import React, { useState, useEffect, useRef, useCallback } from "react";
import MonacoCodeEditor from "../components/MonacoCodeEditor";
import "./CodeEditor.css";

const CodeEditor = () => {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(null);
  const [memory, setMemory] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(75);
  
  // Refs for cleanup and throttling
  const resizeTimeoutRef = useRef(null);
  const animationFrameRef = useRef(null);
  const containerRef = useRef(null);
  const resizeHandleRef = useRef(null);
  const editorContainerRef = useRef(null);

  useEffect(() => {
    const savedCode = localStorage.getItem(`code-${language}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      // Default code templates
      const defaultCode = {
        java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
        python: `print("Hello, World!")`,
        cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`
      };
      setCode(defaultCode[language] || "");
    }
  }, [language]);

  useEffect(() => {
    localStorage.setItem(`code-${language}`, code);
  }, [code, language]);


  // Debounced resize function
  const debouncedResize = useCallback((newWidth) => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      setLeftPanelWidth(newWidth);
    }, 16); // ~60fps
  }, []);

  // Mouse move handler
  const handleMouseMove = useCallback((e) => {
    if (!isResizing || !containerRef.current) return;

    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Use requestAnimationFrame for smooth updates
    animationFrameRef.current = requestAnimationFrame(() => {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const newLeftWidth = e.clientX - containerRect.left;
      const containerWidth = containerRect.width;
      
      // Limit resize range (20% to 80% of container width)
      const minWidth = containerWidth * 0.2;
      const maxWidth = containerWidth * 0.8;
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newLeftWidth));
      
      const leftPercentage = (clampedWidth / containerWidth) * 100;
      
      // Update resize handle position
      if (resizeHandleRef.current) {
        const resizeHandle = resizeHandleRef.current;
        resizeHandle.style.left = `calc(${leftPercentage}% - 2px)`;
      }
      
      // Debounce the state update
      debouncedResize(leftPercentage);
    });
  }, [isResizing, debouncedResize]);

  // Mouse down handler
  const handleMouseDown = useCallback((e) => {
    if (e.target.classList.contains('resize-handle')) {
      setIsResizing(true);
      e.preventDefault();
    }
  }, []);

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    
    // Clear any pending operations
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Resize functionality with proper cleanup
  useEffect(() => {
    const container = containerRef.current;
    const resizeHandle = resizeHandleRef.current;

    if (!container || !resizeHandle) return;

    // Add event listeners
    document.addEventListener('mousedown', handleMouseDown, { passive: false });
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Clear any pending operations
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  // Additional cleanup on unmount
  useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);


  const handleRunCode = async () => {
    setLoading(true);
    setOutput("");
    setTime(null);
    setMemory(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock output for demonstration
      const mockOutputs = {
        java: "Hello, World!\n",
        python: "Hello, World!\n",
        cpp: "Hello, World!\n"
      };
      
      setOutput(mockOutputs[language] || "Code executed successfully!");
      setTime(Math.floor(Math.random() * 100) + 50);
      setMemory(Math.floor(Math.random() * 1000) + 500);
    } catch (error) {
      setOutput("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="online-compiler">
      <div 
        className="compiler-body" 
        ref={containerRef}
        style={{
          gridTemplateColumns: `${leftPanelWidth}% ${100 - leftPanelWidth}%`
        }}
      >
        <div className="left-panel">
          <div className="top-bar">
            <div className="compiler-title">
              <h3>Online Code Editor</h3>
            </div>
            <button onClick={handleRunCode} disabled={loading}>
              {loading ? "Running..." : "Run"}
            </button>
          </div>
          <div className="monaco-editor-container" ref={editorContainerRef}>
            <MonacoCodeEditor
              language={language}
              allowedLanguages={null} // Allow all languages
              onLanguageChange={setLanguage}
              value={code}
              onChange={setCode}
              height="100%"
              showLanguageSelector={true}
            />
          </div>
        </div>
        
        <div 
          className="resize-handle" 
          ref={resizeHandleRef}
          style={{ left: `calc(${leftPanelWidth}% - 2px)` }}
        ></div>
        
        <div className="right-panel">
          <div className="input-area">
            <h4>Input</h4>
            <textarea
              className="input-box"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your input here..."
            />
          </div>
          <div className="output-area">
            <h4>Output</h4>
            <div className="output-box">
              {loading ? (
                <div className="loader">Compiling and running...</div>
              ) : output ? (
                <pre>{output}</pre>
              ) : (
                <span style={{ color: "var(--text-secondary)" }}>
                  Output will appear here...
                </span>
              )}
            </div>
            {(time || memory) && (
              <div className="stats">
                {time && <p>Time: {time}ms</p>}
                {memory && <p>Memory: {memory}KB</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
