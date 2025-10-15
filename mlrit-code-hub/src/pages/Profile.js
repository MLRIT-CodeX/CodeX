import React, { useState, useEffect } from 'react';

// @ts-ignore
const ActivityCalendar = ({ data, theme, labels, blockMargin, blockSize, showMonthLabels, color, hideTotalCount, hideColorLegend, renderBlock, children }) => {
    
    
    if (!data || data.length === 0) {
        return (
            <div className="activity-calendar-placeholder-empty">
                No submission data available for the selected year.
                (ActivityCalendar component placeholder active)
            </div>
        );
    }
    
    const monthNames = labels.months;
    
    return (
        <div className="heatmap-placeholder-scroll">
            <div className="heatmap-placeholder-container">
                <div className="heatmap-month-labels">
                    {monthNames.map((name, index) => (
                            <span key={index} className="month-label">
                                {name}
                            </span>
                        )
                    )}
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
    easy: { solved: 50, total: 200, color: 'color-easy' },
    medium: { solved: 20, total: 200, color: 'color-medium' },
    hard: { solved: 5, total: 100, color: 'color-hard' },
    
    totalSolved: 50 + 20 + 5,
    totalAvailable: 200 + 200 + 100,
};

const mockCoursesBreakdown = {
    easy: { solved: 3, total: 5, color: 'color-easy' },
    medium: { solved: 2, total: 3, color: 'color-medium' },
    hard: { solved: 0.5, total: 2, color: 'color-hard' }, 
    
    totalSolved: 3 + 2 + 0.5,
    totalAvailable: 5 + 3 + 2,
};

const mockScoreData = {
    totalScore: 12600,
    categories: [
        { name: 'Contest Rating', score: 4500, max: 5000, color: 'color-easy' },
        { name: 'Course Quizzes', score: 3500, max: 4000, color: 'color-medium' },
        { name: 'Project Bonuses', score: 4600, max: 6000, color: 'color-hard' },
    ]
};

const problemScoreConfig = {
    easy: 50,
    medium: 75,
    hard: 100,
};

const courseScoreConfig = {
    easy: 500,
    medium: 750,
    hard: 1000,
};

const calculateTotalScores = (problemsData, coursesData, pConfig, cConfig) => {
    
    const problemScore = 
        (problemsData.easy.solved * pConfig.easy) +
        (problemsData.medium.solved * pConfig.medium) +
        (problemsData.hard.solved * pConfig.hard);

    const courseScore = 
        (coursesData.easy.solved * cConfig.easy) +
        (coursesData.medium.solved * cConfig.medium) +
        (coursesData.hard.solved * cConfig.hard);
    
    const totalScore = problemScore + courseScore;
    const maxScore = 
        (problemsData.easy.total * pConfig.easy) +
        (problemsData.medium.total * pConfig.medium) +
        (problemsData.hard.total * pConfig.hard) +
        (coursesData.easy.total * cConfig.easy) +
        (coursesData.medium.total * cConfig.medium) +
        (coursesData.hard.total * cConfig.hard);
        
    return {
        totalScore,
        courseScore,
        problemScore,
        scoreMax: maxScore
    };
};


const mockActivityHighlights = [
    { label: 'Max Daily Streak', value: '42 days', accentClass: 'accent-yellow' },
    { label: 'Highest Rank Achieved', value: '#1552', accentClass: 'accent-blue' },
    { label: 'Total Active Days', value: '111', accentClass: 'accent-green' },
];


// @ts-ignore
const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
// @ts-ignore
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
    { title: 'Total Score', value: 0, isAccent: false, key: 'score' }, 
    { title: 'Problems Solved', value: 370, isAccent: true, key: 'problems' },
    { title: 'Badges', value: 5, isAccent: false, key: 'badges' },
  ],
  score: 0, 
  scoreMax: 0, 
  courseScore: 0,
  problemScore: 0,
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

const ScoreTooltip = ({ isVisible, content, position }) => {
    const tooltipStyle = {
        top: position.y,
        left: position.x
    };

    return (
        <div 
            className={`score-tooltip ${isVisible ? 'visible' : ''}`}
            style={tooltipStyle}
        >
            {content}
        </div>
    );
};


const MultiScoreChart = ({ totalScore, courseScore, problemScore }) => {
    const totalContentScore = courseScore + problemScore; 
    const totalAngleAvailable = 360; 
    
    const courseRatio = courseScore / totalContentScore;
    
    const courseArc = Math.round(courseRatio * totalAngleAvailable);
    const problemArcStart = courseArc; 
    
    const chartData = {
        '--course-stop': `${courseArc}deg`,
        '--problem-start': `${problemArcStart}deg`, 
    };
    
    const [tooltip, setTooltip] = useState({ 
        isVisible: false, 
        content: '', 
        position: { x: 0, y: 0 } 
    });

    const segments = [
        { 
            name: "Courses", 
            score: courseScore, 
            angle: courseArc, 
            colorClass: 'course-segment-color', 
            startAngle: 0, 
            endAngle: courseArc
        },
        { 
            name: "Problems/Other", 
            score: problemScore, 
            angle: totalAngleAvailable - courseArc, 
            colorClass: 'problem-segment-color', 
            startAngle: courseArc, 
            endAngle: totalAngleAvailable 
        }
    ];

    const handleMouseMove = (e, name, score) => {
        setTooltip({
            isVisible: true,
            content: `${name}: ${score}`,
            position: { x: e.clientX + 10, y: e.clientY + 10 } 
        });
    };

    const handleMouseLeave = () => {
        setTooltip({ isVisible: false, content: '', position: { x: 0, y: 0 } });
    };
    
    // Animation logic
    const [currentChartData, setCurrentChartData] = useState({
        '--course-stop': '0deg',
        '--problem-start': '0deg',
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            setCurrentChartData(chartData);
        }, 50); 
        return () => clearTimeout(timeout);
    }, [courseScore, problemScore]);

    return (
        <div className="multi-chart-container">
            <div className="ring-stack-segmented chart-stack-rotation">
                <div 
                    className="chart-ring-visual segmented-ring chart-data-stops" 
                    // @ts-ignore
                    style={currentChartData}
                ></div>
                
                {segments.map((segment, index) => {
                    const segmentRotation = `${segment.startAngle - 135}deg`;
                    const hoverStyle = {
                        '--segment-rotation': segmentRotation,
                        '--segment-angle': `${segment.angle}deg`,
                    };
                    
                    return (
                        <div 
                            key={index}
                            className={`hover-segment-overlay ${segment.colorClass} ${segment.name === "Courses" ? 'no-hover' : ''}`}
                            onMouseMove={(e) => handleMouseMove(e, segment.name, segment.score)}
                            onMouseLeave={handleMouseLeave}
                            // @ts-ignore
                            style={hoverStyle}
                        >
                        </div>
                    );
                })}
                
                <div className="chart-score-inner segmented-inner chart-inner-rotation">
                    <span className="chart-score">{totalScore}</span>
                </div>
            </div>
            
            <ScoreTooltip 
                isVisible={tooltip.isVisible} 
                content={tooltip.content} 
                position={tooltip.position} 
            />
            
            <div className="chart-legend-row">
                <div className="legend-item"><span className="legend-swatch course-swatch"></span>Courses</div>
                <div className="legend-item"><span className="legend-swatch problem-swatch gradient-swatch"></span>Problems/Other</div>
            </div>
        </div>
    );
};


