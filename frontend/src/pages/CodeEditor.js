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
  const containerRef = useRef(null);
  const editorContainerRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const inputAreaRef = useRef(null);
  const outputAreaRef = useRef(null);
  
  // Vertical resizing (left-right panels)
  const [isResizing, setIsResizing] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState('50%');
  const minPanelWidth = 200; // Minimum width in pixels
  const maxPanelWidth = 800; // Maximum width in pixels
  
  // Horizontal resizing (input-output areas)
  const [isHorizontalResizing, setIsHorizontalResizing] = useState(false);
  const [inputAreaHeight, setInputAreaHeight] = useState('50%');
  const minAreaHeight = 100; // Minimum height in pixels
  const maxAreaHeight = 500; // Maximum height in pixels
  
  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Vertical resize handler (left-right panels)
  const resizeVertical = useCallback((e) => {
    if (isResizing && leftPanelRef.current) {
      requestAnimationFrame(() => {
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        let newWidth = e.clientX - containerRect.left;
        newWidth = Math.max(minPanelWidth, Math.min(newWidth, maxPanelWidth));
        
        leftPanelRef.current.style.width = `${newWidth}px`;
        rightPanelRef.current.style.flex = `0 0 calc(100% - ${newWidth}px - 8px)`;
        setLeftPanelWidth(`${(newWidth / containerWidth) * 100}%`);
      });
    }
  }, [isResizing, minPanelWidth, maxPanelWidth]);

  // Horizontal resize handler (input-output areas)
  const resizeHorizontal = useCallback((e) => {
    if (isHorizontalResizing && inputAreaRef.current) {
      requestAnimationFrame(() => {
        const containerRect = rightPanelRef.current.getBoundingClientRect();
        const containerHeight = containerRect.height;
        const newHeight = e.clientY - containerRect.top;
        
        // Apply constraints
        const constrainedHeight = Math.max(minAreaHeight, Math.min(newHeight, maxAreaHeight));
        
        // Use pixel values during resize for better performance
        inputAreaRef.current.style.height = `${constrainedHeight}px`;
        
        // Update state for consistency
        setInputAreaHeight(`${(constrainedHeight / containerHeight) * 100}%`);
      });
    }
  }, [isHorizontalResizing, minAreaHeight, maxAreaHeight]);

  // Add event listeners for vertical resizing (left-right panels)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        e.preventDefault();
        resizeVertical(e);
      } else if (isHorizontalResizing) {
        e.preventDefault();
        resizeHorizontal(e);
      }
    };

    const handleMouseUp = () => {
      if (isResizing || isHorizontalResizing) {
        setIsResizing(false);
        setIsHorizontalResizing(false);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };

    if (isResizing) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      leftPanelRef.current.style.transition = 'none';
      rightPanelRef.current.style.transition = 'none';
    } else if (isHorizontalResizing) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'row-resize';
      if (inputAreaRef.current) {
        inputAreaRef.current.style.transition = 'none';
      }
    } else {
      if (leftPanelRef.current && rightPanelRef.current) {
        leftPanelRef.current.style.transition = 'width 0.2s ease-out';
        rightPanelRef.current.style.transition = 'flex 0.2s ease-out';
      }
      if (inputAreaRef.current) {
        inputAreaRef.current.style.transition = 'height 0.2s ease-out';
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing, isHorizontalResizing, resizeVertical, resizeHorizontal]);

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
      <div className="compiler-body" ref={containerRef}>
        <div 
          className="left-panel" 
          ref={leftPanelRef}
          style={{ width: leftPanelWidth, minWidth: `${minPanelWidth}px` }}
        >
          <div className="top-bar">
            <button 
              onClick={handleRunCode} 
              disabled={loading}
              className="run-button"
            >
              Run
            </button>
          </div>
          <div className="flex-1 flex flex-col editor-container" ref={editorContainerRef}>
            <MonacoCodeEditor
              language={language}
              allowedLanguages={null}
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
          onMouseDown={startResizing}
          style={{ cursor: 'col-resize' }}
        />
        <div 
          className="right-panel"
          ref={rightPanelRef}
          style={{ 
            flex: `0 0 calc(100% - ${leftPanelWidth} - 8px)`,
            minWidth: `${minPanelWidth}px`
          }}
        >
          <div 
            className="input-area"
            ref={inputAreaRef}
            style={{ height: inputAreaHeight }}
          >
            <h4>Input</h4>
            <textarea
              className="input-box"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your input here..."
            />
          </div>
          
          <div 
            className="resize-handle-horizontal"
            onMouseDown={() => setIsHorizontalResizing(true)}
          />
          
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
