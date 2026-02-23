// pages/Leaderboard.js
import React, { useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import UserContext from "../context/UserContext";
import "./Leaderboard.css";

const Leaderboard = () => {
  const { user } = useContext(UserContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedYear, setSelectedYear] = useState("All Academic Years");
  const [sortConfig, setSortConfig] = useState({ key: "rank", direction: "asc" });
  const [hasError, setHasError] = useState(false);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortDirectionClass = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? "sort-asc" : "sort-desc";
    }
    return "";
  };

  const sortedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(sortedData)) return [];
    return sortedData.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment =
        selectedDepartment === "All Departments" || user.department === selectedDepartment;
      const matchesYear =
        selectedYear === "All Academic Years" || user.academicYear === selectedYear;
      return matchesSearch && matchesDepartment && matchesYear;
    });
  }, [sortedData, searchQuery, selectedDepartment, selectedYear]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/leaderboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const leaderboardData = Array.isArray(res.data) ? res.data : [];
        setData(leaderboardData);
      } catch (err) {
        setError("Failed to load leaderboard data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const departments = [
    "All Departments",
    ...new Set(
      Array.isArray(data)
        ? data.map((u) => u.department).filter(Boolean)
        : []
    ),
  ];

  const allAcademicYears = Array.isArray(data)
    ? data
        .map((u) => u.academicYear || u.academic_year || u.year || u.yearOfStudy || u.academicYearOfStudy)
        .filter(Boolean)
    : [];

  const years = ["All Academic Years", ...new Set(allAcademicYears)];

  const getUserInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name[0].toUpperCase();
  };

  if (loading) {
    return (
      <div className="leaderboard-container loading-state">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading leaderboard...</p>
      </div>
    );
  }

  if (error || hasError) {
    return (
      <div className="leaderboard-container error-state">
        <p className="error-message">
          {error || "An unexpected error occurred while processing the leaderboard data"}
        </p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      {user && user.college && (
        <div className="leaderboard-title">
          <h1>{user.college}</h1>
        </div>
      )}

      <div className="controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search by user or roll..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="filter-select"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="filter-select"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        {filteredData.length === 0 ? (
          <div className="no-results">
            <p>
              {data.length === 0
                ? "No leaderboard data available"
                : "No users match your search criteria"}
            </p>
          </div>
        ) : (
          <>
            <div className="leaderboard-header">
              <div
                className={`header-item ${getSortDirectionClass("rank")}`}
                onClick={() => requestSort("rank")}
              >
                Rank
              </div>
              <div className="header-item">Name</div>
              <div className="header-item">Roll</div>
              <div className="header-item">Year</div>
              <div className="header-item">Dept</div>
              <div
                className={`header-item ${getSortDirectionClass("totalScore")}`}
                onClick={() => requestSort("totalScore")}
              >
                Score
              </div>
              <div
                className={`header-item ${getSortDirectionClass("totalSolved")}`}
                onClick={() => requestSort("totalSolved")}
              >
                Solved
              </div>
            </div>

            <div className="leaderboard-grid">
              {filteredData.map((rowUser) => {
                const isCurrentUser =
                  rowUser._id === user?._id ||
                  rowUser._id?.toString() === user?._id?.toString() ||
                  rowUser.email === user?.email;

                return (
                  <div
                    key={rowUser.rank}
                    className={`leaderboard-row rank-${rowUser.rank} ${
                      isCurrentUser ? "current-user-neon" : ""
                    }`}
                  >
                    <div className="rank-cell">
                      <span className={`badge rank-badge-${rowUser.rank}`}>
                        {rowUser.rank}
                      </span>
                    </div>

                    <div className="name-cell">
                      <div className="user-avatar">
                        {getUserInitials(rowUser.name)}
                      </div>
                      <span className="user-name">{rowUser.name}</span>
                    </div>

                    <div className="roll-cell">{rowUser.rollNumber}</div>

                    <div className="year-cell">
                      {rowUser.academicYear ||
                        rowUser.academic_year ||
                        rowUser.year ||
                        rowUser.yearOfStudy ||
                        rowUser.academicYearOfStudy}
                    </div>

                    <div className="dept-cell">{rowUser.department}</div>

                    <div className="score-cell">{rowUser.totalScore}</div>

                    <div className="solved-cell">{rowUser.totalSolved}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;