import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import UserContext from "../context/UserContext";
import "./CourseLeaderboard.css";

const CourseLeaderboard = () => {
  const { courseId } = useParams();
  const [data, setData] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [updateNotification, setUpdateNotification] = useState(null);
  const { user } = useContext(UserContext);

  // Function to fetch leaderboard (extracted for reuse)
  const fetchCourseLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Fetch course leaderboard data
      const leaderboardRes = await axios.get(
        `http://localhost:5000/api/course-leaderboard/${courseId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      
      // Fetch course info
      const courseRes = await axios.get(
        `http://localhost:5000/api/courses/${courseId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
     
      const newData = leaderboardRes.data.leaderboard || [];
      const newTotalUsers = leaderboardRes.data.totalUsers || 0;
      
      // Check for changes to show notification
      if (data.length > 0) {
        const hasChanges = JSON.stringify(newData) !== JSON.stringify(data);
        if (hasChanges) {
          setUpdateNotification('Leaderboard updated with new scores! 🎯');
          setTimeout(() => setUpdateNotification(null), 5000); // Clear after 5 seconds
        }
      }
      
      setData(newData);
      setTotalUsers(newTotalUsers);
      setCourseInfo(courseRes.data);
      setError("");
      setLastUpdated(new Date());
      
      console.log('Leaderboard data loaded:', {
        totalEntries: newData.length,
        totalUsers: newTotalUsers,
        sampleEntry: newData[0] || null,
        timestamp: new Date().toLocaleTimeString(),
        hasChanges: data.length > 0 ? JSON.stringify(newData) !== JSON.stringify(data) : false
      });

      // Debug: Log all user scores to see why they're 0
      console.log('🔍 Debugging leaderboard scores:');
      newData.forEach((user, index) => {
        console.log(`User ${index + 1} (${user.name}):`, {
          overallScore: user.overallScore,
          totalLessonScore: user.totalLessonScore,
          totalModuleTestScore: user.totalModuleTestScore,
          totalFinalExamScore: user.totalFinalExamScore,
          lessonsCompleted: user.lessonsCompleted,
          moduleTestsCompleted: user.moduleTestsCompleted,
          finalExamCompleted: user.finalExamCompleted
        });
      });
    } catch (err) {
      console.error("Course Leaderboard Error", err);
      setError("Failed to load course leaderboard data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (courseId) {
      fetchCourseLeaderboard();
    }
  }, [courseId]);

  // Auto-refresh every 30 seconds when enabled
  useEffect(() => {
    if (!autoRefresh || !courseId) return;

    const interval = setInterval(() => {
      fetchCourseLeaderboard();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, courseId]);

  // Manual refresh function
  const handleRefresh = () => {
    if (courseId) {
      fetchCourseLeaderboard();
    }
  };

  // Test function to add scores (for debugging)
  const handleAddTestScores = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      let userId;
      if (user && user.id) {
        userId = user.id;
      } else {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        userId = tokenPayload.id;
      }

      await axios.post(
        `http://localhost:5000/api/course-leaderboard/${courseId}/add-test-scores`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Test scores added successfully');
      // Refresh leaderboard to see changes
      handleRefresh();
    } catch (error) {
      console.error('❌ Error adding test scores:', error);
    }
  };

  const filteredData = Array.isArray(data) ? data.filter((userData) => {
    const matchesSearch = userData.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) : [];

  if (loading) {
    return (
      <div className="course-leaderboard-container">
        <div className="loading-spinner">Loading course leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="course-leaderboard-container">
      <div className="course-leaderboard-header">
        <h1 className="page-title">📚 Course Leaderboard</h1>
        {courseInfo && (
          <div className="course-info">
            <h2 className="course-title">{courseInfo.title}</h2>
            <p className="course-description">{courseInfo.description}</p>
          </div>
        )}
        <p className="leaderboard-subtitle">Based on Course Assessment Performance</p>
        <div className="leaderboard-stats">
          <div className="stat-item">
            <span className="stat-value">{totalUsers}</span>
            <span className="stat-label">Total Participants</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{filteredData.filter(u => u.finalExamCompleted).length}</span>
            <span className="stat-label">Final Exams Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{filteredData.length > 0 ? Math.round(filteredData.reduce((sum, u) => sum + (u.averageScore || 0), 0) / filteredData.length) : 0}%</span>
            <span className="stat-label">Average Score</span>
          </div>
        </div>
        {user && user.college && (
          <div className="college-info">
            College: <span className="college-name">{user.college}</span>
          </div>
        )}
      </div>

      <div className="search-and-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="leaderboard-controls">
          <button 
            onClick={handleRefresh} 
            className="refresh-btn"
            disabled={loading}
          >
            🔄 {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          
          <button 
            onClick={handleAddTestScores} 
            className="test-btn"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            🧪 Add Test Score
          </button>
          
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (30s)
          </label>
          
          {lastUpdated && (
            <span className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {updateNotification && (
        <div className="update-notification">
          {updateNotification}
        </div>
      )}

      <div className="table-wrapper">
        <table className="course-leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Roll Number</th>
              <th>Department</th>
              <th>Overall Score</th>
              <th>Lessons</th>
              <th>Module Tests</th>
              <th>Final Exam</th>
              <th>Progress</th>
              <th>Percentile</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((userData) => (
                                 <tr 
                   key={userData.userId} 
                   className={`rank-row ${userData.rank <= 3 ? `top-${userData.rank}` : ''}`}
                 >
                  <td className="rank-cell">
                    {userData.rank <= 3 && (
                      <span className="rank-medal">
                        {userData.rank === 1 ? '🥇' : userData.rank === 2 ? '🥈' : '🥉'}
                      </span>
                    )}
                    <span className="rank-number">#{userData.rank}</span>
                  </td>
                  <td className="user-cell">
                    <div className="user-info">
                      <span className="user-name">{userData.name}</span>
                      <span className="user-email">{userData.email}</span>
                    </div>
                  </td>
                  <td className="roll-number">{userData.rollNumber}</td>
                  <td className="department">
                    <span className="department-badge">{userData.department}</span>
                  </td>
                  <td className="overall-score">
                    <div className="score-breakdown">
                      <span className="score-value">{userData.overallScore || 0}</span>
                      <span className="score-percentage">
                        ({userData.averageScore ? Math.round(userData.averageScore) : 0}%)
                      </span>
                    </div>
                  </td>
                  <td className="lesson-score">
                    <div className="score-breakdown">
                      <span className="score">{userData.totalLessonScore || 0}</span>
                      <span className="completed">({userData.lessonsCompleted || 0} completed)</span>
                    </div>
                  </td>
                  <td className="module-test-score">
                    <div className="score-breakdown">
                      <span className="score">{userData.totalModuleTestScore || 0}</span>
                      <span className="completed">({userData.moduleTestsCompleted || 0} completed)</span>
                    </div>
                  </td>
                  <td className="final-exam-score">
                    <div className="score-breakdown">
                      <span className="score">{userData.totalFinalExamScore || 0}</span>
                      <span className={`status ${userData.finalExamCompleted ? 'completed' : 'pending'}`}>
                        {userData.finalExamCompleted ? '✓ Done' : '⏳ Pending'}
                      </span>
                    </div>
                  </td>
                   <td className="progress">
                     <div className="progress-bar">
                       <div 
                         className="progress-fill" 
                         style={{ width: `${userData.averageScore || 0}%` }}
                       ></div>
                    </div>
                    <span className="progress-text">{Math.round(userData.averageScore || 0)}%</span>
                  </td>
                  <td className="percentile">
                    <span className="percentile-value">{userData.percentile}%</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="no-data">
                  {searchQuery ? "No users found matching your search" : "No course leaderboard data available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="course-leaderboard-footer">
        <div className="score-legend">
          <h3>Score Breakdown:</h3>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color lesson"></span>
              <span>Lesson Scores</span>
            </div>
            <div className="legend-item">
              <span className="legend-color module-test"></span>
              <span>Module Test Scores</span>
            </div>
            <div className="legend-item">
              <span className="legend-color final-exam"></span>
              <span>Final Exam Score</span>
            </div>
          </div>
        </div>
        <p className="footer-text">
          Rankings are based on overall course assessment performance including lessons, module tests, and final exam
        </p>
      </div>
    </div>
  );
};

export default CourseLeaderboard;