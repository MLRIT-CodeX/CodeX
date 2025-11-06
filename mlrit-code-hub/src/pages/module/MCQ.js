import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Clock,
  Award,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import CourseSidebar from '../../components/CourseSidebar';
import ContentHeader from '../../components/ContentHeader';
import { useModuleData } from '../../hooks/useModuleData';
import './MCQ.css';

const MCQ = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { module, loading, error } = useModuleData(courseId, moduleId);

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  // ✅ Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // ✅ Navigation paths
  const prevPath = `/courses/${courseId}/module/${moduleId}/lecture`;
  const nextPath = `/courses/${courseId}/module/${moduleId}/challenges`;

  // ✅ Answer selection
  const handleAnswerChange = (index, optionIndex) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [index]: optionIndex }));
  };

  // ✅ Submit MCQ quiz
  const handleSubmit = () => {
    const questions = getQuestions();
    const total = questions.length;
    const answered = Object.keys(answers).length;

    if (answered < total) {
      const confirmSubmit = window.confirm(
        `You have answered ${answered}/${total}. Submit anyway?`
      );
      if (!confirmSubmit) return;
    }

    let correct = 0;
    const questionResults = questions.map((q, i) => {
      const userAns = answers[i];
      const isCorrect = userAns === q.correct;
      if (isCorrect) correct++;
      return {
        question: q.question,
        options: q.options,
        userAnswer: userAns,
        correctAnswer: q.correct,
        isCorrect,
        explanation: q.explanation
      };
    });

    const score = Math.round((correct / total) * 100);
    const passed = score >= 70;

    setResults({
      score,
      correct,
      total,
      passed,
      timeSpent,
      questionResults
    });
    setSubmitted(true);
  };

  // ✅ Retry quiz
  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setResults(null);
    setTimeSpent(0);
    setStartTime(Date.now());
  };

  // ✅ Get MCQs from backend or mock data
  const getQuestions = () => {
    return Array.isArray(module?.mcqs) && module.mcqs.length > 0
      ? module.mcqs
      : getMockQuestions();
  };

  // ✅ Mock data fallback
  const getMockQuestions = () => [
    {
      question: 'What is a variable?',
      options: [
        'A fixed value',
        'A named storage for data',
        'A constant',
        'A keyword'
      ],
      correct: 1,
      explanation: 'A variable stores data that can change during program execution.',
      difficulty: 'easy'
    },
    {
      question: 'Which of the following is a Python data type?',
      options: ['loop', 'class', 'list', 'if'],
      correct: 2,
      explanation: 'Python has built-in data types like list, str, int, etc.',
      difficulty: 'medium'
    }
  ];

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 60) return 'average';
    return 'poor';
  };

  /* ======================================
     🌀 Loading & Error Handling
     ====================================== */
  if (loading) {
    return (
      <div className="mcq-container">
        <div className="mcq-loading">
          <div className="loading-spinner"></div>
          <p>Loading MCQ questions...</p>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="mcq-container">
        <div className="mcq-error">
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

  const questions = getQuestions();
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  /* ======================================
     ✅ Render Component
     ====================================== */
  return (
    <div className="mcq-layout">
      <CourseSidebar courseId={courseId} currentModule={moduleId} />
      <div className="mcq-main">
        <ContentHeader
          title="MCQ Practice"
          subtitle={module.title}
          prevPath={prevPath}
          nextPath={nextPath}
          currentTopic="MCQ"
        />

        <div className="mcq-content">
          {!submitted ? (
            <>
              {/* Header and Progress */}
              <div className="mcq-header">
                <div className="quiz-info">
                  <h3>Test Your Understanding</h3>
                  <p>Answer questions from {module.title}</p>
                </div>

                <div className="quiz-stats">
                  <div className="stat">
                    <Clock size={16} />
                    <span>{formatTime(timeSpent)}</span>
                  </div>
                  <div className="stat">
                    <TrendingUp size={16} />
                    <span>
                      {answeredCount}/{questions.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <span className="progress-text">{progressPercent}% Complete</span>
              </div>

              {/* MCQ List */}
              <div className="questions-container">
                {questions.map((q, i) => (
                  <div key={i} className="question-card">
                    <div className="question-header">
                      <span className="question-number">Question {i + 1}</span>
                      <span className={`difficulty-badge ${q.difficulty || 'medium'}`}>
                        {q.difficulty || 'medium'}
                      </span>
                    </div>

                    <div className="question-text">
                      <h4>{q.question}</h4>
                    </div>

                    <div className="options-container">
                      {q.options.map((opt, j) => (
                        <label
                          key={j}
                          className={`option-label ${answers[i] === j ? 'selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name={`question-${i}`}
                            value={j}
                            checked={answers[i] === j}
                            onChange={() => handleAnswerChange(i, j)}
                            className="option-input"
                          />
                          <span className="option-text">
                            <span className="option-letter">{String.fromCharCode(65 + j)}</span>
                            {opt}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="submit-section">
                <button
                  onClick={handleSubmit}
                  className="submit-button"
                  disabled={answeredCount === 0}
                >
                  <Award size={16} />
                  Submit ({answeredCount}/{questions.length})
                </button>
              </div>
            </>
          ) : (
            // ✅ Results Section
            <div className="results-container">
              <div className={`score-display ${getScoreColor(results.score)}`}>
                <div className="score-circle">
                  <span className="score-number">{results.score}%</span>
                </div>
                <div className="score-info">
                  <h3>{results.passed ? 'Well done!' : 'Try Again!'}</h3>
                  <p>
                    {results.correct}/{results.total} correct
                  </p>
                  <div className="time-taken">
                    <Clock size={14} /> {formatTime(results.timeSpent)}
                  </div>
                </div>
              </div>

              <button onClick={handleRetry} className="retry-button">
                <RotateCcw size={16} />
                Retry Quiz
              </button>

              <div className="detailed-results">
                <h4>Detailed Results</h4>
                {results.questionResults.map((res, idx) => (
                  <div
                    key={idx}
                    className={`result-card ${res.isCorrect ? 'correct' : 'incorrect'}`}
                  >
                    <div className="result-header">
                      <span>Q{idx + 1}</span>
                      {res.isCorrect ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    </div>
                    <p className="question">{res.question}</p>
                    {res.options.map((opt, j) => (
                      <div
                        key={j}
                        className={`result-option ${
                          j === res.correctAnswer
                            ? 'correct-answer'
                            : j === res.userAnswer && !res.isCorrect
                            ? 'wrong-answer'
                            : ''
                        }`}
                      >
                        {String.fromCharCode(65 + j)}. {opt}
                      </div>
                    ))}
                    {res.explanation && (
                      <div className="explanation">
                        <AlertCircle size={14} /> {res.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCQ;
