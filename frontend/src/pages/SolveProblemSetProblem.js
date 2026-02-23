/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import MonacoCodeEditor from "../components/MonacoCodeEditor";
import "./SolveProblemSetProblem_new.css";

// Simplified language mapping for API calls
const languageMap = {
  cpp: 54,
  python: 71,
  java: 62,
  javascript: 63
};

const SolveProblem = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('python');
  const [activeTab, setActiveTab] = useState('description');
  const [activeTestCase, setActiveTestCase] = useState(0);

  // Ensure activeTestCase is within bounds when problem changes
  useEffect(() => {
    if (problem?.sampleTestCases?.length && activeTestCase >= problem.sampleTestCases.length) {
      setActiveTestCase(0);
    }
  }, [problem, activeTestCase]);
  const [autoMode, setAutoMode] = useState(true);
  const [leftPanelWidth, setLeftPanelWidth] = useState(40);
  const [rightPanelWidth, setRightPanelWidth] = useState(60);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(30);
  const [isResizing, setIsResizing] = useState(null);
  const [code, setCode] = useState(() => {
    // Load saved code from localStorage or use default
    const savedCode = localStorage.getItem(`code_${problemId}`);
    return savedCode || '# Write your code here\n\n';
  });
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [verdict, setVerdict] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [activeTestTab, setActiveTestTab] = useState('testcase');
  const [testResults, setTestResults] = useState([]);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [problemList, setProblemList] = useState([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(-1);

  const containerRef = useRef(null);

  // Language display names
  const languages = {
    python: { name: 'Python3' },
    java: { name: 'Java' },
    cpp: { name: 'C++' },
    javascript: { name: 'JavaScript' }
  };




  // Resizing functionality for three-panel layout
  const handleMouseDown = (type) => (e) => {
    setIsResizing(type);
    e.preventDefault();
  };

  useEffect(() => {
    let rafId = null;
    
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;

      // Cancel previous animation frame
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      // Use requestAnimationFrame to throttle resize events
      rafId = requestAnimationFrame(() => {
        try {
          const rect = containerRef.current.getBoundingClientRect();
          
          if (isResizing === 'horizontal-left') {
            // Resize between left panel and right panel
            const newLeftWidth = ((e.clientX - rect.left) / rect.width) * 100;
            const clampedLeftWidth = Math.min(Math.max(newLeftWidth, 20), 70);
            setLeftPanelWidth(clampedLeftWidth);
            setRightPanelWidth(100 - clampedLeftWidth);
          } else if (isResizing === 'vertical-bottom') {
            // Resize between top panels and bottom panel
            const newBottomHeight = ((rect.bottom - e.clientY) / rect.height) * 100;
            setBottomPanelHeight(Math.min(Math.max(newBottomHeight, 20), 60));
          }
        } catch (error) {
          console.warn('Resize error:', error);
        }
      });
    };

    const handleMouseUp = () => {
      setIsResizing(null);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isResizing]);

  // Save code to localStorage whenever it changes
  useEffect(() => {
    if (code && problemId) {
      localStorage.setItem(`code_${problemId}`, code);
    }
  }, [code, problemId]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchProblem = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/problems/${problemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProblem(res.data);
        setCustomInput(res.data.sampleTestCases?.[0]?.input || "");
        setOutput("");
        setVerdict("");
      } catch (err) {
        console.error("Error fetching problem:", err);
      }
    };

    const fetchUserSubmissions = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/submissions/user/${problemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserSubmissions(res.data);
      } catch (err) {
        console.error("Error fetching user submissions:", err);
        setUserSubmissions([]);
      }
    };

    const fetchProblemList = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/problems", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProblemList(res.data);
        
        // Cache the problem list
        localStorage.setItem('problemList', JSON.stringify(res.data));
        
        // Find current problem index
        const currentIndex = res.data.findIndex(p => p._id === problemId);
        setCurrentProblemIndex(currentIndex);
        console.log("Problem list fetched:", res.data.length, "problems");
        console.log("Current problem index:", currentIndex);
      } catch (err) {
        console.error("Error fetching problem list:", err);
        
        // If API fails, try cached data first
        const cachedProblems = localStorage.getItem('problemList');
        if (cachedProblems) {
          try {
            const parsedProblems = JSON.parse(cachedProblems);
            setProblemList(parsedProblems);
            const currentIndex = parsedProblems.findIndex(p => p._id === problemId);
            setCurrentProblemIndex(currentIndex);
            console.log("Using cached problem list:", parsedProblems.length, "problems");
          } catch (parseErr) {
            console.error("Error parsing cached problems:", parseErr);
          }
        }
        
        // If token is invalid, redirect to login
        if (err.response?.status === 401) {
          console.log("Authentication failed, redirecting to login");
          localStorage.removeItem("token");
          navigate("/");
        }
      }
    };

    fetchProblem();
    fetchUserSubmissions();
    fetchProblemList();
  }, [problemId]);

  // Navigation functions
  const goToPreviousProblem = () => {
    console.log("=== PREVIOUS PROBLEM NAVIGATION ===");
    console.log("Current problem ID:", problemId);
    console.log("Current index:", currentProblemIndex);
    console.log("Problem list length:", problemList.length);
    console.log("Token exists:", !!localStorage.getItem("token"));
    
    // Simple fallback - try to navigate to a hardcoded previous problem for testing
    if (currentProblemIndex <= 0 || problemList.length === 0) {
      console.log("No previous problem available or problem list not loaded");
      alert("No previous problem available or problem list not loaded yet. Please wait for the page to fully load.");
      return;
    }
    
    const previousProblem = problemList[currentProblemIndex - 1];
    console.log("Previous problem:", previousProblem);
    
    if (previousProblem && previousProblem._id) {
      try {
        // Clear states
        setSubmissionResult(null);
        setActiveTab('description');
        
        // Get current URL to understand the routing pattern
        const currentUrl = window.location.href;
        console.log("Current URL:", currentUrl);
        
        // Try the current route pattern first
        const targetUrl = window.location.pathname.replace(problemId, previousProblem._id);
        console.log("Target URL:", targetUrl);
        
        // Use window.location instead of navigate as a test
        window.location.href = window.location.origin + targetUrl;
        
      } catch (error) {
        console.error("Navigation error:", error);
        alert("Navigation failed. Check console for details.");
      }
    } else {
      console.error("Previous problem data is invalid");
      alert("Previous problem data is invalid");
    }
  };

  const goToNextProblem = () => {
    console.log("=== NEXT PROBLEM NAVIGATION ===");
    console.log("Current problem ID:", problemId);
    console.log("Current index:", currentProblemIndex);
    console.log("Problem list length:", problemList.length);
    console.log("Token exists:", !!localStorage.getItem("token"));
    
    // Simple fallback - try to navigate to a hardcoded next problem for testing
    if (currentProblemIndex >= problemList.length - 1 || problemList.length === 0) {
      console.log("No next problem available or problem list not loaded");
      alert("No next problem available or problem list not loaded yet. Please wait for the page to fully load.");
      return;
    }
    
    const nextProblem = problemList[currentProblemIndex + 1];
    console.log("Next problem:", nextProblem);
    
    if (nextProblem && nextProblem._id) {
      try {
        // Clear states
        setSubmissionResult(null);
        setActiveTab('description');
        
        // Get current URL to understand the routing pattern
        const currentUrl = window.location.href;
        console.log("Current URL:", currentUrl);
        
        // Try the current route pattern first
        const targetUrl = window.location.pathname.replace(problemId, nextProblem._id);
        console.log("Target URL:", targetUrl);
        
        // Use window.location instead of navigate as a test
        window.location.href = window.location.origin + targetUrl;
        
      } catch (error) {
        console.error("Navigation error:", error);
        alert("Navigation failed. Check console for details.");
      }
    } else {
      console.error("Next problem data is invalid");
      alert("Next problem data is invalid");
    }
  };

  const handleRun = async () => {
    if (!code.trim()) {
      setOutput("Please enter some code before running.");
      return;
    }
    if (!problem?.sampleTestCases?.length) {
      setOutput("No test cases available.");
      return;
    }

    setIsRunning(true);
    setIsSubmitting(false);
    setOutput("Running all test cases...");
    setVerdict("");
    setTestResults([]);
    setActiveTestTab('result'); // Switch to result tab

    try {
      const results = [];
      let allPassed = true;
      const startTime = Date.now();

      // Run against all sample test cases
      for (let i = 0; i < problem.sampleTestCases.length; i++) {
        const testCase = problem.sampleTestCases[i];
        
        const res = await axios.post(
          "http://localhost:2358/submissions?base64_encoded=false&wait=true",
          {
            language_id: languageMap[language],
            source_code: code,
            stdin: testCase.input,
          },
          { headers: { "Content-Type": "application/json" } }
        );

        const { stdout, stderr, compile_output } = res.data;
        const actualOutput = (stdout || stderr || compile_output || "").trim();
        const expectedOutput = (testCase.expectedOutput || testCase.output || "").trim();
        const passed = actualOutput === expectedOutput;
        
        results.push({
          caseNumber: i + 1,
          input: testCase.input,
          expectedOutput: expectedOutput,
          actualOutput: actualOutput,
          passed: passed
        });

        if (!passed) {
          allPassed = false;
        }
      }

      const endTime = Date.now();
      const runtime = endTime - startTime;

      setTestResults(results);
      setOutput(allPassed ? "Accepted" : "Wrong Answer");
      setVerdict(`Runtime: ${runtime} ms`);

    } catch (err) {
      console.error("Run Error:", err);
      setOutput("Error running code");
      setVerdict("");
      setTestResults([]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setOutput("Please enter some code before submitting.");
      return;
    }
    if (!problem?.hiddenTestCases?.length) {
      setOutput("No hidden test cases available for submission.");
      return;
    }

    setIsSubmitting(true);
    setIsRunning(false);
    setOutput("Evaluating against hidden test cases...");
    setVerdict("");
    setActiveTestTab('result'); // Switch to result tab

    try {
      const token = localStorage.getItem("token");
      let allTestsPassed = true;
      let passedCount = 0;
      const totalCount = problem.hiddenTestCases.length;
      const startTime = Date.now();

      // Run against all hidden test cases
      for (let i = 0; i < problem.hiddenTestCases.length; i++) {
        const testCase = problem.hiddenTestCases[i];
        
        const res = await axios.post(
          "http://localhost:2358/submissions?base64_encoded=false&wait=true",
          {
            language_id: languageMap[language],
            source_code: code,
            stdin: testCase.input,
          },
          { headers: { "Content-Type": "application/json" } }
        );

        const { stdout, stderr, compile_output } = res.data;
        const actualOutput = (stdout || stderr || compile_output || "").trim();
        const expectedOutput = (testCase.expectedOutput || testCase.output || "").trim();
        const passed = actualOutput === expectedOutput;
        
        if (passed) {
          passedCount++;
        } else {
          allTestsPassed = false;
          // Stop early if any test case fails (optional - for efficiency)
          // break;
        }
      }

      const endTime = Date.now();
      const runtime = endTime - startTime;

      // Display results
      if (allTestsPassed) {
        setOutput("Accepted");
        setVerdict("");
        
        // Set submission result for left panel
        setSubmissionResult({
          status: "Accepted",
          testCases: `${totalCount} / ${totalCount} testcases passed`,
          runtime: runtime, // Pass as number
          memory: "17.68 MB", // Mock data - you can calculate actual memory usage
          language: language,
          submittedAt: new Date().toLocaleString(),
          beats: "83.44%" // Mock data - you can calculate based on other submissions
        });
        
        // Switch to result tab in left panel
        setActiveTab('result');
        
        // Award marks only if ALL hidden test cases pass
        try {
          await axios.post(
            "http://localhost:5000/api/problems/award-marks",
            { 
              problemId, 
              userId: JSON.parse(localStorage.getItem("user") || '{}')?.id,
              marks: problem.marks || 100,
              language,
              runtime
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("Marks awarded successfully!");
        } catch (marksErr) {
          console.error("Error awarding marks:", marksErr);
        }
      } else {
        setOutput("Wrong Answer");
        setVerdict("");
        
        // Set submission result for left panel
        setSubmissionResult({
          status: "Wrong Answer",
          testCases: `${passedCount} / ${totalCount} testcases passed`,
          runtime: runtime, // Pass as number
          memory: "17.68 MB", // Mock data
          language: language,
          submittedAt: new Date().toLocaleString(),
          beats: "0%" // No beats if wrong answer
        });
        
        // Switch to result tab in left panel
        setActiveTab('result');
      }

      // Save submission to backend
      await axios.post(
        "http://localhost:5000/api/submissions",
        { 
          problemId, 
          code, 
          language, 
          isSuccess: allTestsPassed,
          passedTestCases: passedCount,
          totalTestCases: totalCount,
          runtime
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh submissions list after submission
      try {
        const submissionsRes = await axios.get(`http://localhost:5000/api/submissions/user/${problemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserSubmissions(submissionsRes.data);
      } catch (submissionErr) {
        console.error("Error refreshing submissions:", submissionErr);
      }

    } catch (err) {
      console.error("Submit Error:", err);
      setOutput("Submission error");
      setVerdict("");
    } finally {
      setIsSubmitting(false);
    }
  };



  // Helper components
  const TabButton = ({ id, children, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`cp-tab-button ${active ? 'active' : 'inactive'}`}
    >
      {children}
    </button>
  );

  if (!problem) return (
    <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Loading problem...</p>
      </div>
    </div>
  );

  return (
    <div className="main-container">
      {/* Header */}
      <div className="cp-header-container">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <Link to="/problem-set" className="problem-set">
              Problem List
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={goToPreviousProblem}
              disabled={currentProblemIndex <= 0}
              className={`cp-nav-button ${currentProblemIndex <= 0 ? 'disabled' : 'enabled'}`}
              title="Previous Problem"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18L9 12L15 6"/>
              </svg>
            </button>
            <button 
              onClick={goToNextProblem}
              disabled={currentProblemIndex >= problemList.length - 1}
              className={`cp-nav-button ${currentProblemIndex >= problemList.length - 1 ? 'disabled' : 'enabled'}`}
              title="Next Problem"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18L15 12L9 6"/>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Run and Submit Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="cp-run-btn"
            title={isRunning ? "Code is running..." : "Run your code against test cases"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
            {isRunning ? 'Running...' : 'Run'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="cp-submit-btn"
            title={isSubmitting ? "Code is being submitted..." : "Submit your solution for evaluation"}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Main Content - Left Panel + Right Panel with Bottom */}
      <div ref={containerRef} className="solve-body">
        {/* Left Panel - Problem Section (Full Height) */}
        <div 
          className="left-panel-solve"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Problem Header */}
          <div className="left-panel-header">
            <div className="flex items-center gap-6">
              <TabButton
                  id="description"
                  active={activeTab === 'description'}
                  onClick={setActiveTab}
              >
                  <span className="flex items-center gap-1">
                      {/* Memo Icon */}
                      <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="memo" 
                          role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"
                          style={{ width: '1em', height: '1em', color: '#007bff' }} /* Fixed Blue Color */
                      >
                          <path fill="currentColor" d="M64 48c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H64zM0 64C0 28.7 28.7 0 64 0H320c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm120 64H264c13.3 0 24 10.7 24 24s-10.7 24-24 24H120c-13.3 0-24-10.7-24-24s10.7-24 24-24zm0 96H264c13.3 0 24 10.7 24 24s-10.7 24-24 24H120c-13.3 0-24-10.7-24-24s10.7-24 24-24zm0 96h48c13.3 0 24 10.7 24 24s-10.7 24-24 24H120c-13.3 0-24-10.7-24-24s10.7-24 24-24z"></path>
                      </svg>
                      Description
                  </span>
              </TabButton>
              {submissionResult && (
                <div className="flex items-center">
                  <TabButton
                    id="result"
                    active={activeTab === 'result'}
                    onClick={setActiveTab}
                  >
                    {submissionResult.status}
                  </TabButton>
                  <button
                    onClick={() => {
                      setSubmissionResult(null);
                      setActiveTab('description');
                    }}
                    className="ml-2 p-1 text-gray-400 hover:text-white transition-colors"
                    title="Close"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              )}

              <TabButton
                  id="submissions"
                  active={activeTab === 'submissions'}
                  onClick={setActiveTab}
              >
                  {/* SVG Icon for History/Submissions */}
                  <span className="flex items-center gap-1">
                      <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="clock-rotate-left" 
                          role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                          style={{ width: '1em', height: '1em', color: '#10b981' }} /* Fixed Green Color */
                      >
                          <path fill="currentColor" d="M48 106.7V56c0-13.3-10.7-24-24-24S0 42.7 0 56V168c0 13.3 10.7 24 24 24H136c13.3 0 24-10.7 24-24s-10.7-24-24-24H80.7c37-57.8 101.7-96 175.3-96c114.9 0 208 93.1 208 208s-93.1 208-208 208c-42.5 0-81.9-12.7-114.7-34.5c-11-7.3-25.9-4.3-33.3 6.7s-4.3 25.9 6.7 33.3C155.2 496.4 203.8 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C170.3 0 94.4 42.1 48 106.7zM256 128c-13.3 0-24 10.7-24 24V256c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65V152c0-13.3-10.7-24-24-24z"></path>
                      </svg>
                      Submissions
                  </span>
              </TabButton>
            </div>
          </div>
          
          {/* Problem Content */}
          <div className="cp-content">
            {activeTab === 'description' && (
              <>
                <h1 className="cp-problem-title">
                  {currentProblemIndex >= 0 ? `${currentProblemIndex + 1}. ` : ''}{problem.title}
                </h1>
                
                <div className="flex items-center gap-2 mb-6">
                  <div className="difficulty-container">
                    <span className={`${
                      problem.difficulty === 'Easy' ? 'cp-difficulty-easy' :
                      problem.difficulty === 'Medium' ? 'cp-difficulty-medium' :
                      problem.difficulty === 'Hard' ? 'cp-difficulty-hard' :
                      'cp-difficulty-easy'
                    }`}>
                      {problem.difficulty || 'Easy'}
                    </span>
                    {problem.score && (
                      <span className="difficulty-points">
                        {problem.score}
                      </span>
                    )}
                    {(problem.tags || problem.topics) && (
                      <div className="tags-container">
                        {(problem.tags || problem.topics || []).map((tag, index) => (
                          <span key={index} className="tag">
                            {typeof tag === 'string' ? tag : tag.name || tag.tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="cp-problem-description">{problem.problemStatement || problem.description}</p>
                  {problem.inputFormat && (
                    <div className="mt-6">
                      <h3 className="cp-section-title">Input Format:</h3>
                      <div className="cp-section-content">{problem.inputFormat}</div>
                    </div>
                  )}

                  {problem.outputFormat && (
                    <div className="mt-6">
                      <h3 className="cp-section-title">Output Format:</h3>
                      <div className="cp-section-content">{problem.outputFormat}</div>
                    </div>
                  )}
                  
                  {problem.sampleTestCases && problem.sampleTestCases.length > 0 && (
                    <>
                      {problem.sampleTestCases.map((testCase, index) => (
                        <div key={index} className="mt-6">
                          <h3 className="cp-section-title">Example {index + 1}:</h3>
                          <div className="cp-example-content">
                            <div><strong>Input:</strong> {testCase.input}</div>
                            <div><strong>Output:</strong> {testCase.expectedOutput}</div>
                            {testCase.explanation && (
                              <div><strong>Explanation:</strong> {testCase.explanation}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {problem.constraints && (
                    <div className="mt-6">
                      <h3 className="cp-section-title">Constraints:</h3>
                      <div className="cp-constraints-content">{problem.constraints}</div>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'result' && submissionResult && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <button 
                    onClick={() => setActiveTab('description')}
                    className="cp-back-button"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19L5 12L12 5"/>
                    </svg>
                    All Submissions
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status Header */}
                  <div className="flex items-center gap-3">
                    <span className={`cp-status-text-large ${
                      submissionResult.status === 'Accepted' ? 'cp-status-accepted' : 'cp-status-wrong'
                    }`}>
                      {submissionResult.status}
                    </span>
                    <span className="cp-status-text-small">{submissionResult.testCases}</span>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      👤
                    </div>
                    <span>{JSON.parse(localStorage.getItem("user") || '{}')?.username || 'User'}</span>
                    <span>submitted at {submissionResult.submittedAt}</span>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Runtime */}
                    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        <span className="text-gray-400 text-sm">Runtime</span>
                      </div>
                      <div className="cp-metric-value">{submissionResult.runtime} <span className="cp-metric-unit">ms</span></div>
                      <div className="cp-metric-beats">Beats {submissionResult.beats}</div>
                    </div>

                    {/* Memory */}
                    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                          <path d="M9 7h6l1 9H8l1-9z"/>
                          <path d="M8 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1"/>
                        </svg>
                        <span className="text-gray-400 text-sm">Memory</span>
                      </div>
                      <div className="cp-metric-value">{submissionResult.memory}</div>
                      <div className="cp-metric-beats">Beats {submissionResult.beats}</div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div>
                <h2 className="cp-submissions-title">My Submissions</h2>
                {userSubmissions.length === 0 ? (
                  <div className="cp-submissions-empty">
                    <div className="mb-2">📝</div>
                    <p>No submissions yet</p>
                    <p className="cp-submissions-empty-small">Submit your solution to see it here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full cp-submissions-table">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="text-left py-3 px-2 text-gray-400 font-medium">Status</th>
                          <th className="text-left py-3 px-2 text-gray-400 font-medium">Language</th>
                          <th className="text-left py-3 px-2 text-gray-400 font-medium">Runtime</th>
                          <th className="text-left py-3 px-2 text-gray-400 font-medium">Memory</th>
                          <th className="text-left py-3 pl-4 text-gray-400 font-medium">Code</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userSubmissions.map((submission, index) => (
                          <tr key={submission._id || index} className="border-b border-gray-700 hover:bg-gray-800 transition-colors">
                            <td className="py-3 px-2">
                              <div className="flex flex-col gap-0">
                                <span className={`cp-submission-status ${
                                  submission.isSuccess ? 'accepted' : 'wrong'
                                }`}>
                                  {submission.isSuccess ? 'Accepted' : 'Wrong Answer'}
                                </span>
                                <span className="cp-submission-time">
                                  {new Date(submission.createdAt || submission.submittedAt).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <span className="cp-submission-language">
                                {submission.language === 'python' ? 'Python3' :
                                 submission.language === 'cpp' ? 'C++' :
                                 submission.language === 'java' ? 'Java' :
                                 submission.language === 'javascript' ? 'JavaScript' :
                                 submission.language || 'Unknown'}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center text-gray-400">
                                <svg width="14" height="14" className="mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                  <polyline points="12,6 12,12 16,14"/>
                                </svg>
                                <span className="cp-submission-runtime">
                                  {submission.runtime ? `${submission.runtime} ms` : '0 ms'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center text-gray-400">
                                {/*<svg width="14" height="14" className="mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M9 7h6l1 9H8l1-9z"/>
                                  <path d="M8 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1"/>
                                </svg>*/}
                                <span className="cp-submission-memory">
                                  {submission.memory || '18.1 MB'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 pl-4 pr-2">
                              <div className="flex items-center gap-0">
                              <button
                                  onClick={() => {
                                      if (submission.code) {
                                          setCode(submission.code);
                                          if (submission.language) {
                                              setLanguage(submission.language);
                                          }
                                      }
                                  }}
                                  className="cp-submission-actions"
                                  title="Load this code into the editor"
                                >
                                  Edit
                              </button>
                                {/*<details className="inline">
                                  <div className="absolute z-10 mt-2 bg-gray-900 border border-gray-600 rounded-lg p-3 max-w-md max-h-64 overflow-auto shadow-lg">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="cp-submission-actions text-gray-400">Submitted Code</span>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          // @ts-ignore
                                          e.target.closest('details').removeAttribute('open');
                                        }}
                                        className="text-gray-400 hover:text-white cp-submission-actions"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                    <pre className="cp-submission-code-view">
                                      <code>{submission.code || 'No code available'}</code>
                                    </pre>
                                  </div>
                                </details>*/}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Resizer between Left and Right sections */}
        <div 
          className="w-1 bg-gray-600 cursor-col-resize hover:bg-gray-500 transition-colors"
          onMouseDown={handleMouseDown('horizontal-left')}
        />

        {/* Right Section - Code Editor + Bottom Panel */}
        <div 
          className="right-panel-solve"
          style={{ width: `${rightPanelWidth}%` }}
        >
          {/* Code Editor Panel */}
          <div 
            className="right-top-solve"
            style={{ height: `${100 - bottomPanelHeight}%` }}
          >
            {/* Code Header */}
            <div className="right-top-header">
            <div className="text-sm font-medium code-badge">
    <span
        >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M24 12l-5.657 5.657-1.414-1.414L21.172 12l-4.243-4.243 1.414-1.414L24 12zM2.828 12l4.243 4.243-1.414 1.414L0 12l5.657-5.657L7.07 7.757 2.828 12zm6.96 9H7.66l6.552-18h2.128L9.788 21z"
                fill="currentColor"
            ></path>
        </svg>
        Code
    </span>
</div>
              <div className="flex items-center gap-4">
                <select
                  value={language}
                  onChange={(e) => {
                    console.log('Language changed in parent:', e.target.value);
                    setLanguage(e.target.value);
                  }}
                  className="bg-gray-600 text-white border-none px-3 py-1 rounded text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {Object.entries(languages).map(([key, lang]) => (
                    <option key={key} value={key}>{lang.name}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>Auto Save</span>
                  <button
                    onClick={() => setAutoMode(!autoMode)}
                    className={`cp-toggle-switch ${autoMode ? 'active' : 'inactive'}`}
                  />
                </div>
              </div>
            </div>

            {/* Monaco Code Editor */}
            <div className="flex-1 flex flex-col editor-container">
              <MonacoCodeEditor
                language={language}
                allowedLanguages={['python']} // Only Python for problem solving
                onLanguageChange={(newLang) => {
                  console.log('Language change from Monaco:', newLang);
                  setLanguage(newLang);
                }}
                value={code}
                onChange={setCode}
                height="100%"
                showLanguageSelector={false}
              />
            </div>
          </div>

          {/* Vertical Resizer between Code Editor and Bottom Panel */}
          <div 
            className="h-1 bg-gray-600 cursor-row-resize hover:bg-gray-500 transition-colors"
            onMouseDown={handleMouseDown('vertical-bottom')}
          />

          {/* Bottom Panel - Test Cases (Only under right section) */}
          <div 
            className="right-bottom-solve"
            style={{ height: `${bottomPanelHeight}%`, backgroundColor: '#1e1e1e' }}
          >
            {/* Test Header - Two Rows */}
            <div className="border-b border-gray-600">
              {/* First Row - Testcase and Test Result tabs */}
              <div className="right-bottom-header">
                <button
                  onClick={() => setActiveTestTab('testcase')}
                  className={`cp-test-tab-button ${activeTestTab === 'testcase' ? 'active' : 'inactive'}`}
                >
                  Testcase
                </button>
                <button
                  onClick={() => setActiveTestTab('result')}
                  className={`cp-test-tab-button ${activeTestTab === 'result' ? 'active' : 'inactive'}`}
                >
                  Test Result
                </button>
              </div>
              
              {/* Second Row - Case buttons (only show in Testcase tab) */}
              {activeTestTab === 'testcase' && (
                <div className="px-3 py-2 pt-4 flex items-center gap-3">
                  {problem?.sampleTestCases?.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestCase(index)}
                      className={`cp-test-case-button ${activeTestCase === index ? 'active' : 'inactive'}`}
                    >
                      Case {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Test Content */}
            <div 
              className="flex-1 p-4 overflow-y-scroll cp-scrollbar-thin"
            >
              {activeTestTab === 'testcase' && problem?.sampleTestCases?.[activeTestCase] && (
                <div>
                  <div className="bg-gray-900 border border-gray-600 rounded p-3 font-mono text-sm text-white">
                    {problem.sampleTestCases[activeTestCase]?.input || 'No input available'}
                  </div>
                </div>
              )}

              {activeTestTab === 'result' && (
                <div>
                  {testResults.length > 0 ? (
                    <div className="space-y-3">
                      {/* Overall Result */}
                      <div className="flex items-center gap-4 mb-3">
                        <span className={`cp-result-status ${
                          output === 'Accepted' ? 'accepted' : 'wrong'
                        }`}>
                          {output}
                        </span>
                        <span className="cp-verdict-text">{verdict}</span>
                      </div>

                      {/* Case Results - Simple */}
                      <div className="flex items-center gap-2 mb-3">
                        {testResults.map((result, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveTestCase(index)}
                            className={`cp-test-case-button ${activeTestCase === index ? 'active' : 'inactive'}`}
                          >
                            <div className={`cp-case-indicator ${
                              result.passed ? 'passed' : 'failed'
                            }`}></div>
                            Case {result.caseNumber}
                          </button>
                        ))}
                      </div>

                      {/* Selected Case Details - Simplified */}
                      {testResults[activeTestCase] && (
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Input:</div>
                            <div className="bg-gray-800 border border-gray-600 rounded p-2 font-mono text-sm text-white">
                              {testResults[activeTestCase]?.input || 'No input'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Output:</div>
                            <div className="bg-gray-800 border border-gray-600 rounded p-2 font-mono text-sm text-white">
                              {testResults[activeTestCase]?.actualOutput || 'No output'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : output ? (
                    <div className="bg-gray-800 border border-gray-600 rounded p-3 font-mono text-sm text-white">
                      {output}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm text-center py-8">
                      Run your code to see the results here
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolveProblem;
