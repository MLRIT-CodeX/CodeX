import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import './Submissionheatmap.css'; // Import the dedicated styles

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Normalizes Date.getDay() (0=Sun, 1=Mon, ..., 6=Sat) to Monday=0, Sunday=6.
 * @param {Date} date
 * @returns {number} Normalized day index (0-6)
 */
const getNormalizedDay = (date) => (date.getDay() + 6) % 7; 

// The core generation logic (unchanged)
const generateContributionGrid = (contributions, filter, year) => {
    // ... (logic remains unchanged) ...
    const contributionMap = new Map();
    contributions.forEach(day => {
        let dateKey;
        if (day.date instanceof Date) {
            dateKey = day.date.toISOString().split('T')[0];
        } else if (typeof day.date === 'string') {
            dateKey = day.date.split('T')[0];
        } else {
            return;
        }
        contributionMap.set(dateKey, day);
    });
    
    const monthsGrid = [];

    for (let month = 0; month < 12; month++) {
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        let currentDate = new Date(monthStart);
        
        const daysInGrid = new Array(7).fill(0).map(() => ([]));
        const startDayOffset = getNormalizedDay(monthStart);
        
        // 1. Fill initial empty cells
        for (let i = 0; i < startDayOffset; i++) {
            daysInGrid[i].push({ level: -1, date: null, activity: null });
        }
        
        // 2. Process all actual days in the month
        while (currentDate <= monthEnd) {
            const normalizedDayOfWeek = getNormalizedDay(currentDate);
            const dateKey = currentDate.toISOString().split('T')[0];
            const dayData = contributionMap.get(dateKey);
            
            const dayOffset = currentDate.getDate() - 1; 
            const currentWeekOffset = Math.floor((dayOffset + startDayOffset) / 7);

            // --- Activity Level Calculation ---
            let activityLevel = 0;
            let activityDetails = { codingProblems: 0, courseActivities: 0, moduleTests: 0, totalActivity: 0 };
            
            if (dayData) {
                let activity = 0;
                if (filter === 'coding') {
                    activity = dayData.codingProblems;
                } else if (filter === 'course') {
                    activity = dayData.courseActivities + dayData.moduleTests;
                } else {
                    activity = dayData.totalActivity;
                }
                
                if (activity >= 10) activityLevel = 4;
                else if (activity >= 6) activityLevel = 3;
                else if (activity >= 3) activityLevel = 2;
                else if (activity >= 1) activityLevel = 1;
                else activityLevel = 0;
                
                activityDetails = dayData;
            }
            // --- End Activity Level Calculation ---

            daysInGrid[normalizedDayOfWeek].push({
                level: activityLevel,
                date: new Date(currentDate),
                activity: activityDetails,
                weekOffset: currentWeekOffset
            });
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // 3. Normalize all 7 rows to have the same number of weeks (columns)
        const normalizedMaxWeeks = daysInGrid.reduce((max, row) => Math.max(max, row.length), 0);

        const completeMonthGrid = daysInGrid.map(row => {
            while (row.length < normalizedMaxWeeks) {
                row.push({ level: -1, date: null, activity: null });
            }
            return row;
        });

        monthsGrid.push(completeMonthGrid);
    }
    
    return monthsGrid;
};


// Fallback for API failure (unchanged)
const generateFallbackContributions = () => {
    const contributions = [];
    const today = new Date();
    
    for (let i = 90; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const hasActivity = Math.random() > (i * 0.005); 
        
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

// Heatmap Component
// 🚨 FIX: Now accepting all props passed from Profile.js
const ActivityHeatmap = ({ 
    userId, 
    token, 
    initialYear, 
    activityFilter,
    selectedYear,        // ⬅️ ACCEPTING PROP
    setSelectedYear,     // ⬅️ ACCEPTING PROP
    setActivityFilter    // ⬅️ ACCEPTING PROP
}) => {
    const [contributionData, setContributionData] = useState([]);
    
    // 🚨 FIX: Removed local state for selectedYear/activityFilter
    // const [selectedYear, setSelectedYear] = useState(initialYear || new Date().getFullYear());
    
    const [contributionStats, setContributionStats] = useState({
        totalDays: 0,
        totalCodingProblems: 0,
        totalCourseActivities: 0,
        totalModuleTests: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalActivity: 0
    });
    const currentYear = new Date().getFullYear();
    const yearOptions = useMemo(() => {
        return [2025, 2026].filter(y => y <= currentYear + 1);
    }, [currentYear]);


    const fetchContributionData = useCallback(async (year) => {
        if (!token) {
            console.error("Token missing for contribution data fetch.");
            return { contributions: generateFallbackContributions(), stats: null };
        }
        try {
            const response = await axios.get(`http://localhost:5000/api/contributions/calendar?year=${year}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return { 
                contributions: response.data.contributions || [], 
                stats: response.data.stats || {}
            };
        } catch (err) {
            console.error('Error fetching contribution data:', err);
            const fallbackContributions = generateFallbackContributions();
            return { 
                contributions: fallbackContributions, 
                stats: { 
                    totalDays: fallbackContributions.length, 
                    totalCodingProblems: 30, 
                    totalCourseActivities: 50, 
                    totalModuleTests: 10, 
                    currentStreak: 7, 
                    longestStreak: 10, 
                    totalActivity: 90
                } 
            };
        }
    }, [token]);

    // Effect to fetch data and generate grid whenever year or filter changes
    // 🚨 FIX: Dependencies now use the prop values (selectedYear, activityFilter)
    useEffect(() => {
        const loadHeatmapData = async () => {
            // Note: selectedYear is now passed from parent state
            const { contributions, stats } = await fetchContributionData(selectedYear);
            
            if (stats) {
                setContributionStats(stats);
            }

            const gridData = generateContributionGrid(contributions, activityFilter, selectedYear);
            setContributionData(gridData);
        };
        
        loadHeatmapData();
    }, [selectedYear, activityFilter, fetchContributionData]);


    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="contributions-section neon-card">
            <div className="contributions-header">
                <h3 className="card-title">Submissions</h3>
                <div className="contributions-controls">
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

                    <div className="control-group">
                        <select 
                            className="neon-select"
                            // 🚨 FIX: Read value from prop
                            value={selectedYear}
                            // 🚨 FIX: Call setter from prop
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        >
                            {yearOptions.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    {/* ADDED: Activity Filter Dropdown using parent state */}
                    <div className="control-group">
                        <select 
                            className="neon-select"
                            value={activityFilter}
                            onChange={(e) => setActivityFilter(e.target.value)}
                        >
                            <option value="all">All Contributions</option>
                            <option value="coding">Coding Contributions</option>
                            <option value="course">Course Contributions</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Contribution Stats Summary */}
            <div className="contributions-stats-row">
                <div className="contribution-stat">
                    <span className="stat-label">Total Active Days ({selectedYear})</span>
                    <span className="stat-value-text">{contributionStats.totalDays} days</span>
                </div>
                <div className="contribution-stat">
                    <span className="stat-label">Current Streak</span>
                    <span className="stat-value-text">{contributionStats.currentStreak} days</span>
                </div>
                <div className="contribution-stat">
                    <span className="stat-label">Longest Streak</span>
                    <span className="stat-value-text">{contributionStats.longestStreak} days</span>
                </div>
                <div className="contribution-stat">
                    <span className="stat-label">Total Activities</span>
                    <span className="stat-value-text">{contributionStats.totalActivity} actions</span>
                </div>
            </div>

            {/* Heatmap Rendering (New Structure) */}
            <div className="contributions-graph">
                <div className="day-labels">
                    {/* Display day labels vertically: Show Mon/Wed/Fri for clarity */}
                    {dayLabels.map((day, index) => (
                        <div key={day} className="day-label">
                            {index % 2 === 0 ? day : ''}
                        </div>
                    ))}
                </div>
                
                <div className="months-container">
                    {contributionData.map((monthGrid, monthIndex) => (
                        <div key={monthIndex} className="month-column">
                            <div className="month-label">{MONTH_NAMES[monthIndex]}</div>
                            
                            <div className="month-grid">
                                {/* Iterate through the 7 day-rows (Mon-Sun) */}
                                {monthGrid.map((dayRow, dayOfWeekIndex) => (
                                    <div key={dayOfWeekIndex} className="day-row">
                                        {/* Iterate through all day boxes in that row (weeks/columns) */}
                                        {dayRow.map((day, weekCol) => {
                                            if (day.level === -1) {
                                                return <div key={weekCol} className="contribution-box empty"></div>;
                                            }
                                            
                                            const activity = day.activity;
                                            const tooltipText = activity ? 
                                                `${day.date?.toLocaleDateString()}\n` +
                                                `✅ Solutions: ${activity.codingProblems}\n` +
                                                `✅ MCQs: ${activity.courseActivities}\n` +
                                                `✅ Tests: ${activity.moduleTests}\n` +
                                                `Total: ${activity.totalActivity}` :
                                                `${day.date?.toLocaleDateString()}\nNo activity`;
                                            
                                            return (
                                                <div 
                                                    key={weekCol} 
                                                    className={`contribution-box level-${day.level} ${activity?.codingProblems > 0 ? 'has-coding' : ''} ${activity?.courseActivities > 0 ? 'has-course' : ''} ${activity?.moduleTests > 0 ? 'has-tests' : ''}`}
                                                    title={tooltipText}
                                                >
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
    );
};

export default ActivityHeatmap ;