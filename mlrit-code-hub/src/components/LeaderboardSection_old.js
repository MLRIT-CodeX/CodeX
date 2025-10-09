import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  Users, 
  Target,
  Crown,
  Star,
  Zap,
  Brain,
  Code,
  ChevronUp,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import './LeaderboardSection.css';

const LeaderboardSection = ({ courseId, userId, token, refreshTrigger }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('leaderboard'); // 'leaderboard' or 'stats'
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  useEffect(() => {
    fetchLeaderboardData();
  }, [courseId, userId, token]);

  // Refresh when refreshTrigger changes (e.g., after completing a test)
  {/*useEffect(() => {
    if (refreshTrigger) {
      console.log('🔄 LeaderboardSection - Refreshing due to trigger:', refreshTrigger);
      fetchLeaderboardData();
    }
  }, [refreshTrigger]);

  // Auto-refresh leaderboard every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [courseId, userId, token]);*/}

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 LeaderboardSection - Fetching data for courseId:', courseId, 'at', new Date().toISOString());

      // Fetch all data in parallel for better performance
      const [leaderboardResponse, rankResponse, statsResponse] = await Promise.all([
        axios.get(
          `http://localhost:5000/api/course-leaderboard/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `http://localhost:5000/api/course-leaderboard/${courseId}/user/${userId}/rank`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `http://localhost:5000/api/course-leaderboard/${courseId}/user/${userId}/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ]);

      console.log('🔍 LeaderboardSection - API responses:', {
        leaderboard: leaderboardResponse.data,
        userRank: rankResponse.data,
        userStats: statsResponse.data,
        timestamp: new Date().toISOString()
      });

      // Debug rank data specifically
      console.log('🎯 Rank Debug Info:', {
        userRankData: rankResponse.data,
        userStatsRank: statsResponse.data?.rank,
        actualRankToShow: rankResponse.data?.rank || statsResponse.data?.rank,
        totalUsers: rankResponse.data?.totalUsers || statsResponse.data?.totalUsers
      });

      setLeaderboard(leaderboardResponse.data.leaderboard || []);
      setUserRank(rankResponse.data);
      setUserStats(statsResponse.data);
      setLastRefresh(Date.now());
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown size={20} className="rank-icon gold" />;
      case 2:
        return <Medal size={20} className="rank-icon silver" />;
      case 3:
        return <Award size={20} className="rank-icon bronze" />;
      default:
        return <span className="rank-number">#{rank}</span>;
    }
  };

  const getRankClass = (rank) => {
    switch (rank) {
      case 1: return 'gold';
      case 2: return 'silver';
      case 3: return 'bronze';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="leaderboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-error">
        <Trophy size={48} className="error-icon" />
        <h3>Unable to load leaderboard</h3>
        <p>{error}</p>
        <button onClick={fetchLeaderboardData} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="leaderboard-section">
      {/* Navigation Tabs */}
      <div className="leaderboard-nav">
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeView === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveView('leaderboard')}
          >
            <Trophy size={18} />
            Rankings
          </button>
          <button 
            className={`nav-tab ${activeView === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveView('stats')}
          >
            <TrendingUp size={18} />
            My Stats
          </button>
        </div>
      </div>

      {/* Content */}
      {activeView === 'leaderboard' ? (
        <div className="leaderboard-content">
          {leaderboard.length === 0 ? (
            <div className="empty-leaderboard">
              <Users size={48} className="empty-icon" />
              <h4>No rankings yet</h4>
              <p>Complete some assessments to see your ranking!</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>User</th>
                    <th>Roll Number</th>
                    <th>Department</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr 
                      key={`${entry.userId || entry.user?._id || 'user'}-${entry.rank || index}-${index}`}
                      className={`rank-row rank-${entry.rank} ${(entry.userId || entry.user?._id) === userId ? 'current-user' : ''}`}
                    >
                      <td>
                        <span className={`badge rank-badge-${entry.rank}`}>
                          {entry.rank}
                        </span>
                      </td>
                      <td className="user-name">{entry.name || entry.user?.name || 'Anonymous'}</td>
                      <td>{entry.rollNumber || entry.user?.rollNumber || 'N/A'}</td>
                      <td>{entry.department || entry.user?.department || 'N/A'}</td>
                      <td className="total-score">{entry.overallScore || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="stats-content">
          {userStats ? (
            <>
              {/* Performance Overview */}
              <div className="stats-overview">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <Trophy size={24} className="trophy-icon" />
                    </div>
                    <div className="stat-info">
                      <span className="stat-value">{userStats.overallScore || 0}</span>
                      <span className="stat-label">Total Score</span>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">
                      <TrendingUp size={24} className="trend-icon" />
                    </div>
                    <div className="stat-info">
                      <span className="stat-value">{userStats.performance?.averageScore?.toFixed(1) || '0.0'}</span>
                      <span className="stat-label">Avg Score</span>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">
                      <Star size={24} className="star-icon" />
                    </div>
                    <div className="stat-info">
                      <span className="stat-value">
                        {userRank?.rank ? `#${userRank.rank}` : (userStats?.rank ? `#${userStats.rank}` : 'N/A')}
                      </span>
                      <span className="stat-label">
                        Rank {userRank?.totalUsers ? `of ${userRank.totalUsers}` : (userStats?.totalUsers ? `of ${userStats.totalUsers}` : '')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">
                      <Users size={24} className="users-icon" />
                    </div>
                    <div className="stat-info">
                      <span className="stat-value">{userStats.percentile || 0}%</span>
                      <span className="stat-label">Percentile</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="score-breakdown">
                <h4 className="breakdown-title">Score Breakdown</h4>
                <div className="breakdown-grid">
                  <div className="breakdown-item">
                    <div className="breakdown-header">
                      <BookOpen size={20} />
                      <span>Lessons</span>
                    </div>
                    <div className="breakdown-score">
                      {userStats.breakdown?.lessonScore || 0} pts
                    </div>
                    <div className="breakdown-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill lessons"
                          style={{ 
                            width: `${Math.min(100, (userStats.breakdown?.lessonScore || 0) / Math.max(1, userStats.overallScore) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="breakdown-item">
                    <div className="breakdown-header">
                      <Target size={20} />
                      <span>Module Tests</span>
                    </div>
                    <div className="breakdown-score">
                      {userStats.breakdown?.moduleTestScore || 0} pts
                    </div>
                    <div className="breakdown-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill tests"
                          style={{ 
                            width: `${Math.min(100, (userStats.breakdown?.moduleTestScore || 0) / Math.max(1, userStats.overallScore) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Only show Final Exam if there's a score */}
                  {userStats.breakdown?.finalExamScore > 0 && (
                    <div className="breakdown-item">
                      <div className="breakdown-header">
                        <Award size={20} />
                        <span>Final Exam</span>
                      </div>
                      <div className="breakdown-score">
                        {userStats.breakdown?.finalExamScore || 0} pts
                      </div>
                      <div className="breakdown-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill final"
                            style={{ 
                              width: `${Math.min(100, (userStats.breakdown?.finalExamScore || 0) / Math.max(1, userStats.overallScore) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* SkillTest Final Exam Score */}
                  {userStats.breakdown?.skillTestFinalExamScore > 0 && (
                    <div className="breakdown-item">
                      <div className="breakdown-header">
                        <Zap size={20} />
                        <span>SkillTest Final Exam</span>
                      </div>
                      <div className="breakdown-score">
                        {userStats.breakdown?.skillTestFinalExamScore || 0} pts
                      </div>
                      <div className="breakdown-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill skilltest"
                            style={{ 
                              width: `${Math.min(100, (userStats.breakdown?.skillTestFinalExamScore || 0) / Math.max(1, userStats.overallScore) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Analysis */}
              <div className="performance-analysis">
                <h4 className="analysis-title">Performance Analysis</h4>
                <div className="analysis-grid">
                  <div className="analysis-item">
                    <div className="analysis-icon">
                      <Brain size={24} />
                    </div>
                    <div className="analysis-content">
                      <span className="analysis-label">Strongest Area</span>
                      <span className="analysis-value">
                        {userStats.performance?.strongestArea === 'MCQ' ? (
                          <>
                            <Brain size={16} /> Multiple Choice Questions
                          </>
                        ) : (
                          <>
                            <Code size={16} /> Coding Challenges
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="analysis-item">
                    <div className="analysis-icon">
                      <Zap size={24} />
                    </div>
                    <div className="analysis-content">
                      <span className="analysis-label">Progress Status</span>
                      <span className="analysis-value">
                        {userStats.progress?.lessonsCompleted || 0} lessons, {userStats.progress?.moduleTestsCompleted || 0} tests completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-stats">
              <TrendingUp size={48} className="no-stats-icon" />
              <h4>No statistics available</h4>
              <p>Complete some assessments to see your detailed statistics!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaderboardSection;
