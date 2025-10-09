import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BookOpen,
  Zap,
  BarChart3,
  Clock,
  TrendingUp,
  Check,
  X,
  Code
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
  const [correctedTestResults, setCorrectedTestResults] = useState(null);

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
        correctedResults.wrongAnswers = results.totalQuestions - correctedResults.correctAnswers - (results.unattempted || 0);
        
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

  useEffect(() => {
    if (testResults) {
      const correctedResults = correctCodingScores(testResults);
      setCorrectedTestResults(correctedResults);
      
      if (correctedResults !== testResults) {
        console.log('Correcting coding scores based on verdicts');
      }
    }
  }, [testResults]);

  if (!correctedTestResults) {
    return <div>Loading results...</div>;
  }

  // Calculate time spent in minutes
  const timeSpent = moduleTest?.timeLimit ? 
    Math.floor((moduleTest.timeLimit * 60 - (correctedTestResults?.timeRemaining || 0)) / 60) : 0;

  return (
    <>
      <Navbar />
      <div className="module-test-result-container">
      <h1>
        {topic?.title ? `${topic.title} Results` : 'Module Test Results'}
      </h1>
      {/* Main Results Section */}
      <div className="results-main">
        {/* Performance Breakdown */}
        <div className="performance-breakdown">
          <h3>Performance Breakdown</h3>
          <div className="breakdown-grid">
            <div className="breakdown-card correct">
              <div className="breakdown-icon-container">
                <CheckCircle size={32} className="breakdown-icon" />
              </div>
              <div className="breakdown-info">
                <span className="breakdown-count">{correctedTestResults.correctAnswers}</span>
                <span className="breakdown-label">Correct Answers</span>
              </div>
            </div>

            <div className="breakdown-card incorrect">
              <XCircle size={32} className="breakdown-icon" />
              <div className="breakdown-info">
                <span className="breakdown-count">{correctedTestResults.wrongAnswers}</span>
                <span className="breakdown-label">Wrong Answers</span>
              </div>
            </div>

            <div className="breakdown-card unattempted">
              <Clock size={32} className="breakdown-icon" />
              <div className="breakdown-info">
                <span className="breakdown-count">{correctedTestResults.unattempted}</span>
                <span className="breakdown-label">Unattempted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Information */}
        <div className="assessment-info">
          <h3>Assessment Details</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Assessment:</strong> {moduleTest?.title || 'Module Test'}
            </div>
            <div className="info-item">
              <strong>Total Questions:</strong> {correctedTestResults.totalQuestions}
            </div>
            <div className="info-item">
              <strong>Questions Attempted:</strong> {correctedTestResults.correctAnswers + correctedTestResults.wrongAnswers}
            </div>
            <div className="info-item">
              <strong>Total Marks:</strong> {correctedTestResults.totalMarks}
            </div>
            <div className="info-item">
              <strong>Score:</strong> {correctedTestResults.totalScore} / {correctedTestResults.totalMarks} 
            </div>
            <div className="info-item">
              <strong>Status:</strong> 
              <span className={`status-badge ${correctedTestResults.percentage >= 40 ? 'passed' : 'failed'}`}>
                {correctedTestResults.percentage >= 40 ? 'Passed' : 'Failed'}
              </span>
            </div>
          </div>
        </div>

        {/* Performance by Question Type */}
        <div className="performance-breakdown">
          <h3>Performance by Question Type</h3>
          <div className="performance-table">
            <div className="performance-header">
              <span>Question Type</span>
              <span>Attempted</span>
              <span>Correct</span>
              <span>Marks Earned</span>
              <span>Total Marks</span>
              <span>Accuracy</span>
              <span>Performance</span>
            </div>
            
            {/* MCQs */}
            <div className="performance-row">
              <div className="question-type">
                <span>Multiple Choice</span>
              </div>
              <div className="attempted">
                {correctedTestResults.mcqCorrect + (correctedTestResults.wrongAnswers - correctedTestResults.codingIncorrect || 0)}
              </div>
              <div className="correct">
                {correctedTestResults.mcqCorrect}
              </div>
              <div className="marks-earned">
                {correctedTestResults.mcqScore}
              </div>
              <div className="total-marks">
                {correctedTestResults.totalMcqMarks}
              </div>
              <div className="accuracy">
                {correctedTestResults.mcqCorrect > 0 ? 
                  Math.round((correctedTestResults.mcqCorrect / (correctedTestResults.mcqCorrect + (correctedTestResults.wrongAnswers - (correctedTestResults.codingIncorrect || 0)))) * 100) + '%' : 
                  '0%'}
              </div>
              <div className="performance">
                <div className="performance-bar">
                  <div 
                    className="performance-fill"
                    style={{
                      width: `${(correctedTestResults.mcqScore / correctedTestResults.totalMcqMarks) * 100}%`,
                      backgroundColor: '#3b82f6'
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Coding Questions */}
            {correctedTestResults.totalCodingMarks > 0 && (
              <div className="performance-row">
                <div className="question-type">
                  <span>Coding</span>
                </div>
                <div className="attempted">
                  {correctedTestResults.codingAttempted || 0}
                </div>
                <div className="correct">
                  {correctedTestResults.codingCorrect || 0}
                </div>
                <div className="marks-earned">
                  {correctedTestResults.codingScore}
                </div>
                <div className="total-marks">
                  {correctedTestResults.totalCodingMarks}
                </div>
                <div className="accuracy">
                  {correctedTestResults.codingAttempted > 0 ? 
                    Math.round(((correctedTestResults.codingCorrect || 0) / (correctedTestResults.codingAttempted || 1)) * 100) + '%' : 
                    '0%'}
                </div>
                <div className="performance">
                  <div className="performance-bar">
                    <div 
                      className="performance-fill"
                      style={{
                        width: `${(correctedTestResults.codingScore / correctedTestResults.totalCodingMarks) * 100}%`,
                        backgroundColor: '#10b981'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Total */}
            <div className="performance-row total">
              <div className="question-type">
                <span>Total</span>
              </div>
              <div className="attempted">
                {correctedTestResults.correctAnswers + correctedTestResults.wrongAnswers}
              </div>
              <div className="correct">
                {correctedTestResults.correctAnswers}
              </div>
              <div className="marks-earned">
                {correctedTestResults.totalScore}
              </div>
              <div className="total-marks">
                {correctedTestResults.totalMarks}
              </div>
              <div className="accuracy">
                {correctedTestResults.correctAnswers > 0 ? 
                  Math.round((correctedTestResults.correctAnswers / (correctedTestResults.correctAnswers + correctedTestResults.wrongAnswers)) * 100) + '%' : 
                  '0%'}
              </div>
              <div className="performance">
                <div className="performance-bar">
                  <div 
                    className="performance-fill"
                    style={{
                      width: `${correctedTestResults.percentage}%`,
                      backgroundColor: correctedTestResults.percentage >= 40 ? '#10b981' : '#ef4444'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="result-actions">
          <button 
            className="neon-btn primary-neon"
            onClick={onBackToCourse}
          >
            <div className="btn-glow"></div>
            <span>Continue Learning</span>
          </button>
          
          <button 
            className="neon-btn secondary-neon"
            onClick={onRetakeTest}
          >
            <div className="btn-glow"></div>
            <span>Retake Test</span>
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
    </>
  );
};

export default ModuleTestResultPage;
