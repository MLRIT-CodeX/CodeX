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
    const [lastUpdated, setLastUpdated] = useState(null);
    const [updateNotification, setUpdateNotification] = useState(null);
    const [collegeFilter, setCollegeFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const { user } = useContext(UserContext);

    const getToken = () => localStorage.getItem("token");

    const fetchCourseLeaderboard = async () => {
        const token = getToken();
        if (!token) {
            setError("Authentication token missing.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const [leaderboardRes, courseRes] = await Promise.all([
                axios.get(
                    `http://localhost:5000/api/course-leaderboard/${courseId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                ),
                axios.get(
                    `http://localhost:5000/api/courses/${courseId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            ]);

            const newData = leaderboardRes.data.leaderboard || [];
            const newTotalUsers = leaderboardRes.data.totalUsers || 0;

            if (data.length > 0) {
                const hasChanges = JSON.stringify(newData.map(d => d.overallScore)) !== JSON.stringify(data.map(d => d.overallScore));
                if (hasChanges) {
                    setUpdateNotification('Leaderboard updated with new scores! 🎯');
                    setTimeout(() => setUpdateNotification(null), 5000);
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
                timestamp: new Date().toLocaleTimeString(),
                hasChanges: data.length > 0 ? JSON.stringify(newData.map(d => d.overallScore)) !== JSON.stringify(data.map(d => d.overallScore)) : false
            });

            console.log('🔍 Debugging leaderboard scores:');
            newData.forEach((userData) => {
                console.log(`Rank ${userData.rank} (${userData.name}):`, {
                    overallScore: userData.overallScore,
                    lesson: userData.totalLessonScore,
                    moduleTest: userData.totalModuleTestScore,
                    finalExam: userData.totalFinalExamScore
                });
            });

        } catch (err) {
            console.error("Course Leaderboard Error", err);
            setError(err.response?.data?.message || "Failed to load course leaderboard data");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) {
            fetchCourseLeaderboard();
        }
    }, [courseId]);

    const handleRefresh = () => {
        if (courseId) {
            fetchCourseLeaderboard();
        }
    };

    const handleAddTestScores = async () => {
        try {
            const token = getToken();
            if (!token) return console.error('Token missing for test score addition.');

            const userId = user?.id;

            if (!userId) {
                console.error('User ID not found.');
                return;
            }

            await axios.post(
                `http://localhost:5000/api/course-leaderboard/${courseId}/add-test-scores`,
                { userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('✅ Test scores added successfully for user:', userId);
            handleRefresh();
        } catch (error) {
            console.error('❌ Error adding test scores:', error.response?.data?.message || error.message);
        }
    };

    // Function to determine college name based on student data
    const getCollegeName = (userData) => {
        const rollNumber = userData.rollNumber || '';
        const department = userData.department || '';
        const name = userData.name || '';
        
        // Check for MLRIT (MLR Institute of Technology)
        if (rollNumber.toLowerCase().includes('mlrit') || 
            department.toLowerCase().includes('mlrit') || 
            name.toLowerCase().includes('mlr institute')) {
            return 'MLRIT';
        }
        
        // Check for IARE
        if (rollNumber.toLowerCase().includes('iare') || 
            department.toLowerCase().includes('iare') || 
            name.toLowerCase().includes('iare')) {
            return 'IARE';
        }
        
        // Check for MLRS (Marri Laxman Reddy College)
        if (rollNumber.toLowerCase().includes('mlrs') || 
            rollNumber.toLowerCase().includes('mlr') ||
            department.toLowerCase().includes('mlrs') || 
            name.toLowerCase().includes('marri laxman') ||
            name.toLowerCase().includes('mlr college')) {
            return 'MLRS';
        }
        
        // Default fallback - you can adjust this logic based on your data structure
        return 'MLRIT'; // Default to MLRIT if no specific college is detected
    };

    // Get unique colleges and departments for filter options
    const getUniqueColleges = () => {
        const colleges = Array.from(new Set(data.map(userData => getCollegeName(userData))));
        return colleges.sort();
    };

    const getUniqueDepartments = () => {
        const departments = Array.from(new Set(data.map(userData => userData.department).filter(dept => dept)));
        return departments.sort();
    };

    const filteredData = Array.isArray(data) ? data.filter((userData) => {
        const matchesName = userData.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRoll = userData.rollNumber ? userData.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        const matchesSearch = matchesName || matchesRoll;
        
        const matchesCollege = collegeFilter === '' || getCollegeName(userData) === collegeFilter;
        const matchesDepartment = departmentFilter === '' || userData.department === departmentFilter;
        
        return matchesSearch && matchesCollege && matchesDepartment;
    }) : [];

    if (loading && !lastUpdated) {
        return (
            <div className="course-leaderboard-container">
            </div>
        );
    }

    return (
        <div className="course-leaderboard-container">
            {/* Search Bar and Filters */}
            <div className="search-and-controls">
                <input
                    type="text"
                    placeholder="Search by user or roll..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                
                <div className="filters">
                    <select
                        value={collegeFilter}
                        onChange={(e) => setCollegeFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Colleges</option>
                        {getUniqueColleges().map(college => (
                            <option key={college} value={college}>{college}</option>
                        ))}
                    </select>
                    
                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Departments</option>
                        {getUniqueDepartments().map(department => (
                            <option key={department} value={department}>{department}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="course-leaderboard-table">
                <thead>
                    <tr>
                        <th className="th-rank">Rank</th>
                        <th className="th-user">User</th>
                        <th className="th-roll">Roll</th>
                        <th className="th-dept">Dept</th>
                        <th className="th-college">College</th>
                        <th className="th-score">Score</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.length > 0 ? (
                        filteredData.map((userData) => (
                            <tr 
                                key={userData.userId} 
                                className={`rank-row ${userData.rank <= 3 ? `top-${userData.rank}` : ''} ${userData.userId === user?.id ? 'current-user' : ''}`}
                                style={{
                                    ...(userData.userId === user?.id && {
                                        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                                        border: '2px solid #00d4ff',
                                        borderRadius: '12px',
                                        position: 'relative',
                                        zIndex: 10,
                                        margin: '10px 10px',
                                        boxShadow: '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1), inset 0 0 20px rgba(0, 212, 255, 0.05)',
                                        animation: 'neonGlow 2s ease-in-out infinite, neonBorder 3s ease-in-out infinite',
                                        backdropFilter: 'blur(10px)'
                                    })
                                }}
                            >
                                <td className="rank-cell">
                                    <span className="rank-number">{userData.rank}</span>
                                </td>
                                <td className="user-cell">
                                    <div className="user-info">
                                        <span className="user-name">{userData.name}</span>
                                    </div>
                                </td>
                                <td className="roll-number">{userData.rollNumber || 'N/A'}</td>
                                <td className="department">
                                    <span className="department-badge">{userData.department || 'N/A'}</span>
                                </td>
                                <td className="college">
                                    <span className="college-badge">{getCollegeName(userData)}</span>
                                </td>
                                <td className="overall-score">
                                    <div className="score-breakdown">
                                        <span className="score-value">{userData.overallScore || 0}</span>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="no-data">
                                {searchQuery ? "No users found matching your search" : "No course leaderboard data available"}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>
        </div>
    );
};

export default CourseLeaderboard;