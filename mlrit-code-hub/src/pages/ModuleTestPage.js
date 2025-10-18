import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, ArrowLeft, ArrowRight, CheckCircle, Code, BookOpen, Award } from 'lucide-react';
import MonacoCodeEditor from '../components/MonacoCodeEditor';
import ModuleTestResultPage from '../components/ModuleTestResultPage';
import './ModuleTestPage.css';

const ModuleTestPage = () => {
  const { courseId, topicId } = useParams();
  const navigate = useNavigate();

  // Error boundary state
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [topic, setTopic] = useState(null);
  const [moduleTest, setModuleTest] = useState(null);
  const [course, setCourse] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState({});
  const [isAnswerSaved, setIsAnswerSaved] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [codingAnswers, setCodingAnswers] = useState({});
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [verdict, setVerdict] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [leftWidth, setLeftWidth] = useState(50);
  const [codeHeight, setCodeHeight] = useState(60); // Percentage for code area height
  const [testStartTime, setTestStartTime] = useState(null);
  const containerRef = useRef(null);
  const verticalContainerRef = useRef(null);
  const isModifiedRef = useRef(false);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // Boilerplate code templates - same as LessonPage
  const boilerplate = {
    cpp: `#include <iostream>
using namespace std;
int main() {
    // your code here
    return 0;
}`,
    python: `# your code here`,
    java: `public class Main {
    public static void main(String[] args) {
        // your code here
    }
}`,
    javascript: `// your code here`
  };

  useEffect(() => {
    try {
      fetchCourseAndModuleTest();
    } catch (error) {
      console.error('Error in fetchCourseAndModuleTest useEffect:', error);
      setHasError(true);
      setErrorMessage('Failed to initialize test');
    }
  }, [courseId, topicId]);

  const fetchCourseAndModuleTest = async () => {
    try {
      // Fetch both course and module test data
      const [courseResponse, testResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:5000/api/courses/${courseId}/topics/${topicId}/test`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Set course data
      setCourse(courseResponse.data);

      // Process test data (existing logic)
      const testData = testResponse.data;
      
      if (!testData) {
        throw new Error('No test data received');
      }
      
      setTopic({ title: testData.topicTitle || 'Module Test' });
      setModuleTest({
        mcqs: Array.isArray(testData.mcqs) ? testData.mcqs : [],
        codeChallenges: Array.isArray(testData.codeChallenges) ? testData.codeChallenges : [],
        totalMarks: testData.totalMarks || 100
      });
      
      const mcqs = Array.isArray(testData.mcqs) ? testData.mcqs : [];
      const codeChallenges = Array.isArray(testData.codeChallenges) ? testData.codeChallenges : [];
      
      try {
        const combinedQuestions = [
          ...mcqs.map((mcq, index) => {
            if (!mcq || typeof mcq !== 'object') {
              console.warn('Invalid MCQ at index:', index, mcq);
              return null;
            }
            return { ...mcq, type: 'mcq', originalIndex: index };
          }).filter(Boolean),
          ...codeChallenges.map((challenge, index) => {
            if (!challenge || typeof challenge !== 'object') {
              console.warn('Invalid coding challenge at index:', index, challenge);
              return null;
            }
            return { ...challenge, type: 'coding', originalIndex: index };
          }).filter(Boolean)
        ];
        
        console.log('Combined questions:', combinedQuestions);
        
        if (!Array.isArray(combinedQuestions) || combinedQuestions.length === 0) {
          throw new Error('No valid questions found');
        }
        
        setAllQuestions(combinedQuestions);
      } catch (mapError) {
        console.error('Error processing questions:', mapError);
        setError('Failed to process test questions');
        setLoading(false);
        return;
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching course and module test:', err);
      setError('Failed to load test data');
      setHasError(true);
      setErrorMessage(err.message || 'Unknown error occurred');
      setLoading(false);
    }
  };

  // Global error handler
  useEffect(() => {
    const handleError = (event) => {
      console.error('Global error caught:', event.error);
      setHasError(true);
      setErrorMessage('An unexpected error occurred');
    };

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      setHasError(true);
      setErrorMessage('An unexpected error occurred');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    if (moduleTest && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [moduleTest, showResults]);


  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
    // Reset save status when answer changes
    setIsAnswerSaved(false);
  };

  const handleSaveAnswer = () => {
    const currentQuestionData = allQuestions[currentQuestion];
    
    if (currentQuestionData?.type === 'mcq' && selectedAnswers[currentQuestion] !== undefined) {
      setSavedAnswers(prev => ({
        ...prev,
        [currentQuestion]: selectedAnswers[currentQuestion]
      }));
      setIsAnswerSaved(true);
      setShowNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
        setIsAnswerSaved(false);
      }, 3000);
    } else if (currentQuestionData?.type === 'coding' && code.trim()) {
      setCodingAnswers(prev => ({
        ...prev,
        [currentQuestion]: {
          code: code,
          language: language
        }
      }));
      setIsAnswerSaved(true);
      setShowNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
        setIsAnswerSaved(false);
      }, 3000);
    }
  };

  // Language mapping for Judge0 API - same as LessonPage
  const languageMap = {
    cpp: 54,
    python: 71,
    java: 62,
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setOutput("Please enter some code before running.");
      setVerdict("");
      setShowOutput(true);
      return;
    }
    
    setIsRunning(true);
    setOutput("Running...");
    setVerdict("");
    setShowOutput(true);

    try {
      const res = await axios.post(
        "http://localhost:2358/submissions?base64_encoded=false&wait=true",
        {
          language_id: languageMap[language],
          source_code: code,
          stdin: customInput || "",
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const { stdout, stderr, compile_output, status } = res.data;
      
      if (stdout) {
        const actualOutput = stdout.trim();
        setOutput(actualOutput);
        
        // Check if there's expected output to compare with
        const currentQuestionData = allQuestions[currentQuestion];
        const expectedOutput = currentQuestionData?.sampleOutput?.trim();
        
        let finalVerdict;
        if (expectedOutput && actualOutput === expectedOutput) {
          finalVerdict = "Accepted";
        } else if (expectedOutput) {
          finalVerdict = "Wrong Answer";
        } else {
          finalVerdict = "Output Generated";
        }
        
        setVerdict(finalVerdict);
        
        // Save verdict in coding answers for scoring
        setCodingAnswers(prev => ({
          ...prev,
          [currentQuestion]: {
            ...prev[currentQuestion],
            verdict: finalVerdict,
            hasRun: true,
            lastRunOutput: actualOutput
          }
        }));
      } else if (stderr) {
        const errorVerdict = "Runtime Error";
        setOutput(stderr.trim());
        setVerdict(errorVerdict);
        
        // Save error verdict
        setCodingAnswers(prev => ({
          ...prev,
          [currentQuestion]: {
            ...prev[currentQuestion],
            verdict: errorVerdict,
            hasRun: true,
            lastRunOutput: stderr.trim()
          }
        }));
      } else if (compile_output) {
        const errorVerdict = "Compilation Error";
        setOutput(compile_output.trim());
        setVerdict(errorVerdict);
        
        // Save compilation error verdict
        setCodingAnswers(prev => ({
          ...prev,
          [currentQuestion]: {
            ...prev[currentQuestion],
            verdict: errorVerdict,
            hasRun: true,
            lastRunOutput: compile_output.trim()
          }
        }));
      } else {
        const noOutputVerdict = "No Output";
        setOutput("No output");
        setVerdict(noOutputVerdict);
        
        // Save no output verdict
        setCodingAnswers(prev => ({
          ...prev,
          [currentQuestion]: {
            ...prev[currentQuestion],
            verdict: noOutputVerdict,
            hasRun: true,
            lastRunOutput: ""
          }
        }));
      }
    } catch (err) {
      console.error("Run Error:", err);
      const connectionErrorVerdict = "Connection Error";
      setOutput("Error running code. Make sure Judge0 server is running.");
      setVerdict(connectionErrorVerdict);
      
      // Save connection error verdict
      setCodingAnswers(prev => ({
        ...prev,
        [currentQuestion]: {
          ...prev[currentQuestion],
          verdict: connectionErrorVerdict,
          hasRun: true,
          lastRunOutput: "Connection Error"
        }
      }));
    } finally {
      setIsRunning(false);
    }
  };

  const getInitialCode = () => {
    const currentQuestionData = allQuestions[currentQuestion];
    if (currentQuestionData?.type !== 'coding') return '';
    
    return currentQuestionData.initialCode || boilerplate[language] || '';
  };

  // Auto-load saved code when switching to coding questions
  useEffect(() => {
    if (!allQuestions || !Array.isArray(allQuestions) || allQuestions.length === 0) {
      return;
    }
    
    const currentQuestionData = allQuestions[currentQuestion];
    if (currentQuestionData?.type === 'coding') {
      // Load saved code for this specific question or use boilerplate
      const savedCode = codingAnswers[currentQuestion];
      
      if (savedCode) {
        // Handle both string and object formats
        if (typeof savedCode === 'string') {
          setCode(savedCode);
        } else if (typeof savedCode === 'object' && savedCode.code) {
          setCode(savedCode.code);
          if (savedCode.language) {
            setLanguage(savedCode.language);
          }
        } else {
          const boilerplateCode = boilerplate[language] || '';
          setCode(boilerplateCode);
        }
      } else {
        const boilerplateCode = boilerplate[language] || '';
        setCode(boilerplateCode);
      }
      
      // Show output section for coding questions
      setShowOutput(true);
      // Clear previous output and verdict when switching questions
      setOutput('');
      setVerdict('');
      isModifiedRef.current = false;
    } else {
      // Hide output for non-coding questions
      setShowOutput(false);
    }
  }, [currentQuestion, allQuestions]);

  // Resizer functionality
  const startDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startLeftWidth = leftWidth;
    
    const doDrag = (e) => {
      const containerWidth = containerRef.current?.offsetWidth || 1200;
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

  const startVerticalDrag = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startCodeHeight = codeHeight;
    
    const doDrag = (e) => {
      const containerHeight = verticalContainerRef.current?.offsetHeight || 600;
      const deltaY = e.clientY - startY;
      const deltaPercent = (deltaY / containerHeight) * 100;
      const newCodeHeight = Math.min(85, Math.max(30, startCodeHeight + deltaPercent));
      setCodeHeight(newCodeHeight);
    };
    
    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
    
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const handleSubmitTest = async () => {
    if (!moduleTest) return;

    // Check if any questions are answered
    const totalAnswered = Number(Object.keys(savedAnswers || {}).length) + Number(Object.keys(codingAnswers || {}).length);
    
    if (totalAnswered === 0) {
      setShowSubmitWarning(true);
      return;
    }

    // Calculate time taken with proper type checking
    const timeTaken = testStartTime ? Math.floor((new Date().getTime() - new Date(testStartTime).getTime()) / 1000) : 0;

    // Submit results to backend
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Get userId safely
      let userId;
      if (user && user.id) {
        userId = user.id;
      } else {
        // Try to extract from token if user object is null
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          userId = tokenPayload.id;
        } catch (e) {
          console.error('Could not extract user ID from token:', e);
          throw new Error('User authentication failed. Please login again.');
        }
      }
      
      console.log('Submitting module test for userId:', userId);
      
      // Prepare answers in the format expected by backend
      const answers = [];
      allQuestions.forEach((question, index) => {
        if (question.type === 'mcq') {
          const userAnswer = savedAnswers[index];
          answers.push(userAnswer !== undefined ? userAnswer : null);
        }
      });
      
      // Prepare coding answers in the format expected by backend
      const backendCodingAnswers = {};
      allQuestions.forEach((question, index) => {
        if (question.type === 'coding') {
          const userCode = codingAnswers[index];
          if (userCode && userCode.code && userCode.code.trim()) {
            backendCodingAnswers[index] = {
              code: userCode.code,
              language: userCode.language || 'python',
              verdict: userCode.verdict || 'Not Attempted', // Include verdict for scoring
              hasRun: userCode.hasRun || false // Track if code was executed
            };
          }
        }
      });

      // Submit to progress API with enhanced data
      const response = await axios.post(
        'http://localhost:5000/api/progress/module-test',
        {
          userId: userId,
          courseId: courseId,
          topicId: topicId,
          answers: answers,
          codingAnswers: backendCodingAnswers,
          topicTitle: topic?.title || 'Module Test',
          timeTaken: timeTaken
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('✅ Module test results submitted successfully:', response.data);
      
      // Use the enhanced test result from backend
      const enhancedTestResult = response.data.testResult;
      setTestResults(enhancedTestResult);
      setScore(enhancedTestResult.percentage);
      setShowDetailedResults(true);
      
    } catch (error) {
      console.error('❌ Error submitting module test results:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        userId,
        courseId,
        topicId
      });
      
      // Fallback to local calculation if backend fails
      const fallbackResult = {
        totalScore: Number(Object.keys(savedAnswers || {}).length) + Number(Object.keys(codingAnswers || {}).length),
        totalMarks: moduleTest?.totalMarks || 100,
        percentage: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        unattempted: allQuestions.length - totalAnswered,
        totalQuestions: allQuestions.length,
        mcqScore: 0,
        codingScore: 0,
        totalMcqMarks: 0,
        totalCodingMarks: 0,
        timeTaken: timeTaken,
        error: 'Failed to submit to server'
      };
      
      setTestResults(fallbackResult);
      setScore(0);
      setShowDetailedResults(true);
    }
  };

  const handleForceSubmit = async () => {
    setShowSubmitWarning(false);
    
    // Calculate time taken with proper type checking
    const timeTaken = testStartTime ? Math.floor((new Date().getTime() - new Date(testStartTime).getTime()) / 1000) : 0;
    
    // Submit empty results to backend
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Get userId safely
      let userId;
      if (user && user.id) {
        userId = user.id;
      } else {
        // Try to extract from token if user object is null
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          userId = tokenPayload.id;
        } catch (e) {
          console.error('Could not extract user ID from token:', e);
          throw new Error('User authentication failed. Please login again.');
        }
      }
      
      console.log('Force submitting module test for userId:', userId);
      
      // Prepare empty answers
      const answers = [];
      const backendCodingAnswers = {};

      // Submit to progress API with enhanced data
      const response = await axios.post(
        'http://localhost:5000/api/progress/module-test',
        {
          userId: userId,
          courseId: courseId,
          topicId: topicId,
          answers: answers,
          codingAnswers: backendCodingAnswers,
          topicTitle: topic?.title || 'Module Test',
          timeTaken: timeTaken
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('✅ Empty module test results submitted successfully:', response.data);
      
      // Use the enhanced test result from backend
      const enhancedTestResult = response.data.testResult;
      setTestResults(enhancedTestResult);
      setScore(enhancedTestResult.percentage);
      setShowDetailedResults(true);
      
    } catch (error) {
      console.error('❌ Error submitting empty module test results:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        userId,
        courseId,
        topicId
      });
      
      // Fallback result
      const fallbackResult = {
        totalScore: 0,
        totalMarks: moduleTest?.totalMarks || 100,
        percentage: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        unattempted: allQuestions.length,
        totalQuestions: allQuestions.length,
        mcqScore: 0,
        codingScore: 0,
        totalMcqMarks: 0,
        totalCodingMarks: 0,
        timeTaken: timeTaken,
        error: 'Failed to submit to server'
      };
      
      setTestResults(fallbackResult);
      setScore(0);
      setShowDetailedResults(true);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const nextQuestion = () => {
    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Error boundary
  if (hasError) {
    return (
      <div className="module-test-container">
        <div className="error-state">
          <h2>Something went wrong</h2>
          <p>{errorMessage}</p>
          <button onClick={() => {
            setHasError(false);
            setErrorMessage('');
            window.location.reload();
          }} className="back-btn">
            Reload Page
          </button>
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show enhanced results page if available
  if (showDetailedResults && testResults) {
    return (
      <ModuleTestResultPage
        testResults={testResults}
        courseId={courseId}
        topicId={topicId}
        topic={topic}
        moduleTest={moduleTest}
        onRetakeTest={() => {
          setShowDetailedResults(false);
          setShowResults(false);
          setCurrentQuestion(0);
          setSavedAnswers({});
          setCodingAnswers({});
          setSelectedAnswers({});
          setCode('');
          setScore(0);
          setTestResults(null);
          setTimeLeft(1800);
          setTestStartTime(null);
          setShowIntro(true);
        }}
        onBackToCourse={() => navigate(`/courses/${courseId}`)}
      />
    );
  }

  if (loading || !allQuestions || allQuestions.length === 0) {
    return (
      <div className="module-test-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading module test...</p>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="module-test-container">
        <div className="test-intro">
          <div className="intro-header">
            <h1>Module Test: {topic?.title}</h1>
            <p className="intro-subtitle">Are you ready to test your knowledge of {topic?.title}?</p>
          </div>

          <div className="intro-content">
            <div className="test-overview">
              <h2>Why Take Our Module Test?</h2>
              <div className="overview-text">
                <p><strong>Identify Areas for Improvement:</strong> Our module test will highlight your strengths and weaknesses in various aspects of this topic.</p>
                <ul>
                  <li>If you score more than 80% in the module test - you should continue learning the next topics.</li>
                  <li>If you score less than 80% in the module test - you should revisit the learning concepts and practice more problems in this module.</li>
                </ul>
              </div>
            </div>

            <div className="test-syllabus">
              <h3>Test Syllabus</h3>
              <div className="syllabus-item">
                <span className="syllabus-icon">📄</span>
                <span>{topic?.title}</span>
              </div>
            </div>

            <div className="test-details">
              <div className="detail-item">
                <div className="detail-icon">🕒</div>
                <div className="detail-content">
                  <h4>{Math.floor(timeLeft / 60)} Minutes</h4>
                  <p>Total time to attempt the assessment</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">📝</div>
                <div className="detail-content">
                  <h4>{(moduleTest?.mcqs?.length || 0) + (moduleTest?.codeChallenges?.length || 0)} Questions</h4>
                  <p>MCQs and coding challenges</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">👤</div>
                <div className="detail-content">
                  <h4>{localStorage.getItem('username') || 'Student'}</h4>
                  <p>CodeChef Username: {localStorage.getItem('username') || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="test-rules">
              <h3>Read the rules carefully before starting</h3>
              <ul className="rules-list">
                <li>You will not be able to pause the assessment after starting.</li>
                <li>You will get a detailed report on your performance at the end of the assessment.</li>
                <li>Make sure you have a stable internet connection.</li>
                <li>Do not refresh the page during the test.</li>
              </ul>
            </div>

            <div className="start-section">
              <label className="agreement-checkbox">
                <input 
                  type="checkbox" 
                  checked={agreedToRules}
                  onChange={(e) => setAgreedToRules(e.target.checked)}
                />
                <span>I agree to participate fairly in the assessment</span>
              </label>

              <button 
                className="start-assessment-btn"
                disabled={!agreedToRules}
                onClick={() => {
                  setShowIntro(false);
                  setTestStartTime(new Date());
                }}
              >
                Start Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="module-test-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="module-test-container">
        <div className="test-results">
          <div className="results-header">
            <Award className="results-icon" />
            <h2>Test Complete!</h2>
          </div>
          
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}%</span>
            </div>
            <p className="score-text">
              You scored {score}% ({Object.values(selectedAnswers).filter((answer, index) => 
                answer === moduleTest.mcqs[index]?.correct
              ).length} out of {moduleTest.mcqs.length} correct)
            </p>
          </div>

          <div className="results-actions">
            <button 
              onClick={() => navigate(`/courses/${courseId}/modules`)}
              className="continue-btn"
            >
              <CheckCircle size={20} />
              Continue Learning
            </button>
            <button 
              onClick={() => {
                setShowResults(false);
                setCurrentQuestion(0);
                setSelectedAnswers({});
                setTimeLeft(1800);
              }}
              className="retry-btn"
            >
              Retry Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safety check for allQuestions
  if (!allQuestions || !Array.isArray(allQuestions) || allQuestions.length === 0) {
    return (
      <div className="module-test-container">
        <div className="error-state">
          <p>No test questions available</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Main component return
  try {
    return (
      <div className="module-test-container">
        {/* Custom Test Navbar */}
        <div className="test-navbar">
          <div className="navbar-left">
            <div className="timer-display">
            <Clock size={16} />
            <span className="timer-text">{formatTime(timeLeft)}</span>
          </div>
          </div>
          
          <div className="navbar-center">
            <div className="test-title">{topic?.title || 'Module Test'}</div>
          </div>
        
        <div className="navbar-right">
          <div className="nav-controls">
            <button 
              onClick={prevQuestion} 
              disabled={currentQuestion === 0}
              className="nav-control prev"
            >
              ‹ Prev
            </button>
            <span className="nav-divider">|</span>
            <button 
              onClick={nextQuestion}
              disabled={!allQuestions.length || currentQuestion >= allQuestions.length - 1}
              className="nav-control next"
            >
              Next ›
            </button>
          </div>
        </div>
      </div>


      {/* Main Content - Dynamic Layout */}
      <div className="test-main-content">
        {(allQuestions && allQuestions[currentQuestion])?.type === 'mcq' ? (
          <>
            {/* Left Panel - Question Statement */}
            <div className="test-left-panel">
              <div className="question-statement">
                <h2>Question {currentQuestion + 1}</h2>
                <p className="question-text">
                  {allQuestions[currentQuestion]?.question}
                </p>
              </div>
            </div>

            {/* Right Panel - MCQ Options */}
            <div className="test-right-panel">
              <div className="mcq-options">
                <h3>Choose the correct answer:</h3>
                <div className="options-list">
                  {(allQuestions[currentQuestion]?.options || []).map((option, index) => (
                    <label key={index} className="mcq-option">
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={index}
                        checked={selectedAnswers[currentQuestion] === index}
                        onChange={() => handleAnswerSelect(currentQuestion, index)}
                        className="mcq-radio"
                      />
                      <span className="option-text">{option}</span>
                    </label>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="mcq-actions">
                  <button
                    onClick={handleSaveAnswer}
                    className={`save-btn ${isAnswerSaved ? 'saved' : ''}`}
                    disabled={selectedAnswers[currentQuestion] === undefined}
                  >
                    {isAnswerSaved ? '✓ Saved' : 'Save Answer'}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Coding Challenge Interface */
          <div className="coding-container" ref={containerRef}>
            {/* Left Panel - Problem Statement */}
            <div className="coding-left" style={{ width: `${leftWidth}%` }}>
              <div className="problem-statement">
                <h2>Question {currentQuestion + 1}: {allQuestions[currentQuestion]?.title}</h2>
                <div className="problem-description">
                  <p>{allQuestions[currentQuestion]?.description}</p>
                  
                  {allQuestions[currentQuestion]?.constraints && (
                    <div className="constraints-section">
                      <h3>Hint:</h3>
                      <p>{allQuestions[currentQuestion]?.constraints}</p>
                    </div>
                  )}
                  
                  {allQuestions[currentQuestion]?.sampleInput && (
                    <div className="sample-cases">
                      <h3>Sample Test Cases:</h3>
                      <div className="testcase-block">
                        <strong>Input:</strong>
                        <pre>{allQuestions[currentQuestion]?.sampleInput}</pre>
                        <strong>Output:</strong>
                        <pre>{allQuestions[currentQuestion]?.sampleOutput}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resizer */}
            <div className="resizer" onMouseDown={startDrag} />

            {/* Right Panel - Code Editor and Output */}
            <div className="coding-right" style={{ width: `${100 - leftWidth}%` }} ref={verticalContainerRef}>
              <div className="editor-toolbar">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
                <div className="toolbar-buttons">
                  <button 
                    className="run-button"
                    onClick={handleRunCode} 
                    disabled={isRunning}
                  >
                    {isRunning ? 'Running...' : 'Run'}
                  </button>
                  <button
                    onClick={handleSaveAnswer}
                    className={`save-btn ${isAnswerSaved ? 'saved' : ''}`}
                    disabled={!code.trim()}
                  >
                    {isAnswerSaved ? '✓ Saved' : 'Save Code'}
                  </button>
                </div>
              </div>

              {/* Code Editor Area */}
              <div className="code-editor-area" style={{ height: `${codeHeight}%` }}>
                <div className="monaco-editor-container">
                  <MonacoCodeEditor
                    key={`question-${currentQuestion}-${language}`}
                    language={language}
                    allowedLanguages={course?.language ? [course.language] : course?.programmingLanguage ? [course.programmingLanguage] : ['python']}
                    onLanguageChange={(newLang) => {
                      setLanguage(newLang);
                      isModifiedRef.current = false;
                      setOutput("");
                      setVerdict("");
                    }}
                    value={code || ''}
                    onChange={(val) => {
                      try {
                        setCode(val || '');
                        isModifiedRef.current = true;
                        setIsAnswerSaved(false);
                      } catch (error) {
                        console.error('Error in onChange:', error);
                      }
                    }}
                    height="100%"
                    showLanguageSelector={false}
                  />
                </div>
              </div>

              {/* Vertical Resizer between code and output */}
              {showOutput && (
                <div className="vertical-resizer" onMouseDown={startVerticalDrag} />
              )}

              {/* Output Section - Enhanced like LessonPage */}
              {showOutput && (
                <div className="output-area" style={{ height: `${100 - codeHeight}%` }}>
                  <div className="output-section">
                    <div className="output-header">
                      <h3>Output</h3>
                    </div>
                    <div className="output-block">
                      <pre className="output-text">{output || "Click 'Run' to see output here"}</pre>
                    </div>
                    {verdict && (
                      <div className={`verdict-block ${
                        verdict.includes('Accepted') || verdict.includes('Output Generated')
                          ? 'accepted' 
                          : verdict.includes('Wrong Answer') 
                            ? 'wrong-answer'
                            : verdict.includes('Runtime Error') || verdict.includes('Compilation Error')
                              ? 'error'
                              : 'output-generated'
                      }`}>
                        {verdict.includes('Accepted') 
                          ? '✅ Accepted' 
                          : verdict.includes('Wrong Answer')
                            ? '❌ Wrong Answer'
                            : verdict.includes('Output Generated')
                              ? '✅ Output Generated'
                              : verdict.includes('Runtime Error')
                                ? '❌ Runtime Error'
                                : verdict.includes('Compilation Error')
                                  ? '❌ Compilation Error'
                                  : verdict}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {showNotification && (
        <div className="notification-toast">
          <div className="toast-content">
            <span className="toast-icon">✓</span>
            <span className="toast-message">Your response saved successfully!</span>
          </div>
        </div>
      )}

      {/* Test Results Modal - Dark Theme (Hidden - Direct to detailed results) */}
      {showResults && testResults && (
        <div className="test-completion-overlay" style={{display: 'none'}}>
          <div className="test-completion-modal">
            <div className="completion-icon">
              <div className="trophy-icon">🏆</div>
            </div>
            
            <h1 className="completion-title">Test Complete!</h1>
            
            <div className="score-circle">
              <div className="percentage-display">{Math.round(testResults.percentage || 0)}%</div>
            </div>
            
            
            <p className="score-text">
              You scored {Math.round(testResults.percentage || 0)}% ({testResults.correctAnswers || 0} out of {testResults.totalQuestions || allQuestions.length} correct)
            </p>
            
            <div className="completion-actions">
              <button 
                className="continue-learning-btn"
                onClick={() => navigate(`/courses/${courseId}`)}
              >
                ✓ Continue Learning
              </button>
              <button 
                className="retry-test-btn"
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestion(0);
                  setSavedAnswers({});
                  setCodingAnswers({});
                  setSelectedAnswers({});
                  setScore(0);
                  setTestResults(null);
                }}
              >
                Retry Test
              </button>
            </div>
            
            <div className="review-link">
              <button 
                className="review-assessment-link"
                onClick={() => {
                  setShowResults(false);
                  setShowDetailedResults(true);
                }}
              >
                📋 Review Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Results Page is now handled at the top level return */}

      {/* Submit Warning Modal */}
      {showSubmitWarning && (
        <div className="modal-overlay">
          <div className="warning-modal">
            <div className="warning-header">
              <h3>⚠️ Submit Test Without Answers?</h3>
            </div>
            <div className="warning-content">
              <p>You haven't answered any questions yet. Are you sure you want to submit the test?</p>
              <p className="warning-note">This will result in a score of 0 points.</p>
            </div>
            <div className="warning-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowSubmitWarning(false)}
              >
                Cancel
              </button>
              <button 
                className="force-submit-btn"
                onClick={handleForceSubmit}
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation - Only show when not showing results */}
      {!showResults && (
        <div className="test-navigation">
          <div className="question-indicators">
            {(allQuestions || []).map((question, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`question-indicator ${
                  index === currentQuestion ? 'current' : ''
                } ${
                  (question.type === 'mcq' && savedAnswers[index] !== undefined) || 
                  (question.type === 'coding' && codingAnswers[index] !== undefined) ? 'saved' : ''
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {allQuestions.length > 0 && currentQuestion === allQuestions.length - 1 && (
              <button
                onClick={handleSubmitTest}
                className="nav-btn submit-btn"
                disabled={false} 
              >
                Submit
                <CheckCircle size={20} />
              </button>
            )}
        </div>
      )}
    </div>
  );
  } catch (renderError) {
    console.error('Render error:', renderError);
    return (
      <div className="module-test-container">
        <div className="error-state">
          <h2>Rendering Error</h2>
          <p>An error occurred while rendering the page.</p>
          <button onClick={() => window.location.reload()} className="back-btn">
            Reload Page
          </button>
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }
};

export default ModuleTestPage;
