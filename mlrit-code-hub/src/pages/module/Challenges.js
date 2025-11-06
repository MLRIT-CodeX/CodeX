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
import CourseSidebar from '../../components/CourseSidebar';
import ContentHeader from '../../components/ContentHeader';
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

  /* ======================================
     ✅ Render Component
     ====================================== */
  return (
    <div className="challenges-layout">
      <CourseSidebar courseId={courseId} currentModule={moduleId} />

      <div className="challenges-main">
        <ContentHeader
          title="Coding Challenges"
          subtitle={module.title}
          prevPath={prevPath}
          nextPath={nextPath}
          currentTopic="Challenges"
        />

        <div className="challenges-content">
          <div className="challenges-header">
            <div className="header-info">
              <h3>Practice Your Skills</h3>
              <p>Solve these problems to master {module.title}</p>
            </div>
            <div className="challenges-stats">
              <Code size={16} /> {challenges.length} Challenge
              {challenges.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="challenges-list">
            {challenges.map((challenge, index) => {
              const isExpanded = expandedChallenges.has(index);
              const userSolution = solutions[index] || challenge.initialCode || '';
              const showHint = showHints[index];
              const results = testResults[index];
              const status = submissionStatus[index];

              return (
                <div key={index} className="challenge-card">
                  <div
                    className="challenge-header"
                    onClick={() => toggleChallenge(index)}
                  >
                    <div className="challenge-info">
                      <h4 className="challenge-title">{challenge.title}</h4>
                      <div className="challenge-meta">
                        <span
                          className={`difficulty-badge ${getDifficultyColor(
                            challenge.difficulty
                          )}`}
                        >
                          {challenge.difficulty}
                        </span>
                        <span className="marks-badge">{challenge.marks} marks</span>
                        <span className="time-badge">
                          <Clock size={12} /> {Math.floor(challenge.timeLimit / 60)} min
                        </span>
                      </div>
                    </div>
                    <div className="expand-icon">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="challenge-body">
                      <p className="challenge-description">{challenge.description}</p>

                      <div className="sample-section">
                        <p>
                          <strong>Sample Input:</strong>{' '}
                          <code>{challenge.sampleInput}</code>
                        </p>
                        <p>
                          <strong>Sample Output:</strong>{' '}
                          <code>{challenge.sampleOutput}</code>
                        </p>
                      </div>

                      <div className="code-editor-section">
                        <div className="editor-actions">
                          <button
                            onClick={() => toggleHint(index)}
                            className="hint-button"
                          >
                            <Lightbulb size={14} />{' '}
                            {showHint ? 'Hide Hint' : 'Show Hint'}
                          </button>
                          <button
                            onClick={() => resetChallenge(index)}
                            className="reset-button"
                          >
                            <RotateCcw size={14} /> Reset
                          </button>
                        </div>

                        {showHint && (
                          <div className="hint-section">
                            💡 {challenge.hint || 'Try breaking the problem into smaller steps.'}
                          </div>
                        )}

                        <textarea
                          className="code-textarea"
                          value={userSolution}
                          onChange={(e) => handleSolutionChange(index, e.target.value)}
                          spellCheck={false}
                        />

                        <div className="editor-controls">
                          <button
                            onClick={() => runTests(index)}
                            className="run-button"
                          >
                            <Play size={14} /> Run Tests
                          </button>
                          <button
                            onClick={() => submitSolution(index)}
                            className="submit-button"
                            disabled={status === 'submitting'}
                          >
                            <Send size={14} />
                            {status === 'submitting'
                              ? 'Submitting...'
                              : status === 'accepted'
                              ? 'Accepted ✅'
                              : status === 'rejected'
                              ? 'Try Again ❌'
                              : 'Submit'}
                          </button>
                        </div>
                      </div>

                      {results && (
                        <div
                          className={`test-results ${
                            results.success ? 'success' : 'failure'
                          }`}
                        >
                          <p>{results.message}</p>
                          <div className="test-cases">
                            {results.testCases.map((t, i) => (
                              <div
                                key={i}
                                className={`test-case ${
                                  t.passed ? 'passed' : 'failed'
                                }`}
                              >
                                <strong>Input:</strong> {t.input} |{' '}
                                <strong>Expected:</strong> {t.expected} |{' '}
                                <strong>Actual:</strong> {t.actual}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenges;
