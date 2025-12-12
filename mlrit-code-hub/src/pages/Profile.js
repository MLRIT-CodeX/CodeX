import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import UserContext from '../context/UserContext';
import SubmissionHeatmap from '../components/Submissionheatmap';
import './Profile.css';
import EditProfile from '../components/EditProfile';

// ---------------------------------------------
// Helper functions for derived stats
// ---------------------------------------------
const buildProblemsData = (progressStats, problemCounts) => {
  const stats = progressStats || {};
  const diff = stats.difficultyStats || {};
  const counts = problemCounts || {};

  const easySolved = diff.easy ?? 0;
  const mediumSolved = diff.medium ?? 0;
  const hardSolved = diff.hard ?? 0;

  const easyTotal = counts.easy ?? 0;
  const mediumTotal = counts.medium ?? 0;
  const hardTotal = counts.hard ?? 0;

  const totalSolved =
    stats.problemsSolved ??
    stats.totalSolved ??
    easySolved + mediumSolved + hardSolved;

  const totalAvailable = counts.total ?? easyTotal + mediumTotal + hardTotal;

  return {
    easy: { solved: easySolved, total: easyTotal, color: 'color-easy' },
    medium: { solved: mediumSolved, total: mediumTotal, color: 'color-medium' },
    hard: { solved: hardSolved, total: hardTotal, color: 'color-hard' },
    totalSolved,
    totalAvailable,
  };
};

const buildMcqData = (mcqStats) => {
  const s = mcqStats || {};
  return {
    total: s.totalMCQs ?? 0,
    attempted: s.questionsAttempted ?? 0,
    solved: s.solvedCorrectly ?? 0,
    wrong: s.wrongAnswers ?? 0,
    score: s.totalScore ?? 0,
    accuracy: s.accuracy ?? 0,
  };
};

const buildChallengeData = (progressStats, problemCounts) => {
  const s = progressStats || {};
  const counts = problemCounts || {};

  const totalAvailable = counts.total ?? 0;
  const attempted = s.problemsAttempted ?? 0;
  const solved = s.totalSolved ?? s.problemsSolved ?? 0;
  const score = s.originalScore ?? 0;
  const accuracy = s.successRate ?? 0;

  return {
    totalAvailable,
    attempted,
    solved,
    score,
    accuracy,
  };
};

const buildDashboardSummary = (problemsData, mcqData, challengeData) => {
  const p = problemsData || {};
  const m = mcqData || {};
  const c = challengeData || {};

  const solved =
    (p.totalSolved ?? 0) +
    (m.solved ?? 0) +
    (c.solved ?? 0);

  const available =
    (p.totalAvailable ?? 0) +
    (m.total ?? 0) +
    (c.totalAvailable ?? 0);

  return {
    solved,
    available,
  };
};

// ---------------------------------------------
// Helper: extract LeetCode username from URL
// ---------------------------------------------
const extractLeetCodeUsername = (url) => {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url.trim());
    const segments = u.pathname.split('/').filter(Boolean);
    const uIndex = segments.indexOf('u');
    if (uIndex !== -1 && segments[uIndex + 1]) return segments[uIndex + 1];
    return segments[segments.length - 1] || null;
  } catch {
    const parts = url.split('/').filter(Boolean);
    const uIndex = parts.indexOf('u');
    if (uIndex !== -1 && parts[uIndex + 1]) return parts[uIndex + 1];
    return parts[parts.length - 1] || null;
  }
};

