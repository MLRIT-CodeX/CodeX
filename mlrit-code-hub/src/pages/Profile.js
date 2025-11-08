import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axios';
import UserContext from '../context/UserContext';
import Loader from '../components/Loader';

// Configuration for scoring
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

// Initial state for the profile data
const initialProfileState = {
    profile: {
        avatarUrl: '',
        name: '',
        handle: '',
        email: '',
        rollNumber: '',
        department: '',
        year: '',
        batch: '',
    },
    socialProfiles: [],
    details: [],
    skills: [],
    badges: [],
    stats: [
        { title: 'Total Score', value: 0, isAccent: false, key: 'score' },
        { title: 'Problems Solved', value: 0, isAccent: true, key: 'problems' },
        { title: 'Current Streak', value: 0, isAccent: false, key: 'streak' },
    ],
    highlights: [
        { value: 0, label: 'Longest Streak', accentClass: 'accent-green' },
        { value: 0, label: 'Problems Solved', accentClass: 'accent-yellow' },
        { value: '#0', label: 'Rank', accentClass: 'accent-blue' }
    ],
    submissions: [],
    score: 0,
    scoreMax: 0,
    courseScore: 0,
    problemScore: 0,
    successRate: 0,
    mcqStats: {
        questionsAttempted: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        accuracy: 0,
        totalScore: 0,
        assessmentsAttended: 0
    },
    problemsData: {
        easy: { solved: 0, total: 0, color: 'color-easy' },
        medium: { solved: 0, total: 0, color: 'color-medium' },
        hard: { solved: 0, total: 0, color: 'color-hard' },
        totalSolved: 0,
        totalAvailable: 0
    },
    coursesData: {
        easy: { solved: 0, total: 0, color: 'color-easy' },
        medium: { solved: 0, total: 0, color: 'color-medium' },
        hard: { solved: 0, total: 0, color: 'color-hard' },
        totalSolved: 0,
        totalAvailable: 0
    },
};

