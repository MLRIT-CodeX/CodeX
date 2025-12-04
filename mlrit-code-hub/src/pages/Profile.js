import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { User } from 'lucide-react';
import Navbar from '../components/Navbar';
import UserContext from '../context/UserContext';
import './Profile.css';

const Profile = () => {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('Profile');
  const [progressStats, setProgressStats] = useState({
    problemsSolved: 0,
    problemsAttempted: 0,
    totalSubmissions: 0,
    successfulSubmissions: 0,
    successRate: 0,
    actualScore: 0,
    originalScore: 0,
    totalSolved: 0,
    totalProblems: 200,
    contestsParticipated: 0,
    ranking: null,
    streakDays: 0,
    difficultyStats: {
      easy: 0,
      medium: 0,
      hard: 0,
    },
    mcqStats: {
      totalMCQs: 0,
      solvedCorrectly: 0,
      accuracy: 0,
      wrongAnswers: 0,
      totalScore: 0,
      questionsAttempted: 0,
    },
    projectStats: {
      majorAttended: 0,
      minorAttended: 0,
      totalScore: 0,
    },
  });
  const [problemCounts, setProblemCounts] = useState({
    easy: 52,
    medium: 274,
    hard: 100,
    total: 326,
  });
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);
  const [contributionData, setContributionData] = useState([]);
  const [rawContributionData, setRawContributionData] = useState([]);
  const [contributionStats, setContributionStats] = useState({
    totalDays: 0,
    totalCodingProblems: 0,
    totalCourseActivities: 0,
    totalModuleTests: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalActivity: 0
  });
  const [activityFilter, setActivityFilter] = useState('all'); // 'all', 'coding', 'course'

  const generateContributionGrid = useCallback((contributions, filter = 'all', year = selectedYear) => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    console.log(`📅 Generating grid for year ${year}`);
    
    // Create a map for quick lookup
    const contributionMap = new Map();
    contributions.forEach(day => {
      // Handle both Date objects and date strings
      let dateKey;
      if (day.date instanceof Date) {
        dateKey = day.date.toISOString().split('T')[0];
      } else if (typeof day.date === 'string') {
        dateKey = day.date.split('T')[0];
      } else {
        console.warn('Invalid date format:', day.date);
        return;
      }
      contributionMap.set(dateKey, day);
    });
    
    // Generate grid for the year
    const grid = [];
    const currentDate = new Date(startDate);
    
    // Generate 12 months
    for (let month = 0; month < 12; month++) {
      const monthData = [];
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      const daysInMonth = monthEnd.getDate();
      const startDayOfWeek = (monthStart.getDay() + 6) % 7; // Convert to Monday=0, Tuesday=1, etc.
      
      // Calculate total cells needed (including empty cells at start)
      const totalCells = Math.ceil((daysInMonth + startDayOfWeek) / 7) * 7;
      const numberOfWeeks = Math.ceil((daysInMonth + startDayOfWeek) / 7);
      
      // Generate weeks for this month (variable number based on month)
      for (let week = 0; week < numberOfWeeks; week++) {
        const weekData = [];
        
        // Generate 7 days per week
        for (let day = 0; day < 7; day++) {
          const cellIndex = week * 7 + day;
          
          if (cellIndex < startDayOfWeek) {
            // Empty cell before month starts
            weekData.push({ level: -1, date: null, activity: null });
          } else {
            const dayOfMonth = cellIndex - startDayOfWeek + 1;
            
            if (dayOfMonth <= daysInMonth) {
              // Valid day in this month
              const currentDay = new Date(year, month, dayOfMonth);
              const dateKey = currentDay.toISOString().split('T')[0];
              const dayData = contributionMap.get(dateKey);
            
              let activityLevel = 0;
              if (dayData) {
                let activity = 0;
                if (filter === 'coding') {
                  activity = dayData.codingProblems;
                } else if (filter === 'course') {
                  activity = dayData.courseActivities + dayData.moduleTests;
                } else {
                  activity = dayData.totalActivity;
                }
                
                // Debug logging for activity calculation
                if (activity > 0 && dateKey === '2025-09-20') {
                  console.log(`📊 Date ${dateKey}, Filter: ${filter}, Activity: ${activity}`, dayData);
                }
                
                // Convert activity to level (0-4)
                if (activity >= 10) activityLevel = 4;
                else if (activity >= 6) activityLevel = 3;
                else if (activity >= 3) activityLevel = 2;
                else if (activity >= 1) activityLevel = 1;
                else activityLevel = 0;
              }
              
              weekData.push({
                level: activityLevel,
                date: currentDay,
                activity: dayData || { codingProblems: 0, courseActivities: 0, moduleTests: 0, totalActivity: 0 }
              });
            } else {
              // Empty cell after month ends
              weekData.push({ level: -1, date: null, activity: null });
            }
          }
        }
        monthData.push(weekData);
      }
      
      // Debug logging for November (month index 10)
      if (month === 10) {
        console.log(`📅 November ${year}: ${daysInMonth} days, starts on day ${startDayOfWeek}, ${numberOfWeeks} weeks generated`);
        console.log('November grid data:', monthData);
      }
      
      grid.push(monthData);
    }
    
    return grid;
  }, [selectedYear]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const fetchContributionData = useCallback(async (token, year = selectedYear) => {
    try {
      console.log(`🔄 Fetching contribution data for year ${year}...`);
      const response = await axios.get(`http://localhost:5000/api/contributions/calendar?year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Contribution data received:', response.data.stats);
      console.log('📊 All contribution entries:', response.data.contributions);
      
      // Ensure dates are properly formatted
      const contributions = response.data.contributions.map(day => ({
        ...day,
        date: day.date instanceof Date ? day.date : new Date(day.date)
      }));
      
      console.log('📅 Sample contribution entry:', contributions[0]);
      console.log('🔢 Total contributions found:', contributions.length);
      
      setContributionStats(response.data.stats);
      return contributions;
    } catch (err) {
      console.error('❌ Error fetching contribution data:', err);
      console.log('📝 Using fallback contribution data...');
      
      // Fallback: Generate some sample data based on existing stats
      const fallbackContributions = generateFallbackContributions();
      const fallbackStats = {
        totalDays: Math.min(progressStats.problemsSolved || 0, 30),
        totalCodingProblems: progressStats.problemsSolved || 0,
        totalCourseActivities: progressStats.mcqStats?.solvedCorrectly || 0,
        totalModuleTests: 0, // Will be included in courseActivities
        currentStreak: progressStats.streakDays || 7,
        longestStreak: Math.max(progressStats.streakDays || 7, 10),
        totalActivity: (progressStats.problemsSolved || 0) + (progressStats.mcqStats?.solvedCorrectly || 0)
      };
      
      setContributionStats(fallbackStats);
      return fallbackContributions;
    }
  }, [selectedYear, progressStats]);

  const generateFallbackContributions = () => {
    const contributions = [];
    const today = new Date();
    
    // Generate last 30 days of sample data
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Random activity with some bias towards recent activity
      const hasActivity = Math.random() > (i * 0.02); // More likely to have recent activity
      
      if (hasActivity) {
        contributions.push({
          date,
          codingProblems: Math.floor(Math.random() * 3),
          courseActivities: Math.floor(Math.random() * 5),
          moduleTests: Math.random() > 0.8 ? 1 : 0,
          totalActivity: Math.floor(Math.random() * 8) + 1
        });
      }
    }
    
    return contributions;
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

        let statsUpdate = {
          problemsSolved: 0,
          problemsAttempted: 0,
          totalSubmissions: 0,
          successfulSubmissions: 0,
          successRate: 0,
          actualScore: 0,
          originalScore: 0,
          totalSolved: 0,
          contestsParticipated: 0,
          ranking: null,
          streakDays: 0,
          difficultyStats: { easy: 0, medium: 0, hard: 0 },
          mcqStats: { totalMCQs: 0, solvedCorrectly: 0, accuracy: 0, wrongAnswers: 0, totalScore: 0, questionsAttempted: 0 },
          projectStats: { majorAttended: 0, minorAttended: 0, totalScore: 0 },
        };

        try {
          const problemCountsResponse = await axios.get('http://localhost:5000/api/problems/difficulty-counts', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProblemCounts(problemCountsResponse.data);
        } catch (err) {
          console.log('Problem counts not available:', err.response?.status);
        }

        try {
          const problemResponse = await axios.get('http://localhost:5000/api/submissions/user-stats', {
            headers: { Authorization: `Bearer ${token}` },
          });

          statsUpdate.problemsSolved = problemResponse.data.problemsSolved || 0;
          statsUpdate.problemsAttempted = problemResponse.data.problemsAttempted || 0;
          statsUpdate.totalSubmissions = problemResponse.data.totalSubmissions || 0;
          statsUpdate.successfulSubmissions = problemResponse.data.successfulSubmissions || 0;
          statsUpdate.successRate = problemResponse.data.successRate || 0;
          statsUpdate.originalScore = problemResponse.data.totalScore || 0;
        } catch (err) {
          console.log('Problem stats not available:', err.response?.status);
        }

        try {
          const difficultyResponse = await axios.get('http://localhost:5000/api/submissions/difficulty-stats', {
            headers: { Authorization: `Bearer ${token}` },
          });
          statsUpdate.difficultyStats = difficultyResponse.data || { easy: 0, medium: 0, hard: 0 };
        } catch (err) {
          console.log('Difficulty stats not available:', err.response?.status);
        }

        try {
          const contestResponse = await axios.get('http://localhost:5000/api/contest-submissions/user-stats', {
            headers: { Authorization: `Bearer ${token}` },
          });
          statsUpdate.contestsParticipated = contestResponse.data.contestsParticipated || 0;
        } catch (err) {
          console.log('Contest stats not available:', err.response?.status);
        }

        try {
          const leaderboardResponse = await axios.get('http://localhost:5000/api/leaderboard', {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const userId = JSON.parse(atob(token.split('.')[1])).id;
          const currentUserEntry = leaderboardResponse.data.find(
            (entry) => entry.userId === userId || entry.userId?.toString() === userId
          );

          if (currentUserEntry) {
            statsUpdate.actualScore = currentUserEntry.totalScore || 0;
            statsUpdate.totalSolved = currentUserEntry.totalSolved || 0;
          } else {
            statsUpdate.actualScore = 0;
            statsUpdate.totalSolved = 0;
          }
        } catch (err) {
          console.log('Leaderboard score not available:', err.response?.status);
          statsUpdate.actualScore = 0;
          statsUpdate.totalSolved = 0;
        }

        let totalCourseMCQs = 0;
        try {
          const mcqTotalsResponse = await axios.get('http://localhost:5000/api/courses/mcq-totals', {
            headers: { Authorization: `Bearer ${token}` },
          });
          totalCourseMCQs = mcqTotalsResponse.data.totalMCQs || 0;
        } catch (err) {
          console.log('MCQ totals not available');
        }

        try {
          const mcqResponse = await axios.get('http://localhost:5000/api/mcq-submissions/user-stats', {
            headers: { Authorization: `Bearer ${token}` },
          });

          statsUpdate.mcqStats = {
            totalMCQs: totalCourseMCQs,
            solvedCorrectly: mcqResponse.data.solvedCorrectly || 0,
            wrongAnswers: mcqResponse.data.wrongAnswers || 0,
            accuracy: mcqResponse.data.accuracy || 0,
            totalScore: mcqResponse.data.totalScore || 0,
            questionsAttempted: mcqResponse.data.questionsAttempted || 0,
          };
        } catch (err) {
          console.log('MCQ stats not available:', err.response?.status);
          statsUpdate.mcqStats = {
            totalMCQs: totalCourseMCQs,
            solvedCorrectly: 0,
            wrongAnswers: 0,
            accuracy: 0,
            totalScore: 0,
            questionsAttempted: 0,
          };
        }

        try {
          const globalRankResponse = await axios.get('http://localhost:5000/api/leaderboard/user/global-rank', {
            headers: { Authorization: `Bearer ${token}` },
          });
          statsUpdate.ranking = globalRankResponse.data.rank || null;
        } catch (err) {
          console.log('Global ranking not available:', err.response?.status);
        }

        statsUpdate.streakDays = 7;

        console.log('🔄 Final statsUpdate before state:', {
          actualScore: statsUpdate.actualScore,
          originalScore: statsUpdate.originalScore,
          totalSolved: statsUpdate.totalSolved,
          mcqTotalScore: statsUpdate.mcqStats?.totalScore,
          projectTotalScore: statsUpdate.projectStats?.totalScore
        });

        setProgressStats((prevStats) => {
          const newStats = {
            ...prevStats,
            ...statsUpdate,
          };
          
          console.log('🎯 ALL SCORE FIELDS IN NEW STATE:');
          console.log('  - actualScore:', newStats.actualScore);
          console.log('  - originalScore:', newStats.originalScore);
          console.log('  - totalSolved:', newStats.totalSolved);
          console.log('  - MCQ Total Score:', newStats.mcqStats?.totalScore);
          console.log('  - Project Total Score:', newStats.projectStats?.totalScore);
          console.log('  - Any combined score calculation?:', newStats.actualScore + newStats.originalScore);
          
          return newStats;
        });
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError('Failed to load user statistics');
      } finally {
        setLoading(false);
      }
    };

    const loadData = async () => {
      await fetchUserStats();
      // Initial contribution data will be loaded by the second useEffect
    };
    
    loadData();
  }, []);

  // Regenerate contribution grid when activity filter or year changes
  useEffect(() => {
    if (loading) return; // Don't load contributions while still loading user stats
    
    const regenerateForNewParams = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log(`🔄 Fetching data for year ${selectedYear} with filter ${activityFilter}`);
          const contributions = await fetchContributionData(token, selectedYear);
          if (contributions && contributions.length >= 0) {
            const gridData = generateContributionGrid(contributions, activityFilter, selectedYear);
            setContributionData(gridData);
            setRawContributionData(contributions);
          }
        } catch (error) {
          console.error('Error regenerating contribution grid:', error);
          // Use fallback data if API fails
          const fallbackContributions = generateFallbackContributions();
          setContributionData(generateContributionGrid(fallbackContributions, activityFilter, selectedYear));
        }
      }
    };
    
    regenerateForNewParams();
  }, [loading, activityFilter, selectedYear, fetchContributionData, generateContributionGrid]);

  if (loading) {
    return (
      <div className="profile-container">
        <Navbar />
        <main className="profile-main">
          <div className="loading-container">
            <div className="neon-spinner"></div>
            <p className="loading-text">Loading your profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <Navbar />
        <main className="profile-main">
          <div className="error-container">
            <p className="error-text">Error: {error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="profile-dashboard">
      <Navbar />
      <div className="profile-content">
        <div className="profile-tabs">
          <button className={`tab ${activeTab === 'Profile' ? 'active' : ''}`} onClick={() => setActiveTab('Profile')}>
            <span className="tab-text">Profile</span>
          </button>
          <button className={`tab ${activeTab === 'Skill' ? 'active' : ''}`} onClick={() => setActiveTab('Skill')}>
            <Link to="/" className="tab-link">
              Dashboard
            </Link>
          </button>
          <button className={`tab ${activeTab === 'Course' ? 'active' : ''}`} onClick={() => setActiveTab('Course')}>
            <Link to="/courses" className="tab-link">
              Course
            </Link>
          </button>
          <button className={`tab ${activeTab === 'Drives' ? 'active' : ''}`} onClick={() => setActiveTab('Drives')}>
            <span className="tab-text">Drives</span>
          </button>
        </div>

        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <span className="last-updated">Last Updated on 01/09/2025 09:21 PM</span>
        </div>

        <div className="profile-banner">
          <div className="banner-glow"></div>
          <div className="profile-avatar-wrapper">
            {user?.profilePic && !imageError ? (
              <img
                src={`http://localhost:5000${user.profilePic}`}
                alt="Profile"
                className="profile-avatar-img"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="avatar-generated">
                <span className="avatar-initials">
                  {user?.name
                    ? user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'U'}
                </span>
              </div>
            )}
            <div className="avatar-placeholder" style={{ display: 'none' }}>
              <User size={40} />
            </div>
          </div>
        </div>

        <div className="student-info-card">
          <h2 className="student-name">{user?.name}</h2>
          <p className="student-email">{user?.email}</p>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Register Number</span>
              <span className="info-value">{user?.rollNumber}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Degree</span>
              <span className="info-value">{user?.course}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Batch</span>
              <span className="info-value">{user?.batch}</span>
            </div>
            <div className="info-item">
              <span className="info-label">College</span>
              <span className="info-value">{user?.college}</span>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card neon-card">
            <h3 className="card-title">Neo-PAT</h3>
            <div className="empty-state">
              <p>No PAT Courses Taken</p>
            </div>
          </div>

          <div className="stat-card neon-card">
            <h3 className="card-title">Neo-Colab</h3>
            <div className="empty-state">
              <p>No Colab Courses Taken</p>
            </div>
          </div>

          <div className="stat-card neon-card">
            <h3 className="card-title">Solved Questions</h3>
            <div className="circular-progress-wrapper">
              <svg viewBox="0 0 200 200" className="progress-svg">
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f0ff" />
                    <stop offset="50%" stopColor="#ff00ff" />
                    <stop offset="100%" stopColor="#00f0ff" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="12"
                  strokeDasharray={`${(progressStats.problemsSolved / problemCounts.total) * 502.4} 502.4`}
                  strokeDashoffset="125.6"
                  transform="rotate(-90 100 100)"
                  className="progress-circle"
                />
              </svg>
              <div className="progress-text">
                <span className="progress-number">
                  {progressStats.problemsSolved}/{problemCounts.total}
                </span>
                <span className="progress-label">Questions</span>
              </div>
            </div>
            <div className="difficulty-stats">
              <div className="difficulty-row">
                <span className="difficulty-label">Easy</span>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill easy-fill"
                    style={{
                      width: `${problemCounts.easy > 0 ? (progressStats.difficultyStats.easy / problemCounts.easy) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="difficulty-count">
                  {progressStats.difficultyStats.easy}/{problemCounts.easy}
                </span>
              </div>
              <div className="difficulty-row">
                <span className="difficulty-label">Medium</span>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill medium-fill"
                    style={{
                      width: `${problemCounts.medium > 0 ? (progressStats.difficultyStats.medium / problemCounts.medium) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="difficulty-count">
                  {progressStats.difficultyStats.medium}/{problemCounts.medium}
                </span>
              </div>
              <div className="difficulty-row">
                <span className="difficulty-label">Hard</span>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill hard-fill"
                    style={{
                      width: `${problemCounts.hard > 0 ? (progressStats.difficultyStats.hard / problemCounts.hard) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="difficulty-count">
                  {progressStats.difficultyStats.hard > 0 ? `${progressStats.difficultyStats.hard}/${problemCounts.hard}` : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="performance-grid">
          <div className="performance-card neon-card">
            <div className="card-header coding-header">
              <h3 className="card-title">Coding</h3>
            </div>
            <div className="metrics-grid">
              <div className="metric-box">
                <span className="metric-label">Questions Attended</span>
                <span className="metric-value glow-text">{progressStats.problemsAttempted || 0}</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Solved Correctly</span>
                <span className="metric-value glow-text">{progressStats.totalSolved || 0}</span>
              </div>
            </div>
            <div className="score-row">
              <div className="score-box">
                <span className="score-label">Original Score</span>
                <span className="score-value blue-glow">{progressStats.originalScore || 0}</span>
              </div>
              <div className="score-box">
                <span className="score-label">Accuracy</span>
                <span
                  className={`score-value ${
                    progressStats.successRate >= 70 ? 'green-glow' : progressStats.successRate >= 40 ? 'yellow-glow' : 'red-glow'
                  }`}
                >
                  {progressStats.successRate ? `${progressStats.successRate}%` : '0%'}
                </span>
              </div>
            </div>
          </div>

          <div className="performance-card neon-card">
            <div className="card-header projects-header">
              <h3 className="card-title">Projects</h3>
            </div>
            <div className="metrics-grid">
              <div className="metric-box">
                <span className="metric-label">Major Attended</span>
                <span className="metric-value glow-text">{progressStats.projectStats.majorAttended || 0}</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Minor Attended</span>
                <span className="metric-value glow-text">{progressStats.projectStats.minorAttended || 0}</span>
              </div>
            </div>
            <div className="score-row">
              <div className="score-box">
                <span className="score-label">Your Score</span>
                <span className="score-value blue-glow">{progressStats.projectStats.totalScore || 0}</span>
              </div>
            </div>
          </div>

          <div className="performance-card neon-card">
            <div className="card-header mcq-header">
              <h3 className="card-title">MCQ Performance</h3>
            </div>
            <div className="metrics-grid">
              <div className="metric-box">
                <span className="metric-label">Total MCQ Questions</span>
                <span className="metric-value glow-text">{progressStats.mcqStats.totalMCQs || 0}</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Questions Attempted</span>
                <span className="metric-value glow-text">{progressStats.mcqStats.questionsAttempted || 0}</span>
              </div>
            </div>
            <div className="score-row">
              <div className="score-box">
                <span className="score-label">Correct Answers</span>
                <span className="score-value green-glow">{progressStats.mcqStats.solvedCorrectly || 0}</span>
              </div>
              <div className="score-box">
                <span className="score-label">Wrong Answers</span>
                <span className="score-value red-glow">{progressStats.mcqStats.wrongAnswers || 0}</span>
              </div>
            </div>
            <div className="score-row">
              <div className="score-box">
                <span className="score-label">MCQ Score</span>
                <span className="score-value blue-glow">{progressStats.mcqStats.totalScore || 0}</span>
              </div>
              <div className="score-box">
                <span className="score-label">Accuracy</span>
                <span
                  className={`score-value ${
                    progressStats.mcqStats.accuracy >= 70
                      ? 'green-glow'
                      : progressStats.mcqStats.accuracy >= 40
                      ? 'yellow-glow'
                      : 'red-glow'
                  }`}
                >
                  {progressStats.mcqStats.accuracy}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="contributions-section neon-card">
          <div className="contributions-header">
            <h3 className="card-title">Success Activity Calendar</h3>
            <p className="activity-description">
              {selectedYear} activity calendar - Green squares show days with successful activities: 
              {activityFilter === 'coding' && ' ✅ Correct coding solutions'}
              {activityFilter === 'course' && ' ✅ Correct MCQ answers'}
              {activityFilter === 'all' && ' ✅ Correct solutions & MCQ answers'}
            </p>
            <div className="contributions-controls">
              <div className="control-group">
                <label className="control-label">Year:</label>
                <select 
                  className="neon-select"
                  value={selectedYear}
                  onChange={(e) => {
                    const newYear = parseInt(e.target.value);
                    console.log('📅 Year dropdown changed from', selectedYear, 'to:', newYear);
                    setSelectedYear(newYear);
                  }}
                >
                  <option value={2023}>2023</option>
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
              <div className="control-group">
                <label className="control-label">Type:</label>
                <select 
                  className="neon-select"
                  value={activityFilter}
                  onChange={(e) => {
                    console.log('🎯 Filter dropdown changed from', activityFilter, 'to:', e.target.value);
                    setActivityFilter(e.target.value);
                  }}
                >
                  <option value="all">All Contributions</option>
                  <option value="coding">Coding Contributions</option>
                  <option value="course">Course Contributions</option>
                </select>
              </div>
              <div className="legend">
                <span className="legend-text">Less</span>
                <div className="legend-colors">
                  <span className="legend-box level-0" title="No activity"></span>
                  <span className="legend-box level-1" title="1-2 activities"></span>
                  <span className="legend-box level-2" title="3-5 activities"></span>
                  <span className="legend-box level-3" title="6-9 activities"></span>
                  <span className="legend-box level-4" title="10+ activities"></span>
                </div>
                <span className="legend-text">More</span>
              </div>
              <select className="neon-select">
                <option>{new Date().getFullYear()}</option>
              </select>
            </div>
          </div>
          
          <div className="contributions-stats-row">
            <div className="contribution-stat">
              <span className="stat-label">Active Days</span>
              <span className="stat-value-text">{contributionStats.totalDays} days</span>
            </div>
            {(activityFilter === 'all' || activityFilter === 'coding') && (
              <div className="contribution-stat">
                <span className="stat-label">✅ Problems Solved</span>
                <span className="stat-value-text">{contributionStats.totalCodingProblems} correct solutions</span>
              </div>
            )}
            {(activityFilter === 'all' || activityFilter === 'course') && (
              <div className="contribution-stat">
                <span className="stat-label">✅ Correct MCQs</span>
                <span className="stat-value-text">{contributionStats.totalCourseActivities + contributionStats.totalModuleTests} correct answers</span>
              </div>
            )}
            <div className="contribution-stat">
              <span className="stat-label">Current Streak</span>
              <span className="stat-value-text">{contributionStats.currentStreak} days</span>
            </div>
          </div>
          
          <div className="activity-summary">
            <div className="activity-breakdown">
              {(activityFilter === 'all' || activityFilter === 'coding') && (
                <div className="activity-item coding">
                  <span className="activity-color coding-color"></span>
                  <span className="activity-label">✅ Solutions: {contributionStats.totalCodingProblems}</span>
                </div>
              )}
              {(activityFilter === 'all' || activityFilter === 'course') && (
                <>
                  <div className="activity-item course">
                    <span className="activity-color course-color"></span>
                    <span className="activity-label">✅ MCQs: {contributionStats.totalCourseActivities}</span>
                  </div>
                  <div className="activity-item tests">
                    <span className="activity-color tests-color"></span>
                    <span className="activity-label">✅ Tests: {contributionStats.totalModuleTests}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="contributions-graph">
            <div className="day-labels">
              <div className="day-label">Mon</div>
              <div className="day-label">Tue</div>
              <div className="day-label">Wed</div>
              <div className="day-label">Thu</div>
              <div className="day-label">Fri</div>
              <div className="day-label">Sat</div>
              <div className="day-label">Sun</div>
            </div>
            <div className="months-container">
              {months.map((month, monthIndex) => (
                <div key={month} className="month-column">
                  <div className="month-label">{month}</div>
                  <div className="weeks-container">
                    {contributionData[monthIndex] &&
                      contributionData[monthIndex].map((week, weekIndex) => (
                        <div key={weekIndex} className="week-column">
                          {week.map((day, dayIndex) => {
                            if (day.level === -1) {
                              return <div key={dayIndex} className="contribution-box empty"></div>;
                            }
                            
                            const activity = day.activity;
                            const dateNumber = day.date ? day.date.getDate() : '';
                            const tooltipText = activity ? 
                              `${day.date?.toLocaleDateString()}\n` +
                              `✅ Correct Solutions: ${activity.codingProblems}\n` +
                              `✅ Correct MCQs: ${activity.courseActivities}\n` +
                              `✅ Test MCQs: ${activity.moduleTests}\n` +
                              `Total: ${activity.totalActivity}` :
                              `${day.date?.toLocaleDateString()}\nNo activity`;
                            
                            return (
                              <div 
                                key={dayIndex} 
                                className={`contribution-box level-${day.level} ${activity?.codingProblems > 0 ? 'has-coding' : ''} ${activity?.courseActivities > 0 ? 'has-course' : ''} ${activity?.moduleTests > 0 ? 'has-tests' : ''}`}
                                title={tooltipText}
                              >
                                <span className="date-number">{dateNumber}</span>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
