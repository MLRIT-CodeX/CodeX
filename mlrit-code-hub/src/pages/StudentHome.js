import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import UserContext from '../context/UserContext';
import './Home.css';

const StudentHome = () => {
  const { user } = useContext(UserContext);
  const [progressStats, setProgressStats] = useState({
    problemsSolved: 0,
    totalProblems: 200,
    contestsParticipated: 8,
    ranking: 156,
    streakDays: 7,
    difficultyStats: {
      easy: 0,
      medium: 0,
      hard: 0
    }
  });
  const [recentProblems, setRecentProblems] = useState([]);
  const [upcomingContests, setUpcomingContests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contestsLoading, setContestsLoading] = useState(true);
  const [contestsError, setContestsError] = useState(null);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  const fetchUpcomingContests = async () => {
    try {
      setContestsLoading(true);
      setContestsError(null);
      
      const response = await axios.get('http://localhost:5000/api/contests/upcoming');
      setUpcomingContests(response.data);
    } catch (err) {
      console.error('Error fetching upcoming contests:', err);
      setContestsError('Failed to load upcoming contests');
    } finally {
      setContestsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      setCoursesError(null);
      
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const response = await axios.get('http://localhost:5000/api/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Take only the first 3 courses for the home page
      const coursesData = response.data.slice(0, 3);
      
      // Fetch progress for each course
      const coursesWithProgress = await Promise.all(
        coursesData.map(async (course) => {
          try {
            const progressResponse = await axios.get(`http://localhost:5000/api/progress?userId=${userId}&courseId=${course._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            const progress = progressResponse.data || {};
            
            // Calculate progress percentage
            let progressPercent = 0;
            if (progress.topicsProgress && progress.topicsProgress.length > 0) {
              const totalTopics = course.topics?.length || 0;
              const completedTopics = progress.topicsProgress.filter(tp => tp.completed).length;
              progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
            }
            
            return {
              ...course,
              progress: progressPercent,
              isEnrolled: progress.isEnrolled || false
            };
          } catch (progressErr) {
            console.error(`Error fetching progress for course ${course._id}:`, progressErr);
            return {
              ...course,
              progress: 0,
              isEnrolled: false
            };
          }
        })
      );
      
      console.log('Courses with progress:', coursesWithProgress);
      setCourses(coursesWithProgress);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setCoursesError('Failed to load courses');
      // Fallback to sample courses
      setCourses([
        { _id: '1', title: 'JavaScript Fundamentals', description: 'Learn the basics of JavaScript programming', progress: 25, isEnrolled: true },
        { _id: '2', title: 'React Development', description: 'Build modern web applications with React', progress: 60, isEnrolled: true },
        { _id: '3', title: 'Python for Beginners', description: 'Start your Python programming journey', progress: 0, isEnrolled: false }
      ]);
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        // Fetch problem statistics
        const problemResponse = await axios.get('http://localhost:5000/api/submissions/user-stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Fetch contest statistics
        const contestResponse = await axios.get('http://localhost:5000/api/contest-submissions/user-stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Fetch recent solved problems
        const recentSolvedResponse = await axios.get('http://localhost:5000/api/submissions/recent-solved?limit=3', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Recent solved response:', recentSolvedResponse.data);
        console.log('First problem data:', recentSolvedResponse.data[0]);
        console.log('Number of recent problems:', recentSolvedResponse.data.length);

        // Fetch difficulty-based statistics
        const difficultyStatsResponse = await axios.get('http://localhost:5000/api/submissions/difficulty-stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Fetch global ranking
        const globalRankResponse = await axios.get('http://localhost:5000/api/leaderboard/user/global-rank', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Fetch user streak data
        const streakResponse = await axios.get('http://localhost:5000/api/streak/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setProgressStats(prevStats => ({
          ...prevStats,
          problemsSolved: problemResponse.data.problemsSolved,
          contestsParticipated: contestResponse.data.contestsParticipated,
          ranking: globalRankResponse.data.rank,
          streakDays: streakResponse.data.data.currentStreak,
          difficultyStats: difficultyStatsResponse.data
        }));

        // Ensure all problems have scores, add fallback if missing
        const problemsWithScores = recentSolvedResponse.data.map(problem => ({
          ...problem,
          score: problem.score || (problem.difficulty === 'Easy' ? 100 : 
                                  problem.difficulty === 'Medium' ? 200 : 300)
        }));
        
        // If no recent problems, show sample data for testing
        if (problemsWithScores.length === 0) {
          console.log('No recent problems found, showing sample data for testing');
          const sampleProblems = [
            {
              _id: 'sample1',
              title: 'Two Sum',
              difficulty: 'Easy',
              score: 100,
              problemNumber: 1
            },
            {
              _id: 'sample2', 
              title: 'Add Two Numbers',
              difficulty: 'Medium',
              score: 200,
              problemNumber: 2
            },
            {
              _id: 'sample3',
              title: 'Longest Substring',
              difficulty: 'Hard', 
              score: 300,
              problemNumber: 3
            }
          ];
          setRecentProblems(sampleProblems);
        } else {
          setRecentProblems(problemsWithScores);
        }
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError('Failed to load user statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
    fetchUpcomingContests();
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="home-container">
        <Navbar />
        <main className="home-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your statistics...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <Navbar />
        <main className="home-main">
          <div className="error-container">
            <p>Error: {error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Navbar />

      {/* Main Content */}
      <main className="home-main">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-content">
            <h1>Welcome back, {user?.name || 'Student'}!</h1>
            <p>Continue your coding journey and improve your skills</p>
          </div>
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-value">{progressStats.problemsSolved}</div>
              <div className="stat-label">Problems Solved</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{progressStats.contestsParticipated}</div>
              <div className="stat-label">Contests Participated</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">#{progressStats.ranking}</div>
              <div className="stat-label">Current Ranking</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{progressStats.streakDays}</div>
              <div className="stat-label">Day Streak</div>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="home-grid">
                     {/* Recent Problems */}
           <section className="grid-card recent-problems">
             <h2>Recent Problems</h2>
             <div className="problem-list">
               {recentProblems.length > 0 ? (
                 recentProblems.map(problem => (
                   <Link 
                     key={problem._id} 
                     to={`/solve/${problem._id}`} 
                     className="problem-item-two-lines problem-link"
                   >
                     <div className="problem-line-1">
                       <span className="problem-number">{problem.problemNumber || 'N/A'}</span>
                       <span className="problem-title">{problem.title}</span>
                     </div>
                     <div className="problem-line-2">
                       <span className={`difficulty-badge ${problem.difficulty?.toLowerCase()}`}>
                         {problem.difficulty || 'Easy'}
                       </span>
                       <span className="points-badge">
                         {problem.score || 100} points
                       </span>
                     </div>
                   </Link>
                 ))
               ) : (
                 <div className="no-problems-message">
                   <div className="no-problems-icon">🎯</div>
                   <p>No problems solved yet. Start your coding journey!</p>
                   <Link to="/problem-set" className="start-solving-btn">Start Solving</Link>
                 </div>
               )}
             </div>
             <Link to="/problem-set" className="view-all-btn">View All Problems</Link>
           </section>

          {/* Upcoming Contests */}
          <section className="grid-card upcoming-contests">
            <h2>Upcoming Contests</h2>
            <div className="contest-list">
              {contestsLoading ? (
                <div className="loading-message">
                  <div className="loading-spinner-small"></div>
                  <p>Loading contests...</p>
                </div>
              ) : contestsError ? (
                <div className="error-message">
                  <p>{contestsError}</p>
                  <button onClick={fetchUpcomingContests} className="retry-btn-small">
                    Retry
                  </button>
                </div>
              ) : upcomingContests.length > 0 ? (
                upcomingContests.map(contest => {
                  const startDate = new Date(contest.startTime);
                  const formattedDate = startDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  });
                  const formattedTime = startDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  });
                  
                  return (
                    <div key={contest._id} className="contest-item">
                      <div className="contest-info">
                        <h3>{contest.title}</h3>
                        <p>
                          <svg viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                          </svg>
                          {formattedDate} at {formattedTime}
                        </p>
                      </div>
                      <button className="register-btn">Register</button>
                    </div>
                  );
                })
              ) : (
                <div className="no-contests-message">
                  <p>No upcoming contests available at the moment.</p>
                  <p className="sub-message">Check back later for new contests!</p>
                </div>
              )}
            </div>
            <Link to="/contests" className="view-all-btn">View All Contests</Link>
          </section>

          {/* Progress Chart */}

          {/* Courses */}
          <section className="grid-card courses-section">
            <h2>Featured Courses</h2>
            <div className="courses-list">
              {coursesLoading ? (
                <div className="loading-message">
                  <p>Loading courses...</p>
                </div>
              ) : coursesError ? (
                <div className="error-message">
                  <p>{coursesError}</p>
                  <button onClick={fetchCourses} className="retry-btn-small">
                    Retry
                  </button>
                </div>
              ) : courses.length > 0 ? (
                courses.map(course => {
                  console.log('Rendering course:', course.title, 'isEnrolled:', course.isEnrolled, 'progress:', course.progress);
                  return (
                    <div key={course._id} className="course-item">
                      <div className="course-content">
                        <span className="course-title">{course.title}</span>
                        <span className="course-description">{course.description || 'Start learning today!'}</span>
                        <div className="course-progress">
                          <div className="course-progress-info">
                            <span className="progress-label">Progress</span>
                            <span className="progress-percentage">{course.progress || 0}%</span>
                          </div>
                          <div className="mini-progress-bar">
                            <div 
                              className="mini-progress-fill" 
                              style={{ width: `${course.progress || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-courses-message">
                  <p>No courses available</p>
                </div>
              )}
            </div>
            <Link to="/courses" className="view-all-btn">
              View All Courses
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StudentHome;
