import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MonacoCodeEditor from "../components/MonacoCodeEditor";
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Code, 
  HelpCircle, 
  Eye,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Award,
  FileText,
  Target,
  ArrowLeft,
  Check,
  Settings
} from 'lucide-react';
import { validateCourseStructure } from "../utils/courseUtils";
import "./LessonPage_new.css";

const LessonPage = () => {
  const { courseId, topicId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [topicTitle, setTopicTitle] = useState("");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  
  const [stepCodes, setStepCodes] = useState({});
  const [verdict, setVerdict] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('theory');
  const [leftWidth, setLeftWidth] = useState(40);
  const [executionError, setExecutionError] = useState("");
  const [showExpectedOutput, setShowExpectedOutput] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  
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
  
  const isModifiedRef = useRef(false);
  const containerRef = useRef(null);
  
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
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [mcqResult, setMcqResult] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [stepResults, setStepResults] = useState({});
  
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [stepProgress, setStepProgress] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [steps, setSteps] = useState([]);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const attemptedRecovery = useRef(false);

  useEffect(() => {
    const fetchLessonAndProgress = async () => {
      try {
        setLoading(true);
        
        const [lessonResponse, progressResponse] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/courses/${courseId}/topics/${topicId}/lessons/${lessonId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `http://localhost:5000/api/progress?userId=${userId}&courseId=${courseId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        ]);
        
        const lessonData = lessonResponse.data;
        setLesson(lessonData);
        setCode(boilerplate[lessonData.language] || '');
        setLanguage(lessonData.language || 'python');
        setTotalSteps(lessonData.steps?.length || 1);
        
        if (progressResponse.data) {
          const topicProgress = progressResponse.data.topicsProgress?.find(
            tp => tp.topicId === topicId
          );
          const lessonProgress = topicProgress?.lessons?.find(
            lp => lp.lessonId === lessonId
          );
          
          if (lessonProgress?.completed) {
            setIsCompleted(true);
          }
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error('Error checking lesson progress:', err);
        }
        
        if (!lesson) {
          const lessonResponse = await axios.get(
            `http://localhost:5000/api/courses/${courseId}/topics/${topicId}/lessons/${lessonId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setLesson(lessonResponse.data);
          setCode(boilerplate[lessonResponse.data.language] || '');
          setLanguage(lessonResponse.data.language || 'python');
          setTotalSteps(lessonResponse.data.steps?.length || 1);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLessonAndProgress();
  }, [courseId, topicId, lessonId, token, navigate]);

  const fetchCourse = useCallback(async () => {
    if (!courseId || !token) return null;
    
    try {
      const response = await axios.get(`http://localhost:5000/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourse(response.data);
      setCourseTitle(response.data.title);
      return response.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course data');
      return null;
    }
  }, [courseId, token]);

  useEffect(() => {
    if (!courseId || !topicId || !lessonId || !token || !userId) {
      setError('Invalid course, topic, or lesson ID');
      setLoading(false);
      return;
    }

    const fetchLesson = async () => {
      try {
        setLoading(true);
        
        const courseData = await fetchCourse();
        if (!courseData || !courseData.topics) {
          setError('Failed to load course data');
          setLoading(false);
          return;
        }
        
        const validation = await validateCourseStructure(courseId, topicId, lessonId);
        
        if (!validation) {
          setError('Failed to validate course structure');
          setLoading(false);
          return;
        }
        
        if (!validation.valid) {
          if (validation.correctedUrl && validation.correctedUrl !== window.location.pathname) {
            navigate(validation.correctedUrl);
            return;
          }
          
          setError(validation.error || 'Course structure validation failed');
          return;
        }
        
        const { topic, lesson } = validation;
        setLesson(lesson);
        setTopicTitle(topic.title);
        
      } catch (err) {
        const status = err.response?.status;
        const message = err.response?.data?.message || "Failed to load lesson";
        setError(message);

        if (status === 404 && !attemptedRecovery.current) {
          attemptedRecovery.current = true;
          navigate(`/courses/${courseId}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [courseId, topicId, lessonId, token, navigate]);

  const markComplete = async () => {
    if (isCompleted) {
      navigate(`/courses/${courseId}`);
      return;
    }
    
    try {
      const progressResponse = await axios.post(
        `http://localhost:5000/api/progress/lesson`,
        { userId, courseId, topicId, lessonId, completed: true, timeSpent: 0, score: 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const lessonData = {
        topicId,
        lessonId,
        mcqResults: Object.entries(stepResults || {}).filter(([key, result]) => {
          const stepIndex = parseInt(key);
          const step = steps[stepIndex];
          return step?.type === 'mcq';
        }).map(([key, result]) => ({
          stepIndex: parseInt(key),
          isCorrect: result === 'correct',
          type: 'mcq'
        })),
        codingResults: Object.entries(stepResults || {}).filter(([key, result]) => {
          const stepIndex = parseInt(key);
          const step = steps[stepIndex];
          return step?.type === 'coding';
        }).map(([key, result]) => ({
          stepIndex: parseInt(key),
          verdict: result === 'correct' ? 'Accepted' : 'Wrong Answer',
          type: 'coding'
        })),
        mcqQuestions: lesson?.mcqs || [],
        codingQuestions: lesson?.codeChallenges || []
      };
      
      try {
        await axios.post(
          `http://localhost:5000/api/course-leaderboard/${courseId}/update-score`,
          {
            userId,
            assessmentType: 'lesson',
            assessmentData: lessonData
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (leaderboardError) {
        console.warn('Failed to update leaderboard:', leaderboardError);
      }
      
      if (!progressResponse.data.alreadyCompleted) {
        setIsCompleted(true);
      }
      
      localStorage.setItem('lessonCompleted', Date.now().toString());
      navigate(`/courses/${courseId}`);
    } catch (err) {
      if (err.response?.status === 200 && err.response?.data?.alreadyCompleted) {
        setIsCompleted(true);
        navigate(`/courses/${courseId}`);
      } else {
        setError(err.response?.data?.message || "Failed to complete lesson");
      }
    }
  };

  useEffect(() => {
    if (!isModifiedRef.current) {
      setCode(boilerplate[language]);
      setOutput("");
      setVerdict("");
    }
  }, [language]);


  useEffect(() => {
    const currentStep = getCurrentStep();
    if (currentStep?.type === 'theory') {
      setActiveTab('theory');
    } else if (currentStep?.type === 'coding') {
      setActiveTab('statement');
    }
  }, [currentStep, steps]);

  useEffect(() => {
    const currentStepData = getCurrentStep();
    if (currentStepData?.type === 'coding') {
      const savedCode = stepCodes[currentStep];
      
      if (savedCode) {
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
      
      setOutput("");
      setVerdict("");
      setExecutionError("");
      isModifiedRef.current = false;
    }
  }, [currentStep, language, steps]);

  const executeCode = async () => {
    if (!code.trim()) {
      setOutput("Please enter some code first.");
      return;
    }

    setIsRunning(true);
    setOutput("");
    setVerdict("");
    setExecutionError("");

    try {
      const currentStep = getCurrentStep();
      const inputToUse = currentStep?.content?.sampleInput || "";
      
      const response = await axios.post("http://localhost:2358/submissions", {
        source_code: code,
        language_id: languageMap[language],
        stdin: inputToUse,
      });

      const token = response.data.token;
      
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
        
        const currentStep = getCurrentStep();
        const expectedOutput = currentStep?.content?.sampleOutput?.trim();
        
        if (expectedOutput && actualOutput === expectedOutput) {
          setVerdict("Accepted");
          setStepResults(prev => ({
            ...prev,
            [currentStep]: 'correct'
          }));
        } else if (expectedOutput) {
          setVerdict("Wrong Answer");
          setStepResults(prev => ({
            ...prev,
            [currentStep]: 'wrong'
          }));
        } else {
          setVerdict("Output Generated");
          setStepResults(prev => ({
            ...prev,
            [currentStep]: 'correct'
          }));
        }
      } else if (result.stderr) {
        setOutput(result.stderr);
        setVerdict("Runtime Error");
        setExecutionError(result.stderr);
        setStepResults(prev => ({
          ...prev,
          [currentStep]: 'wrong'
        }));
      } else if (result.compile_output) {
        setOutput(result.compile_output);
        setVerdict("Compilation Error");
        setExecutionError(result.compile_output);
        setStepResults(prev => ({
          ...prev,
          [currentStep]: 'wrong'
        }));
      } else {
        setOutput("No output");
        setVerdict("No Output");
        setStepResults(prev => ({
          ...prev,
          [currentStep]: 'wrong'
        }));
      }
      
    } catch (error) {
      setOutput("Error executing code. Make sure Judge0 server is running.");
      setExecutionError("Connection error");
      setVerdict("");
      setStepResults(prev => ({
        ...prev,
        [currentStep]: 'wrong'
      }));
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setOutput("Please enter some code before submitting.");
      return;
    }

    const currentStep = getCurrentStep();
    if (!currentStep?.content?.sampleOutput) {
      setOutput("No expected output available for submission.");
      return;
    }

    setIsRunning(true);
    setOutput("Evaluating solution...");
    setVerdict("");

    try {
      const inputToUse = currentStep.content.sampleInput || "";
      
      const res = await axios.post(
        "http://localhost:2358/submissions?base64_encoded=false&wait=true",
        {
          language_id: languageMap[language],
          source_code: code,
          stdin: inputToUse,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const { stdout, stderr, compile_output } = res.data;
      const finalOutput = stdout || stderr || compile_output || "No output";
      setOutput(finalOutput.trim());

      const expected = currentStep.content.sampleOutput.trim();
      const isSuccess = finalOutput.trim() === expected;
      setVerdict(isSuccess ? "✅ Correct Output" : "❌ Wrong Output");

      if (isSuccess) {
        setStepProgress(prev => ({
          ...prev,
          [currentStep]: true
        }));
      }
    } catch (err) {
      setOutput("Submission error");
      setVerdict("");
    } finally {
      setIsRunning(false);
    }
  };

  const handleMCQAnswer = (mcqIndex, optionIndex) => {
    const current = getCurrentStep()?.content;
    if (!current) return;
    
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);
    const correct = optionIndex === current.correct;
    setIsCorrect(correct);
    setShowExplanation(true);
    setMcqResult(correct ? 'correct' : 'wrong');
    
    setStepResults(prev => ({
      ...prev,
      [currentStep]: correct ? 'correct' : 'wrong'
    }));
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    const correct = answer === getCurrentStep().content.correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);
    setMcqResult(correct ? 'correct' : 'wrong');
  };

  const resetMCQ = () => {
    setSelectedAnswer("");
    setIsAnswered(false);
    setIsCorrect(false);
    setShowExplanation(false);
  };

  const allowRetryMCQ = () => {
    setSelectedAnswer("");
    setIsAnswered(false);
    setIsCorrect(false);
    setShowExplanation(false);
  };

  useEffect(() => {
    if (lesson) {
      const stepsList = [];
      
      if (lesson.content) {
        stepsList.push({
          type: 'theory',
          title: lesson.title || 'Lesson Content',
          icon: <FileText size={20} />,
          content: lesson.content
        });
      }
      
      if (lesson.mcqs?.length > 0) {
        lesson.mcqs.forEach((mcq, index) => {
          stepsList.push({
            type: 'mcq',
            title: `Question ${index + 1}`,
            icon: <Target size={20} />,
            content: mcq,
            mcqIndex: index
          });
        });
      }
      
      if (lesson.codeChallenges?.length > 0) {
        lesson.codeChallenges.forEach((challenge, index) => {
          stepsList.push({
            type: 'coding',
            title: `Statement`,
            icon: <Code size={20} />,
            content: challenge,
            challengeIndex: index
          });
        });
      }
      
      if (lesson.review) {
        stepsList.push({
          type: 'review',
          title: 'Review',
          icon: <CheckCircle size={20} />,
          content: lesson.review
        });
      }
      
      setSteps(stepsList);
      setTotalSteps(stepsList.length);
    }
  }, [lesson]);

  const getCurrentStep = () => {
    return steps[currentStep] || null;
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      if (getCurrentStep()?.type === 'theory') {
        setStepResults(prev => ({
          ...prev,
          [currentStep]: 'completed'
        }));
      }
      setCurrentStep(currentStep + 1);
      resetMCQ();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      resetMCQ();
    }
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
    resetMCQ();
  };

  const getStepStatus = (stepIndex) => {
    const step = steps[stepIndex];
    const result = stepResults[stepIndex];
    
    if (step?.type === 'theory') {
      return result === 'completed' ? 'completed-green' : 'completed';
    } else if (step?.type === 'mcq') {
      if (result === 'correct') return 'completed-green';
      if (result === 'wrong') return 'completed-red';
      return 'completed';
    } else if (step?.type === 'coding') {
      if (result === 'correct') return 'completed-green';
      if (result === 'wrong') return 'completed-red';
      return 'completed';
    }
    return 'completed';
  };

  const canProceedToNext = () => {
    const step = getCurrentStep();
    if (!step) return false;
    
    if (step.type === 'mcq') {
      return true;
    }
    
    if (step.type === 'coding') {
      return true;
    }
    
    return true;
  };


  if (loading) return <div>Loading lesson...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={`lesson-page dark-mode ${getCurrentStep()?.type === 'theory' ? 'theory-black' : ''}`}>
      <div className="dark-progress-navbar">
        <div className="navbar-content">
          <div className="navbar-left-icons">
            <button 
              onClick={() => navigate(`/courses/${courseId}`)} 
              className="course-back-icon"
              title="Back to Course"
            >
              <ArrowLeft size={16} />
            </button>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="menu-toggle-button"
              title="Course Menu"
            >
              <Menu size={16} />
            </button>
            <div 
              className={`status-check-indicator ${
                getCurrentStep()?.type === 'theory' && stepResults[currentStep] === 'completed' ? 'completed-green' :
                getCurrentStep()?.type === 'mcq' && stepResults[currentStep] === 'correct' ? 'completed-green' :
                getCurrentStep()?.type === 'mcq' && stepResults[currentStep] === 'wrong' ? 'completed-red' :
                getCurrentStep()?.type === 'coding' && stepResults[currentStep] === 'correct' ? 'completed-green' :
                getCurrentStep()?.type === 'coding' && stepResults[currentStep] === 'wrong' ? 'completed-red' :
                ''
              }`}
              title="Progress Status"
            >
              {getCurrentStep()?.type === 'theory' && stepResults[currentStep] === 'completed' ? (
                <Check size={16} className="status-check-green" />
              ) : getCurrentStep()?.type === 'mcq' && stepResults[currentStep] === 'correct' ? (
                <Check size={16} className="status-check-green" />
              ) : getCurrentStep()?.type === 'mcq' && stepResults[currentStep] === 'wrong' ? (
                <X size={16} className="status-check-red" />
              ) : getCurrentStep()?.type === 'coding' && stepResults[currentStep] === 'correct' ? (
                <Check size={16} className="status-check-green" />
              ) : getCurrentStep()?.type === 'coding' && stepResults[currentStep] === 'wrong' ? (
                <X size={16} className="status-check-red" />
              ) : (
                <Check size={16} />
              )}
            </div>
          </div>

          <div className="lesson-progress-navigation">
            <button 
              onClick={prevStep} 
              disabled={currentStep === 0}
              className="step-previous-button"
              title="Previous Step"
            >
              <ArrowLeft size={14} />
              <span>Prev</span>
            </button>

            <div className="segment-progress-dots">
              {steps?.map((step, index) => (
                <div
                  key={index}
                  className={`progress-step-dot ${
                    index < currentStep ? getStepStatus(index) : 
                    index === currentStep ? 'active-step' : 'pending-step'
                  }`}
                  onClick={() => index <= currentStep && goToStep(index)}
                  title={`${step.type.charAt(0).toUpperCase() + step.type.slice(1)}: ${step.title || `Step ${index + 1}`}`}
                />
              ))}
            </div>

            <button 
              onClick={currentStep < totalSteps - 1 ? nextStep : markComplete}
              disabled={!canProceedToNext()}
              className={`step-next-button ${
                currentStep < totalSteps - 1 ? 'continue-button' : 'complete-action'
              }`}
              title={currentStep < totalSteps - 1 ? "Next Step" : "Complete Lesson"}
            >
              <span>{currentStep < totalSteps - 1 ? 'Next' : 'Complete'}</span>
              {currentStep < totalSteps - 1 ? 
                <ChevronRight size={14} /> : 
                <CheckCircle size={14} />
              }
            </button>
          </div>
        </div>
      </div>

      <div className={`course-sidebar-panel ${sidebarOpen ? 'open-sidebar' : 'closed-sidebar'}`}>
        <div className="sidebar-header-area">
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="sidebar-close-button"
            title="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="sidebar-content-area">
          <div className="sidebar-course-info">
            <div className="course-icon-container">
              <img src="/api/placeholder/48/48" alt="Python" className="course-logo-image" />
            </div>
            <div className="course-details-block">
              <h3 className="course-name-heading">{courseTitle || 'Learn Python Programming'}</h3>
              <a href={`/courses/${courseId}/syllabus`} className="syllabus-view-link">View full syllabus</a>
            </div>
          </div>
          
          <div className="module-topic-list">
            {course?.topics?.map((topic, topicIndex) => {
              const isCurrentTopic = topic._id === topicId;
              const isExpanded = expandedTopics[topicIndex] ?? isCurrentTopic;
              
              return (
                <div key={topicIndex} className="module-section-container">
                  <div 
                    className={`module-header-title clickable-header ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => setExpandedTopics(prev => ({
                      ...prev,
                      [topicIndex]: !isExpanded
                    }))}
                  >
                    <div className="module-number-badge">{topicIndex + 1}</div>
                    <h3 className="module-title-heading">{topic.title}</h3>
                    <div className="expand-indicator-icon">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="module-lessons-list">
                      {topic.lessons?.map((lesson, lessonIndex) => {
                        const isCurrentLesson = isCurrentTopic && lesson._id === lessonId;
                        return (
                          <div 
                            key={lessonIndex} 
                            className={`lesson-item-row ${isCurrentLesson ? 'active-lesson' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/courses/${courseId}/topic/${topic._id}/lesson/${lesson._id}`);
                            }}
                          >
                            <div className="lesson-status-marker">
                              {isCurrentLesson ? (
                                <div className="active-dot-marker"></div>
                              ) : (
                                <div className="pending-dot-marker"></div>
                              )}
                            </div>
                            <span className="lesson-title-text">
                              {lesson.title}
                            </span>
                          </div>
                        );
                      })}
                      
                      {topic.moduleTest && (
                        <div 
                          className="lesson-item-row module-test-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/courses/${courseId}/topic/${topic._id}/secure-test`);
                          }}
                        >
                          <div className="lesson-status-marker">
                            <div className="test-dot-indicator"></div>
                          </div>
                          <span className="lesson-title-text module-test-label">
                            <Award size={16} />
                            Knowledge Assessment
                          </span>
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
      
      {sidebarOpen && <div className="sidebar-background-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <div className={`lesson-main-content ${getCurrentStep()?.type === 'mcq' ? 'mcq-no-scroll-mode' : ''}`}>
        {getCurrentStep() && (
          <div className="step-content-container">
            {getCurrentStep().type !== 'coding' && (
              <div className="step-header-banner">
                <h2 className="step-header-title">
                  {getCurrentStep().icon}{' '}
                  {getCurrentStep().type === 'mcq' ? 'Statement' : getCurrentStep().title}
                </h2>
              </div>
            )}
            
            <div className="current-step-content-area">
              {getCurrentStep().type === 'theory' && (
                <div className="theory-step-display">
                  <div className="theory-content-wrapper">
                    <div className="theory-html-body" dangerouslySetInnerHTML={{ __html: getCurrentStep().content }} />
                  </div>
                </div>
              )}

              {getCurrentStep().type === 'mcq' && (
                <div className="mcq-split-solve-layout">
                  <div className="solve-layout-container" ref={containerRef}>
                    <div className="solve-left-panel" style={{ width: `${leftWidth}%` }}>
                      <div className="solve-content-body">
                        <div className="mcq-statement-body">
                          <h2 className="mcq-statement-title">{getCurrentStep().title || 'MCQ'}</h2>
                          <div className="mcq-statement-question">
                            <p>{getCurrentStep().content.question}</p>
                          </div>
                          {getCurrentStep().content?.hint && (
                            <div className="mcq-statement-hint-box">
                              <strong>Hint: </strong>{getCurrentStep().content.hint}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="panel-resizer-handle" onMouseDown={startDrag} />

                    <div className="solve-right-panel" style={{ width: `${100 - leftWidth}%` }}>
                      <div className="mcq-question-interaction-box">
                        <h3 className="mcq-question-title">{getCurrentStep().content.question}</h3>
                        {getCurrentStep().content?.hint && (
                          <div className="mcq-question-hint-text">{getCurrentStep().content.hint}</div>
                        )}

                        <div className="mcq-options-list">
                          {getCurrentStep().content?.options?.map((opt, optionIndex) => {
                            const isSelected = selectedAnswer === optionIndex;
                            const isCorrectOption = isAnswered && optionIndex === getCurrentStep().content.correct;
                            const isIncorrectSelected = isAnswered && isSelected && !isCorrectOption;

                            return (
                              <label
                                key={optionIndex}
                                className={`mcq-option-tile ${
                                  isCorrectOption
                                    ? 'correct-option'
                                    : isIncorrectSelected
                                    ? 'incorrect-option'
                                    : isSelected
                                    ? 'selected-option'
                                    : ''
                                } checkbox-option-container`}
                                onClick={() => {
                                  if (!isAnswered) {
                                    handleMCQAnswer(0, optionIndex);
                                  }
                                }}
                              >
                                <svg 
                                    width="18px" 
                                    height="18px" 
                                    viewBox="0 0 18 18" 
                                    className="checkbox-svg-icon"
                                >
                                  <path d="M 1 9 L 1 9 c 0 -5 3 -8 8 -8 L 9 1 C 14 1 17 5 17 9 L 17 9 c 0 4 -4 8 -8 8 L 9 17 C 5 17 1 14 1 9 L 1 9 Z"></path>
                                  <polyline points="1 9 7 14 15 4"></polyline>
                                </svg>
                                <span className="option-label-text">{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                        
                        {showExplanation && (
                          <div className="mcq-explanation-feedback">
                            <div className={`mcq-explanation-sidebar ${isCorrect ? 'correct-bar' : 'wrong-bar'}`} />
                            <div className="mcq-explanation-content-body">
                              <div className={`verdict-header-message ${isCorrect ? 'correct-verdict-status' : 'wrong-verdict-status'}`}>
                                <h4 className="verdict-status-title">{isCorrect ? '✅ Correct!' : '❌ Incorrect'}</h4>
                              </div>
                              <div className="explanation-text-content">
                                <h5>Reason:</h5>
                                <p>
                                  {isCorrect 
                                    ? (getCurrentStep().content?.explanation || 'Great job! Your answer is correct. Here is a brief explanation for why this option is right.')
                                    : (getCurrentStep().content?.wrongExplanation || 'That\'s not quite right. The correct answer provides a better solution.')
                                  }
                                </p>
                              </div>
                              {!isCorrect && (
                                <button 
                                  className="mcq-retry-action-button"
                                  onClick={allowRetryMCQ}
                                >
                                  Try Again
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {getCurrentStep().type === 'coding' && (
                <div className="coding-challenge-split-view">
                  <div className="solve-layout-container" ref={containerRef}>
                    <div className="solve-left-panel" style={{ width: `${leftWidth}%` }}>
                      <div className="left-panel-tabs-navigation">
                        <button
                          className={activeTab === "statement" ? "active-tab-button" : "inactive-tab-button"}
                          onClick={() => setActiveTab("statement")}
                        >
                          Statement
                        </button>
                        <button
                          className={activeTab === "submissions" ? "active-tab-button" : "inactive-tab-button"}
                          onClick={() => setActiveTab("submissions")}
                        >
                          Submissions
                        </button>
                      </div>

                      <div className="left-panel-tab-content">
                        {activeTab === "statement" ? (
                          <>
                            <h2>{getCurrentStep().content.title}</h2>
                            <div className="problem-description-section">
                              <p>{getCurrentStep().content.description}</p>
                              {getCurrentStep().content.constraints && (
                                <div className="constraints-info-block">
                                  <h3>Constraints:</h3>
                                  <p>{getCurrentStep().content.constraints}</p>
                                </div>
                              )}
                            </div>
                            
                            {getCurrentStep().content.sampleInput && getCurrentStep().content.sampleOutput && (
                              <div className="sample-testcase-area">
                                <h3>Sample Test Cases:</h3>
                                <div className="testcase-code-block">
                                  <strong>Input:</strong>
                                  <pre className="input-code-text">{getCurrentStep().content.sampleInput}</pre>
                                  <strong>Output:</strong>
                                  <pre className="output-code-text">{getCurrentStep().content.sampleOutput}</pre>
                                </div>
                              </div>
                            )}
                          </>
                        ) : activeTab === "submissions" ? (
                          <div className="submission-history-section">
                            <h2>Submission History</h2>
                            <div className="empty-submissions-message">
                              <p>No submissions yet.</p>
                              <p className="submission-hint-text">Submit your solution to see it here.</p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="panel-resizer-handle" onMouseDown={startDrag} />

                    <div className="solve-right-panel" style={{ width: `${100 - leftWidth}%` }}>
                      <div className="editor-toolbar-header">
                        <select
                          value={language}
                          onChange={(e) => {
                            setLanguage(e.target.value);
                            isModifiedRef.current = false;
                            setOutput("");
                            setVerdict("");
                          }}
                          className="language-selector-dropdown"
                        >
                          <option value="cpp">C++</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                          <option value="javascript">JavaScript</option>
                        </select>
                        <div className="toolbar-action-buttons">
                          <button 
                            className="run-code-button"
                            onClick={executeCode} 
                            disabled={isRunning}
                          >
                            {isRunning ? 'Running...' : 'Run'}
                          </button>
                        </div>
                      </div>

                      <div className="monaco-editor-wrapper">
                        <MonacoCodeEditor
                          key={`step-${currentStep}-${language}`}
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
                            setCode(val || '');
                            setStepCodes(prev => ({
                              ...prev,
                              [currentStep]: {
                                code: val || '',
                                language: language
                              }
                            }));
                            isModifiedRef.current = true;
                          }}
                          height="100%"
                          showLanguageSelector={false}
                        />
                      </div>

                      <div className="output-console-section">
                        <div className="output-header-bar">
                          <h3>Output</h3>
                        </div>
                        <div className="output-content-block">
                          <pre className="output-text-content">{output || "Click 'Run' to see output here"}</pre>
                        </div>
                        {verdict && (
                          <div className={`verdict-status-message ${
                            verdict.includes('✅') || verdict.includes('Correct') || verdict.includes('Accepted') 
                              ? 'accepted-verdict' 
                              : verdict.includes('Wrong Answer') 
                                ? 'wrong-answer-verdict'
                                : verdict.includes('Output Generated')
                                  ? 'output-generated-verdict'
                                  : 'error-verdict'
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
                  </div>
                </div>
              )}

              {getCurrentStep().type === 'review' && (
                <div className="review-step-area">
                  <div className="review-content-text" dangerouslySetInnerHTML={{ __html: getCurrentStep().content }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPage;