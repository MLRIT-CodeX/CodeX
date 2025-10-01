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
  const [correctedTestResults, setCorrectedTestResults] = useState(null);

  useEffect(() => {
    if (testResults) {
      // Correct the coding scores based on verdicts if needed
      const correctedResults = correctCodingScores(testResults);
      setCorrectedTestResults(correctedResults);
      
      if (correctedResults !== testResults) {
        // Update the results if corrections were made
        console.log('Correcting coding scores based on verdicts');
      }
      generatePerformanceInsights(correctedResults);
    }
  }, [testResults]);

  const correctCodingScores = (results) => {
    // Check if we have coding results to analyze
    if (results.codingResults && results.codingResults.length > 0) {
      let correctedCodingScore = 0;
      let acceptedCount = 0;
      
      // Create codingDetails from codingResults for display
      const codingDetails = results.codingResults.map((codingResult, index) => {
        const verdict = codingResult.verdict || 'Not Attempted';
        const maxMarks = results.totalCodingMarks / results.codingResults.length; // Assume equal marks per question
        
        // Only award marks for "Accepted" verdicts
        if (verdict === 'Accepted') {
          correctedCodingScore += maxMarks;
          acceptedCount++;
        }
        
        return {
          title: `Coding Question ${index + 1}`,
          verdict: verdict,
          maxMarks: maxMarks,
          hasRun: codingResult.hasRun || false,
          code: codingResult.code || ''
        };
      });
      
      // If the corrected score differs from the reported score, update it
      if (correctedCodingScore !== results.codingScore) {
        console.log(`Correcting coding score from ${results.codingScore} to ${correctedCodingScore}`);
        
        const correctedResults = {
          ...results,
          codingScore: correctedCodingScore,
          totalScore: (results.mcqScore || 0) + correctedCodingScore,
          percentage: ((results.mcqScore || 0) + correctedCodingScore) / (results.totalMarks || 1) * 100,
          codingDetails: codingDetails
        };
        
        // Update correct/wrong answers count
        const mcqCorrect = results.mcqCorrect || 0;
        correctedResults.correctAnswers = mcqCorrect + acceptedCount;
        correctedResults.wrongAnswers = results.totalQuestions - correctedResults.correctAnswers - results.unattempted;
        
        return correctedResults;
      } else {
        // Even if scores match, add codingDetails for display
        return {
          ...results,
          codingDetails: codingDetails
        };
      }
    }
    
    return results;
  };

  const generatePerformanceInsights = (results = testResults) => {
    const insights = {
      overallPerformance: getPerformanceLevel(results.percentage),
      strengths: [],
      improvements: [],
      recommendations: []
    };

    // Analyze MCQ performance
    if (results.mcqScore > 0) {
      const mcqPercentage = (results.mcqScore / results.totalMcqMarks) * 100;
      if (mcqPercentage >= 80) {
        insights.strengths.push('Strong conceptual understanding (MCQs)');
      } else if (mcqPercentage < 50) {
        insights.improvements.push('Review fundamental concepts');
        insights.recommendations.push('Revisit lesson materials and practice more MCQs');
      }
    }

    // Analyze coding performance - only count "Accepted" solutions
    if (results.codingScore > 0) {
      const codingPercentage = (results.codingScore / results.totalCodingMarks) * 100;
      if (codingPercentage >= 80) {
        insights.strengths.push('Excellent problem-solving skills');
      } else if (codingPercentage < 50) {
        insights.improvements.push('Practice more coding problems');
        insights.recommendations.push('Focus on algorithm implementation and debugging');
      }
    } else if (results.totalCodingMarks > 0) {
      // No coding marks earned but coding questions exist
      insights.improvements.push('Run your code and ensure it gets "Accepted" verdict');
      insights.recommendations.push('Only "Accepted" solutions receive marks - test your code thoroughly');
    }

    // Overall recommendations
    if (results.percentage >= 80) {
      insights.recommendations.push('Ready to proceed to next topic');
      insights.recommendations.push('Consider helping peers with this topic');
    } else if (results.percentage >= 60) {
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

  if (!testResults || !correctedTestResults) {
    return <div>Loading results...</div>;
  }

  const gradeInfo = getGradeInfo(correctedTestResults.percentage);
  const performance = getPerformanceLevel(correctedTestResults.percentage);

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
                  background: `conic-gradient(${performance.color} 0deg, ${performance.color} ${correctedTestResults.percentage * 3.6}deg, #e5e7eb ${correctedTestResults.percentage * 3.6}deg, #e5e7eb 360deg)`
                }}
              >
                <div className="progress-inner">
                  <span className="percentage">{Math.round(correctedTestResults.percentage)}%</span>
                  <span className="performance-level">{performance.level}</span>
                </div>
              </div>
            </div>
            
            <div className="score-details">
              <div className="score-item">
                <span className="score-label">Total Score</span>
                <span className="score-value">
                  {correctedTestResults.totalScore} / {correctedTestResults.totalMarks}
                </span>
              </div>
              <div className="score-item">
                <span className="score-label">Questions Correct</span>
                <span className="score-value">
                  {correctedTestResults.correctAnswers} / {correctedTestResults.totalQuestions}
                </span>
              </div>
              <div className="score-item">
                <span className="score-label">Time Taken</span>
                <span className="score-value">
                  {formatTime(correctedTestResults.timeTaken || 0)}
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
              <div className="breakdown-value">{correctedTestResults.correctAnswers}</div>
              <div className="breakdown-subtitle">
                {Math.round((correctedTestResults.correctAnswers / correctedTestResults.totalQuestions) * 100)}% of total
              </div>
            </div>

            <div className="breakdown-card incorrect">
              <div className="breakdown-header">
                <XCircle className="breakdown-icon" />
                <span className="breakdown-title">Incorrect</span>
              </div>
              <div className="breakdown-value">{correctedTestResults.wrongAnswers}</div>
              <div className="breakdown-subtitle">
                {Math.round((correctedTestResults.wrongAnswers / correctedTestResults.totalQuestions) * 100)}% of total
              </div>
            </div>

            <div className="breakdown-card unattempted">
              <div className="breakdown-header">
                <AlertCircle className="breakdown-icon" />
                <span className="breakdown-title">Unattempted</span>
              </div>
              <div className="breakdown-value">{correctedTestResults.unattempted}</div>
              <div className="breakdown-subtitle">
                {Math.round((correctedTestResults.unattempted / correctedTestResults.totalQuestions) * 100)}% of total
              </div>
            </div>
          </div>
        </div>

        {/* Question Type Analysis */}
        <div className="question-type-analysis">
          <h3>Question Type Performance</h3>
          
          <div className="type-analysis-grid">
            {correctedTestResults.totalMcqMarks > 0 && (
              <div className="type-card">
                <div className="type-header">
                  <BookOpen className="type-icon" />
                  <span className="type-title">Multiple Choice Questions</span>
                </div>
                <div className="type-stats">
                  <div className="type-score">
                    <span className="score-earned">{correctedTestResults.mcqScore}</span>
                    <span className="score-total">/ {correctedTestResults.totalMcqMarks}</span>
                  </div>
                  <div className="type-percentage">
                    {Math.round((correctedTestResults.mcqScore / correctedTestResults.totalMcqMarks) * 100)}%
                  </div>
                </div>
                <div className="type-progress">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${(correctedTestResults.mcqScore / correctedTestResults.totalMcqMarks) * 100}%`,
                      backgroundColor: '#3b82f6'
                    }}
                  ></div>
                </div>
              </div>
            )}

            {correctedTestResults.totalCodingMarks > 0 && (
              <div className="type-card">
                <div className="type-header">
                  <Zap className="type-icon" />
                  <span className="type-title">Coding Challenges</span>
                </div>
                <div className="type-stats">
                  <div className="type-score">
                    <span className="score-earned">{correctedTestResults.codingScore}</span>
                    <span className="score-total">/ {correctedTestResults.totalCodingMarks}</span>
                  </div>
                  <div className="type-percentage">
                    {Math.round((correctedTestResults.codingScore / correctedTestResults.totalCodingMarks) * 100)}%
                  </div>
                </div>
                <div className="type-progress">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${(correctedTestResults.codingScore / correctedTestResults.totalCodingMarks) * 100}%`,
                      backgroundColor: '#10b981'
                    }}
                  ></div>
                </div>
                {testResults.codingScore > correctedTestResults.codingScore && (
                  <div className="scoring-warning">
                    ⚠️ Corrected: Only "Accepted" solutions receive marks (was {testResults.codingScore})
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detailed Coding Question Analysis */}
        {correctedTestResults.codingDetails && correctedTestResults.codingDetails.length > 0 && (
          <div className="coding-details-section">
            <h3>Coding Questions Breakdown</h3>
            <p className="section-subtitle">
              Only "Accepted" solutions receive full marks. Run your code to get a verdict!
            </p>
            
            <div className="coding-questions-grid">
              {correctedTestResults.codingDetails.map((question, index) => (
                <div key={index} className={`coding-question-card ${question.verdict?.toLowerCase().replace(' ', '-') || 'not-attempted'}`}>
                  <div className="question-header">
                    <div className="question-number">Q{index + 1}</div>
                    <div className="question-title">{question.title || `Coding Question ${index + 1}`}</div>
                  </div>
                  
                  <div className="question-verdict">
                    <div className={`verdict-badge ${question.verdict?.toLowerCase().replace(' ', '-') || 'not-attempted'}`}>
                      {question.verdict === 'Accepted' && '✅ Accepted'}
                      {question.verdict === 'Wrong Answer' && '❌ Wrong Answer'}
                      {question.verdict === 'Runtime Error' && '💥 Runtime Error'}
                      {question.verdict === 'Compilation Error' && '🔧 Compilation Error'}
                      {question.verdict === 'Output Generated' && '⚡ Output Generated'}
                      {question.verdict === 'Connection Error' && '🔌 Connection Error'}
                      {question.verdict === 'No Output' && '⭕ No Output'}
                      {!question.verdict && '⏸️ Not Attempted'}
                    </div>
                  </div>
                  
                  <div className="question-score">
                    <span className="earned-marks">
                      {question.verdict === 'Accepted' ? question.maxMarks : 0}
                    </span>
                    <span className="total-marks">/ {question.maxMarks}</span>
                    <span className="marks-label">marks</span>
                  </div>
                  
                  {question.hasRun && (
                    <div className="execution-info">
                      <div className="execution-status">
                        <span className="status-icon">🏃‍♂️</span>
                        <span className="status-text">Code Executed</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="coding-summary">
              <div className="summary-item">
                <span className="summary-label">Accepted Solutions:</span>
                <span className="summary-value">
                  {correctedTestResults.codingDetails.filter(q => q.verdict === 'Accepted').length} / {correctedTestResults.codingDetails.length}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Coding Marks:</span>
                <span className="summary-value">
                  {correctedTestResults.codingScore} / {correctedTestResults.totalCodingMarks}
                </span>
              </div>
            </div>
          </div>
        )}

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
