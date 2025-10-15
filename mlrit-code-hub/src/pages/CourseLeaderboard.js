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

    const filteredData = Array.isArray(data) ? data.filter((userData) => {
        const matchesName = userData.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRoll = userData.rollNumber ? userData.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        return matchesName || matchesRoll;
    }) : [];

    if (loading && !lastUpdated) {
        return (
            <div className="course-leaderboard-container">
            </div>
        );
    }

    return (
        <div className="table-wrapper">
            <table className="course-leaderboard-table">
                <thead>
                    <tr>
                        <th className="th-rank">Rank</th>
                        <th className="th-user">User</th>
                        <th className="th-roll">Roll</th>
                        <th className="th-dept">Dept</th>
                        <th className="th-score">Score</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.length > 0 ? (
                        filteredData.map((userData) => (
                            <tr 
                                key={userData.userId} 
                                className={`rank-row ${userData.rank <= 3 ? `top-${userData.rank}` : ''} ${userData.userId === user?.id ? 'current-user' : ''}`}
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
                                <td className="overall-score">
                                    <div className="score-breakdown">
                                        <span className="score-value">{userData.overallScore || 0}</span>
                                    </div>
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
    );
};

export default CourseLeaderboard;