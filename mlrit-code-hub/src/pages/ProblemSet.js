import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./ProblemSet.css";

const ProblemSet = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [statsMap, setStatsMap] = useState({});
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const problemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchProblems = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/problems", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProblems(res.data);
      } catch (err) {
        console.error("Failed to load problems", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
        }
      }
    };

    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/problems/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const map = {};
        res.data.forEach((stat) => {
          map[stat.problemId] = stat;
        });
        setStatsMap(map);
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };

    fetchProblems();
    fetchStats();
  }, [navigate]);

  const filteredProblems = problems.filter((problem) => {
    const searchTerm = search.trim();
    
    // If no search term, show all problems (filtered by difficulty only)
    if (!searchTerm) {
      const matchesDifficulty =
        difficulty === "All" || problem.difficulty?.toLowerCase() === difficulty.toLowerCase();
      return matchesDifficulty;
    }
    
    // Search ONLY by the display number (NO. column: 1, 2, 3, 4...)
    const problemDisplayNumber = problems.indexOf(problem) + 1;
    const matchesDisplayNumber = problemDisplayNumber.toString() === searchTerm;
    
    const matchesDifficulty =
      difficulty === "All" || problem.difficulty?.toLowerCase() === difficulty.toLowerCase();
    
    console.log(`Searching for number "${searchTerm}":`, {
      displayNumber: problemDisplayNumber,
      matchesDisplayNumber,
      title: problem.title
    });
    
    return matchesDisplayNumber && matchesDifficulty;
  });

  const indexOfLast = currentPage * problemsPerPage;
  const indexOfFirst = indexOfLast - problemsPerPage;
  const currentProblems = filteredProblems.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

  // Debug information
  console.log("Current search:", search);
  console.log("Total problems:", problems.length);
  console.log("Filtered problems:", filteredProblems.length);
  console.log("Current problems on page:", currentProblems.length);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="problemset-page">
      <h2>Problem Set</h2>

      <div className="problemset-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by problem number (1, 2, 3...)..."
            value={search}
            onChange={(e) => {
              console.log("Search input changed:", e.target.value);
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <select
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

             <div className="problemset-list">
               {/* Header Row */}
               <div className="problem-row header-row">
                 <span className="problem-si">No.</span>
                 <span className="problem-title">Title</span>
                 <span className="problem-score">Score</span>
                 <span className="problem-success">Success Rate</span>
                 <span className="problem-difficulty">Difficulty</span>
                 <span className="solve-btn">Action</span>
               </div>
               
               {currentProblems.length > 0 ? (
                 currentProblems.map((problem) => (
                   <div 
                     className="problem-row" 
                     key={problem._id}
                     onClick={() => navigate(`/solve/${problem._id}`)}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' || e.key === ' ') {
                         e.preventDefault();
                         navigate(`/solve/${problem._id}`);
                       }
                     }}
                     tabIndex="0"
                     role="button"
                     aria-label={`Open problem: ${problem.title}`}
                   >
                     <span className="problem-si">{problem.problemNumber || 'N/A'}</span>
                     <span className="problem-title">{problem.title}</span>
                     <span className="problem-score">{problem.score || 50}</span>
                     <span className="problem-success">
                       {statsMap[problem._id]?.successRate?.toFixed(2) || "0.00"}%
                     </span>
                     <span className={`problem-difficulty ${(problem.difficulty || "Easy").toLowerCase()}`}>
                       {problem.difficulty || "Easy"}
                     </span>
                     <Link 
                       className="solve-btn" 
                       to={`/solve/${problem._id}`}
                       onClick={(e) => {
                         e.stopPropagation();
                       }}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter' || e.key === ' ') {
                           e.stopPropagation();
                         }
                       }}
                     >
                       Solve →
                     </Link>
                   </div>
                 ))
               ) : (
                 <div className="no-problems-found">
                   <p>No problems found matching your search criteria.</p>
                   <p>Try adjusting your search terms or difficulty filter.</p>
                 </div>
               )}
             </div>

      {/* Pagination */}
      <div className="pagination">
        <span 
          className={`pagination-chevron ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={handlePrev}
          tabIndex="0"
          role="button"
          aria-label="Previous page"
        >
          &lt;
        </span>
        <span className="pagination-info">
          {filteredProblems.length > 0 ? (
            <>
              {indexOfFirst + 1} – {Math.min(indexOfLast, filteredProblems.length)} of{" "}
              {filteredProblems.length}
              {filteredProblems.length !== problems.length && (
                <span className="filtered-indicator">
                  {" "}(filtered from {problems.length} total)
                </span>
              )}
            </>
          ) : (
            "No problems found"
          )}
        </span>
        <span 
          className={`pagination-chevron ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={handleNext}
          tabIndex="0"
          role="button"
          aria-label="Next page"
        >
          &gt;
        </span>
      </div>
    </div>
  );
};

export default ProblemSet;
