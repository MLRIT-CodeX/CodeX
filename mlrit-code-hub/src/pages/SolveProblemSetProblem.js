/* eslint-disable no-undef */
import React, { useEffect, useState, useRef } from "react";
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
              userId: JSON.parse(localStorage.getItem("user"))?.id,
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
      className={`px-3 py-2 text-sm font-medium transition-colors relative ${
        active ? 'text-white' : 'text-gray-400 hover:text-gray-200'
      }`}
    >
      {children}
      {active && <div className="absolute bottom-0 left-0 right-0 h-0-5 bg-orange-400" />}
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
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-700 px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span className="text-white font-medium">Problem List</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={goToPreviousProblem}
              disabled={currentProblemIndex <= 0}
              className={`p-1 transition-colors ${
                currentProblemIndex <= 0 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Previous Problem"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18L9 12L15 6"/>
              </svg>
            </button>
            <button 
              onClick={goToNextProblem}
              disabled={currentProblemIndex >= problemList.length - 1}
              className={`p-1 transition-colors ${
                currentProblemIndex >= problemList.length - 1 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Next Problem"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18L15 12L9 6"/>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Run and Submit Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded text-sm font-medium transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
            {isRunning ? 'Running...' : 'Run'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded text-sm font-medium transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 13l3 3 7-7"/>
            </svg>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Main Content - Left Panel + Right Panel with Bottom */}
      <div ref={containerRef} className="flex-1 flex select-none">
        {/* Left Panel - Problem Section (Full Height) */}
        <div 
          className="bg-gray-800 border-r border-gray-600 flex flex-col"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Problem Header */}
          <div className="bg-gray-700 px-4 py-3 border-b border-gray-600 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <TabButton
                id="description"
                active={activeTab === 'description'}
                onClick={setActiveTab}
              >
                📝 Description
              </TabButton>
              {submissionResult && (
                <div className="flex items-center">
                  <TabButton
                    id="result"
                    active={activeTab === 'result'}
                    onClick={setActiveTab}
                  >
                    ✅ {submissionResult.status}
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
                📋 My Submissions
              </TabButton>
            </div>
          </div>
          
          {/* Problem Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'description' && (
              <>
                <h1 className="text-xl font-semibold mb-4">
                  {currentProblemIndex >= 0 ? `${currentProblemIndex + 1}. ` : ''}{problem.title}
                </h1>
                
                <div className="flex items-center gap-2 mb-6">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    problem.difficulty === 'Easy' ? 'bg-green-600 text-white' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-600 text-white' :
                    problem.difficulty === 'Hard' ? 'bg-red-600 text-white' :
                    'bg-gray-600 text-orange-400'
                  }`}>
                    {problem.difficulty || 'Easy'}
                  </span>
                </div>

                <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                  <p>{problem.problemStatement || problem.description}</p>
                  
                  {problem.sampleTestCases && problem.sampleTestCases.length > 0 && (
                    <>
                      {problem.sampleTestCases.map((testCase, index) => (
                        <div key={index} className="mt-6">
                          <h3 className="text-white font-semibold mb-2">Example {index + 1}:</h3>
                          <div className="bg-gray-900 border border-gray-600 rounded p-3 font-mono text-xs text-gray-200">
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
                      <h3 className="text-white font-semibold mb-2">Constraints:</h3>
                      <div className="text-xs">{problem.constraints}</div>
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
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
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
                    <span className={`text-2xl font-bold ${
                      submissionResult.status === 'Accepted' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {submissionResult.status}
                    </span>
                    <span className="text-gray-400 text-sm">{submissionResult.testCases}</span>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      👤
                    </div>
                    <span>{JSON.parse(localStorage.getItem("user") || '{}').username || 'User'}</span>
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
                      <div className="text-2xl font-bold text-white mb-1">{submissionResult.runtime} <span className="text-sm text-gray-400">ms</span></div>
                      <div className="text-xs text-gray-500">Beats {submissionResult.beats}</div>
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
                      <div className="text-2xl font-bold text-white mb-1">{submissionResult.memory}</div>
                      <div className="text-xs text-gray-500">Beats {submissionResult.beats}</div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">My Submissions</h2>
                {userSubmissions.length === 0 ? (
                  <div className="text-gray-400 text-sm text-center py-8">
                    <div className="mb-2">📝</div>
                    <p>No submissions yet</p>
                    <p className="text-xs mt-1">Submit your solution to see it here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="text-left py-3 px-2 text-gray-400 font-medium">Status ▼</th>
                          <th className="text-left py-3 px-2 text-gray-400 font-medium">Language ▼</th>
                          <th className="text-left py-3 px-2 text-gray-400 font-medium">Runtime</th>
                          <th className="text-left py-3 px-2 text-gray-400 font-medium">Memory</th>
                          <th className="text-left py-3 px-2 text-gray-400 font-medium">Code</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userSubmissions.map((submission, index) => (
                          <tr key={submission._id || index} className="border-b border-gray-700 hover:bg-gray-800 transition-colors">
                            <td className="py-3 px-2">
                              <div className="flex flex-col">
                                <span className={`text-sm font-medium ${
                                  submission.isSuccess ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {submission.isSuccess ? 'Accepted' : 'Wrong Answer'}
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                  {new Date(submission.createdAt || submission.submittedAt).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
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
                                <span className="text-xs">
                                  {submission.runtime ? `${submission.runtime} ms` : '0 ms'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center text-gray-400">
                                <svg width="14" height="14" className="mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M9 7h6l1 9H8l1-9z"/>
                                  <path d="M8 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1"/>
                                </svg>
                                <span className="text-xs">
                                  {submission.memory || '18.1 MB'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    if (submission.code) {
                                      setCode(submission.code);
                                      if (submission.language) {
                                        setLanguage(submission.language);
                                      }
                                    }
                                  }}
                                  className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded border border-blue-400 hover:border-blue-300 transition-colors"
                                  title="Load this code into the editor"
                                >
                                  Edit
                                </button>
                                <details className="inline">
                                  <summary className="text-gray-400 hover:text-white text-xs cursor-pointer">
                                    View
                                  </summary>
                                  <div className="absolute z-10 mt-2 bg-gray-900 border border-gray-600 rounded-lg p-3 max-w-md max-h-64 overflow-auto shadow-lg">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs text-gray-400">Submitted Code</span>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.target.closest('details').removeAttribute('open');
                                        }}
                                        className="text-gray-400 hover:text-white text-xs"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                    <pre className="text-xs text-gray-300 overflow-x-auto">
                                      <code>{submission.code || 'No code available'}</code>
                                    </pre>
                                  </div>
                                </details>
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
          className="flex flex-col"
          style={{ width: `${rightPanelWidth}%` }}
        >
          {/* Code Editor Panel */}
          <div 
            className="bg-gray-800 flex flex-col"
            style={{ height: `${100 - bottomPanelHeight}%` }}
          >
            {/* Code Header */}
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex items-center justify-between">
              <div className="text-sm font-medium">🧑‍💻 Code</div>
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
                  <span>🔒 Auto</span>
                  <button
                    onClick={() => setAutoMode(!autoMode)}
                    className={`w-8 h-4 rounded-full transition-colors relative ${
                      autoMode ? 'bg-orange-400' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full absolute top-0-5 transition-transform ${
                      autoMode ? 'translate-x-4' : 'translate-x-0-5'
                    }`} />
                  </button>
                </div>
                <span className="text-xs text-gray-500">Saved</span>
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
            className="bg-gray-700 border-t border-gray-600 flex flex-col"
            style={{ height: `${bottomPanelHeight}%` }}
          >
            {/* Test Header - Two Rows */}
            <div className="border-b border-gray-600">
              {/* First Row - Testcase and Test Result tabs */}
              <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-6">
                <button
                  onClick={() => setActiveTestTab('testcase')}
                  className={`text-sm font-medium transition-colors ${
                    activeTestTab === 'testcase' 
                      ? 'text-green-400' 
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Testcase
                </button>
                <button
                  onClick={() => setActiveTestTab('result')}
                  className={`text-sm font-medium transition-colors ${
                    activeTestTab === 'result' 
                      ? 'text-green-400' 
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Test Result
                </button>
              </div>
              
              {/* Second Row - Case buttons (only show in Testcase tab) */}
              {activeTestTab === 'testcase' && (
                <div className="px-4 py-2 flex items-center gap-2">
                  {problem?.sampleTestCases?.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestCase(index)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        activeTestCase === index
                          ? 'bg-orange-400 text-black'
                          : 'bg-gray-600 text-white hover:bg-gray-500'
                      }`}
                    >
                      Case {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Test Content */}
            <div 
              className="flex-1 p-4 overflow-y-scroll" 
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#6B7280 #374151'
              }}
            >
              {activeTestTab === 'testcase' && problem?.sampleTestCases?.[activeTestCase] && (
                <div>
                  <div className="bg-gray-800 border border-gray-600 rounded p-3 font-mono text-sm text-white">
                    {problem.sampleTestCases[activeTestCase].input}
                  </div>
                </div>
              )}

              {activeTestTab === 'result' && (
                <div>
                  {testResults.length > 0 ? (
                    <div className="space-y-3">
                      {/* Overall Result */}
                      <div className="flex items-center gap-4 mb-3">
                        <span className={`text-base font-medium ${
                          output === 'Accepted' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {output}
                        </span>
                        <span className="text-gray-400 text-sm">{verdict}</span>
                      </div>

                      {/* Case Results - Simple */}
                      <div className="flex items-center gap-2 mb-3">
                        {testResults.map((result, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveTestCase(index)}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                              activeTestCase === index
                                ? 'bg-orange-400 text-black'
                                : 'bg-gray-600 text-white hover:bg-gray-500'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              result.passed ? 'bg-green-400' : 'bg-red-400'
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
                              {testResults[activeTestCase].input}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Output:</div>
                            <div className="bg-gray-800 border border-gray-600 rounded p-2 font-mono text-sm text-white">
                              {testResults[activeTestCase].actualOutput}
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
