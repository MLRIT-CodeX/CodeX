// @ts-nocheck
import React, { useEffect, useState, useCallback } from "react";
import PropTypes from 'prop-types';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  CheckCircle, 
  Lock,
  Award,
  Target,
  Code,
  FileText,
  ChevronRight,
  Zap,
  Trophy,
  TrendingUp,
  Shield,
  Brain,
  Timer,
  AlertTriangle
} from "lucide-react";
import CourseLeaderboard from "./CourseLeaderboard.js";
import Navbar from "../components/Navbar.js";
import { shouldShowNavbar } from "../utils/navbarUtils";
import "./ModernCourseDetail.css";

// About Section Component
/**
 * @param {{
 *   courseId: string;
 *   userId: string;
 *   token: string;
 *   refreshTrigger: number;
 * }} props
 */
function AboutSection({ courseId, userId, token, refreshTrigger }) {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/courses/${courseId}/about`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAboutData(response.data);
        setError("");
      } catch (err) {
        console.error('Error fetching about data:', err);
        setError("Failed to load about content");
        setAboutData(null);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && token) {
      fetchAboutData();
    }
  }, [courseId, token]);

  if (loading) {
    return (
      <div className="about-section">
        <div className="about-card">
          <div className="about-loading">
            <div className="modern-spinner"></div>
            <p>Loading about content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !aboutData) {
    return (
      <div className="about-section">
        <div className="about-card">
          <div className="about-loading">
            <p>No data found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="about-section">
      <div className="about-card">
        <div className="about-header">
          <h2 className="about-title">{aboutData.title}</h2>
        </div>
        <div className="about-content" dangerouslySetInnerHTML={{ __html: aboutData.content }} />
      </div>
    </div>
  );
};

AboutSection.propTypes = {
  courseId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired,
  refreshTrigger: PropTypes.number.isRequired,
};

const ModernCourseDetail = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // State management
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('curriculum'); // Always default to curriculum
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFetchingProgress, setIsFetchingProgress] = useState(false);

  // Debug: Log state changes
  useEffect(() => {
    console.log('>>> STATE CHANGE: isEnrolled =', isEnrolled);
  }, [isEnrolled]);

  useEffect(() => {
    console.log('>>> STATE CHANGE: course =', course?.title || 'null');
  }, [course]);

  useEffect(() => {
    console.log('>>> STATE CHANGE: activeTab =', activeTab);
  }, [activeTab]);

  // Check if navbar should be shown
  const showNavbar = shouldShowNavbar(location.pathname);

  // Progress data fetching function
  const fetchProgressData = useCallback(async () => {
    if (!token || !userId || !courseId || isFetchingProgress) {
      console.log('Skipping progress fetch - missing data or fetch in progress');
      return;
    }
    
    try {
      setIsFetchingProgress(true);
      console.log('Fetching progress data for userId:', userId, 'courseId:', courseId);
      
      // First fetch basic progress
      let basicProgress = {};
      try {
        const progressResponse = await axios.get(
          `http://localhost:5000/api/progress?userId=${userId}&courseId=${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        basicProgress = progressResponse.data || {};
      } catch (error) {
        console.warn('Failed to fetch basic progress (expected for new users):', error.message);
      }

      // Then try to fetch module progress only if we have some basic progress
      let moduleProgress = {};
      if (basicProgress.modules?.length > 0) {
        try {
          const moduleProgressRes = await axios.get(
            `http://localhost:5000/api/courses/${courseId}/modules/progress/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          moduleProgress = moduleProgressRes.data || {};
        } catch (error) {
          console.warn('Failed to fetch module progress (expected for new users):', error.message);
        }
      } else {
        console.log('No basic progress found, skipping module progress fetch');
      }

      setProgress({
        ...basicProgress,
        moduleProgress,
        stats: basicProgress.stats || {
          totalScore: 0,
          completedLessons: 0,
          completedModules: 0
        },
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setProgress({
        stats: {
          totalScore: 0,
          completedLessons: 0,
          completedModules: 0
        },
        moduleProgress: {},
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setIsFetchingProgress(false);
    }
  }, [courseId, userId, token]); // Removed isFetchingProgress to prevent infinite loop
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);

        console.log("=== ENROLLMENT CHECK START ===");
        console.log("CourseId:", courseId);
        console.log("UserId:", userId);

        // 1️⃣ Fetch course details
        const courseResponse = await axios.get(
          `http://localhost:5000/api/courses/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("=== COURSE DATA FETCHED ===");
        console.log("Course Title:", courseResponse.data.title);
        console.log("Course has modules property:", !!courseResponse.data.modules);
        console.log("Modules array length:", courseResponse.data.modules?.length || 0);
        console.log("Full course object:", courseResponse.data);
        console.log("Modules data:", courseResponse.data.modules);

        setCourse(courseResponse.data);
        console.log("Course Loaded:", courseResponse.data.title);

        // 2️⃣ Check enrollment USING ONLY /courses/user/:userId
        if (token && userId) {
          console.log("Checking enrollment using /courses/user/:userId");

          const enrolledResponse = await axios.get(
            `http://localhost:5000/api/courses/user/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const enrolledCourses = enrolledResponse.data?.courses || [];

          console.log("User enrolled courses:", enrolledCourses);

          const enrolled = enrolledCourses.some(
            (c) => (c._id?.toString() || c._id) === courseId.toString()
          );

          console.log("Is enrolled?", enrolled);

          setIsEnrolled(enrolled);

          setActiveTab("curriculum");

          if (enrolled) {
            console.log("User enrolled → fetching progress");
            await fetchProgressData();
          } else {
            console.log("User NOT enrolled → show enroll button");
          }
        } else {
          console.log("User not logged in → default to not enrolled");
          setIsEnrolled(false);
          setActiveTab("curriculum");
        }

        console.log("=== ENROLLMENT CHECK COMPLETE ===");
      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, token, userId]); // Removed fetchProgressData to prevent infinite loop


  const handleEnroll = async () => {
    try {
      console.log("=== ENROLL CLICKED ===");
      console.log("POST /courses/:id/enroll");
      console.log("Course ID:", courseId);
      console.log("User ID:", userId);

      // 1️⃣ Enroll request
      const enrollResponse = await axios.post(
        `http://localhost:5000/api/courses/${courseId}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Enrollment response:", enrollResponse.data);
      console.log("Enrollment successful → waiting 500ms before verifying...");

      // Wait a bit for database to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // 2️⃣ Verify using /courses/user/:userId
      const verify = await axios.get(
        `http://localhost:5000/api/courses/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Verification response:", verify.data);
      const enrolledCourses = verify.data?.courses || [];
      console.log("Enrolled courses:", enrolledCourses.map(c => ({ id: c._id, title: c.title })));

      const isNowEnrolled = enrolledCourses.some(
        (c) => {
          const courseIdMatch = (c._id?.toString() || c._id) === courseId.toString();
          console.log(`Comparing: ${c._id} === ${courseId} → ${courseIdMatch}`);
          return courseIdMatch;
        }
      );

      console.log("Verified enrollment:", isNowEnrolled);

      setIsEnrolled(isNowEnrolled);

      if (isNowEnrolled) {
        await fetchProgressData();
      } else {
        console.warn("⚠️ Enrollment succeeded but verification failed. Forcing enrolled state.");
        // Force enrolled state since enrollment API succeeded
        setIsEnrolled(true);
        await fetchProgressData();
      }
    } catch (error) {
      console.error("Enrollment error:", error);

      if (error.response?.status === 404) {
        alert("❌ Enrollment API not found. Check backend route.");
      } else {
        alert("Enrollment failed.");
      }
    }
  };

  const reloadProgress = async () => {
    await fetchProgressData();
  };

  const startLesson = async (topic, lesson) => {
    try {
      await axios.post(`http://localhost:5000/api/progress/lesson`, {
        userId,
        courseId: courseId,
        topicId: topic?._id,
        lessonId: lesson?._id,
        completed: false,
        timeSpent: 0,
        score: 0,
        topicTitle: topic?.title || 'Unknown Topic'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await reloadProgress();
      navigate(`/courses/${courseId}/topic/${topic?._id}/lesson/${lesson?._id}`);
    } catch (error) {
      console.error('Error starting lesson:', error);
    }
  };

  const startTopic = (topicIndex) => {
    const topic = (course.topics || [])[topicIndex];
    if (!topic) return;
    const firstLesson = (topic.lessons || [])[0];
    if (firstLesson) {
      startLesson(topic, firstLesson);
    }
  };

  if (loading) {
    return (
      <div className="modern-loading">
        <div className="loading-container">
          <div className="modern-spinner"></div>
          <p className="loading-text">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>Course not found</h2>
          <button onClick={() => navigate('/courses')} className="modern-back-btn">
            <ArrowLeft size={20} />
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // Calculate accurate progress based on actual course structure
  const calculateCourseProgress = () => {
    if (!course?.topics || !progress) return { percent: 0, completed: 0, total: 0, details: {} };
    
    const topicsProgress = progress.topicsProgress || [];
    const leaderboardStats = progress.leaderboardStats || {};
    
    let totalLessons = 0;
    let totalModuleTests = 0;
    let totalFinalExams = course.finalExam ? 1 : 0;
    
    let completedLessons = 0;
    let completedModuleTests = 0;
    let completedFinalExams = 0;
    let completedTopics = 0;
    
    course.topics.forEach(topic => {
      const topicProgress = topicsProgress.find(tp => 
        (tp.topicId?.toString() || tp.topicId) === (topic._id?.toString() || topic._id)
      );
      
      const lessonsInTopic = topic.lessons?.length || 0;
      totalLessons += lessonsInTopic;
      
      if (topicProgress?.lessons) {
        const completedLessonsInTopic = topicProgress.lessons.filter(l => l.completed).length;
        completedLessons += completedLessonsInTopic;
      }
      
      if (topic.moduleTest) {
        totalModuleTests++;
        if (topicProgress?.moduleTest?.completed) {
          completedModuleTests++;
        }
      }
      
      const allLessonsCompleted = lessonsInTopic === 0 || 
        (topicProgress?.lessons?.filter(l => l.completed).length === lessonsInTopic);
      const moduleTestCompleted = !topic.moduleTest || topicProgress?.moduleTest?.completed;
      
      if (allLessonsCompleted && moduleTestCompleted) {
        completedTopics++;
      }
    });
    
    if (progress.finalExamCompleted || leaderboardStats.progress?.finalExamCompleted) {
      completedFinalExams = 1;
    }
    
    const totalComponents = totalLessons + totalModuleTests + totalFinalExams;
    const completedComponents = completedLessons + completedModuleTests + completedFinalExams;
    const percent = totalComponents > 0 ? Math.round((completedComponents / totalComponents) * 100) : 0;
    
    return { 
      percent, 
      completed: completedTopics, 
      total: course.topics.length,
      details: {
        lessonsCompleted: completedLessons,
        totalLessons,
        moduleTestsCompleted: completedModuleTests,
        totalModuleTests,
        finalExamCompleted: completedFinalExams > 0,
        totalFinalExams,
        overallScore: leaderboardStats.overallScore || 0,
        breakdown: leaderboardStats.breakdown || {},
        totalComponents,
        completedComponents
      }
    };
  };
  
  const { percent: progressPercent, details: progressDetails } = calculateCourseProgress();

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getDifficultyDisplay = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'Beginner';
      case 'medium': return 'Intermediate';
      case 'hard': return 'Advanced';
      default: return difficulty;
    }
  };

  return (
    <>
      {showNavbar && <Navbar />}
      <div className={`modern-course-container ${showNavbar ? 'with-navbar' : ''}`}>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-header">
            <button onClick={() => navigate('/courses')} className="modern-back-btn">
              <ArrowLeft size={24} />
            </button>
            <div className="badge-container">
              <span 
                className={`difficulty-pill ${course.difficulty.toLowerCase()}`}
                style={{ backgroundColor: getDifficultyColor(course.difficulty) }}
              >
                {getDifficultyDisplay(course.difficulty)}
              </span>
            </div>
          </div>
          <div className="course-hero">
            <div className="course-info">
              <p className="hero-title">{course.title}</p>
              <p className="hero-description">{course.description}</p>

              <div className="stats-row">
                <div className="stat">
                  <Clock size={18} />
                  <span>{course.duration || '2-3 hours'}</span>
                </div>
                <div className="stat">
                  <Users size={18} />
                  <span>{course.enrolledCount || 0} students</span>
                </div>
                <div className="stat">
                  <BookOpen size={18} />
                  <span>{course.modules?.length || 0} modules</span>
                </div>
                <div className="stat">
                  <Star size={18} fill="#fbbf24" color="#fbbf24" />
                  <span>4.8 rating</span>
                </div>
              </div>
            </div>

            {/* Action Panel */}
            <div className="action-panel">
              {!isEnrolled ? (
                <div className="enroll-card">
                  <div className="price-display">
                    <span className="price-label">Price</span>
                    <span className="price-value">Free</span>
                  </div>

                  <button onClick={handleEnroll} className="modern-enroll-btn">
                    <Play size={20} />
                    Enroll Now
                  </button>

                  <div className="features-list">
                    <div className="feature">
                      <CheckCircle size={16} />
                      <span>Lifetime access</span>
                    </div>
                    <div className="feature">
                      <CheckCircle size={16} />
                      <span>Certificate included</span>
                    </div>
                    <div className="feature">
                      <CheckCircle size={16} />
                      <span>Interactive coding</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="enroll-card">
                  <div className="price-display">
                    <span className="price-label">Status</span>
                    <span className="price-value enrolled-status">
                      <CheckCircle size={20} color="#10b981" />
                      Enrolled
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (progressPercent > 0) {
                        const firstIncompleteTopicIndex = (course.topics || []).findIndex((topic) => {
                          const tProg = ((progress?.topicsProgress || [])).find(tp =>
                            (tp.topicId?.toString?.() || tp.topicId) ===
                            (topic._id?.toString?.() || topic._id)
                          );
                          return !tProg?.completed;
                        });

                        if (firstIncompleteTopicIndex !== -1) {
                          const topic = course.topics[firstIncompleteTopicIndex];
                          const firstLesson = (topic.lessons || [])[0];
                          if (firstLesson) {
                            startLesson(topic, firstLesson);
                          }
                        } else {
                          startTopic(0);
                        }
                      } else {
                        startTopic(0);
                      }
                    }}
                    className="modern-enroll-btn"
                  >
                    <Play size={20} />
                    {progressPercent > 0 ? "Continue Course" : "Start Course"}
                  </button>

                  <div className="features-list">
                    <div className="feature">
                      <CheckCircle size={16} />
                      <span>Lifetime access</span>
                    </div>
                    <div className="feature">
                      <CheckCircle size={16} />
                      <span>Certificate included</span>
                    </div>
                    <div className="feature">
                      <CheckCircle size={16} />
                      <span>Interactive coding</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Navigation */}
      <div className="modern-nav">
        <div className="nav-container">
          <div className="nav-tabs">
            {isEnrolled && (
              <button
                className={`modern-tab ${
                  activeTab === "leaderboard" ? "active" : ""
                }`}
                onClick={() => setActiveTab("leaderboard")}
              >
                <Trophy size={18} />
                <span>Leaderboard</span>
              </button>
            )}

            <button
              className={`modern-tab ${
                activeTab === "curriculum" ? "active" : ""
              }`}
              onClick={() => setActiveTab("curriculum")}
            >
              <BookOpen size={18} />
              <span>Curriculum</span>
            </button>

            <button
              className={`modern-tab ${
                activeTab === "overview" ? "active" : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <FileText size={18} />
              <span>About</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="modern-content">
        {activeTab === "curriculum" && (
          <div className="curriculum-section">
            {(() => {
              // Handle both 'modules' and 'topics' properties
              const modulesList = course.modules || course.topics || [];
              
              console.log("=== CURRICULUM DEBUG ===");
              console.log("Course has modules:", !!course.modules);
              console.log("Course has topics:", !!course.topics);
              console.log("Modules count:", modulesList.length);
              console.log("Modules data:", modulesList);
              
              if (modulesList.length === 0) {
                return (
                  <div className="no-modules-message">
                    <BookOpen size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <h3>No Curriculum Available</h3>
                    <p>This course doesn't have any modules yet.</p>
                  </div>
                );
              }
              
              return (
                <div className="modules-grid">
                  {modulesList.map((module, moduleIndex) => {
                    const isLocked = !isEnrolled;

                    return (
                      <div
                        key={moduleIndex}
                        className={`modern-module ${isLocked ? "locked" : ""}`}
                      >
                        <div className="module-card">
                          <div className="module-header">
                            <div className="module-number">
                              {isLocked ? (
                                <Lock size={18} />
                              ) : (
                                <span className="number">{moduleIndex + 1}</span>
                              )}
                            </div>

                            <div className="module-content">
                              <div className="module-title-row">
                                <h4 className="module-title">{module.title || module.module || `Module ${moduleIndex + 1}`}</h4>

                                {!isLocked && (
                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/courses/${courseId}/module/${module._id}/theory`
                                      )
                                    }
                                    className="review-btn"
                                  >
                                    Start
                                <ChevronRight size={14} />
                              </button>
                            )}
                          </div>

                          <p className="module-description">
                            {module.description}
                          </p>

                          {/* Module Items */}
                          <div className="module-items">
                            {/* THEORY */}
                            <div
                              className={`module-item ${
                                isLocked ? "locked" : ""
                              }`}
                              onClick={() =>
                                !isLocked &&
                                navigate(
                                  `/courses/${courseId}/module/${module._id}/theory`
                                )
                              }
                            >
                              <div className="item-status">
                                {isLocked ? (
                                  <Lock size={16} />
                                ) : (
                                  <div className="completion-circle"></div>
                                )}
                              </div>

                              <div className="item-content">
                                <span className="item-title">Theory</span>
                                <span className="item-type">
                                  Content, PDF, PPT, DOC
                                </span>
                              </div>
                            </div>

                            {/* SNIPPETS */}
                            <div
                              className={`module-item ${
                                isLocked ? "locked" : ""
                              }`}
                              onClick={() =>
                                !isLocked &&
                                navigate(
                                  `/courses/${courseId}/module/${module._id}/snippets`
                                )
                              }
                            >
                              <div className="item-status">
                                {isLocked ? (
                                  <Lock size={16} />
                                ) : (
                                  <div className="completion-circle"></div>
                                )}
                              </div>

                              <div className="item-content">
                                <span className="item-title">Snippets</span>
                                <span className="item-type">
                                  Syntax Examples
                                </span>
                              </div>
                            </div>

                            {/* LECTURE */}
                            <div
                              className={`module-item ${
                                isLocked ? "locked" : ""
                              }`}
                              onClick={() =>
                                !isLocked &&
                                navigate(
                                  `/courses/${courseId}/module/${module._id}/lecture`
                                )
                              }
                            >
                              <div className="item-status">
                                {isLocked ? (
                                  <Lock size={16} />
                                ) : (
                                  <div className="completion-circle"></div>
                                )}
                              </div>
                              <div className="item-content">
                                <span className="item-title">Lecture</span>
                                <span className="item-type">
                                  Interactive Learning
                                </span>
                              </div>
                            </div>

                            {/* MCQ */}
                            <div
                              className={`module-item ${
                                isLocked ? "locked" : ""
                              }`}
                              onClick={() =>
                                !isLocked &&
                                navigate(
                                  `/courses/${courseId}/module/${module._id}/mcq`
                                )
                              }
                            >
                              <div className="item-status">
                                {isLocked ? (
                                  <Lock size={16} />
                                ) : (
                                  <div className="completion-circle"></div>
                                )}
                              </div>
                              <div className="item-content">
                                <span className="item-title">MCQ</span>
                                <span className="item-type">
                                  Practice Questions
                                </span>
                              </div>
                            </div>

                            {/* CODE CHALLENGES */}
                            <div
                              className={`module-item ${
                                isLocked ? "locked" : ""
                              }`}
                              onClick={() =>
                                !isLocked &&
                                navigate(
                                  `/courses/${courseId}/module/${module._id}/challenges`
                                )
                              }
                            >
                              <div className="item-status">
                                {isLocked ? (
                                  <Lock size={16} />
                                ) : (
                                  <div className="completion-circle"></div>
                                )}
                              </div>
                              <div className="item-content">
                                <span className="item-title">
                                  Code Challenges
                                </span>
                                <span className="item-type">
                                  Coding Practice
                                </span>
                              </div>
                            </div>

                            {/* MODULE TEST */}
                            {module.moduleTest &&
                              (module.moduleTest.mcqs?.length > 0 ||
                                module.moduleTest.codeChallenges?.length > 0) && (
                                <div
                                  className={`module-item test-item ${
                                    isLocked ? "locked" : ""
                                  }`}
                                  onClick={() =>
                                    !isLocked &&
                                    navigate(
                                      `/courses/${courseId}/module/${module._id}/test`
                                    )
                                  }
                                >
                                  <div className="item-status">
                                    {isLocked ? (
                                      <Lock size={16} />
                                    ) : (
                                      <div className="item-icon test">
                                        <Award size={16} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="item-content">
                                    <span className="item-title">
                                      Knowledge Assessment: {module.title}
                                    </span>
                                    <span className="item-type">Assessment</span>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
                </div>
              );
            })()}

            {/* Final Exam */}
            {course.finalExam && course.finalExam.isActive && (
              <div className="final-exam-section">
                <div className="final-exam-header">
                  <div className="exam-icon">
                    <Shield size={32} />
                  </div>
                  <div className="exam-info">
                    <p className="exam-title">{course.finalExam.title}</p>
                    <p className="exam-description">
                      {course.finalExam.description}
                    </p>
                  </div>
                </div>

                <div className="exam-stats">
                  <div className="exam-stat">
                    <Brain size={20} />
                    <span>
                      {course.finalExam.mcqs?.length || 0} MCQs +{" "}
                      {course.finalExam.codeChallenges?.length || 0} Coding
                    </span>
                  </div>

                  <div className="exam-stat">
                    <Timer size={20} />
                    <span>{course.finalExam.duration} minutes</span>
                  </div>

                  <div className="exam-stat">
                    <Trophy size={20} />
                    <span>{course.finalExam.totalMarks} marks</span>
                  </div>

                  <div className="exam-stat">
                    <Target size={20} />
                    <span>{course.finalExam.passingScore}% to pass</span>
                  </div>
                </div>

                {course.finalExam.securitySettings?.isSecure && (
                  <div className="security-notice">
                    <AlertTriangle size={16} />
                    <span>
                      Secure Assessment - Full screen required, copy-paste
                      disabled
                    </span>
                  </div>
                )}

                <div className="exam-actions">
                  {!isEnrolled ? (
                    <button className="exam-btn locked" disabled>
                      <Lock size={18} />
                      Enroll to Access Final Exam
                    </button>
                  ) : (
                    <button
                      className="exam-btn available"
                      onClick={() =>
                        navigate(`/courses/${courseId}/final-exam`)
                      }
                    >
                      <Shield size={18} />
                      Take Final Exam
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABOUT */}
        {activeTab === "overview" && (
          // @ts-ignore - Component props are properly validated with PropTypes
          <AboutSection
            courseId={courseId}
            userId={userId}
            token={token}
            refreshTrigger={refreshTrigger}
          />
        )}

        {/* LEADERBOARD */}
        {activeTab === "leaderboard" && isEnrolled && (
          <CourseLeaderboard
            courseId={courseId}
            userId={userId}
            token={token}
            refreshTrigger={Date.now()}
          />
        )}
      </div>
    </div>
    </>
  );
};

export default ModernCourseDetail;