// @ts-ignore
const ScoreStatCard = ({ stat, courseScore, problemScore, scoreMax }) => (
    <div className="card stat-card score-card-large card-1-3">
        <h3 className="card-title">Total Score</h3>
        <div className="score-chart-content">
            <MultiScoreChart 
                totalScore={stat.value} 
                courseScore={courseScore}
                problemScore={problemScore}
            />
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

// @ts-ignore
const ScoreChartContent = ({ score, scoreMax, title }) => {
    const progress = Math.min(1, score / scoreMax);
    const progressAngle = Math.round(progress * 360);
    
    // Animation logic
    const [currentAngle, setCurrentAngle] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setCurrentAngle(progressAngle);
        }, 50); 
        return () => clearTimeout(timeout);
    }, [progressAngle]);

    const percentage = progress * 100;

    let accentColorClass;
    if (percentage <= 33.33) {
        accentColorClass = 'accent-red'; 
    } else if (percentage <= 66.66) {
        accentColorClass = 'accent-yellow'; 
    } else {
        accentColorClass = 'accent-green';
    }

    const ringClassName = `chart-ring-visual full-ring ${accentColorClass}`;
    const ringStyle = { '--progress-angle': `${currentAngle}deg` };

    return (
        <div className="chart-placeholder">
            <div 
                className={ringClassName} 
                // @ts-ignore
                style={ringStyle}
            >
                <div className="chart-score-inner single-inner chart-inner-rotation-90">
                    <span className="chart-score">{score}</span>
                </div>
            </div>
        </div>
    );
};

const DifficultyBreakdownChart = ({ data, setHighlight }) => {
    const { easy, medium, hard, totalAvailable, totalSolved } = data;
    const total = totalAvailable; 
    
    const easySolvedArc = Math.round((easy.solved / total) * 360);
    const mediumSolvedArc = Math.round((medium.solved / total) * 360);
    const hardSolvedArc = Math.round((hard.solved / total) * 360);
    
    const easyStart = 0;
    const mediumStart = easySolvedArc;
    const hardStart = easySolvedArc + mediumSolvedArc;
    
    const totalSolvedArc = easySolvedArc + mediumSolvedArc + hardSolvedArc;

    const chartData = {
        '--easy-stop': `${easySolvedArc}deg`,
        '--medium-stop': `${easySolvedArc + mediumSolvedArc}deg`,
        '--hard-stop': `${totalSolvedArc}deg`,
    };

    const easyMidpointAngle = easyStart + (easySolvedArc / 2); 
    const mediumMidpointAngle = mediumStart + (mediumSolvedArc / 2); 
    const hardMidpointAngle = hardStart + (hardSolvedArc / 2); 
    
    const arrowSegments = [
        { name: 'easy', angle: easyMidpointAngle, color: 'var(--color-easy)', idSuffix: 'arrow-easy' },
        { name: 'medium', angle: mediumMidpointAngle, color: 'var(--color-medium)', idSuffix: 'arrow-medium' },
        { name: 'hard', angle: hardMidpointAngle, color: 'var(--color-hard)', idSuffix: 'arrow-hard' },
    ];
    
    // Animation logic
    const [currentChartData, setCurrentChartData] = useState({
        '--easy-stop': '0deg',
        '--medium-stop': '0deg',
        '--hard-stop': '0deg',
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            setCurrentChartData(chartData);
        }, 50);
        return () => clearTimeout(timeout);
    }, [easySolvedArc, mediumSolvedArc, hardSolvedArc]);


    return (
        <div className="multi-chart-container problem-chart-ring-wrapper">
            <div className="ring-stack-segmented chart-stack-rotation-90">
                <div 
                    className="chart-ring-visual problem-segmented-ring chart-data-stops" 
                    // @ts-ignore
                    style={currentChartData}
                ></div>
                
                {arrowSegments.map(segment => {
                    const arrowStyle = {
                        '--arrow-angle': `${segment.angle}deg`,
                        '--arrow-color': segment.color,
                    };
                    return (
                        <div 
                            key={segment.name}
                            className={`chart-arrow ${segment.idSuffix} ${setHighlight === segment.name ? 'visible-arrow' : ''}`}
                            // @ts-ignore
                            style={arrowStyle}
                        ></div>
                    );
                })}

                <div className="chart-score-inner segmented-inner chart-inner-rotation-90">
                    <span className="chart-score">{totalSolved}</span>
                    <span className="chart-max-score primary-text">/ {totalAvailable}</span>
                </div>
            </div>
        </div>
    );
}