// Custom hook to fetch and process all profile data
const useProfileData = () => {
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(initialProfileState);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user) {
                setError('User not authenticated');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log('🔄 Starting profile data fetch...');

                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Authentication token not found');
                }

                console.log('🔄 Fetching profile data from multiple endpoints...');

                const apiCalls = [
                    axiosInstance.get('/profile'),
                    axiosInstance.get('/streak/user'),
                    axiosInstance.get('/submissions/stats/user'),
                    axiosInstance.get('/problems/stats'),
                    axiosInstance.get('/submissions/user'),
                    axiosInstance.get('/mcq-submissions/user-stats')
                ];

                const [
                    profileRes,
                    streakRes,
                    submissionsRes,
                    problemsRes,
                    submissionHistoryRes,
                    mcqStatsRes
                ] = await Promise.all(
                    apiCalls.map(promise =>
                        promise.catch(err => ({
                            data: null,
                            error: err.response?.data?.message || err.message
                        }))
                    )
                );

                console.log('✅ All API calls completed');

                // Process responses and handle potential errors
                const userProfile = profileRes.data ? profileRes.data : {};
                const streakData = streakRes.data?.data || { currentStreak: 0, longestStreak: 0 };
                const submissionStats = submissionsRes.data || {
                    totalScore: 0,
                    problemScore: 0,
                    courseScore: 0,
                    practiceStats: { totalSolved: 0 },
                    courseStats: { totalSolved: 0 },
                    rank: 0,
                    totalUsers: 1,
                    successfulSubmissions: 0,
                    totalSubmissions: 0,
                };
                const problemStats = problemsRes.data || { 
                    easy: { solved: 0, total: 0 }, 
                    medium: { solved: 0, total: 0 }, 
                    hard: { solved: 0, total: 0 }, 
                    totalSolved: 0, 
                    totalAvailable: 0, 
                    maxPossibleScore: 0,
                    courses: {
                        easy: { solved: 0, total: 0 },
                        medium: { solved: 0, total: 0 },
                        hard: { solved: 0, total: 0 },
                        totalSolved: 0,
                        totalAvailable: 0
                    }
                };
                const submissions = submissionHistoryRes.data?.submissions || [];
                const mcqStats = mcqStatsRes.data || {
                    questionsAttempted: 0,
                    correctAnswers: 0,
                    wrongAnswers: 0,
                    accuracy: 0,
                    totalScore: 0,
                    assessmentsAttended: 0
                };

                console.log('📊 Processing fetched data...');

                // Construct and update the profile data
                const profileData = {
                    profile: {
                        avatarUrl: userProfile.profilePic ? `http://localhost:5000${userProfile.profilePic}` :
                            userProfile.name ? `https://placehold.co/96x96/00A9FF/FFFFFF?text=${userProfile.name?.slice(0, 2)}` :
                            '/default-profile.png',
                        name: userProfile.name || 'Anonymous User',
                        handle: `${userProfile.department || 'Department'} | ${userProfile.rollNumber || 'Roll Number'}`,
                        email: userProfile.email || '',
                        rollNumber: userProfile.rollNumber || '',
                        department: userProfile.department || '',
                        year: userProfile.year || '',
                        batch: userProfile.batch || '',
                    },
                    socialProfiles: [
                        userProfile.codingProfiles?.leetcode && {
                            platform: 'LeetCode',
                            username: userProfile.codingProfiles.leetcode,
                            url: `https://leetcode.com/${userProfile.codingProfiles.leetcode}/`
                        },
                        userProfile.codingProfiles?.codechef && {
                            platform: 'CodeChef',
                            username: userProfile.codingProfiles.codechef,
                            url: `https://www.codechef.com/users/${userProfile.codingProfiles.codechef}`
                        },
                        userProfile.codingProfiles?.github && {
                            platform: 'GitHub',
                            username: userProfile.codingProfiles.github,
                            url: `https://github.com/${userProfile.codingProfiles.github}`
                        },
                    ].filter(Boolean),
                    details: [
                        { label: 'Email', value: userProfile.email },
                        { label: 'Roll', value: userProfile.rollNumber },
                        { label: 'Department', value: userProfile.department },
                        { label: 'Year', value: String(userProfile.year) },
                    ],
                    stats: [
                        {
                            title: 'Total Score',
                            value: submissionStats?.totalScore || 0,
                            isAccent: false,
                            key: 'score',
                            tooltip: `Practice: ${submissionStats?.problemScore || 0} + Course: ${submissionStats?.courseScore || 0}`
                        },
                        {
                            title: 'Problems Solved',
                            value: (submissionStats?.practiceStats?.totalSolved || 0) + (submissionStats?.courseStats?.totalSolved || 0),
                            isAccent: true,
                            key: 'problems',
                            tooltip: `Practice: ${submissionStats?.practiceStats?.totalSolved || 0} + Course: ${submissionStats?.courseStats?.totalSolved || 0}`
                        },
                        {
                            title: 'Current Streak',
                            value: streakData?.currentStreak || 0,
                            isAccent: false,
                            key: 'streak',
                            tooltip: `Longest Streak: ${streakData?.longestStreak || 0}`
                        },
                    ],
                    skills: userProfile.skills?.map(skill => ({
                        name: skill.name,
                        count: skill.count || 0
                    })) || [],
                    badges: userProfile.badges || [],
                    highlights: [
                        { value: streakData?.longestStreak || 0, label: 'Longest Streak', accentClass: 'accent-green' },
                        {
                            value: (submissionStats?.practiceStats?.totalSolved || 0) + (submissionStats?.courseStats?.totalSolved || 0),
                            label: 'Problems Solved',
                            accentClass: 'accent-yellow'
                        },
                        {
                            value: `#${submissionStats?.rank || 0}/${submissionStats?.totalUsers || 1}`,
                            label: 'Global Rank',
                            accentClass: 'accent-blue'
                        }
                    ],
                    submissions: submissions,
                    score: submissionStats?.totalScore || 0,
                    scoreMax: problemStats?.maxPossibleScore || 0,
                    courseScore: submissionStats?.courseScore || 0,
                    problemScore: submissionStats?.problemScore || 0,
                    successRate: submissionStats?.totalSubmissions > 0 ?
                        Math.round((submissionStats.successfulSubmissions / submissionStats.totalSubmissions) * 100) : 0,
                    mcqStats: mcqStats,
                    problemsData: {
                        easy: { solved: problemStats?.easy?.solved || 0, total: problemStats?.easy?.total || 0, color: 'color-easy' },
                        medium: { solved: problemStats?.medium?.solved || 0, total: problemStats?.medium?.total || 0, color: 'color-medium' },
                        hard: { solved: problemStats?.hard?.solved || 0, total: problemStats?.hard?.total || 0, color: 'color-hard' },
                        totalSolved: problemStats?.totalSolved || 0,
                        totalAvailable: problemStats?.totalAvailable || 0
                    },
                    coursesData: {
                        easy: { solved: problemStats?.courses?.easy?.solved || 0, total: problemStats?.courses?.easy?.total || 0, color: 'color-easy' },
                        medium: { solved: problemStats?.courses?.medium?.solved || 0, total: problemStats?.courses?.medium?.total || 0, color: 'color-medium' },
                        hard: { solved: problemStats?.courses?.hard?.solved || 0, total: problemStats?.courses?.hard?.total || 0, color: 'color-hard' },
                        totalSolved: problemStats?.courses?.totalSolved || 0,
                        totalAvailable: problemStats?.courses?.totalAvailable || 0
                    },
                };

                setData(profileData);
                setError(null);
            } catch (err) {
                console.error('Error fetching profile data:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load profile data');

                // Set fallback data even in case of error
                setData(prevData => ({
                    ...initialProfileState,
                    profile: {
                        ...initialProfileState.profile,
                        name: user?.name || 'Anonymous User',
                        email: user?.email || '',
                    }
                }));
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfileData();
        }
    }, [user]);

    return { data, loading, error };
};

