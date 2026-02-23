import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { User } from 'lucide-react';
import Navbar from '../components/Navbar';
import UserContext from '../context/UserContext';
import SubmissionHeatmap from '../components/Submissionheatmap'; 
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
  
  // RETAINED STATE FOR HEATMAP CONTROLS
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activityFilter, setActivityFilter] = useState('all');
  
  const [error, setError] = useState(null);
  
  // REMOVED: generateContributionGrid, fetchContributionData, generateFallbackContributions functions

  // REMOVED: contributionData, rawContributionData, contributionStats states


  // CORE DASHBOARD DATA FETCH (First useEffect remains)
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

        // --- Fetch calls for primary stats (UNCHANGED) ---
        
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
        
        // --- End Fetch calls ---

        setProgressStats((prevStats) => {
          const newStats = {
            ...prevStats,
            ...statsUpdate,
          };
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
    };
    
    loadData();
  }, []); // Dependency array is clean

  // REMOVED: The entire second useEffect hook for contribution data

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

        {/* ⬅️ REPLACED: ENTIRE CALENDAR BLOCK WITH THE SUBMISSION HEATMAP COMPONENT */}
        <SubmissionHeatmap
          userId={user?.id}
          token={localStorage.getItem('token')}
          initialYear={selectedYear}
          selectedYear={selectedYear} 
          setSelectedYear={setSelectedYear} 
          activityFilter={activityFilter}
          setActivityFilter={setActivityFilter} 
        />
      </div>
    </div>
  );
};

export default Profile;