import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Play,
  Lightbulb,
  CheckCircle,
  XCircle,
  Clock,
  Code,
  ChevronDown,
  ChevronUp,
  Send,
  RotateCcw,
} from 'lucide-react';
import MonacoCodeEditor from '../../components/MonacoCodeEditor';
import ModuleNavigationHeader from '../../components/ModuleNavigationHeader';
import ModuleNavigationFooter from '../../components/ModuleNavigationFooter';
import { useModuleData } from '../../hooks/useModuleData';
import './Challenges.css';

const Challenges = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  const { module, loading, error } = useModuleData(courseId, moduleId);

  const [expandedChallenges, setExpandedChallenges] = useState(new Set([0]));
  const [solutions, setSolutions] = useState({});
  const [showHints, setShowHints] = useState({});
  const [testResults, setTestResults] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState({});
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [leftWidth, setLeftWidth] = useState(50);
  const [codeHeight, setCodeHeight] = useState(60);
  const [language, setLanguage] = useState('python');
  const [isRunning, setIsRunning] = useState(false);
  
  // Language mapping for Judge0
  const languageMap = {
    cpp: 54,
    python: 71,
    java: 62,
    javascript: 63
  };

  /* ======================================
     ✅ Navigation flow (MCQ → Challenges → next)
     ====================================== */
  const prevPath = `/courses/${courseId}/module/${moduleId}/mcq`;
  const nextPath = `/courses/${courseId}/module/${moduleId}/theory`;

  /* ======================================
     ✅ Toggle & Edit Handlers
     ====================================== */
  const toggleChallenge = (index) => {
    const newExpanded = new Set(expandedChallenges);
    newExpanded.has(index) ? newExpanded.delete(index) : newExpanded.add(index);
    setExpandedChallenges(newExpanded);
  };

  const handleSolutionChange = (index, code) => {
    setSolutions((prev) => ({ ...prev, [index]: code }));
  };

  const toggleHint = (index) => {
    setShowHints((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  /* ======================================
     ✅ Run test cases using Judge0
     ====================================== */
  const runTests = async (index) => {
    const challenge = getChallenges()[index];
    const userCode = solutions[index] || '';

    if (!userCode.trim()) {
      setTestResults((prev) => ({
        ...prev,
        [index]: {
          success: false,
          message: '✏️ Write some code before running tests!',
          testCases: [],
        },
      }));
      return;
    }

    if (!challenge.testCases || challenge.testCases.length === 0) {
      setTestResults((prev) => ({
        ...prev,
        [index]: {
          success: false,
          message: '⚠️ No test cases available for this challenge.',
          testCases: [],
        },
      }));
      return;
    }

    setIsRunning(true);
    setTestResults((prev) => ({
      ...prev,
      [index]: {
        success: false,
        message: '⏳ Running test cases...',
        testCases: [],
      },
    }));

    try {
      const results = [];
      let allPassed = true;
      const startTime = Date.now();

      // Run against all visible test cases
      for (let i = 0; i < challenge.testCases.length; i++) {
        const testCase = challenge.testCases[i];
        
        // Skip hidden test cases during run
        if (testCase.isHidden) continue;
        
        const res = await axios.post(
          "http://localhost:2358/submissions?base64_encoded=false&wait=true",
          {
            language_id: languageMap[language],
            source_code: userCode,
            stdin: testCase.input || '',
          },
          { headers: { "Content-Type": "application/json" } }
        );

        const { stdout, stderr, compile_output, status } = res.data;
        const actualOutput = (stdout || stderr || compile_output || "").trim();
        const expectedOutput = (testCase.expectedOutput || testCase.output || "").trim();
        const passed = actualOutput === expectedOutput && status?.id === 3; // 3 = Accepted
        
        results.push({
          input: testCase.input,
          expected: expectedOutput,
          actual: actualOutput,
          passed: passed,
          status: status?.description || 'Unknown'
        });

        if (!passed) {
          allPassed = false;
        }
      }

      const endTime = Date.now();
      const runtime = endTime - startTime;

      setTestResults((prev) => ({
        ...prev,
        [index]: {
          success: allPassed,
          message: allPassed 
            ? `✅ All test cases passed! (${runtime}ms)` 
            : '❌ Some test cases failed.',
          testCases: results,
          runtime: runtime
        },
      }));

    } catch (err) {
      console.error("Run Error:", err);
      setTestResults((prev) => ({
        ...prev,
        [index]: {
          success: false,
          message: '❌ Error running code: ' + (err.response?.data?.message || err.message),
          testCases: [],
        },
      }));
    } finally {
      setIsRunning(false);
    }
  };

  /* ======================================
     ✅ Submit solution using Judge0 with hidden test cases
     ====================================== */
  const submitSolution = async (index) => {
    const challenge = getChallenges()[index];
    const userCode = solutions[index] || '';
    
    if (!userCode.trim()) {
      alert('Please write your code before submitting.');
      return;
    }

    if (!challenge.testCases || challenge.testCases.length === 0) {
      alert('No test cases available for submission.');
      return;
    }

    setSubmissionStatus((prev) => ({ ...prev, [index]: 'submitting' }));
    setTestResults((prev) => ({
      ...prev,
      [index]: {
        success: false,
        message: '⏳ Evaluating against all test cases (including hidden)...',
        testCases: [],
      },
    }));

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      let allTestsPassed = true;
      let passedCount = 0;
      const totalCount = challenge.testCases.length;
      const startTime = Date.now();
      const results = [];

      // Run against ALL test cases (including hidden ones)
      for (let i = 0; i < challenge.testCases.length; i++) {
        const testCase = challenge.testCases[i];
        
        const res = await axios.post(
          "http://localhost:2358/submissions?base64_encoded=false&wait=true",
          {
            language_id: languageMap[language],
            source_code: userCode,
            stdin: testCase.input || '',
          },
          { headers: { "Content-Type": "application/json" } }
        );

        const { stdout, stderr, compile_output, status } = res.data;
        const actualOutput = (stdout || stderr || compile_output || "").trim();
        const expectedOutput = (testCase.expectedOutput || testCase.output || "").trim();
        const passed = actualOutput === expectedOutput && status?.id === 3; // 3 = Accepted
        
        // Only show results for non-hidden test cases
        if (!testCase.isHidden) {
          results.push({
            input: testCase.input,
            expected: expectedOutput,
            actual: actualOutput,
            passed: passed,
            status: status?.description || 'Unknown'
          });
        }

        if (passed) {
          passedCount++;
        } else {
          allTestsPassed = false;
        }
      }

      const endTime = Date.now();
      const runtime = endTime - startTime;

      // Display results
      if (allTestsPassed) {
        setSubmissionStatus((prev) => ({ ...prev, [index]: 'accepted' }));
        setTestResults((prev) => ({
          ...prev,
          [index]: {
            success: true,
            message: `✅ Accepted! All ${totalCount} test cases passed. (${runtime}ms)`,
            testCases: results,
            runtime: runtime,
            passedCount: totalCount,
            totalCount: totalCount
          },
        }));

        // Award marks to user (save to database)
        try {
          await axios.post(
            "http://localhost:5000/api/progress/challenge-complete",
            {
              userId: userId,
              courseId: courseId,
              moduleId: moduleId,
              challengeId: challenge._id || `challenge-${index}`,
              marks: challenge.marks || 10,
              language: language,
              code: userCode,
              runtime: runtime
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          console.error("Error saving progress:", err);
        }

      } else {
        setSubmissionStatus((prev) => ({ ...prev, [index]: 'rejected' }));
        setTestResults((prev) => ({
          ...prev,
          [index]: {
            success: false,
            message: `❌ Wrong Answer. Passed ${passedCount}/${totalCount} test cases.`,
            testCases: results,
            runtime: runtime,
            passedCount: passedCount,
            totalCount: totalCount
          },
        }));
      }

    } catch (err) {
      console.error("Submission Error:", err);
      setSubmissionStatus((prev) => ({ ...prev, [index]: 'rejected' }));
      setTestResults((prev) => ({
        ...prev,
        [index]: {
          success: false,
          message: '❌ Error submitting code: ' + (err.response?.data?.message || err.message),
          testCases: [],
        },
      }));
    }
  };

  /* ======================================
     ✅ Reset challenge
     ====================================== */
  const resetChallenge = (index) => {
    const challenge = getChallenges()[index];
    setSolutions((prev) => ({
      ...prev,
      [index]: challenge.initialCode || '',
    }));

    setTestResults((prev) => {
      const newResults = { ...prev };
      delete newResults[index];
      return newResults;
    });

    setSubmissionStatus((prev) => {
      const newStatus = { ...prev };
      delete newStatus[index];
      return newStatus;
    });
  };

  /* ======================================
     ✅ Difficulty badge color
     ====================================== */
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'difficulty-easy';
      case 'medium':
        return 'difficulty-medium';
      case 'hard':
        return 'difficulty-hard';
      default:
        return 'difficulty-medium';
    }
  };

  /* ======================================
     ✅ Get challenges (API or mock)
     ====================================== */
  const getChallenges = () => {
    return Array.isArray(module?.challenges?.problems)
      ? module.challenges.problems
      : Array.isArray(module?.codeChallenges)
      ? module.codeChallenges
      : getMockChallenges();
  };

  /* ======================================
     ✅ Mock challenge data
     ====================================== */
  const getMockChallenges = () => [
    {
      title: 'Sum of Two Numbers',
      description: 'Write a function that returns the sum of two numbers.',
      difficulty: 'easy',
      marks: 10,
      timeLimit: 300,
      sampleInput: 'add_numbers(5, 3)',
      sampleOutput: '8',
      initialCode: `def add_numbers(a, b):\n    # Write your code here\n    pass`,
      hint: 'Use the + operator to add both numbers.',
      testCases: [
        { input: 'add_numbers(5, 3)', expectedOutput: '8' },
        { input: 'add_numbers(0, 0)', expectedOutput: '0' },
      ],
    },
    {
      title: 'Palindrome Checker',
      description: 'Return True if the input string is a palindrome.',
      difficulty: 'medium',
      marks: 15,
      timeLimit: 600,
      sampleInput: 'is_palindrome("madam")',
      sampleOutput: 'True',
      initialCode: `def is_palindrome(s):\n    # Write your code here\n    pass`,
      hint: 'Compare the string with its reverse.',
      testCases: [
        { input: 'is_palindrome("madam")', expectedOutput: 'True' },
        { input: 'is_palindrome("hello")', expectedOutput: 'False' },
      ],
    },
  ];

  /* ======================================
     🌀 Loading & Error States
     ====================================== */
  if (loading) {
    return (
      <div className="challenges-container">
        <div className="challenges-loading">
          <div className="loading-spinner"></div>
          <p>Loading coding challenges...</p>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="challenges-container">
        <div className="challenges-error">
          <h2>Error</h2>
          <p>{error || 'Module not found'}</p>
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="back-button"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  const challenges = getChallenges();

  // Resizer functionality
  const startDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startLeftWidth = leftWidth;
    
    const doDrag = (e) => {
      const containerWidth = 1200; // Approximate container width
      const deltaX = e.clientX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newLeftWidth = Math.min(80, Math.max(20, startLeftWidth + deltaPercent));
      setLeftWidth(newLeftWidth);
    };
    
    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
    
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  /* ======================================
     ✅ Render Component
     ====================================== */
  return (
    <div className="challenges-layout">
      <ModuleNavigationHeader 
        currentTopic="challenges"
        moduleTitle={module?.title || 'Module'}
        courseTitle="Python Programming"
      />
      
          <div className="challenges-test-main">
            <div className="coding-container">
              {/* Left Panel - Problem Statement */}
              <div className="coding-left" style={{ width: `${leftWidth}%` }}>
                <div className="problem-statement">
                  <h2>Challenge {currentChallenge + 1}: {challenges[currentChallenge]?.title}</h2>
                  
                  <div className="challenge-meta">
                    <span className={`difficulty-badge ${getDifficultyColor(challenges[currentChallenge]?.difficulty)}`}>
                      {challenges[currentChallenge]?.difficulty}
                    </span>
                    <span className="marks-badge">{challenges[currentChallenge]?.marks} marks</span>
                    <span className="time-badge">
                      <Clock size={12} /> {Math.floor((challenges[currentChallenge]?.timeLimit || 1800) / 60)} min
                    </span>
                  </div>
                  
                  <div className="problem-description">
                    <p>{challenges[currentChallenge]?.description}</p>
                    
                    {challenges[currentChallenge]?.hint && showHints[currentChallenge] && (
                      <div className="hint-section">
                        <h3>💡 Hint:</h3>
                        <p>{challenges[currentChallenge].hint}</p>
                      </div>
                    )}
                    
                    <div className="sample-cases">
                      <h3>Sample Test Cases:</h3>
                      <div className="testcase-block">
                        <strong>Input:</strong>
                        <pre>{challenges[currentChallenge]?.sampleInput}</pre>
                        <strong>Output:</strong>
                        <pre>{challenges[currentChallenge]?.sampleOutput}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resizer */}
              <div className="resizer" onMouseDown={startDrag} />

              {/* Right Panel - Code Editor and Output */}
              <div className="coding-right" style={{ width: `${100 - leftWidth}%` }}>
                <div className="editor-toolbar">
                  <div className="toolbar-left">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="language-selector"
                    >
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                  </div>
                  <div className="toolbar-buttons">
                    <button
                      onClick={() => toggleHint(currentChallenge)}
                      className="hint-button"
                    >
                      <Lightbulb size={14} />
                      {showHints[currentChallenge] ? 'Hide Hint' : 'Show Hint'}
                    </button>
                    <button
                      onClick={() => resetChallenge(currentChallenge)}
                      className="reset-button"
                    >
                      <RotateCcw size={14} /> Reset
                    </button>
                    <button
                      onClick={() => runTests(currentChallenge)}
                      className="run-button"
                      disabled={isRunning}
                    >
                      <Play size={14} /> {isRunning ? 'Running...' : 'Run Tests'}
                    </button>
                    <button
                      onClick={() => submitSolution(currentChallenge)}
                      className="submit-button"
                      disabled={submissionStatus[currentChallenge] === 'submitting' || isRunning}
                    >
                      <Send size={14} />
                      {submissionStatus[currentChallenge] === 'submitting'
                        ? 'Submitting...'
                        : submissionStatus[currentChallenge] === 'accepted'
                        ? 'Accepted ✅'
                        : submissionStatus[currentChallenge] === 'rejected'
                        ? 'Try Again ❌'
                        : 'Submit'}
                    </button>
                  </div>
                </div>

                {/* Monaco Code Editor */}
                <div className="code-editor-area" style={{ height: `${codeHeight}%` }}>
                  <MonacoCodeEditor
                    language={language}
                    onLanguageChange={setLanguage}
                    value={solutions[currentChallenge] || challenges[currentChallenge]?.initialCode || ''}
                    onChange={(code) => handleSolutionChange(currentChallenge, code)}
                    height="100%"
                    showLanguageSelector={false}
                  />
                </div>

                {/* Output Section */}
                {testResults[currentChallenge] && (
                  <div className="output-area" style={{ height: `${100 - codeHeight}%` }}>
                    <div className="output-section">
                      <div className="output-header">
                        <h3>Test Results</h3>
                        {testResults[currentChallenge]?.runtime && (
                          <span className="runtime-badge">
                            <Clock size={12} /> {testResults[currentChallenge].runtime}ms
                          </span>
                        )}
                      </div>
                      <div className={`test-results ${testResults[currentChallenge]?.success ? 'success' : 'failure'}`}>
                        <p className="result-message">{testResults[currentChallenge]?.message}</p>
                        
                        {testResults[currentChallenge]?.passedCount !== undefined && (
                          <div className="test-summary">
                            <strong>Test Cases: </strong>
                            <span className={testResults[currentChallenge].success ? 'text-success' : 'text-error'}>
                              {testResults[currentChallenge].passedCount} / {testResults[currentChallenge].totalCount} passed
                            </span>
                          </div>
                        )}
                        
                        {testResults[currentChallenge]?.testCases?.length > 0 && (
                          <div className="test-cases">
                            {testResults[currentChallenge].testCases.map((t, i) => (
                              <div key={i} className={`test-case ${t.passed ? 'passed' : 'failed'}`}>
                                <div className="test-case-header">
                                  <strong>Test Case {i + 1}</strong>
                                  <span className={`status-badge ${t.passed ? 'success' : 'error'}`}>
                                    {t.passed ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                    {t.status || (t.passed ? 'Passed' : 'Failed')}
                                  </span>
                                </div>
                                <div className="test-case-details">
                                  <div className="test-detail">
                                    <strong>Input:</strong>
                                    <pre>{t.input || '(empty)'}</pre>
                                  </div>
                                  <div className="test-detail">
                                    <strong>Expected:</strong>
                                    <pre>{t.expected}</pre>
                                  </div>
                                  <div className="test-detail">
                                    <strong>Actual:</strong>
                                    <pre className={t.passed ? 'text-success' : 'text-error'}>{t.actual}</pre>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
      
      <ModuleNavigationFooter 
        currentTopic="challenges"
      />
    </div>
  );
};

export default Challenges;