// --- Reusable Components ---

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

    const courseRatio = totalContentScore > 0 ? courseScore / totalContentScore : 0;

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
    }, [courseScore, problemScore, chartData]);

    return (
        <div className="multi-chart-container">
            <div className="ring-stack-segmented chart-stack-rotation">
                <div
                    className="chart-ring-visual segmented-ring chart-data-stops"
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


const ScoreStatCard = ({ stat, courseScore, problemScore }) => (
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

const BadgesStatCard = ({ badges }) => (
    <div className="card badges-card-container card-2-3">
        <div className="stat-header">
            <p className="stat-title badge-title-inline">
                Badges
                <span className="inline-badge-count">{badges.length}</span>
            </p>
        </div>
        <BadgesDisplay badges={badges} />
    </div>
);

const ScoreChartContent = ({ score, scoreMax, title }) => {
    const progress = (scoreMax > 0) ? Math.min(1, score / scoreMax) : 0;
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
    const total = totalAvailable > 0 ? totalAvailable : 1; // Avoid division by zero

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
    }, [chartData]);


    return (
        <div className="multi-chart-container problem-chart-ring-wrapper">
            <div className="ring-stack-segmented chart-stack-rotation-90">
                <div
                    className="chart-ring-visual problem-segmented-ring chart-data-stops"
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

    const { easy, medium, hard } = data;

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

    const { easy, medium, hard } = data;

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


const ScoreDetailsContent = ({ data }) => {
    const [highlightedCategory, setHighlightedCategory] = useState('');

    const totalPossibleScore = data.categories.reduce((sum, cat) => sum + cat.max, 0);

    const chartData = data.categories.map((cat, index) => {
        const scoreArc = (totalPossibleScore > 0) ? Math.round((cat.score / totalPossibleScore) * 360) : 0;
        return {
            ...cat,
            arc: scoreArc,
            endAngle: data.categories.slice(0, index + 1).reduce((sum, c) => sum + ((totalPossibleScore > 0) ? Math.round((c.score / totalPossibleScore) * 360) : 0), 0)
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
    }, [data.totalScore, ringData]);


    return (
        <div className="problems-content-grid">
            <div className="problem-chart-container simplified-chart-area">
                <div className="multi-chart-container problem-chart-ring-wrapper">
                    <div className="ring-stack-segmented chart-stack-rotation-90">
                        <div
                            className="chart-ring-visual score-segmented-ring chart-data-stops"
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

const TabbedScoreCard = ({ problemsData, coursesData, scoreConfig, courseScoreConfig }) => {
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

const SubmissionHeatmapCard = ({ submissions }) => {
    const currentYear = new Date().getFullYear();
    const availableYears = [currentYear, currentYear - 1, currentYear - 2];
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const handleYearChange = (event) => {
        setSelectedYear(Number(event.target.value));
    };

    // Process submissions into a daily activity format
    const generateActivityData = (year) => {
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year + 1, 0, 0);

        // Create array with 365/366 days
        const daysInYear = Math.floor((yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const activityData = Array(daysInYear).fill(null).map((_, i) => ({
            date: new Date(yearStart.getTime() + i * (1000 * 60 * 60 * 24)),
            level: 0,
            count: 0
        }));

        // Populate submission counts
        submissions?.forEach(submission => {
            const submissionDate = new Date(submission.createdAt);
            if (submissionDate.getFullYear() === year) {
                const dayOfYear = Math.floor((submissionDate.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
                if (dayOfYear >= 0 && dayOfYear < activityData.length) {
                    activityData[dayOfYear].count++;
                    activityData[dayOfYear].level = Math.min(Math.floor(activityData[dayOfYear].count / 2) + 1, 4);
                }
            }
        });

        return activityData;
    };

    const activityData = generateActivityData(selectedYear);

    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

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
            {submissions && submissions.length > 0 ? (
                <div className="heatmap-container">
                    <div className="heatmap-month-labels">
                        {monthNames.map((month, i) => (
                            <span key={i} className="month-label">{month}</span>
                        ))}
                    </div>
                    <div className="submission-heatmap">
                        {activityData.map((day, index) => (
                            <div
                                key={index}
                                className={`heatmap-day level-${day.level} ${index % 28 === 0 && index !== 0 ? 'month-separator-start' : ''}`}
                                title={`${day.date.toLocaleDateString()}: ${day.count} submissions`}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="empty-heatmap-content">
                    <p className="secondary-text">No submission data available for {selectedYear}.</p>
                </div>
            )}
        </div>
    );
};


const CoursesPerformanceCard = ({ coursesData, courseScore, mcqStats }) => (
    <div className="card courses-performance-card full-width-card">
        <h3 className="card-title">Courses Performance</h3>
        <div className="course-metrics-flex">
            <div className="course-metric-item">
                <p className="metric-title primary-text">Assessments Attended</p>
                <h2 className="metric-value accent-text">{mcqStats.assessmentsAttended}</h2>
            </div>
            <div className="course-metric-item">
                <p className="metric-title primary-text">Total Problems Solved</p>
                <h2 className="metric-value primary-text">{coursesData.totalSolved}</h2>
            </div>
            <div className="course-metric-item">
                <p className="metric-title primary-text">Total Score Obtained</p>
                <h2 className="metric-value accent-text-secondary">{courseScore}</h2>
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

// --- Main Profile Component ---

const Profile = () => {
    const { data, loading, error } = useProfileData();

    if (loading) return <Loader />;
    if (error) return <div className="error-message">Error loading profile: {error}</div>;

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
                    transition: background 1.5s ease-out;
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
                
                .heatmap-container {
                  overflow-x: auto;
                  padding: 1rem 0 0.5rem 0;
                }
                
                .submission-heatmap {
                    display: grid;
                    grid-template-rows: repeat(7, var(--heatmap-cell-size));
                    grid-auto-flow: column;
                    grid-auto-columns: var(--heatmap-cell-size);
                    gap: var(--heatmap-gap);
                    justify-content: start;
                }
                
                .heatmap-day {
                    width: var(--heatmap-cell-size);
                    height: var(--heatmap-cell-size);
                    background-color: rgba(255, 255, 255, 0.05);
                    border-radius: 2px;
                    transition: background-color 0.3s;
                }
                
                .heatmap-day.level-1 { background-color: #0e4429; }
                .heatmap-day.level-2 { background-color: #006d32; }
                .heatmap-day.level-3 { background-color: #26a641; }
                .heatmap-day.level-4 { background-color: #39d353; }

                .heatmap-month-labels {
                  display: flex;
                  justify-content: space-between;
                  font-size: 0.75rem;
                  color: var(--text-secondary);
                  padding-left: 20px; /* Adjust as needed */
                  margin-bottom: 5px;
                }
                
                .month-label {
                  flex-basis: calc(100% / 12);
                  text-align: left;
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
                    transition: background 1.5s ease-out;
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
                    transition: background 1.5s ease-out;
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
                    transition: background 1.5s ease-out;
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
                      align-items: center;
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
                    {loading ? (
                        <Loader />
                    ) : error ? (
                        <div className="error-message">Error loading profile: {error}</div>
                    ) : (
                        <>
                            <aside className="profile-sidebar card">
                                <div className="profile-card">
                                    <img src={data.profile.avatarUrl} alt="User Avatar" className="profile-avatar" />
                                    <h1 className="profile-name">{data.profile.name}</h1>
                                    <p className="profile-handle">{data.profile.handle}</p>
                                    <button className="edit-button">Edit Profile</button>
                                </div>

                                <SocialProfilesSection profiles={data.socialProfiles} />

                                <div className="details-section section">
                                    <h3 className="section-title">Details</h3>
                                    <ul className="details-list">
                                        {data.details.map((detail, index) => (
                                            <li key={index}>
                                                <span className="detail-label">{detail.label}:</span>
                                                <span className="detail-value">{detail.value}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {data.skills?.length > 0 && <SkillsSection skills={data.skills} />}
                            </aside>

                            <section className="profile-main">
                                <div className="main-flex-container">
                                    <CoursesPerformanceCard
                                        coursesData={data.coursesData}
                                        courseScore={data.courseScore}
                                        mcqStats={data.mcqStats}
                                    />

                                    <div className="top-cards-row">
                                        <ProblemsSolvedStatsCard data={data.problemsData} />
                                        <BadgesStatCard
                                            badges={data.badges || []}
                                        />
                                    </div>

                                    <div className="bottom-cards-row">
                                        <ScoreStatCard
                                            stat={data.stats.find(s => s.key === 'score')}
                                            courseScore={data.courseScore}
                                            problemScore={data.problemScore}
                                        />
                                        <TabbedPerformanceCard
                                            problemsData={data.problemsData}
                                            coursesData={data.coursesData}
                                        />
                                    </div>

                                    <div className="full-width-card-row">
                                        <TabbedScoreCard
                                            problemsData={data.problemsData}
                                            coursesData={data.coursesData}
                                            scoreConfig={problemScoreConfig}
                                            courseScoreConfig={courseScoreConfig}
                                        />
                                    </div>

                                    <ActivityHighlightsCard highlights={data.highlights} />
                                    <SubmissionHeatmapCard submissions={data.submissions} />
                                </div>
                            </section>
                        </>
                    )}
                </main>
            </div>
        </>
    );
};

export default Profile;