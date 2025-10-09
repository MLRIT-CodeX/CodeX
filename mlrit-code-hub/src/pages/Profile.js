import React, { useState } from 'react';
import './Profile.css';

const ActivityCalendar = ({ data, theme, labels, blockMargin, blockSize, showMonthLabels, color, hideTotalCount, hideColorLegend, renderBlock, children }) => {


    if (!data || data.length === 0) {
        return (
            <div className="activity-calendar-placeholder-empty">
                No submission data available for the selected year.
                <br />
                (ActivityCalendar component placeholder active)
            </div>
        );
    }
    
    const monthNames = labels.months;
    
    return (
        <div className="heatmap-placeholder-scroll">
            <div className="heatmap-placeholder-container">
                <div className="heatmap-month-labels">
                    {monthNames.map((name, index) => {
                        return (
                            <span key={index} className="month-label">
                                {name}
                            </span>
                        );
                    })}
                </div>

                <div className="submission-heatmap">
                    {data.map((day, index) => (
                        <div
                            key={index}
                            className={`heatmap-day level-${day.level} ${index % 28 === 0 && index !== 0 ? 'month-separator-start' : ''}`}
                            title={`${day.date}: Level ${day.level}`}
                        ></div>
                    ))}
                </div>
                {children} 
            </div>
        </div>
    );
};


const mockCoursesData = {
  enrolled: 7,
  problemsSolved: 120, 
  totalScore: 5600,
};

const mockProblemsData = {
    easy: { solved: 180, total: 200, color: 'color-easy' },
    medium: { solved: 140, total: 200, color: 'color-medium' },
    hard: { solved: 50, total: 100, color: 'color-hard' },
    
    totalSolved: 180 + 140 + 50,
    totalAvailable: 200 + 200 + 100,
    attempting: 12,
};

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();


const mockData = {
  profile: {
    avatarUrl: 'https://placehold.co/96x96/00A9FF/FFFFFF?text=RV',
    name: 'POREDDY VIGNESWAR REDDY',
    handle: 'CSD - A | 84530',
  },
  socialProfiles: [ 
    { platform: 'LeetCode', username: 'user_handle_1904', url: 'https://leetcode.com/user_handle_1904/' },
    { platform: 'CodeChef', username: 'codechef_user', url: 'https://www.codechef.com/users/codechef_user' },
    { platform: 'Codeforces', username: 'cf_master', url: 'https://codeforces.com/profile/cf_master' },
    { platform: 'GitHub', username: 'github_vignesh', url: 'https://github.com/github_vignesh' },
    { platform: 'HackerRank', username: 'hrank_pro', url: 'https://www.hackerrank.com/hrank_pro' },
    { platform: 'LinkedIn', username: 'vignesh_p', url: 'https://linkedin.com/in/vignesh_p' },
  ],
  details: [
    { label: 'Email', value: 'example@mint.co.in' },
    { label: 'Roll', value: 'BTech/CSD/1904' },
    { label: 'Department', value: 'CSD' },
    { label: 'Year', value: 'Third' },
  ],
  skills: [
    { name: 'Python', count: 22 },
    { name: 'Java', count: 18 },
    { name: 'React', count: 10 },
    { name: 'HTML', count: 5 },
    { name: 'CSS', count: 5 },
  ],
  badges: [
    { name: '100 Day Streak', icon: '🔥', description: 'Achieved 100 consecutive days of activity' },
    { name: 'Master Coder', icon: '👑', description: 'Solved over 500 problems' },
    { name: 'First Contribution', icon: '🌱', description: 'Made first contribution to a public project' },
    { name: 'Python Expert', icon: '🐍', description: 'Completed advanced Python course' },
    { name: 'Team Player', icon: '🤝', description: 'Collaborated on 5 projects' },
  ],
  stats: [
    { title: 'Total Score', value: 1605, isAccent: false, key: 'score' },
    { title: 'Problems Solved', value: 370, isAccent: true, key: 'problems' },
    { title: 'Badges', value: 5, isAccent: false, key: 'badges' },
  ],
  score: 1605,
  scoreMax: 2000,
};

const SkillsSection = ({ skills }) => (
  <div className="skills-section section">
    <h3 className="section-title">Skills</h3>
    <div className="skills-list">
      {skills.map((skill, index) => (
        <span key={index} className="skills-tag">
          {skill.name} ({skill.count})
        </span>
      ))}
    </div>
  </div>
);