// ------------------------------------------------------------------
// ProfileSidebar Component
// ------------------------------------------------------------------
const ProfileSidebar = ({ user, progressStats, onEditClick }) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="profile-sidebar card">
      <div className="profile-card">
        <div className="edit-icon-wrapper">
          <button
            className="icon-only-btn"
            title="Edit Profile"
            onClick={onEditClick}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>

        <div className="profile-avatar-container">
          {user?.profilePic ? (
            <img
              src={`http://localhost:5000${user.profilePic}`}
              alt="User Avatar"
              className="profile-avatar-img"
            />
          ) : (
            <div className="avatar-generated">
              <span className="avatar-initials">{getInitials(user?.name)}</span>
            </div>
          )}
        </div>

        <h1 className="student-name">{user?.name || 'Anonymous User'}</h1>
      </div>

      <div className="details-section section">
        <h3 className="section-title">Academic Background</h3>
        <ul className="details-list">
          <li>
            <span className="detail-label">College</span>
            <span className="info-value">{user?.college || 'N/A'}</span>
          </li>
          <li>
            <span className="detail-label">Department</span>
            <span className="info-value">{user?.department || 'N/A'}</span>
          </li>
          <li>
            <span className="detail-label">Roll Number</span>
            <span className="info-value">{user?.rollNumber || 'N/A'}</span>
          </li>
        </ul>
      </div>

      <div className="details-section section">
        <h3 className="section-title">Personal Info</h3>
        <ul className="details-list">
          <li>
            <span className="detail-label">Email</span>
            <span className="info-value">{user?.email || 'N/A'}</span>
          </li>
          <li>
            <span className="detail-label">Phone</span>
            <span className="info-value">{user?.phoneNumber || 'N/A'}</span>
          </li>
          {['linkedin', 'instagram', 'facebook'].map((platform) => {
            const link = user?.socialProfiles?.[platform];

            return (
              <li key={platform}>
                <span className="detail-label">
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </span>

                <span className="info-value">
                  {link && link !== 'N/A' ? (
                    <a
                      href={
                        link.startsWith('http')
                          ? link
                          : `https://www.${platform}.com/${link}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="active-link"
                    >
                      Active
                    </a>
                  ) : (
                    <span className="add-link-text">+ Add</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="details-section section">
        <h3 className="section-title">Coding Profiles</h3>
        <ul className="details-list grid-list">
          {[
            'leetcode',
            'codechef',
            'github',
            'codeforces',
            'hackerrank',
            'geeksforgeeks',
          ].map((site) => {
            const url = user?.codingProfiles?.[site];

            return (
              <li key={site}>
                <span className="detail-label">{site}</span>
                <span className="info-value">
                  {url && url !== 'N/A' ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="active-link"
                    >
                      Active
                    </a>
                  ) : (
                    <span className="add-link-text">+ Add</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="details-section section">
        <h3 className="section-title">Skills & Tech Stack</h3>
        <div className="skills-badge-container">
          {user?.skills && user.skills.length > 0 ? (
            user.skills.map((skill, index) => (
              <span key={index} className="skill-badge">
                {skill}
              </span>
            ))
          ) : (
            <span className="no-data-text">No skills added yet</span>
          )}
        </div>
      </div>
    </aside>
  );
};

// ------------------------------------------------------------------
// Main Profile Component
// ------------------------------------------------------------------
const Profile = () => {
  const { user, setUser } = useContext(UserContext);
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
    difficultyStats: { easy: 0, medium: 0, hard: 0 },
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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activityFilter, setActivityFilter] = useState('all');
  const [error, setError] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // New LeetCode states
  const [leetcodeSolved, setLeetcodeSolved] = useState(null);
  const [leetcodeRating, setLeetcodeRating] = useState(null);
  const [codeforcesSolved, setCodeforcesSolved] = useState(null);
  const [codeforcesRating, setCodeforcesRating] = useState(null);
  const [codechefSolved, setCodechefSolved] = useState(null);
  const [codechefRating, setCodechefRating] = useState(null);

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
          streakDays: 7,
          difficultyStats: { easy: 0, medium: 0, hard: 0 },
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
        };

        try {
          const problemCountsResponse = await axios.get(
            'http://localhost:5000/api/problems/difficulty-counts',
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setProblemCounts(problemCountsResponse.data);
        } catch (err) {
          console.log('Problem counts not available:', err.response?.status);
        }

        try {
          const problemResponse = await axios.get(
            'http://localhost:5000/api/submissions/user-stats',
            { headers: { Authorization: `Bearer ${token}` } }
          );
          statsUpdate.problemsSolved = problemResponse.data.problemsSolved || 0;
          statsUpdate.problemsAttempted =
            problemResponse.data.problemsAttempted || 0;
          statsUpdate.totalSubmissions =
            problemResponse.data.totalSubmissions || 0;
          statsUpdate.successfulSubmissions =
            problemResponse.data.successfulSubmissions || 0;
          statsUpdate.successRate = problemResponse.data.successRate || 0;
          statsUpdate.originalScore = problemResponse.data.totalScore || 0;
        } catch (err) {
          console.log('Problem stats not available:', err.response?.status);
        }

        try {
          const difficultyResponse = await axios.get(
            'http://localhost:5000/api/submissions/difficulty-stats',
            { headers: { Authorization: `Bearer ${token}` } }
          );
          statsUpdate.difficultyStats = difficultyResponse.data || {
            easy: 0,
            medium: 0,
            hard: 0,
          };
        } catch (err) {
          console.log('Difficulty stats not available:', err.response?.status);
        }

        try {
          const contestResponse = await axios.get(
            'http://localhost:5000/api/contest-submissions/user-stats',
            { headers: { Authorization: `Bearer ${token}` } }
          );
          statsUpdate.contestsParticipated =
            contestResponse.data.contestsParticipated || 0;
        } catch (err) {
          console.log('Contest stats not available:', err.response?.status);
        }

        try {
          const userProfileResponse = await axios.get(
            'http://localhost:5000/api/profile',
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (userProfileResponse.data?.college) {
            const leaderboardResponse = await axios.get(
              'http://localhost:5000/api/leaderboard',
              { headers: { Authorization: `Bearer ${token}` } }
            );

            const userId = JSON.parse(atob(token.split('.')[1])).id;
            const currentUserEntry = leaderboardResponse.data.find(
              (entry) =>
                entry.userId === userId || entry.userId?.toString() === userId
            );

            if (currentUserEntry) {
              statsUpdate.actualScore = currentUserEntry.totalScore || 0;
              statsUpdate.totalSolved = currentUserEntry.totalSolved || 0;
            } else {
              statsUpdate.actualScore = 0;
              statsUpdate.totalSolved = 0;
            }
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
          const mcqTotalsResponse = await axios.get(
            'http://localhost:5000/api/courses/mcq-totals',
            { headers: { Authorization: `Bearer ${token}` } }
          );
          totalCourseMCQs = mcqTotalsResponse.data.totalMCQs || 0;
        } catch (err) {
          console.log('MCQ totals not available');
        }

        try {
          const mcqResponse = await axios.get(
            'http://localhost:5000/api/mcq-submissions/user-stats',
            { headers: { Authorization: `Bearer ${token}` } }
          );

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
          const userProfileResponse = await axios.get(
            'http://localhost:5000/api/profile',
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (userProfileResponse.data?.college) {
            const globalRankResponse = await axios.get(
              'http://localhost:5000/api/leaderboard/user/global-rank',
              { headers: { Authorization: `Bearer ${token}` } }
            );
            statsUpdate.ranking = globalRankResponse.data.rank || null;
          }
        } catch (err) {
          console.log('Global ranking not available:', err.response?.status);
        }

        setProgressStats((prevStats) => ({
          ...prevStats,
          ...statsUpdate,
        }));
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError('Failed to load user statistics');
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    fetchUserStats();
  }, []);

  // Fetch LeetCode stats (problems solved + rating) based on URL
  useEffect(() => {
    const leetUrl = user?.codingProfiles?.leetcode;
    if (!leetUrl) return;

    const username = extractLeetCodeUsername(leetUrl);
    if (!username) return;

    const fetchLeetCodeStats = async () => {
      try {
        // If you don't require auth for this route, you can drop the headers.
        const res = await axios.get(
          `http://localhost:5000/api/external/leetcode/${username}`
        );

        setLeetcodeSolved(res.data?.totalSolved ?? null);
        setLeetcodeRating(res.data?.rating ?? null);
      } catch (err) {
        console.log('LeetCode API fetch error:', err);
        setLeetcodeSolved(null);
        setLeetcodeRating(null);
      }
    };

    fetchLeetCodeStats();
  }, [user]);

  useEffect(() => {
  const cfUrl = user?.codingProfiles?.codeforces;
  if (!cfUrl) return;

  const handle = extractCodeforcesHandle(cfUrl);
    if (!handle) return;

    const fetchCodeforcesStats = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/external/codeforces/${handle}`
        );
        setCodeforcesSolved(res.data?.problemsSolved ?? null);
        setCodeforcesRating(res.data?.rating ?? null);
      } catch (err) {
        console.log('Codeforces API fetch error:', err);
        setCodeforcesSolved(null);
        setCodeforcesRating(null);
      }
    };

    fetchCodeforcesStats();
  }, [user]);


  const extractCodeforcesHandle = (url) => {
    if (!url || typeof url !== 'string') return null;
    try {
      const u = new URL(url.trim());
      const segments = u.pathname.split('/').filter(Boolean);
      const profileIndex = segments.indexOf('profile');
      if (profileIndex !== -1 && segments[profileIndex + 1]) {
        return segments[profileIndex + 1];
      }
      return segments[segments.length - 1] || null;
    } catch {
      const parts = url.split('/').filter(Boolean);
      const profileIndex = parts.indexOf('profile');
      if (profileIndex !== -1 && parts[profileIndex + 1]) {
        return parts[profileIndex + 1];
      }
      return parts[parts.length - 1] || null;
    }
  };

  useEffect(() => {
      const ccUrl = user?.codingProfiles?.codechef;
      if (!ccUrl) return;

      const handle = extractCodechefHandle(ccUrl);
      if (!handle) return;

      const fetchCodechefStats = async () => {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/external/codechef/${handle}`
          );
          setCodechefSolved(res.data?.problemsSolved ?? null);
          setCodechefRating(res.data?.rating ?? null);
        } catch (err) {
          console.log('CodeChef API fetch error:', err);
          setCodechefSolved(null);
          setCodechefRating(null);
        }
      };

      fetchCodechefStats();
    }, [user]);

  const extractCodechefHandle = (url) => {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url.trim());
    const segments = u.pathname.split('/').filter(Boolean);
    const usersIndex = segments.indexOf('users');
    if (usersIndex !== -1 && segments[usersIndex + 1]) {
      return segments[usersIndex + 1];
    }
    return segments[segments.length - 1] || null;
  } catch {
    const parts = url.split('/').filter(Boolean);
    const usersIndex = parts.indexOf('users');
    if (usersIndex !== -1 && parts[usersIndex + 1]) {
      return parts[usersIndex + 1];
    }
    return parts[parts.length - 1] || null;
  }
};


  // ----- Derived score values for display -----
  const codingProblemsScore = progressStats.originalScore || 0;
  const leaderboardProblemScore = progressStats.actualScore || 0;

  const problemsScoreForTotal =
    leaderboardProblemScore > 0 ? leaderboardProblemScore : codingProblemsScore;

  const mcqScore = progressStats.mcqStats?.totalScore || 0;
  const courseChallengeScore = 0;
  const courseTotalScore = mcqScore + courseChallengeScore;
  const totalCombinedScore = problemsScoreForTotal + courseTotalScore;

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
            <button
              onClick={() => window.location.reload()}
              className="retry-btn"
            >
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
        <div className="profile-main-layout">
          <ProfileSidebar
            user={user}
            progressStats={progressStats}
            onEditClick={() => setIsEditingProfile(true)}
          />

          <section className="profile-main-content">
            <div className="profile-tabs">
              <button
                className={`tab ${
                  activeTab === 'Profile' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('Profile')}
              >
                <span className="tab-text">Profile</span>
              </button>
              <button
                className={`tab ${
                  activeTab === 'Course' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('Course')}
              >
                <Link to="/courses" className="tab-link">
                  Course
                </Link>
              </button>
              <button
                className={`tab ${
                  activeTab === 'Coding' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('Problems')}
              >
                <Link to="/problem-set" className="tab-link">
                  Coding
                </Link>
              </button>
            </div>

            <div className="stats-grid">
              {/* 1) Challenges count card */}
              <div className="stat-card neon-card">
                <h3 className="card-title">Challenges</h3>
                <div className="simple-metrics">
                  <div className="metric-row">
                    <span className="metric-label">Total Challenges Available</span>
                    <span className="metric-value glow-text">
                      {problemCounts.total || 0}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Challenges Solved</span>
                    <span className="metric-value glow-text">
                      {progressStats.totalSolved || progressStats.problemsSolved || 0}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Progress (Solved / Available)</span>
                    <span className="metric-value">
                      {(progressStats.totalSolved || progressStats.problemsSolved || 0)}/
                      {problemCounts.total || 0}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Attempts (Submissions)</span>
                    <span className="metric-value">
                      {progressStats.totalSubmissions || progressStats.problemsAttempted || 0}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Successful Attempts</span>
                    <span className="metric-value">
                      {progressStats.successfulSubmissions || 0}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Accuracy</span>
                    <span className="metric-value">
                      {progressStats.successRate
                        ? `${progressStats.successRate}%`
                        : '0%'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2) MCQ's count card */}
              <div className="stat-card neon-card">
                <h3 className="card-title">MCQ's</h3>
                <div className="simple-metrics">
                  <div className="metric-row">
                    <span className="metric-label">Total MCQ Questions</span>
                    <span className="metric-value glow-text">
                      {progressStats.mcqStats.totalMCQs || 0}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">MCQs Solved</span>
                    <span className="metric-value glow-text">
                      {progressStats.mcqStats.solvedCorrectly || 0}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Progress (Solved / Available)</span>
                    <span className="metric-value">
                      {progressStats.mcqStats.solvedCorrectly || 0}/
                      {progressStats.mcqStats.totalMCQs || 0}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Questions Attempted</span>
                    <span className="metric-value">
                      {progressStats.mcqStats.questionsAttempted || 0}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Correct Answers</span>
                    <span className="metric-value">
                      {progressStats.mcqStats.solvedCorrectly || 0}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Wrong Answers</span>
                    <span className="metric-value">
                      {progressStats.mcqStats.wrongAnswers || 0}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Accuracy</span>
                    <span className="metric-value">
                      {progressStats.mcqStats.accuracy || 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 3) Coding problems count card */}
              <div className="stat-card neon-card">
                <h3 className="card-title">Coding Problems</h3>
                <div className="simple-metrics">
                  <div className="metric-row metric-row-heading">
                    <span className="metric-label">Difficulty-wise Totals</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Easy (Solved / Total)</span>
                    <span className="metric-value">
                      {progressStats.difficultyStats.easy || 0}/
                      {problemCounts.easy || 0}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Medium (Solved / Total)</span>
                    <span className="metric-value">
                      {progressStats.difficultyStats.medium || 0}/
                      {problemCounts.medium || 0}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Hard (Solved / Total)</span>
                    <span className="metric-value">
                      {progressStats.difficultyStats.hard || 0}/
                      {problemCounts.hard || 0}
                    </span>
                  </div>

                  <div className="metric-row metric-row-heading">
                    <span className="metric-label">Overall</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Total Problems Available</span>
                    <span className="metric-value glow-text">
                      {problemCounts.total || 0}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Total Problems Solved</span>
                    <span className="metric-value glow-text">
                      {progressStats.problemsSolved || progressStats.totalSolved || 0}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Total Attempts (Submissions)</span>
                    <span className="metric-value">
                      {progressStats.totalSubmissions || progressStats.problemsAttempted || 0}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Successful Submissions</span>
                    <span className="metric-value">
                      {progressStats.successfulSubmissions || 0}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Accuracy</span>
                    <span className="metric-value">
                      {progressStats.successRate
                        ? `${progressStats.successRate}%`
                        : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="performance-grid">
              {/* 1) Courses score card (MCQ + course challenges) */}
              <div className="performance-card neon-card">
                <div className="card-header mcq-header">
                  <h3 className="card-title">Courses Score</h3>
                </div>
                <div className="simple-metrics">
                  <div className="metric-row">
                    <span className="metric-label">MCQ Score</span>
                    <span className="metric-value blue-glow">
                      {mcqScore}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Challenge Score (Courses)</span>
                    <span className="metric-value">
                      {courseChallengeScore}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Total Courses Score</span>
                    <span className="metric-value glow-text">
                      {courseTotalScore}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2) Problems score card */}
              <div className="performance-card neon-card">
                <div className="card-header coding-header">
                  <h3 className="card-title">Problems Score</h3>
                </div>
                <div className="simple-metrics">
                  <div className="metric-row">
                    <span className="metric-label">Problem-set Score</span>
                    <span className="metric-value blue-glow">
                      {codingProblemsScore}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Leaderboard Score</span>
                    <span className="metric-value glow-text">
                      {leaderboardProblemScore}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Score Used for Total</span>
                    <span className="metric-value">
                      {problemsScoreForTotal}
                    </span>
                  </div>

                  <div className="metric-row">
                    <span className="metric-label">Problem Accuracy</span>
                    <span className="metric-value">
                      {progressStats.successRate
                        ? `${progressStats.successRate}%`
                        : '0%'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3) Total score card */}
              <div className="performance-card neon-card">
                <div className="card-header total-header">
                  <h3 className="card-title">Total Score</h3>
                </div>
                <div className="simple-metrics">
                  <div className="metric-row">
                    <span className="metric-label">Problems Score (Used)</span>
                    <span className="metric-value">
                      {problemsScoreForTotal}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Courses Score</span>
                    <span className="metric-value">
                      {courseTotalScore}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Combined Total Score</span>
                    <span className="metric-value glow-text">
                      {totalCombinedScore}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Global Rank</span>
                    <span className="metric-value">
                      {progressStats.ranking != null ? `#${progressStats.ranking}` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coding platform cards (LeetCode, CodeChef, Codeforces) */}
            <div className="stats-grid coding-platforms-grid">
              {/* LeetCode card */}
              <div className="stat-card neon-card">
                <h3 className="card-title">LeetCode</h3>
                <div className="simple-metrics">
                  <div className="metric-row">
                    <span className="metric-label">Profile Status</span>
                    <span className="metric-value">
                      {user?.codingProfiles?.leetcode
                        ? 'Linked'
                        : 'Not linked yet'}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Username</span>
                    <span className="metric-value">
                      {user?.codingProfiles?.leetcode
                        ? extractLeetCodeUsername(user.codingProfiles.leetcode)
                        : '—'}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Problems Solved</span>
                    <span className="metric-value glow-text">
                      {leetcodeSolved != null ? leetcodeSolved : '—'}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Contest Rating</span>
                    <span className="metric-value glow-text">
                      {leetcodeRating != null ? leetcodeRating : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* CodeChef card */}
              <div className="stat-card neon-card">
                <h3 className="card-title">CodeChef</h3>
                <div className="simple-metrics">
                  <div className="metric-row">
                    <span className="metric-label">Profile Status</span>
                    <span className="metric-value">
                      {user?.codingProfiles?.codechef ? 'Linked' : 'Not linked yet'}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Handle</span>
                    <span className="metric-value">
                      {user?.codingProfiles?.codechef
                        ? extractCodechefHandle(user.codingProfiles.codechef)
                        : '—'}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Problems Solved</span>
                    <span className="metric-value glow-text">
                      {codechefSolved != null ? codechefSolved : '—'}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Rating</span>
                    <span className="metric-value glow-text">
                      {codechefRating != null ? codechefRating : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Codeforces card */}
              <div className="stat-card neon-card">
                <h3 className="card-title">Codeforces</h3>
                <div className="simple-metrics">
                  <div className="metric-row">
                    <span className="metric-label">Profile Status</span>
                    <span className="metric-value">
                      {user?.codingProfiles?.codeforces
                        ? 'Linked'
                        : 'Not linked yet'}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Handle</span>
                    <span className="metric-value">
                      {user?.codingProfiles?.codeforces
                        ? extractCodeforcesHandle(user.codingProfiles.codeforces)
                        : '—'}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Problems Solved</span>
                    <span className="metric-value glow-text">
                      {codeforcesSolved != null ? codeforcesSolved : '—'}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Rating</span>
                    <span className="metric-value glow-text">
                      {codeforcesRating != null ? codeforcesRating : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <SubmissionHeatmap
              userId={user?._id || user?.id}
              token={localStorage.getItem('token')}
              initialYear={selectedYear}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              activityFilter={activityFilter}
              setActivityFilter={setActivityFilter}
            />
          </section>
        </div>

        {isEditingProfile && (
          <div className="edit-profile-modal-overlay">
            <div className="edit-profile-modal">
              <EditProfile
                user={user}
                userId={user?._id || user?.id}
                onCancel={() => setIsEditingProfile(false)}
                onSaveSuccess={(updatedUser) => {
                  if (updatedUser) setUser(updatedUser);
                  setIsEditingProfile(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
