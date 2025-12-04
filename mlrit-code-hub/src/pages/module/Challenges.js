import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
     ✅ Run mock test cases (simulated)
     ====================================== */
  const runTests = (index) => {
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

    const mockResults = {
      success: Math.random() > 0.3,
      message: Math.random() > 0.3 ? '✅ All test cases passed!' : '❌ Some test cases failed.',
      testCases:
        challenge.testCases?.map((t) => ({
          input: t.input,
          expected: t.expectedOutput,
          actual: Math.random() > 0.3 ? t.expectedOutput : 'Incorrect Output',
          passed: Math.random() > 0.3,
        })) || [],
    };

    setTestResults((prev) => ({ ...prev, [index]: mockResults }));
  };

  /* ======================================
     ✅ Submit solution (mock)
     ====================================== */
  const submitSolution = (index) => {
    const userCode = solutions[index] || '';
    if (!userCode.trim()) return alert('Please write your code before submitting.');

    setSubmissionStatus((prev) => ({ ...prev, [index]: 'submitting' }));

    setTimeout(() => {
      const accepted = Math.random() > 0.4;
      setSubmissionStatus((prev) => ({
        ...prev,
        [index]: accepted ? 'accepted' : 'rejected',
      }));
    }, 1500);
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
                    >
                      <Play size={14} /> Run Tests
                    </button>
                    <button
                      onClick={() => submitSolution(currentChallenge)}
                      className="submit-button"
                      disabled={submissionStatus[currentChallenge] === 'submitting'}
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

                {/* Code Editor Area */}
                <div className="code-editor-area" style={{ height: `${codeHeight}%` }}>
                  <textarea
                    className="code-textarea"
                    value={solutions[currentChallenge] || challenges[currentChallenge]?.initialCode || ''}
                    onChange={(e) => handleSolutionChange(currentChallenge, e.target.value)}
                    placeholder="Write your solution here..."
                    spellCheck={false}
                  />
                </div>

                {/* Output Section */}
                {testResults[currentChallenge] && (
                  <div className="output-area" style={{ height: `${100 - codeHeight}%` }}>
                    <div className="output-section">
                      <div className="output-header">
                        <h3>Test Results</h3>
                      </div>
                      <div className={`test-results ${testResults[currentChallenge]?.success ? 'success' : 'failure'}`}>
                        <p>{testResults[currentChallenge]?.message}</p>
                        <div className="test-cases">
                          {testResults[currentChallenge]?.testCases?.map((t, i) => (
                            <div key={i} className={`test-case ${t.passed ? 'passed' : 'failed'}`}>
                              <strong>Input:</strong> {t.input} | <strong>Expected:</strong> {t.expected} | <strong>Actual:</strong> {t.actual}
                            </div>
                          ))}
                        </div>
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