const SocialProfilesSection = ({ profiles }) => (
  <div className="social-profiles-section section">
    <h3 className="section-title">Coding Profiles</h3>
    <div className="social-links-list">
      {profiles.map((profile, index) => (
        <a 
          key={index} 
          href={profile.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="social-link"
        >
          <span className="platform-name">{profile.platform}:</span>
          <span className="username-handle">{profile.username}</span>
        </a>
      ))}
    </div>
  </div>
);

const BadgesDisplay = ({ badges }) => (
  <div className="badges-scroll-container">
    <div className="badges-list">
      {badges.map((badge, index) => (
        <div 
          key={index} 
          className="badge-item" 
          title={`${badge.name}: ${badge.description}`}
        >
          <span className="badge-icon">{badge.icon}</span>
          <span className="badge-name">{badge.name}</span>
        </div>
      ))}
    </div>
  </div>
);

const ScoreStatCard = ({ stat }) => (
      <div 
        className="card stat-card score-card-large card-1-3"
      >
        <div className="stat-header">
            <p className="stat-title">{stat.title}</p>
            <h2 className={`stat-value ${stat.isAccent ? 'accent-text' : 'primary-text'}`}>{stat.value}</h2>
        </div>
      </div>
);

const BadgesStatCard = ({ stat, badges }) => (
    <div className="card badges-card-container card-2-3"> 
        <div className="stat-header">
            <p className="stat-title badge-title-inline">
            {stat.title}
            <span className="inline-badge-count">{stat.value}</span>
            </p>
        </div>
        <BadgesDisplay badges={badges} />
    </div>
);

const ScoreChartContent = ({ score, scoreMax, title }) => {
    const progress = Math.min(1, score / scoreMax);
    const progressAngle = Math.round(progress * 360);
    const percentage = progress * 100;
    const ringRef = React.useRef(null);

    React.useEffect(() => {
        if (ringRef.current) {
            ringRef.current.style.setProperty('--progress-angle', `${progressAngle}deg`);
        }
    }, [progressAngle]);

    let accentColorClass;
    if (percentage <= 33.33) {
        accentColorClass = 'accent-red'; 
    } else if (percentage <= 66.66) {
        accentColorClass = 'accent-yellow'; 
    } else {
        accentColorClass = 'accent-green';
    }
    const ringClassName = `chart-ring-visual full-ring ${accentColorClass}`;

    return (
        <div className="chart-placeholder">
            <div 
                ref={ringRef}
                className={ringClassName}
            >
                <div className="chart-score-inner single-inner">
                    <span className="chart-score">{score}</span>
                    <span className="chart-max-score primary-text">/ {scoreMax}</span>
                </div>
            </div>
        </div>
    );
};

const ProblemsSolvedContent = ({ data }) => {
    const { easy, medium, hard, totalSolved, totalAvailable } = data;

    const overallProgress = {
        score: totalSolved,
        scoreMax: totalAvailable,
        title: 'Total Solved',
    };


    return (
        <div className="problems-content-grid">
            <div className="problem-chart-container simplified">
                <ScoreChartContent 
                    score={overallProgress.score} 
                    scoreMax={overallProgress.scoreMax} 
                    title={overallProgress.title} 
                />
            </div>

            <div className="difficulty-breakdown">
                {[
                    { label: 'Easy', data: easy, class: 'easy' },
                    { label: 'Med.', data: medium, class: 'medium' },
                    { label: 'Hard', data: hard, class: 'hard' },
                ].map(item => (
                    <div key={item.label} className={`difficulty-card ${item.class}`}>
                        <span className={`difficulty-label ${item.data.color}`}>{item.label}</span>
                        <span className="difficulty-count primary-text">{item.data.solved}/{item.data.total}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const TabbedPerformanceCard = ({ score, scoreMax, problemsData }) => {
    const [activeTab, setActiveTab] = useState('Problems');
    
    const renderContent = () => {
        switch (activeTab) {
            case 'Problems':
                return <ProblemsSolvedContent data={problemsData} />;
            case 'Courses':
                return (
                    <div className="tab-content-placeholder">
                        <p>Detailed performance metrics for enrolled courses will go here.</p>
                        <p className="placeholder-detail">e.g., Course completion rates, specific module scores, time spent.</p>
                    </div>
                );
            case 'Contests':
                return (
                    <div className="tab-content-placeholder">
                        <p>History and statistics for past coding contests will go here.</p>
                        <p className="placeholder-detail">e.g., Rank history chart, percentile, win rate, performance graph.</p>
                    </div>
                );
            default:
                return <ProblemsSolvedContent data={problemsData} />;
        }
    };

    return (
        <div className="card score-card tabbed-card card-2-3">
            <div className="tab-navigation">
                {['Problems', 'Courses', 'Contests'].map(tab => (
                    <button
                        key={tab}
                        className={`tab-button ${activeTab === tab ? 'active-tab' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="tab-content">
                {renderContent()}
            </div>
        </div>
    );
};

const ProblemsSolvedStatsCard = ({ data }) => {
    const { totalSolved, totalAvailable } = data;
    
    return (
        <div className="card problems-solved-card-small card-1-3">
            <h3 className="card-title">Problems Solved</h3>
            <div className="solved-count-wrapper">
                <span className="solved-value accent-text">{totalSolved}</span>
                <span className="total-value secondary-text">/ {totalAvailable}</span>
            </div>
            <p className="solved-detail">Overall progress</p>
        </div>
    );
}

const SubmissionHeatmapCard = () => {
    const availableYears = ['2025', '2024', '2023']; 
    const [selectedYear, setSelectedYear] = useState(availableYears[0]);
    
    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    return (
        <div className="card submission-heatmap-card full-width-card">
            <div className="heatmap-header">
                <h3 className="card-title">Submission Heatmap</h3>
                <select value={selectedYear} onChange={handleYearChange} className="year-filter">
                {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
                </select>
            </div>

            <div className="empty-heatmap-content">
                <p className="secondary-text">Heatmap visualization space.</p>
            </div>
        </div>
    );
};


const CoursesPerformanceCard = ({ data }) => (
  <div className="card courses-performance-card full-width-card">
    <h3 className="card-title">Courses Performance</h3>
    <div className="course-metrics-flex">
      <div className="course-metric-item">
        <p className="metric-title primary-text">Number of Courses Enrolled</p>
        <h2 className="metric-value accent-text">{data.enrolled}</h2>
      </div>
      <div className="course-metric-item">
        <p className="metric-title primary-text">Total Problems Solved</p>
        <h2 className="metric-value primary-text">{data.problemsSolved}</h2>
      </div>
      <div className="course-metric-item">
        <p className="metric-title primary-text">Total Score Obtained</p>
        <h2 className="metric-value accent-text-secondary">{data.totalScore}</h2>
      </div>
    </div>
  </div>
);


const App = () => {
    const totalScoreStat = mockData.stats.find(s => s.key === 'score');
    const badgesStat = mockData.stats.find(s => s.key === 'badges');
    
    
  return (
      <div className="app-container">
        <main className="profile-container">
          <aside className="profile-sidebar card">
            <div className="profile-card">
              <img src={mockData.profile.avatarUrl} alt="User Avatar" className="profile-avatar" />
              <h1 className="profile-name">{mockData.profile.name}</h1>
              <p className="profile-handle">{mockData.profile.handle}</p>
              <button className="edit-button">Edit Profile</button>
            </div>
            
            <SocialProfilesSection profiles={mockData.socialProfiles} />

            <div className="details-section section">
              <h3 className="section-title">Details</h3>
              <ul className="details-list">
                {mockData.details.map((detail, index) => (
                  <li key={index}>
                    <span className="detail-label">{detail.label}:</span>
                    <span className="detail-value">{detail.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <SkillsSection skills={mockData.skills} />

            <div className="section">
              <h3 className="section-title">Interests</h3>
              <p className="detail-value">Artificial Intelligence, Machine Learning</p>
            </div>
          </aside>

          <section className="profile-main">
            <div className="main-flex-container">
              
              <CoursesPerformanceCard data={mockCoursesData} />

              <div className="top-cards-row">
                <ScoreStatCard stat={totalScoreStat} />
                <BadgesStatCard stat={badgesStat} badges={mockData.badges} />
              </div>

              <div className="bottom-cards-row">
                <ProblemsSolvedStatsCard data={mockProblemsData} />
                <TabbedPerformanceCard score={mockData.score} scoreMax={mockData.scoreMax} problemsData={mockProblemsData} />
              </div>
              
              <SubmissionHeatmapCard />
            </div>
          </section>
        </main>
      </div>
  );
};

export default App;