const ProblemsScoreContent = ({ problemData, scoreConfig }) => {
    const [highlightedDifficulty, setHighlightedDifficulty] = useState('');
    
    const scoreData = {
        easy: {
            score: problemData.easy.solved * scoreConfig.easy,
            max: problemData.easy.total * scoreConfig.easy,
            color: problemData.easy.color
        },
        medium: {
            score: problemData.medium.solved * scoreConfig.medium,
            max: problemData.medium.total * scoreConfig.medium,
            color: problemData.medium.color
        },
        hard: {
            score: problemData.hard.solved * scoreConfig.hard,
            max: problemData.hard.total * scoreConfig.hard,
            color: problemData.hard.color
        }
    };

    const totalScoreObtained = scoreData.easy.score + scoreData.medium.score + scoreData.hard.score;
    const totalScorePossible = scoreData.easy.max + scoreData.medium.max + scoreData.hard.max;

    const dataForChart = {
        easy: { solved: scoreData.easy.score, total: totalScorePossible, color: scoreData.easy.color },
        medium: { solved: scoreData.medium.score, total: totalScorePossible, color: scoreData.medium.color },
        hard: { solved: scoreData.hard.score, total: totalScorePossible, color: scoreData.hard.color },
        totalSolved: totalScoreObtained,
        totalAvailable: totalScorePossible,
    };


    return (
        <div className="problems-content-grid">
            <div className="problem-chart-container simplified-chart-area">
                <DifficultyBreakdownChart 
                    data={dataForChart} 
                    setHighlight={setHighlightedDifficulty} 
                />
            </div>

            <div className="difficulty-breakdown">
                {[
                    { label: 'Easy', data: scoreData.easy, class: 'easy' },
                    { label: 'Med.', data: scoreData.medium, class: 'medium' },
                    { label: 'Hard', data: scoreData.hard, class: 'hard' },
                ].map(item => (
                    <div 
                        key={item.label} 
                        className={`difficulty-card ${item.class} ${highlightedDifficulty === item.class ? 'highlighted-card' : ''}`}
                        onMouseEnter={() => setHighlightedDifficulty(item.class)} 
                        onMouseLeave={() => setHighlightedDifficulty('')}
                        id={`${item.class}-score-card`}
                    >
                        <span className={`difficulty-label ${item.data.color}`}>{item.label}</span>
                        <span className="difficulty-count primary-text">{item.data.score}/{item.data.max}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const CoursesScoreContent = ({ coursesData, scoreConfig }) => {
    const [highlightedDifficulty, setHighlightedDifficulty] = useState('');

    const scoreData = {
        easy: {
            score: coursesData.easy.solved * scoreConfig.easy,
            max: coursesData.easy.total * scoreConfig.easy,
            color: coursesData.easy.color
        },
        medium: {
            score: coursesData.medium.solved * scoreConfig.medium,
            max: coursesData.medium.total * scoreConfig.medium,
            color: coursesData.medium.color
        },
        hard: {
            score: coursesData.hard.solved * scoreConfig.hard,
            max: coursesData.hard.total * scoreConfig.hard,
            color: coursesData.hard.color
        }
    };

    const totalScoreObtained = scoreData.easy.score + scoreData.medium.score + scoreData.hard.score;
    const totalScorePossible = scoreData.easy.max + scoreData.medium.max + scoreData.hard.max;

    const dataForChart = {
        easy: { solved: scoreData.easy.score, total: totalScorePossible, color: scoreData.easy.color },
        medium: { solved: scoreData.medium.score, total: totalScorePossible, color: scoreData.medium.color },
        hard: { solved: scoreData.hard.score, total: totalScorePossible, color: scoreData.hard.color },
        totalSolved: totalScoreObtained,
        totalAvailable: totalScorePossible,
    };

    return (
        <div className="problems-content-grid">
            <div className="problem-chart-container simplified-chart-area">
                <DifficultyBreakdownChart 
                    data={dataForChart} 
                    setHighlight={setHighlightedDifficulty} 
                />
            </div>

            <div className="difficulty-breakdown">
                {[
                    { label: 'Beginner', data: scoreData.easy, class: 'easy' },
                    { label: 'Intermd.', data: scoreData.medium, class: 'medium' },
                    { label: 'Advanced', data: scoreData.hard, class: 'hard' },
                ].map(item => (
                    <div 
                        key={item.label} 
                        className={`difficulty-card ${item.class} ${highlightedDifficulty === item.class ? 'highlighted-card' : ''}`}
                        onMouseEnter={() => setHighlightedDifficulty(item.class)} 
                        onMouseLeave={() => setHighlightedDifficulty('')}
                        id={`${item.class}-course-score-card`}
                    >
                        <span className={`difficulty-label ${item.data.color}`}>{item.label}</span>
                        <span className="difficulty-count primary-text">{item.data.score}/{item.data.max}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const ProblemsSolvedContent = ({ data }) => {
    const [highlightedDifficulty, setHighlightedDifficulty] = useState('');
    
    // @ts-ignore
    const { easy, medium, hard, totalSolved, totalAvailable } = data;

    return (
        <div className="problems-content-grid">
            <div className="problem-chart-container simplified-chart-area">
                <DifficultyBreakdownChart data={data} setHighlight={setHighlightedDifficulty} />
            </div>

            <div className="difficulty-breakdown">
                {[
                    { label: 'Easy', data: easy, class: 'easy' },
                    { label: 'Med.', data: medium, class: 'medium' },
                    { label: 'Hard', data: hard, class: 'hard' },
                ].map(item => (
                    <div 
                        key={item.label} 
                        className={`difficulty-card ${item.class} ${highlightedDifficulty === item.class ? 'highlighted-card' : ''}`}
                        onMouseEnter={() => setHighlightedDifficulty(item.class)} 
                        onMouseLeave={() => setHighlightedDifficulty('')}
                        id={`${item.class}-card`}
                    >
                        <span className={`difficulty-label ${item.data.color}`}>{item.label}</span>
                        <span className="difficulty-count primary-text">{item.data.solved}/{item.data.total}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CoursesCompletionContent = ({ data }) => {
    const [highlightedDifficulty, setHighlightedDifficulty] = useState('');
    
    // @ts-ignore
    const { easy, medium, hard, totalSolved, totalAvailable } = data;

    return (
        <div className="problems-content-grid">
            <div className="problem-chart-container simplified-chart-area">
                <DifficultyBreakdownChart data={data} setHighlight={setHighlightedDifficulty} />
            </div>

            <div className="difficulty-breakdown">
                {[
                    { label: 'Beginner', data: easy, class: 'easy' },
                    { label: 'Intermd.', data: medium, class: 'medium' },
                    { label: 'Advanced', data: hard, class: 'hard' },
                ].map(item => (
                    <div 
                        key={item.label} 
                        className={`difficulty-card ${item.class} ${highlightedDifficulty === item.class ? 'highlighted-card' : ''}`}
                        onMouseEnter={() => setHighlightedDifficulty(item.class)} 
                        onMouseLeave={() => setHighlightedDifficulty('')}
                        id={`${item.class}-card`}
                    >
                        <span className={`difficulty-label ${item.data.color}`}>{item.label}</span>
                        <span className="difficulty-count primary-text">{item.data.solved}/{item.data.total}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TabbedPerformanceCard = ({ problemsData, coursesData }) => {
    const [activeTab, setActiveTab] = useState('Problems');
    
    const renderContent = () => {
        switch (activeTab) {
            case 'Problems':
                return <ProblemsSolvedContent data={problemsData} />;
            case 'Courses':
                return <CoursesCompletionContent data={coursesData} />;
            default:
                return <ProblemsSolvedContent data={problemsData} />;
        }
    };

    return (
        <div className="card problems-detailing tabbed-card card-2-3">
            <div className="tab-navigation">
                {['Problems', 'Courses'].map(tab => (
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


// @ts-ignore
const ScoreDetailsContent = ({ data }) => {
    const [highlightedCategory, setHighlightedCategory] = useState('');
    
    const totalPossibleScore = data.categories.reduce((sum, cat) => sum + cat.max, 0);

    const chartData = data.categories.map((cat, index) => {
        const scoreArc = Math.round((cat.score / totalPossibleScore) * 360);
        return {
            ...cat,
            arc: scoreArc,
            // @ts-ignore
            endAngle: data.categories.slice(0, index + 1).reduce((sum, c, i) => sum + Math.round((c.score / totalPossibleScore) * 360), 0)
        };
    });

    const totalScoreArc = chartData[chartData.length - 1]?.endAngle || 0;

    const ringData = {
        '--cat-stop-1': `${chartData[0]?.endAngle || 0}deg`,
        '--cat-stop-2': `${chartData[1]?.endAngle || 0}deg`,
        '--cat-stop-3': `${chartData[2]?.endAngle || 0}deg`,
        '--total-stop': `${totalScoreArc}deg`
    };
    
    // Animation logic
    const [currentRingData, setCurrentRingData] = useState({
        '--cat-stop-1': '0deg',
        '--cat-stop-2': '0deg',
        '--cat-stop-3': '0deg',
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            setCurrentRingData(ringData);
        }, 50); 
        return () => clearTimeout(timeout);
    }, [data.totalScore]);


    return (
        <div className="problems-content-grid">
            <div className="problem-chart-container simplified-chart-area">
                <div className="multi-chart-container problem-chart-ring-wrapper">
                    <div className="ring-stack-segmented chart-stack-rotation-90">
                        <div 
                            className="chart-ring-visual score-segmented-ring chart-data-stops" 
                            // @ts-ignore
                            style={currentRingData}
                        ></div>
                        <div className="chart-score-inner segmented-inner chart-inner-rotation-90">
                            <span className="chart-score">{data.totalScore}</span>
                            <span className="chart-max-score primary-text">/ {totalPossibleScore}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="difficulty-breakdown">
                {data.categories.map(item => (
                    <div 
                        key={item.name} 
                        className={`difficulty-card ${item.color} ${highlightedCategory === item.name ? 'highlighted-card' : ''}`}
                        onMouseEnter={() => setHighlightedCategory(item.name)} 
                        onMouseLeave={() => setHighlightedCategory('')}
                    >
                        <span className={`difficulty-label ${item.color}`}>{item.name}</span>
                        <span className="difficulty-count primary-text">{item.score}/{item.max}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// @ts-ignore
const TabbedScoreCard = ({ scoreData, problemsData, coursesData, scoreConfig, courseScoreConfig }) => {
    const [activeTab, setActiveTab] = useState('Problems');
    
    const renderContent = () => {
        switch (activeTab) {
            case 'Problems':
                return <ProblemsScoreContent problemData={problemsData} scoreConfig={scoreConfig} />;
            case 'Courses':
                return <CoursesScoreContent coursesData={coursesData} scoreConfig={courseScoreConfig} />;
            default:
                return <ProblemsScoreContent problemData={problemsData} scoreConfig={scoreConfig} />;
        }
    };

    return (
        <div className="card score-detailing tabbed-card full-width-card">
            <div className="tab-navigation">
                {['Problems', 'Courses'].map(tab => (
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

const ActivityHighlightsCard = ({ highlights }) => (
    <div className="card activity-highlights-card full-width-card">
        <div className="highlights-flex">
            {highlights.map((item, index) => (
                <div key={index} className="highlight-item">
                    <span className={`highlight-value ${item.accentClass}`}>{item.value}</span>
                    <span className="highlight-label secondary-text">{item.label}</span>
                </div>
            ))}
        </div>
    </div>
);


const App = () => {
    
    const calculatedScores = calculateTotalScores(
        mockProblemsData, 
        mockCoursesBreakdown, 
        problemScoreConfig, 
        courseScoreConfig
    );
    
    const totalScoreStat = { 
        ...mockData.stats.find(s => s.key === 'score'), 
        value: calculatedScores.totalScore,
        max: calculatedScores.scoreMax
    };

    // @ts-ignore
    const problemsStat = mockData.stats.find(s => s.key === 'problems');
    const badgesStat = mockData.stats.find(s => s.key === 'badges');
    
    
  return (
    <>
      <style>{`
        
        :root {
          --bg-primary: #000000;
          --bg-card: #1E1E1E;
          --text-primary: #EAEAEA; 
          --text-secondary: #A0A0A0; 
          --color-accent1: #00A9FF;
          --color-accent2: #FFB347;
          --color-contribution-low: #1b321a;
          --color-contribution-high: #007300;
          --color-easy: #00C853;
          --color-medium: #FFD700;
          --color-hard: #FF4757;
          --spacing-unit: 16px;
          --border-radius: 12px;
          --heatmap-cell-size: 10px;
          --heatmap-gap: 3px;
          --ring-background: rgba(255, 255, 255, 0.1);
          --color-red: #FF4757;
          --color-yellow: #FFD700;
          --color-green: #00C853;
          --color-purple-start: #8A2BE2; 
          --color-purple-end: #4B0082; 
        }

        body {
          margin: 0;
          padding: 0;
          font-family: system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: var(--text-primary);
          line-height: 1.6;
          background-color: var(--bg-primary); 
        }

        .app-container {
          padding: 0;
        }

        .profile-container {
          display: flex;
          max-width: 1400px;
          margin: 0 auto;
          gap: 1rem;
          padding: 2rem; 
        }

        .card {
          background-color: var(--bg-card);
          border-radius: var(--border-radius);
          padding: 1.5rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
          height: 100%;
        }

        .section {
          padding-bottom: 1rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .primary-text {
            color: var(--text-primary) !important;
        }
        
        .secondary-text {
            color: var(--text-secondary) !important;
        }


        .section-title {
          color: var(--text-secondary); 
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 0;
          margin-bottom: 1rem;
        }

        .profile-sidebar {
          width: 300px;
          flex-shrink: 0;
          height: fit-content;
          margin-top: 5rem;
        }

        .profile-card {
          text-align: center;
          padding: 0 0 1rem 0;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .profile-avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 1rem;
          border: 4px solid var(--color-accent1);
          display: block; 
          margin-left: auto;
          margin-right: auto;
        }

        .profile-name {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 4px 0;
        }

        .profile-handle {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 0 0 1rem 0;
        }

        .edit-button {
          background-color: var(--color-accent2);
          color: var(--bg-card);
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .edit-button:hover {
          background-color: #f7a933;
        }

        .social-profiles-section {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .social-links-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .social-link {
            display: flex;
            gap: 5px;
            text-decoration: none;
            color: var(--color-accent1);
            font-size: 0.95rem;
            transition: color 0.2s;
        }
        
        .social-link:hover {
            color: var(--color-accent2);
        }
        
        .social-link .platform-name {
            color: var(--text-secondary); 
            font-weight: 500;
            width: 90px;
            flex-shrink: 0;
        }
        
.social-link .username-handle {
            color: var(--text-primary); 
            text-decoration: underline;
            text-decoration-color: rgba(255, 255, 255, 0.2);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .details-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .details-list li {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
        }

        .detail-label {
          color: var(--text-secondary); 
          font-weight: 500;
        }

        .detail-value {
          color: var(--text-primary); 
          font-size: 0.95rem;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .skills-tag {
          background-color: rgba(0, 169, 255, 0.1);
          color: var(--color-accent1);
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .profile-main {
          flex-grow: 1;
        }

        .main-flex-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .top-cards-row {
            display: flex;
            gap: 1rem;
            align-items: stretch;
        }

        .bottom-cards-row {
            display: flex;
            gap: 1rem;
            align-items: stretch;
        }
        
        .full-width-card {
            flex: 1 1 100%;
        }
        
        .card-1-3 {
            flex: 1 1 32%;
        }
        
        .card-2-3 {
            flex: 1 1 66%;
        }
        
        .card-title {
            color: var(--text-secondary); 
            font-size: 1.1rem;
            font-weight: 600;
            margin-top: 0;
            margin-bottom: 1rem;
        }

        .courses-performance-card {
            padding: 1.5rem 2rem;
        }
        
        .course-metrics-flex {
            display: flex;
            gap: 1.5rem;
            margin-top: 1.5rem;
            text-align: center;
        }
        
        .course-metric-item {
            flex: 1;
            padding: 1.25rem;
            border-radius: var(--border-radius);
            background-color: rgba(255, 255, 255, 0.03); 
            border: 1px solid rgba(255, 255, 255, 0.08); 
            transition: transform 0.2s;
        }

        .course-metric-item:hover {
            transform: translateY(-2px);
        }

        .course-metric-item .metric-title {
            color: var(--text-primary); 
            font-size: 0.95rem;
            margin: 0 0 8px 0;
            font-weight: 500;
        }

        .course-metric-item .metric-value {
            font-size: 2rem;
            font-weight: 700;
            margin: 0;
        }
        .accent-text-secondary {
            color: var(--color-accent2);
        }

        .stat-header {
          text-align: center;
        }

        .stat-title {
          color: var(--text-secondary); 
          font-size: 0.9rem;
          margin: 0 0 8px 0;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary); 
        }

        .accent-text {
          color: var(--color-accent1);
        }
        
        .score-card-large .stat-value {
            color: var(--text-primary);
        }

        .badges-card-container {
            padding: 1rem;
            text-align: left; 
            display: flex;
            flex-direction: column;
        }

        .badges-card-container .stat-header {
            text-align: left; 
            margin: 0.5rem 0; 
        }

        .badges-card-container .stat-title {
            color: var(--text-secondary); 
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1.1rem; 
            font-weight: 600;
            margin: 0; 
            line-height: 1; 
        }

        .inline-badge-count {
            background-color: var(--color-accent1);
            color: var(--bg-card);
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 700;
            line-height: 1; 
        }
        
        .badges-scroll-container {
            overflow-x: scroll; 
            padding-bottom: 5px; 
            margin-top: 0.5rem; 
            white-space: nowrap; 
            -webkit-overflow-scrolling: touch; 
            scroll-snap-type: x mandatory; 
            scroll-padding: 0 0.5rem; 
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .badges-scroll-container::-webkit-scrollbar {
            height: 4px; 
        }

        .badges-scroll-container::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
        }

        .badges-list {
            display: flex;
            gap: 1px; 
            padding-right: 0.5rem; 
        }
        
        .badge-item {
            background-color: transparent; 
            border: none;
            padding: 0; 
            display: flex;
            flex-direction: column;
            align-items: center;
            flex-shrink: 0; 
            width: calc(30% - 5px); 
            scroll-snap-align: start; 
            cursor: help;
        }
        
        .badge-icon {
            font-size: 1.8rem; 
            margin-bottom: 2px; 
            filter: drop-shadow(0 0 3px var(--color-accent2));
        }

        .badge-name {
            color: var(--text-primary); 
            font-size: 0.75rem; 
            font-weight: 500; 
            text-align: center;
            white-space: normal;
            line-height: 1.1;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .solved-count-wrapper {
            display: flex;
            align-items: baseline;
            justify-content: center;
        }
        
        .solved-value {
            font-size: 2.5rem;
            font-weight: 700;
            line-height: 1;
            color: var(--text-primary); 
        }
        
        .total-value {
            font-size: 1.2rem;
            color: var(--text-secondary); 
            font-weight: 500;
        }
        
        .solved-detail {
            color: var(--text-secondary); 
            font-size: 0.85rem;
            margin: 5px 0 0 0;
        }

        .tab-navigation {
            display: flex;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            width: 100%;
            justify-content: flex-start;
            margin-bottom: 1rem;
            padding: 0 0 4px 0;
        }
        
        .tab-button {
            background: none;
            border: none;
            color: var(--text-secondary); 
            font-size: 0.95rem;
            font-weight: 500;
            padding: 8px 15px;
            margin: 0 5px;
            cursor: pointer;
            transition: color 0.2s, border-bottom 0.2s;
            position: relative;
        }

        .tab-button:hover {
            color: var(--text-primary);
        }

        .active-tab {
            color: var(--color-accent1);
            font-weight: 600;
        }

        .active-tab::after {
            content: '';
            position: absolute;
            bottom: -5px; 
            left: 5px;
            right: 5px;
            height: 2px;
            background-color: var(--color-accent1);
            border-radius: 2px;
        }
        
        .tab-content {
            width: 100%;
            flex-grow: 1;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .tab-content-placeholder {
            text-align: center;
            padding: 2rem 0;
            color: var(--text-secondary);
        }
        
.placeholder-detail {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.4);
            margin-top: 5px;
        }

        .chart-placeholder {
          width: 140px;
          height: 140px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .chart-ring-visual {
            --ring-size: 140px;
            --ring-thickness: 10px;
            --ring-background: rgba(255, 255, 255, 0.1);
            
            width: var(--ring-size);
            height: var(--ring-size);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            
            background: var(--ring-background);
            
            display: flex;
            align-items: center;
            justify-content: center;
            
            transform: rotate(0deg); 
            box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 0 2px rgba(0, 0, 0, 0.5);
            transition: background 10s ease-out;
        }
        
        .full-ring.accent-red {
            background: conic-gradient(
                var(--color-red) 0deg,
                var(--color-red) var(--progress-angle),
                var(--ring-background) var(--progress-angle)
            );
        }
        
        .full-ring.accent-yellow {
            background: conic-gradient(
                var(--color-yellow) 0deg,
                var(--color-yellow) var(--progress-angle),
                var(--ring-background) var(--progress-angle)
            );
        }
        
        .full-ring.accent-green {
            background: conic-gradient(
                var(--color-green) 0deg,
                var(--color-green) var(--progress-angle),
                var(--ring-background) var(--progress-angle)
            );
        }

        .chart-score-inner {
            background-color: var(--bg-card);
            border-radius: 50%;
            width: calc(var(--ring-size) - (var(--ring-thickness) * 2));
            height: calc(var(--ring-size) - (var(--ring-thickness) * 2));
            
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            
            transition: all 0.5s ease-out;
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5) inset;
        }
        
        .single-inner {
            transform: rotate(90deg); 
        }
        
        .chart-score {
            font-size: 2.2rem;
            font-weight: 700;
            color: var(--text-primary); 
            line-height: 1.1;
        }
        
        .chart-max-score {
            font-size: 1rem;
            color: var(--text-secondary); 
            font-weight: 500;
        }

        .solved-status-labels {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, 30px); 
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
        }

        .problems-content-grid {
            display: flex;
            flex-direction: row;
            justify-content: flex-start; 
            align-items: flex-start; 
            width: 100%;
            max-width: 600px; 
            margin: 1rem 0 0 0;
            gap: 2rem;
        }
        
        .simplified-chart-area {
            width: 160px; 
            height: 160px;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex-shrink: 0; 
            margin-left: 0; 
        }


        .difficulty-breakdown {
            display: flex;
            flex-direction: column;
            gap: 0.5rem; 
            width: 160px; 
            flex-shrink: 0; 
            padding-top: 0; 
            height: fit-content; 
        }

        .difficulty-card {
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 6px;
            padding: 0.6rem 1rem;
            text-align: left;
            transition: transform 0.2s;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative; 
        }

        .difficulty-card:hover {
            transform: translateY(-1px);
        }

        .difficulty-label {
            font-size: 0.9rem;
            font-weight: 600;
            margin: 0;
            display: inline;
        }

        .difficulty-label.color-easy {
            color: var(--color-easy); 
        }
        .difficulty-label.color-medium {
            color: var(--color-medium); 
        }
        .difficulty-label.color-hard {
            color: var(--color-hard); 
        }

        .difficulty-count {
            font-size: 0.9rem;
            color: var(--text-primary); 
            font-weight: 500;
            white-space: nowrap;
        }

        .difficulty-card.easy {
            border-left: 4px solid var(--color-easy);
        }
        .difficulty-card.medium {
            border-left: 4px solid var(--color-medium);
        }
        .difficulty-card.hard {
            border-left: 4px solid var(--color-hard);
        }

        .submission-heatmap-card {
          flex: 1 1 100%;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          margin-top: 1rem;
        }

        .heatmap-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .empty-heatmap-content {
            padding: 2rem 0;
            text-align: center;
            flex-grow: 1;
            min-height: 100px; 
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px dashed rgba(255, 255, 255, 0.1);
            border-radius: var(--border-radius);
            margin-top: 1rem;
        }

        .year-filter {
            background-color: var(--bg-card);
            color: var(--text-primary); 
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 0.9rem;
            cursor: pointer;
            outline: none;
            transition: border-color 0.2s;
        }

        .year-filter:hover {
            border-color: var(--color-accent1);
        }

        .accent-red {
            --progress-color: var(--color-red);
        }
        .accent-yellow {
            --progress-color: var(--color-yellow);
        }
        .accent-green {
            --progress-color: var(--color-green);
        }

        .multi-chart-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
        }

        .ring-stack-segmented {
            position: relative;
            --ring-size: 140px;
            --ring-thickness: 10px;
            width: var(--ring-size); 
            height: var(--ring-size);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(-135deg); 
        }

        .chart-ring-visual.segmented-ring {
            --ring-size: 140px;
            --ring-thickness: 10px;
            position: absolute;
            width: var(--ring-size);
            height: var(--ring-size);
            border-radius: 50%;
            
            background: conic-gradient(
                var(--color-accent1) 0deg,
                var(--color-accent1) var(--course-stop),
                
                var(--color-purple-end) var(--course-stop), 
                var(--color-purple-end) 360deg 
            );
            transition: background 10s ease-out;
        }
        
        .chart-ring-visual.problem-segmented-ring {
            --ring-size: 140px;
            --ring-thickness: 10px;
            --ring-background: rgba(255, 255, 255, 0.1);
            
            position: absolute;
            width: var(--ring-size);
            height: var(--ring-size);
            border-radius: 50%;
            
            background: conic-gradient(
                var(--color-easy) 0deg,
                var(--color-easy) var(--easy-stop),
                var(--color-medium) var(--easy-stop), 
                var(--color-medium) var(--medium-stop), 
                var(--color-hard) var(--medium-stop), 
                var(--color-hard) var(--hard-stop),
                var(--ring-background) var(--hard-stop)
            );
            transition: background 10s ease-out;
        }
        
        .chart-ring-visual.score-segmented-ring {
            --ring-size: 140px;
            --ring-thickness: 10px;
            --ring-background: rgba(255, 255, 255, 0.1);
            
            position: absolute;
            width: var(--ring-size);
            height: var(--ring-size);
            border-radius: 50%;
            
            background: conic-gradient(
                var(--color-easy) 0deg,
                var(--color-easy) var(--cat-stop-1),
                var(--color-medium) var(--cat-stop-1), 
                var(--color-medium) var(--cat-stop-2), 
                var(--color-hard) var(--cat-stop-2), 
                var(--color-hard) var(--cat-stop-3),
                var(--ring-background) var(--cat-stop-3)
            );
            transition: background 10s ease-out;
        }

        .chart-score-inner.segmented-inner {
            z-index: 3;
            width: calc(140px - (10px * 2));
            height: calc(140px - (10px * 2));
            box-shadow: none;
            background-color: var(--bg-card);
        }
        
        .chart-legend-row {
            display: flex;
            gap: 1.5rem;
            font-size: 0.85rem;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            color: var(--text-secondary);
        }

        .legend-swatch {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 6px;
        }

        .course-swatch {
            background-color: var(--color-accent1); 
        }
        
        .problem-swatch {
            background: linear-gradient(to right, var(--color-purple-start), var(--color-purple-end));
        }

        .score-tooltip {
            position: fixed;
            background-color: var(--text-primary);
            color: var(--bg-card);
            padding: 8px 12px;
            border-radius: var(--border-radius);
            font-size: 0.85rem;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s, transform 0.2s;
            z-index: 100;
            transform: translate(0, 10px);
        }
        
        .score-tooltip.visible {
            opacity: 1;
            transform: translate(0, 0);
        }
        
        .hover-segment-overlay {
            --ring-size: 140px;
            --ring-thickness: 10px;
            position: absolute;
            width: var(--ring-size);
            height: var(--ring-size);
            border-radius: 50%;
            z-index: 5; 
            pointer-events: all; 
            transition: transform 0.2s ease-out;
            background-color: transparent; 
            
            clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%, 50% 50%);
            transform: rotate(var(--segment-rotation));
        }
        
        .hover-segment-overlay:hover {
            transform: scale(1.03) rotate(var(--segment-rotation)); 
            filter: brightness(1.2); 
        }
        
        .hover-segment-overlay.no-hover {
            transform: none; 
            filter: none; 
            cursor: default;
        }


        
        .chart-arrow {
            position: absolute;
            width: 100px; 
            height: 3px;
            border-radius: 2px;
            transform-origin: left center;
            top: 50%;
            left: 50%;
            z-index: 10;
            opacity: 0;
            transition: opacity 0.3s ease-out, transform 0.3s ease-out;
            
            visibility: hidden;
            pointer-events: none;
            background-color: var(--arrow-color); 
        }
        
        .chart-arrow.arrow-easy { background-color: var(--color-easy); }
        .chart-arrow.arrow-medium { background-color: var(--color-medium); }
        .chart-arrow.arrow-hard { background-color: var(--color-hard); }

        .chart-arrow.visible-arrow {
            opacity: 1;
            visibility: visible;
            transform: translate(-50%, -50%) rotate(var(--arrow-angle)) translateX(70px); 
        }
        
        .chart-arrow::after {
            content: '';
            position: absolute;
            right: -6px;
            top: -3px;
            width: 0;
            height: 0;
            border-top: 5px solid transparent;
            border-bottom: 5px solid transparent;
            border-left: 8px solid currentColor; 
        }

        .chart-arrow.arrow-easy::after { border-left-color: var(--color-easy); }
        .chart-arrow.arrow-medium::after { border-left-color: var(--color-medium); }
        .chart-arrow.arrow-hard::after { border-left-color: var(--color-hard); }

        /* --- Custom Chart Positioning Classes --- */

        .chart-stack-rotation {
            transform: rotate(-135deg); 
        }

        .chart-inner-rotation {
            transform: rotate(135deg); 
        }
        
        /* Rotation for Problems/Courses Chart (Start at 9 o'clock position) */
        .chart-stack-rotation-90 { 
            transform: rotate(-90deg); 
        }
        
        /* Counter-Rotation for Problems/Courses Chart Inner Content */
        .chart-inner-rotation-90 {
            transform: rotate(90deg); 
        }


        .chart-data-stops {
            background: conic-gradient(
                var(--color-accent1) 0deg,
                var(--color-accent1) var(--course-stop),
                
                var(--color-purple-end) var(--course-stop), 
                var(--color-purple-end) 360deg 
            );
        }

        .problem-chart-ring-wrapper .chart-data-stops {
            background: conic-gradient(
                var(--color-easy) 0deg,
                var(--color-easy) var(--easy-stop),
                var(--color-medium) var(--easy-stop), 
                var(--color-medium) var(--medium-stop), 
                var(--color-hard) var(--medium-stop), 
                var(--color-hard) var(--hard-stop),
                var(--ring-background) var(--hard-stop)
            );
        }
        
        .score-segmented-ring.chart-data-stops {
            background: conic-gradient(
                var(--color-easy) 0deg,
                var(--color-easy) var(--cat-stop-1),
                var(--color-medium) var(--cat-stop-1), 
                var(--color-medium) var(--cat-stop-2), 
                var(--color-hard) var(--cat-stop-2), 
                var(--color-hard) var(--cat-stop-3),
                var(--ring-background) var(--cat-stop-3)
            );
        }
        
        .activity-highlights-card {
            padding: 1.5rem 2rem;
            margin-top: 1rem;
        }

        .highlights-flex {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1.5rem;
        }

        .highlight-item {
            display: flex;
            flex-direction: column;
            text-align: center;
            padding: 0.5rem 1rem;
            flex: 1;
            border-radius: 6px;
            background-color: rgba(255, 255, 255, 0.05);
        }

        .highlight-value {
            font-size: 1.8rem;
            font-weight: 700;
            line-height: 1.2;
        }

        .highlight-label {
            font-size: 0.85rem;
            font-weight: 500;
            margin-top: 4px;
        }
        
        .highlight-item .accent-yellow { color: var(--color-yellow); }
        .highlight-item .accent-blue { color: var(--color-accent1); }
        .highlight-item .accent-green { color: var(--color-green); }


        @media (max-width: 1024px) {
            :root {
                --heatmap-cell-size: 8px;
                --heatmap-gap: 2px;
            }

            .profile-container {
                padding: 1rem;
            }
            
            .top-cards-row, .bottom-cards-row {
                flex-direction: column;
                align-items: stretch;
            }
            
            .card-1-3, .card-2-3, .full-width-card {
                flex: 1 1 100% !important; 
            }
            
            .profile-sidebar {
                width: 100%; 
            }
            
            .problems-content-grid {
                flex-direction: row; 
                gap: 1.5rem;
                justify-content: flex-start;
                margin: 1rem 0 1rem 0;
            }
            
            .difficulty-breakdown {
                flex-direction: column; 
                width: 160px;
                flex-shrink: 0;
            }
        }


        @media (max-width: 768px) {
           :root {
                --heatmap-cell-size: 6px;
                --heatmap-gap: 1px;
            }

          .profile-container {
            flex-direction: column;
            padding: 1rem;
          }

          .profile-sidebar {
            width: 100%;
            margin-bottom: 1rem;
          }

          .course-metrics-flex {
              flex-direction: column;
          }

          .badge-item {
              width: calc(50% - 5px); 
          }
          
          .problems-content-grid {
                flex-direction: column;
                gap: 1.5rem;
                justify-content: center;
          }
          
          .difficulty-breakdown {
                flex-direction: row;
                width: 100%;
                justify-content: space-around;
          }
          .difficulty-card {
                text-align: center;
                flex-grow: 1;
                padding: 0.8rem;
          }
          .simplified-chart-area {
                width: 160px;
                height: 160px;
          }
          .chart-ring-visual {
              --ring-size: 160px;
              --ring-thickness: 10px;
          }
          .chart-score {
                font-size: 2.2rem;
          }
          .chart-max-score {
                font-size: 1rem;
          }
          
          .highlights-flex {
              flex-direction: column;
          }
          .highlight-item {
              width: 100%;
          }
        }
      `}</style>

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
                <ProblemsSolvedStatsCard data={mockProblemsData} /> 
                <BadgesStatCard stat={badgesStat} badges={mockData.badges} />
              </div>

              <div className="bottom-cards-row">
                <ScoreStatCard 
                    stat={totalScoreStat} 
                    courseScore={calculatedScores.courseScore} 
                    problemScore={calculatedScores.problemScore} 
                    scoreMax={calculatedScores.scoreMax}
                />
                <TabbedPerformanceCard problemsData={mockProblemsData} coursesData={mockCoursesBreakdown} />
              </div>

              <div className="full-width-card-row">
                <TabbedScoreCard scoreData={mockScoreData} problemsData={mockProblemsData} coursesData={mockCoursesBreakdown} scoreConfig={problemScoreConfig} courseScoreConfig={courseScoreConfig} />
              </div>

              <ActivityHighlightsCard highlights={mockActivityHighlights} />
              <SubmissionHeatmapCard />
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default App;
