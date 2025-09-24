import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BookOpen,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import './ModuleTestResultPage.css';

const ModuleTestResultPage = ({ 
  testResults, 
  courseId, 
  topicId, 
  topic, 
  moduleTest,
  onRetakeTest,
  onBackToCourse 
}) => {
  const navigate = useNavigate();
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [performanceInsights, setPerformanceInsights] = useState(null);

  useEffect(() => {
    if (testResults) {
      generatePerformanceInsights();
    }
  }, [testResults]);

  const generatePerformanceInsights = () => {
    const insights = {
      overallPerformance: getPerformanceLevel(testResults.percentage),
      strengths: [],
      improvements: [],
      recommendations: []
    };

    // Analyze MCQ performance
    if (testResults.mcqScore > 0) {
      const mcqPercentage = (testResults.mcqScore / testResults.totalMcqMarks) * 100;
      if (mcqPercentage >= 80) {
        insights.strengths.push('Strong conceptual understanding (MCQs)');
      } else if (mcqPercentage < 50) {
        insights.improvements.push('Review fundamental concepts');
        insights.recommendations.push('Revisit lesson materials and practice more MCQs');
      }
    }

    // Analyze coding performance
    if (testResults.codingScore > 0) {
      const codingPercentage = (testResults.codingScore / testResults.totalCodingMarks) * 100;
      if (codingPercentage >= 80) {
        insights.strengths.push('Excellent problem-solving skills');
      } else if (codingPercentage < 50) {
        insights.improvements.push('Practice more coding problems');
        insights.recommendations.push('Focus on algorithm implementation and debugging');
      }
    }

    // Overall recommendations
    if (testResults.percentage >= 80) {
      insights.recommendations.push('Ready to proceed to next topic');
      insights.recommendations.push('Consider helping peers with this topic');
    } else if (testResults.percentage >= 60) {
      insights.recommendations.push('Review weak areas before proceeding');
      insights.recommendations.push('Practice additional problems');
    } else {
      insights.recommendations.push('Retake the lesson and practice extensively');
      insights.recommendations.push('Seek help from instructors or peers');
    }

    setPerformanceInsights(insights);
  };

  const getPerformanceLevel = (percentage) => {
    if (percentage >= 90) return { level: 'Excellent', color: '#10b981', icon: '🏆' };
    if (percentage >= 80) return { level: 'Very Good', color: '#059669', icon: '🌟' };
    if (percentage >= 70) return { level: 'Good', color: '#0891b2', icon: '👍' };
    if (percentage >= 60) return { level: 'Average', color: '#ea580c', icon: '📈' };
    if (percentage >= 40) return { level: 'Below Average', color: '#dc2626', icon: '📉' };
    return { level: 'Needs Improvement', color: '#991b1b', icon: '🎯' };
  };

  const getGradeInfo = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', description: 'Outstanding' };
    if (percentage >= 80) return { grade: 'A', description: 'Excellent' };
    if (percentage >= 70) return { grade: 'B+', description: 'Very Good' };
    if (percentage >= 60) return { grade: 'B', description: 'Good' };
    if (percentage >= 50) return { grade: 'C', description: 'Average' };
    if (percentage >= 40) return { grade: 'D', description: 'Below Average' };
    return { grade: 'F', description: 'Needs Improvement' };
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (!testResults) {
    return <div>Loading results...</div>;
  }

  const gradeInfo = getGradeInfo(testResults.percentage);
  const performance = getPerformanceLevel(testResults.percentage);

  return (
    <div className="module-test-result-container">
      {/* Header Section */}
      <div className="result-header">
        <div className="header-content">
          <div className="test-info">
            <h1>Module Test Results</h1>
            <h2>{topic?.title || 'Module Test'}</h2>
            <p className="completion-date">
              Completed on {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="grade-badge">
            <div className="grade-circle" style={{ borderColor: performance.color }}>
              <span className="grade-text" style={{ color: performance.color }}>
                {gradeInfo.grade}
              </span>
            </div>
            <p className="grade-description">{gradeInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Main Results Section */}
      <div className="results-main">
        {/* Score Overview */}
        <div className="score-overview-card">
          <div className="score-header">
            <Award className="score-icon" style={{ color: performance.color }} />
            <h3>Your Performance</h3>
          </div>
          
          <div className="score-display">
            <div className="circular-progress">
              <div 
                className="progress-ring"
                style={{
                  background: `conic-gradient(${performance.color} 0deg, ${performance.color} ${testResults.percentage * 3.6}deg, #e5e7eb ${testResults.percentage * 3.6}deg, #e5e7eb 360deg)`
                }}
              >
                <div className="progress-inner">
                  <span className="percentage">{Math.round(testResults.percentage)}%</span>
                  <span className="performance-level">{performance.level}</span>
                </div>
              </div>
            </div>
            
            <div className="score-details">
              <div className="score-item">
                <span className="score-label">Total Score</span>
                <span className="score-value">
                  {testResults.totalScore} / {testResults.totalMarks}
                </span>
              </div>
              <div className="score-item">
                <span className="score-label">Questions Correct</span>
                <span className="score-value">
                  {testResults.correctAnswers} / {testResults.totalQuestions}
                </span>
              </div>
              <div className="score-item">
                <span className="score-label">Time Taken</span>
                <span className="score-value">
                  {formatTime(testResults.timeTaken || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="performance-breakdown">
          <h3>Performance Breakdown</h3>
          
          <div className="breakdown-grid">
            <div className="breakdown-card correct">
              <div className="breakdown-header">
                <CheckCircle className="breakdown-icon" />
                <span className="breakdown-title">Correct</span>
              </div>
              <div className="breakdown-value">{testResults.correctAnswers}</div>
              <div className="breakdown-subtitle">
                {Math.round((testResults.correctAnswers / testResults.totalQuestions) * 100)}% of total
              </div>
            </div>

            <div className="breakdown-card incorrect">
              <div className="breakdown-header">
                <XCircle className="breakdown-icon" />
                <span className="breakdown-title">Incorrect</span>
              </div>
              <div className="breakdown-value">{testResults.wrongAnswers}</div>
              <div className="breakdown-subtitle">
                {Math.round((testResults.wrongAnswers / testResults.totalQuestions) * 100)}% of total
              </div>
            </div>

            <div className="breakdown-card unattempted">
              <div className="breakdown-header">
                <AlertCircle className="breakdown-icon" />
                <span className="breakdown-title">Unattempted</span>
              </div>
              <div className="breakdown-value">{testResults.unattempted}</div>
              <div className="breakdown-subtitle">
                {Math.round((testResults.unattempted / testResults.totalQuestions) * 100)}% of total
              </div>
            </div>
          </div>
        </div>

        {/* Question Type Analysis */}
        <div className="question-type-analysis">
          <h3>Question Type Performance</h3>
          
          <div className="type-analysis-grid">
            {testResults.totalMcqMarks > 0 && (
              <div className="type-card">
                <div className="type-header">
                  <BookOpen className="type-icon" />
                  <span className="type-title">Multiple Choice Questions</span>
                </div>
                <div className="type-stats">
                  <div className="type-score">
                    <span className="score-earned">{testResults.mcqScore}</span>
                    <span className="score-total">/ {testResults.totalMcqMarks}</span>
                  </div>
                  <div className="type-percentage">
                    {Math.round((testResults.mcqScore / testResults.totalMcqMarks) * 100)}%
                  </div>
                </div>
                <div className="type-progress">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${(testResults.mcqScore / testResults.totalMcqMarks) * 100}%`,
                      backgroundColor: '#3b82f6'
                    }}
                  ></div>
                </div>
              </div>
            )}

            {testResults.totalCodingMarks > 0 && (
              <div className="type-card">
                <div className="type-header">
                  <Zap className="type-icon" />
                  <span className="type-title">Coding Challenges</span>
                </div>
                <div className="type-stats">
                  <div className="type-score">
                    <span className="score-earned">{testResults.codingScore}</span>
                    <span className="score-total">/ {testResults.totalCodingMarks}</span>
                  </div>
                  <div className="type-percentage">
                    {Math.round((testResults.codingScore / testResults.totalCodingMarks) * 100)}%
                  </div>
                </div>
                <div className="type-progress">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${(testResults.codingScore / testResults.totalCodingMarks) * 100}%`,
                      backgroundColor: '#10b981'
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Insights */}
        {performanceInsights && (
          <div className="performance-insights">
            <h3>Performance Insights</h3>
            
            <div className="insights-grid">
              {performanceInsights.strengths.length > 0 && (
                <div className="insight-card strengths">
                  <div className="insight-header">
                    <TrendingUp className="insight-icon" />
                    <span className="insight-title">Strengths</span>
                  </div>
                  <ul className="insight-list">
                    {performanceInsights.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {performanceInsights.improvements.length > 0 && (
                <div className="insight-card improvements">
                  <div className="insight-header">
                    <Target className="insight-icon" />
                    <span className="insight-title">Areas for Improvement</span>
                  </div>
                  <ul className="insight-list">
                    {performanceInsights.improvements.map((improvement, index) => (
                      <li key={index}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="insight-card recommendations">
                <div className="insight-header">
                  <BarChart3 className="insight-icon" />
                  <span className="insight-title">Recommendations</span>
                </div>
                <ul className="insight-list">
                  {performanceInsights.recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="result-actions">
          <button 
            className="action-btn secondary"
            onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
          >
            <BarChart3 size={20} />
            {showDetailedAnalysis ? 'Hide' : 'Show'} Detailed Analysis
          </button>
          
          <button 
            className="action-btn secondary"
            onClick={onRetakeTest}
          >
            <Clock size={20} />
            Retake Test
          </button>
          
          <button 
            className="action-btn primary"
            onClick={onBackToCourse}
          >
            <BookOpen size={20} />
            Continue Learning
          </button>
        </div>

        {/* Detailed Analysis (Expandable) */}
        {showDetailedAnalysis && (
          <div className="detailed-analysis">
            <h3>Detailed Question Analysis</h3>
            <div className="analysis-content">
              <p>Question-by-question analysis will be displayed here...</p>
              {/* This would show individual question performance */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleTestResultPage;
