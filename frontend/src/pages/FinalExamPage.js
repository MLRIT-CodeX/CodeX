import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FinalExamPage.css';
import { 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Code, 
  BookOpen, 
  Award,
  AlertTriangle, 
  Shield, 
  Eye, 
  Monitor,
  Play,
  Square,
  Camera,
  Mic,
  Lock,
  Wifi,
  Battery
} from 'lucide-react';
import MonacoCodeEditor from '../components/MonacoCodeEditor';

const FinalExamPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  // Core states - matching ModuleTestPage
  const [exam, setExam] = useState(null);
  const [course, setCourse] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours for final exam
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState({});
  const [isAnswerSaved, setIsAnswerSaved] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [allQuestions, setAllQuestions] = useState([]);
  const [codingAnswers, setCodingAnswers] = useState({});
  const [code, setCodeState] = useState('');
  const [language, setLanguage] = useState('python');
  
  // Safe setCode function that ensures code is always a string
  const setCode = (value) => {
    setCodeState(typeof value === 'string' ? value : (value?.code || ''));
  };
  const [output, setOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [leftWidth, setLeftWidth] = useState(50);
  const [codeHeight, setCodeHeight] = useState(60);
  
  // Enhanced Security States for Enterprise Assessment
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [securityViolations, setSecurityViolations] = useState([]);
  const [fullscreenViolations, setFullscreenViolations] = useState(0);
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [proctoringActive, setProctoringActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const [webcamPermissionGranted, setWebcamPermissionGranted] = useState(false);
  const [microphoneActive, setMicrophoneActive] = useState(false);
  const [screenRecording, setScreenRecording] = useState(false);
  const [networkMonitoring, setNetworkMonitoring] = useState(true);
  const [keystrokeLogging, setKeystrokeLogging] = useState([]);
  const [mouseTracking, setMouseTracking] = useState([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState([]);
  const [browserInfo, setBrowserInfo] = useState({});
  const [systemInfo, setSystemInfo] = useState({});
  const [locationData, setLocationData] = useState(null);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [verdict, setVerdict] = useState("");
  const [executionError, setExecutionError] = useState("");
  
  // Language mapping and boilerplate - same as LessonPage
  const languageMap = {
    cpp: 54,
    python: 71,
    java: 62,
    javascript: 63
  };
  
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
  
  // Refs
  const containerRef = useRef(null);
  const verticalContainerRef = useRef(null);
  const timerRef = useRef(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const examRef = useRef(null);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem("userId");
  const isModifiedRef = useRef(false);

  // Reset editor state when switching to a different coding question
  useEffect(() => {
    const currentQ = allQuestions[currentQuestion];
    if (currentQ?.type === 'coding') {
      // Reset output and verdict when switching questions (but keep output box visible)
      setOutput("");
      setVerdict("");
      setExecutionError("");
      setShowOutput(true); // Keep output visible for coding questions
      
      // Auto-load saved code for this specific question or use boilerplate
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
      isModifiedRef.current = false;
    } else {
      // Hide output for non-coding questions
      setShowOutput(false);
    }
  }, [currentQuestion, allQuestions]);

  // Fetch exam data on component mount
  useEffect(() => {
    fetchExamData();
  }, [courseId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSecurityListeners();
      if (timerRef.current) clearInterval(timerRef.current);
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [webcamStream]);

  // Setup security suite only when exam starts
  useEffect(() => {
    if (examStarted && isSecureMode) {
      setupEnterpriseSecuritySuite();
    }
  }, [examStarted, isSecureMode]);

  useEffect(() => {
    if (exam && !showResults && examStarted) {
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
  }, [exam, showResults, examStarted]);

  const fetchExamData = async () => {
    try {
      if (!courseId) {
        setError('Course ID is missing from URL parameters');
        setLoading(false);
        return;
      }
      
      console.log('Fetching final exam data for course:', courseId);
      const response = await axios.get(`http://localhost:5000/api/courses/${courseId}/final-exam`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Final exam data fetched:', response.data);
      
      // Check if user has already completed the exam
      if (response.data.lastAttempt && response.data.lastAttempt.submitted) {
        navigate(`/course/${courseId}/final-exam/results`, {
          state: {
            results: response.data.lastAttempt || {},
            finalExam: response.data.exam || {},
            examData: response.data.exam || {}
          }
        });
        return;
      }
      
      const examData = response.data.exam;
      const courseData = response.data.course;
      
      if (!examData) {
        console.error('Assessment data is undefined for finalExam type');
        setError('Final exam data not found');
        setLoading(false);
        return;
      }
      
      console.log('Exam data loaded:', {
        title: examData.title,
        mcqs: examData.mcqs?.length || 0,
        codeChallenges: examData.codeChallenges?.length || 0,
        duration: examData.duration
      });
      
      setExam(examData);
      setCourse(courseData);
      setTimeLeft(examData.duration * 60); // Convert to seconds
      
      // Combine MCQs and coding challenges into unified question list
      const combinedQuestions = [
        ...(examData.mcqs || []).map((mcq, index) => ({ ...mcq, type: 'mcq', originalIndex: index })),
        ...(examData.codeChallenges || []).map((challenge, index) => ({ ...challenge, type: 'coding', originalIndex: index }))
      ];
      setAllQuestions(combinedQuestions);
      
      console.log('Combined questions loaded:', combinedQuestions.length);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching final exam:', error);
      setError('Failed to load final exam data');
      setLoading(false);
    }
  };

  const setupEnterpriseSecuritySuite = () => {
    console.log('Setting up enterprise security suite...');
    
    // Core security listeners
    // document.addEventListener('contextmenu', preventRightClick); commentedbyme
    document.addEventListener('keydown', preventKeyboardShortcuts);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('selectstart', preventSelection);
    
    // Multiple fullscreen event listeners for better compatibility
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    // Advanced enterprise security
    document.addEventListener('keydown', logKeystroke);
    document.addEventListener('mousemove', trackMouseMovement);
    document.addEventListener('click', trackMouseClicks);
    document.addEventListener('blur', detectWindowFocusLoss);
    document.addEventListener('focus', detectWindowFocusGain);
    
    // Network monitoring
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    
    // Browser tab/window monitoring
    window.addEventListener('beforeunload', handlePageUnload);
    window.addEventListener('resize', handleWindowResize);
    
    // Device orientation (mobile security)
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
  };

  const cleanupSecurityListeners = () => {
    // document.removeEventListener('contextmenu', preventRightClick); commentedbyme
    document.removeEventListener('keydown', preventKeyboardShortcuts);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('selectstart', preventSelection);
    
    // Remove all fullscreen event listeners
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    
    document.removeEventListener('keydown', logKeystroke);
    document.removeEventListener('mousemove', trackMouseMovement);
    document.removeEventListener('click', trackMouseClicks);
    document.removeEventListener('blur', detectWindowFocusLoss);
    document.removeEventListener('focus', detectWindowFocusGain);
    window.removeEventListener('online', handleNetworkChange);
    window.removeEventListener('offline', handleNetworkChange);
    window.removeEventListener('beforeunload', handlePageUnload);
    window.removeEventListener('resize', handleWindowResize);
    if (window.DeviceOrientationEvent) {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    }
  };

  {/* const preventRightClick = (e) => {
    if (isSecureMode) {
      e.preventDefault();
      addSecurityViolation('Right-click attempted');
    }
  }; commentedbyme */}

  const preventKeyboardShortcuts = (e) => {
    if (isSecureMode) {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+A, F12, etc.
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a')) {
        e.preventDefault();
        addSecurityViolation(`Keyboard shortcut attempted: Ctrl+${e.key.toUpperCase()}`);
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        addSecurityViolation('Developer tools access attempted');
      }
      // Additional enterprise security shortcuts
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        addSecurityViolation('Alt+Tab switching attempted');
      }
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        addSecurityViolation('Screenshot attempt detected');
      }
    }
  };

  const handleVisibilityChange = () => {
    if (isSecureMode && document.hidden && examStarted && !examSubmitted) {
      setTabSwitchCount(prev => prev + 1);
      addSecurityViolation('Tab switch detected');
      
      // Show notification immediately on tab switch
      setShowWarning(true);
      
      // Show tab switch warning modal instead of auto-fullscreen
      
      // Enterprise-level response to tab switching
      if (tabSwitchCount >= 100) {
        addSecurityViolation('Excessive tab switching - Auto-submitting exam');
        setAutoSubmitTriggered(true);
        handleSubmitTest(true);
      }
    }
  };

  // Handle fullscreen exit detection
  const handleFullscreenChange = () => {
    // Only process fullscreen changes after exam has started and is in secure mode
    if (!examStarted || !isSecureMode || examSubmitted || autoSubmitTriggered) {
      console.log('Ignoring fullscreen change - exam not active:', {
        examStarted,
        isSecureMode,
        examSubmitted,
        autoSubmitTriggered
      });
      return;
    }
    
    console.log('Processing fullscreen change:', {
      examStarted,
      examSubmitted,
      autoSubmitTriggered,
      fullscreenElement: document.fullscreenElement
    });
    
    const isCurrentlyFullscreen = !!document.fullscreenElement;
    setIsFullScreen(isCurrentlyFullscreen);
    
    if (!isCurrentlyFullscreen) {
        console.log('User exited fullscreen - showing alert');
        
        // Track violation first
        setFullscreenViolations(prev => {
          const newCount = prev + 1;
          console.log(`Fullscreen violation ${newCount}/3`);
          
          addSecurityViolation(`Fullscreen exit detected - Violation ${newCount}`);
          
          // Check if this is the 3rd violation
          if (newCount >= 100) {
            addSecurityViolation('Maximum fullscreen violations reached - Auto-submitting exam');
            setAutoSubmitTriggered(true);
            alert('Maximum violations reached. Your exam will be submitted automatically.');
            handleSubmitTest(true);
            return newCount;
          }
          
          // Show fullscreen warning modal instead of alert
          setShowFullscreenWarning(true);
          
          return newCount;
        });
    }
  };

  const preventSelection = (e) => {
    if (isSecureMode) {
      e.preventDefault();
    }
  };

  // Enterprise Security Functions
  const collectSystemInformation = () => {
    const systemData = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      colorDepth: window.screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    };
    setSystemInfo(systemData);
    setBrowserInfo({
      name: getBrowserName(),
      version: getBrowserVersion(),
      isFullScreenCapable: document.fullscreenEnabled
    });
  };

  const getBrowserName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const getBrowserVersion = () => {
    const userAgent = navigator.userAgent;
    const match = userAgent.match(/(chrome|firefox|safari|edge)\/([\d.]+)/i);
    return match ? match[2] : 'Unknown';
  };

  const logKeystroke = (e) => {
    if (isSecureMode && examStarted) {
      const keystroke = {
        key: e.key,
        timestamp: Date.now(),
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        shiftKey: e.shiftKey
      };
      setKeystrokeLogging(prev => [...prev.slice(-99), keystroke]); // Keep last 100 keystrokes
    }
  };

  const trackMouseMovement = (e) => {
    if (isSecureMode && examStarted) {
      const mouseData = {
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      };
      setMouseTracking(prev => [...prev.slice(-49), mouseData]); // Keep last 50 movements
    }
  };

  const trackMouseClicks = (e) => {
    if (isSecureMode && examStarted) {
      // Only log suspicious clicks (right clicks, outside exam area, etc.)
      if (e.button === 2 || e.ctrlKey || e.altKey) {
        addSecurityViolation(`Suspicious mouse activity: ${e.button === 2 ? 'Right click' : 'Modified click'} at (${e.clientX}, ${e.clientY})`);
      }
    }
  };

  const detectWindowFocusLoss = () => {
    if (isSecureMode && examStarted) {
      addSecurityViolation('Window focus lost');
      setSuspiciousActivity(prev => [...prev, {
        type: 'focus_loss',
        timestamp: Date.now()
      }]);
    }
  };

  const detectWindowFocusGain = () => {
    if (isSecureMode && examStarted) {
      addSecurityViolation('Window focus regained');
    }
  };

  const handleNetworkChange = () => {
    const isOnline = navigator.onLine;
    addSecurityViolation(`Network status changed: ${isOnline ? 'Online' : 'Offline'}`);
    if (!isOnline) {
      setShowWarning(true);
    }
  };

  const handlePageUnload = (e) => {
    if (isSecureMode && examStarted && !examSubmitted) {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your exam progress may be lost.';
      addSecurityViolation('Page unload attempt');
      return e.returnValue;
    }
  };

  const handleWindowResize = () => {
    if (isSecureMode && examStarted) {
      addSecurityViolation(`Window resized to ${window.innerWidth}x${window.innerHeight}`);
    }
  };

  const handleDeviceOrientation = (e) => {
    if (isSecureMode && examStarted) {
      addSecurityViolation(`Device orientation changed: ${e.alpha}, ${e.beta}, ${e.gamma}`);
    }
  };

  const initializeWebcamProctoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: true 
      });
      setWebcamStream(stream);
      setProctoringActive(true);
      setMicrophoneActive(true);
      
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
      
      // Start periodic face detection
      startFaceDetection();
    } catch (error) {
      console.error('Failed to initialize webcam:', error);
      addSecurityViolation('Webcam access denied');
    }
  };

  const startFaceDetection = () => {
    const interval = setInterval(() => {
      if (webcamRef.current && canvasRef.current && proctoringActive) {
        captureFrame();
      }
    }, 5000); // Capture every 5 seconds
    
    return () => clearInterval(interval);
  };

  const captureFrame = () => {
    const video = webcamRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    // In a real implementation, this would send to AI service for face detection
    addSecurityViolation('Proctoring frame captured');
  };

  const requestLocationAccess = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationData({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          addSecurityViolation(`Location access denied: ${error.message}`);
        }
      );
    }
  };


  const addSecurityViolation = (violation) => {
    const violationData = {
      type: violation,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`
    };
    setSecurityViolations(prev => [...prev, violationData]);
    
    // Log to console for debugging
    console.warn('Security Violation:', violationData);
  };

  const enterFullscreen = async () => {
    try {
      const element = examRef.current || document.documentElement;
      
      // Try different fullscreen methods for browser compatibility
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
      
      setIsSecureMode(true);
      setIsFullScreen(true);
      console.log('Successfully entered fullscreen mode');
      addSecurityViolation('Fullscreen mode activated');
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      addSecurityViolation('Fullscreen activation failed');
    }
  };

  // Request webcam permission before starting exam
  const requestWebcamPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setWebcamStream(stream);
      setWebcamPermissionGranted(true);
      setProctoringActive(true);
      
      // Set up webcam reference
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
      
      return true;
    } catch (error) {
      console.error('Webcam permission denied:', error);
      alert('Webcam and microphone access is required to start the exam. Please allow access and try again.');
      return false;
    }
  };

  const startExam = async () => {
    // First request webcam permission
    const webcamGranted = await requestWebcamPermission();
    if (!webcamGranted) {
      return; // Don't start exam without webcam permission
    }

    // Initialize enterprise security suite and force fullscreen
    // await enterFullscreen(); commentedbyme
    await initializeWebcamProctoring();
    requestLocationAccess();
    
    setExamStarted(true);
    setIsSecureMode(true);
    setShowIntro(false);
    setIsFullScreen(true);
    
    addSecurityViolation('Final exam started in fullscreen mode');
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitTest(true); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmitTest = async (autoSubmit = false) => {
    if (!exam) return;

    // Skip warning dialog - directly submit and redirect to results
    
    // Show response notification
    setNotificationMessage('Exam submitted successfully! Redirecting to results page...');
    setShowNotification(true);
    
    // Hide notification after 2 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 2000);

    try {
      setLoading(true);
      
      // Turn off webcam immediately when submitting
      if (webcamStream) {
        console.log('Stopping webcam stream...');
        webcamStream.getTracks().forEach(track => {
          track.stop();
        });
      }
      
      // Calculate local results first
      const localResults = await calculateResults();
      
      // Submit to backend and get response
      const backendResponse = await submitToBackend(autoSubmit, localResults);
      
      console.log('Using backend response for results:', backendResponse);
      
      // Use backend results if available, otherwise fall back to local results
      const finalResults = backendResponse?.testResult || localResults;
      
      // Navigate to results page with complete data
      navigate(`/courses/${courseId}/final-exam/results`, {
        state: {
          results: {
            ...finalResults,
            mcqResults: finalResults.mcqResults || localResults.mcqResults || [],
            codingResults: finalResults.codingResults || localResults.codingResults || [],
            codingSubmissions: backendResponse?.codingSubmissions || getCodingSubmissionsForResults(),
            timeSpent: (exam.duration * 60) - timeLeft,
            autoSubmitted: autoSubmit,
            securityViolations: securityViolations || [],
            proctoringData: {
              tabSwitchCount,
              keystrokeLogging: keystrokeLogging.length,
              mouseTracking: mouseTracking.length,
              suspiciousActivity,
              systemInfo,
              browserInfo,
              locationData
            }
          },
          finalExam: {
            mcqs: exam.mcqs || [],
            codeChallenges: exam.codeChallenges || [],
            title: exam.title,
            duration: exam.duration,
            totalMarks: exam.totalMarks
          }
        }
      });
      
    } catch (error) {
      console.error('Error submitting final exam:', error);
      setError('Failed to submit final exam');
    }
  };
  
  const submitToBackend = async (autoSubmit, localResults) => {
    try {
      // Convert answers to backend expected format
      const answers = [];
      const codingSubmissions = [];
      
      // Process all questions in order
      allQuestions.forEach((question, index) => {
        if (question.type === 'mcq' && savedAnswers[index] !== undefined) {
          answers[question.originalIndex] = savedAnswers[index];
        } else if (question.type === 'coding' && codingAnswers[index]?.code) {
          // Submit any saved code (even minimal) to ensure it appears in review
          const userCode = codingAnswers[index];
          if (userCode.code && userCode.code.trim().length > 0) {
            codingSubmissions[question.originalIndex] = {
              code: userCode.code,
              language: userCode.language || 'python'
            };
          }
        }
      });
      
      const submissionData = {
        answers: answers,
        codingSubmissions: codingSubmissions,
        timeSpent: (exam.duration * 60) - timeLeft,
        securityViolations: securityViolations,
        autoSubmitted: autoSubmit,
        proctoringData: {
          tabSwitchCount,
          keystrokeLogging: keystrokeLogging.length,
          mouseTracking: mouseTracking.length,
          suspiciousActivity,
          systemInfo,
          browserInfo,
          locationData
        }
      };
      
      console.log('Submitting exam data to backend:', JSON.stringify(submissionData, null, 2));
      
      const response = await axios.post(
        `http://localhost:5000/api/courses/${courseId}/final-exam/submit`, 
        submissionData,
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Backend submission successful:', response.data);
      
      // Update leaderboard with final exam completion
      try {
        await axios.post(
          `http://localhost:5000/api/course-leaderboard/${courseId}/update-score`,
          {
            userId,
            assessmentType: 'finalExam',
            assessmentData: {
              mcqResults: localResults.mcqResults || [],
              codingResults: localResults.codingResults || []
            }
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Leaderboard updated with final exam completion');
      } catch (leaderboardError) {
        console.warn('Failed to update leaderboard for final exam:', leaderboardError);
      }
      
      // Trigger progress refresh for course page
      localStorage.setItem('finalExamCompleted', Date.now().toString());
      
      return response.data;
    } catch (error) {
      console.error('Error submitting to backend:', error);
      throw error;
    }
  };

  const calculateResults = async () => {
    if (!exam || !allQuestions.length) {
      return {
        correctCount: 0,
        wrongCount: 0,
        unattemptedCount: 0,
        percentage: 0,
        totalQuestions: 0,
        mcqCorrect: 0,
        codingCorrect: 0,
        mcqAttempted: 0,
        codingAttempted: 0,
        totalAttempted: 0,
        mcqScore: 0,
        codingScore: 0,
        totalScore: 0,
        mcqResults: [],
        codingResults: []
      };
    }
    
    let correctCount = 0;
    let mcqCorrect = 0;
    let codingCorrect = 0;
    let mcqAttempted = 0;
    let codingAttempted = 0;
    let mcqScore = 0;
    let codingScore = 0;
    const mcqResults = [];
    const codingResults = [];
    
    // Process MCQ answers
    const mcqQuestions = allQuestions.filter(q => q.type === 'mcq');
    mcqQuestions.forEach((question, mcqIndex) => {
      const questionIndex = allQuestions.findIndex(q => q === question);
      const userAnswer = savedAnswers[questionIndex];
      const isCorrect = userAnswer !== undefined && userAnswer === question.correct;
      
      mcqResults.push({
        isCorrect,
        userAnswer,
        correctAnswer: question.correct,
        marks: question.marks || 5
      });
      
      if (userAnswer !== undefined) {
        mcqAttempted++;
        if (isCorrect) {
          correctCount++;
          mcqCorrect++;
          mcqScore += question.marks || 5;
        }
      }
    });
    
    // Process coding challenges with Judge0 execution
    const codingQuestions = allQuestions.filter(q => q.type === 'coding');
    for (let i = 0; i < codingQuestions.length; i++) {
      const question = codingQuestions[i];
      const questionIndex = allQuestions.findIndex(q => q === question);
      const userCode = codingAnswers[questionIndex];
      
      // Count as attempted if user saved any code (even minimal)
      if (userCode && userCode.code && userCode.code.trim().length > 0) {
        codingAttempted++;
      }
      
      // Check if user actually wrote substantial code for execution
      const hasActualCode = userCode && userCode.code && 
        userCode.code.trim().length > 0 && 
        userCode.code.trim() !== (boilerplate[userCode.language] || boilerplate['python'] || '').trim() &&
        !userCode.code.includes('// your code here') &&
        !userCode.code.includes('# your code here') &&
        userCode.code.trim().length > 20; // Minimum meaningful code length
        
      if (hasActualCode) {
        
        try {
          // Execute code with Judge0 for each test case
          let allTestsPassed = true;
          let executionOutput = '';
          
          for (const testCase of question.testCases || []) {
            const languageId = languageMap[question.language || 'python'] || 71;
            
            const submissionData = {
              source_code: btoa(userCode.code),
              language_id: languageId,
              stdin: btoa(testCase.input || ''),
              expected_output: btoa(testCase.expectedOutput || '')
            };
            
            const response = await axios.post('http://localhost:2358/submissions?base64_encoded=true&wait=true', submissionData);
            
            if (response.data.status?.id === 3) { // Accepted
              executionOutput += `Test case passed\n`;
            } else {
              allTestsPassed = false;
              executionOutput += `Test case failed: ${response.data.status?.description || 'Unknown error'}\n`;
              break;
            }
          }
          
          const isCorrect = allTestsPassed && question.testCases && question.testCases.length > 0;
          const verdict = isCorrect ? 'Accepted' : 'Wrong Answer';
          
          codingResults.push({
            verdict: verdict,
            output: executionOutput,
            marks: isCorrect ? (question.marks || 25) : 0  // Only assign marks if Accepted
          });
          
          if (isCorrect) {
            correctCount++;
            codingCorrect++;
            codingScore += question.marks || 25;
          }
        } catch (error) {
          console.error('Code execution error:', error);
          codingResults.push({
            verdict: 'Runtime Error',
            output: 'Code execution failed',
            marks: 0  // No marks for runtime errors
          });
        }
      } else if (userCode && userCode.code && userCode.code.trim().length > 0) {
        // User saved code but it's not substantial enough to execute
        codingResults.push({
          verdict: 'Saved (Not Executed)',
          output: 'Code saved but not executed due to insufficient content',
          marks: 0  // No marks for saved but not executed
        });
      } else {
        // No code saved at all
        codingResults.push({
          verdict: 'Not Attempted',
          output: 'No code submitted',
          marks: 0  // No marks for not attempted
        });
      }
    }
    
    const totalQuestions = allQuestions.length;
    const totalAttempted = mcqAttempted + codingAttempted;
    const wrongCount = totalAttempted - correctCount;
    const unattemptedCount = totalQuestions - totalAttempted;
    const totalScore = mcqScore + codingScore;
    const maxScore = (mcqQuestions.reduce((sum, q) => sum + (q.marks || 5), 0)) + 
                     (codingQuestions.reduce((sum, q) => sum + (q.marks || 25), 0));
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    
    // Debug logging to track scoring
    console.log('📊 Final Score Calculation:', {
      mcqScore,
      codingScore,
      totalScore,
      mcqAttempted,
      codingAttempted,
      codingResults: codingResults.map(r => ({ verdict: r.verdict, marks: r.marks }))
    });
    
    return {
      correctCount,
      wrongCount,
      unattemptedCount,
      percentage,
      totalQuestions,
      mcqCorrect,
      codingCorrect,
      mcqAttempted,
      codingAttempted,
      totalAttempted,
      mcqScore,
      codingScore,
      totalScore,
      maxScore,
      mcqResults,
      codingResults
    };
  };

  // Helper function to format coding submissions for results page
  const getCodingSubmissionsForResults = () => {
    const submissions = [];
    allQuestions.forEach((question, index) => {
      if (question.type === 'coding' && codingAnswers[index]?.code) {
        const userCode = codingAnswers[index];
        if (userCode.code && userCode.code.trim().length > 0) {
          submissions[question.originalIndex] = {
            code: userCode.code,
            language: userCode.language || 'python'
          };
        }
      }
    });
    return submissions;
  };

  const handleForceSubmit = async () => {
    setShowSubmitWarning(false);
    await handleSubmitTest(true);
  };

  // Enhanced code execution function - similar to LessonPage
  const executeCode = async () => {
    console.log("Execute code called with:", { code, language, showOutput });
    
    if (!code || !code.trim()) {
      setOutput("Please write some code first.");
      setShowOutput(true);
      console.log("No code provided, showing message");
      return;
    }

    setIsRunning(true);
    setOutput("Running code...");
    setVerdict("");
    setExecutionError("");
    setShowOutput(true);
    
    console.log("Set running state and output, showOutput:", true);

    try {
      // Get current coding question for comparison
      const currentCodingQuestion = allQuestions.find((q, index) => 
        index === currentQuestion && q.type === 'coding'
      );
      const inputToUse = currentCodingQuestion?.sampleInput || customInput || "";
      
      console.log("Sending request to Judge0:", {
        source_code: code,
        language_id: languageMap[language],
        stdin: inputToUse,
      });
      
      const response = await axios.post("http://localhost:2358/submissions", {
        source_code: code,
        language_id: languageMap[language],
        stdin: inputToUse,
      });
      
      console.log("Judge0 response:", response.data);

      const token = response.data.token;
      
      // Poll for result
      let result;
      let attempts = 0;
      const maxAttempts = 10;
      
      do {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const resultResponse = await axios.get(`http://localhost:2358/submissions/${token}`);
        result = resultResponse.data;
        attempts++;
      } while (result.status.id <= 2 && attempts < maxAttempts);

      if (result.stdout) {
        const actualOutput = result.stdout.trim();
        setOutput(actualOutput);
        
        // Check if there's expected output to compare with
        const expectedOutput = currentCodingQuestion?.sampleOutput?.trim();
        
        if (expectedOutput && actualOutput === expectedOutput) {
          setVerdict("Accepted");
        } else if (expectedOutput) {
          setVerdict("Wrong Answer");
        } else {
          setVerdict("Output Generated");
        }
      } else if (result.stderr) {
        setOutput(result.stderr);
        setVerdict("Runtime Error");
        setExecutionError(result.stderr);
      } else if (result.compile_output) {
        setOutput(result.compile_output);
        setVerdict("Compilation Error");
        setExecutionError(result.compile_output);
      } else {
        setOutput("No output");
        setVerdict("No Output");
      }
      
      addSecurityViolation('Code executed during final exam');
    } catch (error) {
      console.error("Execution error:", error);
      console.error("Error details:", error.response?.data || error.message);
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setOutput("❌ Cannot connect to Judge0 server. Please make sure the Judge0 server is running on localhost:2358");
      } else if (error.response?.status === 422) {
        setOutput("❌ Invalid submission data. Please check your code and try again.");
      } else {
        setOutput(`❌ Error executing code: ${error.message}`);
      }
      setExecutionError("Connection error");
      setVerdict("Error");
    } finally {
      setIsRunning(false);
    }
  };

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

    // 1. Handle MCQ manual saving
    if (currentQuestionData?.type === 'mcq' && selectedAnswers[currentQuestion] !== undefined) {
      setSavedAnswers(prev => ({
        ...prev,
        [currentQuestion]: selectedAnswers[currentQuestion]
      }));
      addSecurityViolation(`MCQ answer saved for question ${currentQuestion + 1}`);

    // 2. Add logic for Coding question manual saving
    } else if (currentQuestionData?.type === 'coding' && code.trim().length > 0) {
      // Save the current code and language to the persistent codingAnswers state
      console.log('💾 Saving coding answer:', {
        questionIndex: currentQuestion,
        codeLength: code.length,
        language: language,
        code: code.substring(0, 100) + '...' // Show first 100 chars for debugging
      });
      
      setCodingAnswers(prev => ({
        ...prev,
        [currentQuestion]: {
          code: code || '',
          language: language
        }
      }));
      addSecurityViolation(`Coding answer saved for question ${currentQuestion + 1}`);
    } else {
      // If no code/answer is present, just return or show a message
      setShowNotification(true);
      setNotificationMessage('Nothing to save. Please enter code/answer.');
      setTimeout(() => { setShowNotification(false); }, 3000);
      return;
    }
    
    // Common UI feedback for both types
    setIsAnswerSaved(true);
    setShowNotification(true);
    setNotificationMessage('Your response saved successfully!');

    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
      setIsAnswerSaved(false);
    }, 3000);
  };

  const getInitialCode = () => {
    const currentQuestionData = allQuestions[currentQuestion];
    if (currentQuestionData?.type !== 'coding') return '';
    
    return currentQuestionData.initialCode || `# Write your solution here
def solution():
    pass`;
  };

  // This useEffect was removed to avoid conflicts with the main useEffect above

  // Resizer functionality - same as ModuleTestPage
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

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  if (loading) {
    return (
      <div className="final-exam-loading">
        <div className="loading-spinner"></div>
        <p>Loading Final Exam...</p>
      </div>
    );
  }

  // Exam submitted - redirect handled in handleSubmitTest
  if (examSubmitted) {
    return (
      <div className="exam-submitted-container">
        <div className="submitted-message">
          <CheckCircle size={64} color="#4CAF50" />
          <h2>Exam Submitted Successfully!</h2>
          <p>Redirecting to results page...</p>
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

  if (showIntro) {
    return (
      <div className="module-test-container">
        <div className="test-intro">
          <div className="intro-header">
            <h1>Final Course Assessment: {course?.title}</h1>
            <p className="intro-subtitle">Enterprise-Grade Secure Examination Environment</p>
          </div>

          <div className="intro-content">
            <div className="test-overview">
              <h2>🏆 Final Course Examination</h2>
              <div className="overview-text">
                <p><strong>Complete Your Learning Journey:</strong> This comprehensive final exam will test your mastery of all course concepts.</p>
                <ul>
                  <li>Score 70% or higher to earn your course certificate</li>
                  <li>This exam uses enterprise-grade security and proctoring</li>
                  <li>All activities are monitored for academic integrity</li>
                  <li>You have {Math.floor(timeLeft / 60)} minutes to complete the assessment</li>
                </ul>
              </div>
            </div>

            <div className="test-syllabus">
              <h3>Assessment Coverage</h3>
              <div className="syllabus-item">
                <span className="syllabus-icon">📚</span>
                <span>Complete {course?.title} Curriculum</span>
              </div>
            </div>

            <div className="test-details">
              <div className="detail-item">
                <div className="detail-icon">🕒</div>
                <div className="detail-content">
                  <h4>{Math.floor(timeLeft / 60)} Minutes</h4>
                  <p>Total time for final assessment</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">📝</div>
                <div className="detail-content">
                  <h4>{(exam?.mcqs?.length || 0) + (exam?.codeChallenges?.length || 0)} Questions</h4>
                  <p>MCQs and coding challenges</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">🏅</div>
                <div className="detail-content">
                  <h4>{exam?.totalMarks || 100} Points</h4>
                  <p>Total marks available</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">👤</div>
                <div className="detail-content">
                  <h4>{localStorage.getItem('username') || 'Student'}</h4>
                  <p>Candidate ID: {userId}</p>
                </div>
              </div>
            </div>

            <div className="security-requirements">
              <h3>🔒 Enterprise Security Requirements</h3>
              <div className="security-grid">
                <div className="security-item">
                  <Camera size={20} />
                  <span>Webcam Proctoring Required</span>
                </div>
                <div className="security-item">
                  <Mic size={20} />
                  <span>Microphone Monitoring</span>
                </div>
                <div className="security-item">
                  <Monitor size={20} />
                  <span>Full Screen Mandatory</span>
                </div>
                <div className="security-item">
                  <Shield size={20} />
                  <span>Tab Switching Blocked</span>
                </div>
                <div className="security-item">
                  <Lock size={20} />
                  <span>Copy/Paste Disabled</span>
                </div>
                <div className="security-item">
                  <Eye size={20} />
                  <span>Activity Tracking</span>
                </div>
              </div>
            </div>

            <div className="test-rules">
              <h3>📋 Examination Rules & Guidelines</h3>
              <ul className="rules-list">
                <li>This is a proctored examination with continuous monitoring</li>
                <li>Webcam and microphone access is required for identity verification</li>
                <li>Exam will automatically enter fullscreen mode when started</li>
                <li>Exiting fullscreen will trigger security violations</li>
                <li>Maximum 3 violations allowed before automatic submission</li>
                <li>The exam will run in fullscreen mode - exiting will trigger warnings</li>
                <li>Tab switching is limited and monitored (max 3 violations)</li>
                <li>All keystrokes and mouse movements are logged for security</li>
                <li>Screenshots and screen recording attempts are blocked</li>
                <li>The exam will auto-submit when time expires</li>
                <li>Ensure stable internet connection throughout the exam</li>
                <li>Any suspicious activity may result in exam termination</li>
              </ul>
            </div>

            <div className="system-check">
              <h3>🔧 System Requirements Check</h3>
              <div className="check-items">
                <div className="check-item">
                  <Wifi size={16} />
                  <span>Internet: {navigator.onLine ? '✅ Connected' : '❌ Disconnected'}</span>
                </div>
                <div className="check-item">
                  <Monitor size={16} />
                  <span>Screen: {window.screen.width}x{window.screen.height}</span>
                </div>
                <div className="check-item">
                  <Battery size={16} />
                  <span>Browser: {getBrowserName()} {getBrowserVersion()}</span>
                </div>
              </div>
            </div>

            <div className="start-section">
              <label className="agreement-checkbox">
                <input 
                  type="checkbox" 
                  checked={agreedToRules}
                  onChange={(e) => setAgreedToRules(e.target.checked)}
                />
                <span>I agree to the examination rules and authorize proctoring for academic integrity</span>
              </label>

              <button 
                className="start-assessment-btn"
                disabled={!agreedToRules}
                onClick={startExam}
              >
                <Shield size={20} />
                Start Secure Final Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!allQuestions || allQuestions.length === 0) {
    return (
      <div className="module-test-container">
        <div className="error-state">
          <p>No exam questions available</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="module-test-container" ref={examRef}>
      {/* Enterprise Security Header */}
      <div className="test-navbar">
        <div className="navbar-left">
          <div className="timer-display">
            <Clock size={16} />
            <span className={`timer-text ${timeLeft < 600 ? 'timer-warning' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        
        <div className="navbar-center">
          <div className="test-title">Final Exam: {course?.title}</div>
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
          <div className="hamburger-menu">
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="hamburger-btn"
            >
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Question Navigation Sidebar */}
      {showSidebar && (
        <div className="sidebar-overlay" onClick={() => setShowSidebar(false)}>
          <div className="question-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
              <h3>Questions</h3>
              <button 
                onClick={() => setShowSidebar(false)}
                className="close-sidebar-btn"
              >
                ×
              </button>
            </div>
            
            {/* MCQs Section */}
            {exam?.mcqs && exam.mcqs.length > 0 && (
              <div className="question-section">
                <h4 className="section-title">
                  MCQs ({exam.mcqs.length})
                </h4>
                <div className="question-grid">
                  {exam.mcqs.map((_, index) => (
                    <button
                      key={`mcq-${index}`}
                      onClick={() => {
                        setCurrentQuestion(index);
                        setShowSidebar(false);
                      }}
                      className={`question-indicator ${
                        currentQuestion === index ? 'current' : ''
                      } ${
                        savedAnswers[index] !== undefined ? 'saved' : ''
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Coding Challenges Section */}
            {exam?.codeChallenges && exam.codeChallenges.length > 0 && (
              <div className="question-section">
                <h4 className="section-title">
                  Coding Challenges ({exam.codeChallenges.length})
                </h4>
                <div className="question-grid">
                  {exam.codeChallenges.map((_, index) => {
                    const questionIndex = (exam?.mcqs?.length || 0) + index;
                    return (
                      <button
                        key={`code-${index}`}
                        onClick={() => {
                          setCurrentQuestion(questionIndex);
                          setShowSidebar(false);
                        }}
                        className={`question-indicator ${
                          currentQuestion === questionIndex ? 'current' : ''
                        } ${
                          codingAnswers[questionIndex] !== undefined ? 'saved' : ''
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content - Dynamic Layout */}
      <div className="test-main-content">
        {allQuestions[currentQuestion]?.type === 'mcq' ? (
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
                  {allQuestions[currentQuestion]?.options?.map((option, index) => (
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
                      <h3>Constraints:</h3>
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
                  className="language-selector"
                >
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript</option>
                </select>
                <div className="toolbar-buttons">
                  <button 
                    className="run-button"
                    onClick={executeCode} 
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
              <div 
                className="code-editor-area" 
                style={{ height: `${codeHeight}%` }}>
                <div className="monaco-editor-container">
                  <MonacoCodeEditor
                    key={`question-${currentQuestion}-${language}`}
                    language={language}
                    allowedLanguages={course?.language ? [course.language] : course?.programmingLanguage ? [course.programmingLanguage] : ['python']}
                    onLanguageChange={(newLang) => {
                      setLanguage(newLang);
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

              {/* Output Section - Exactly like LessonPage */}
              {showOutput && (
                <div 
                  className="output-area" 
                  style={{ height: `${100 - codeHeight}%` }}>
                  <div className="output-section">
                    <div className="output-header">
                      <h3>Output</h3>
                    </div>
                    <div className="output-block">
                      <pre className="output-text">{output || "Click 'Run' to see output here"}</pre>
                    </div>
                    {verdict && (
                      <div className={`verdict-block ${
                        verdict.includes('✅') || verdict.includes('Correct') || verdict.includes('Accepted') 
                          ? 'accepted' 
                          : verdict.includes('Wrong Answer') 
                            ? 'wrong-answer'
                            : verdict.includes('Output Generated')
                              ? 'output-generated'
                              : 'error'
                      }`}>
                        {verdict.includes('✅') || verdict.includes('Correct') || verdict.includes('Accepted') 
                          ? '✅ Accepted' 
                          : verdict.includes('Wrong Answer')
                            ? '❌ Wrong Answer'
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

      {/* Navigation Buttons at Bottom */}
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
              onClick={() => handleSubmitTest()}
              className="nav-btn submit-btn"
              disabled={false} 
            >
              Submit
              <CheckCircle size={20} />
            </button>
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

      {/* Submit Warning Modal */}
      {showSubmitWarning && (
        <div className="submit-warning-overlay">
          <div className="submit-warning-dialog">
            <AlertTriangle size={48} className="warning-icon" />
            <h3>Submit Final Exam?</h3>
            <p>You haven't answered all questions. Are you sure you want to submit?</p>
            <div className="warning-actions">
              <button onClick={() => setShowSubmitWarning(false)} className="cancel-btn">
                Continue Exam
              </button>
              <button onClick={handleForceSubmit} className="submit-btn">
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Warning Modal */}
      {/*{showWarning && ( commentedbyme
        <div className="security-warning-overlay">
          <div className="security-warning-dialog">
            <AlertTriangle size={48} className="warning-icon" />
            <h3 className="warning-heading">Skill Test Requires Fullscreen</h3>
            <p className="warning-text">
              {tabSwitchCount >= 3 ? 
                'Maximum violations reached. Exam will be submitted automatically.' : 
                'Tab switching detected. This skill test requires fullscreen mode. Please stay focused on the exam.'
              }
            </p>
            <button className="warning-action-btn" onClick={() => {
              setShowWarning(false);
            }}>
              {tabSwitchCount >= 3 ? 'Understood' : 'Continue Exam'}
            </button>
          </div>
        </div>
      )}*/}

      {/* Fullscreen Warning Modal */}
      {showFullscreenWarning && (
        <div className="security-warning-overlay">
          <div className="security-warning-dialog">
            <Monitor size={48} className="warning-icon" />
            <h3 className="warning-heading">This exam must be conducted in fullscreen mode</h3>
            <p className="warning-text">
              You have exited fullscreen mode. Violation {fullscreenViolations}/3 recorded. 
              {fullscreenViolations >= 3 ? 
                ' Maximum violations reached - exam will be auto-submitted.' : 
                ' Click the button below to return to fullscreen and continue your exam.'
              }
            </p>
            <button 
              className="warning-action-btn" 
              onClick={() => {
                setShowFullscreenWarning(false);
                if (!autoSubmitTriggered) {
                  const element = examRef.current || document.documentElement;
                  
                  // Try different fullscreen methods for browser compatibility
                  if (element.requestFullscreen) {
                    element.requestFullscreen()
                      .then(() => console.log('Successfully re-entered fullscreen'))
                      .catch(err => console.error('Failed to re-enter fullscreen:', err));
                  } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                  } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                  } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                  }
                }
              }}
            >
              {fullscreenViolations >= 3 ? 'Understood' : 'Return to Fullscreen'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalExamPage;
