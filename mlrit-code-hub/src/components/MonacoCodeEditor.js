/* eslint-disable no-undef */
import React, { useEffect, useState, useRef } from 'react';

/**
 * Alias with custom flags to satisfy type checkers.
 * @type {Window & typeof globalThis & { _monacoLoaded?: boolean; _monacoLoading?: boolean; require?: any; monaco?: any }}
 */
const w = /** @type {any} */ (window);

// Language configurations with simple templates
const LANGUAGE_CONFIGS = {
  python: {
    name: "Python3",
    template: "# Write your code here\n\n",
    monacoLang: "python",
  },
  java: {
    name: "Java",
    template: "public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}",
    monacoLang: "java",
  },
  cpp: {
    name: "C++",
    template: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}",
    monacoLang: "cpp",
  },
};

// Monaco Editor loader utility (robust against multiple mounts and existing AMD loader)
const loadMonacoEditor = () => {
  return new Promise((resolve, reject) => {
    try {
      // Already loaded
      if (w.monaco && w._monacoLoaded) {
        return resolve(w.monaco);
      }

      // If currently loading, wait until it finishes
      if (w._monacoLoading) {
        const checkInterval = setInterval(() => {
          if (w.monaco && w._monacoLoaded) {
            clearInterval(checkInterval);
            resolve(w.monaco);
          }
        }, 100);
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('Monaco loading timeout'));
        }, 15000);
        return;
      }

      // Function to configure AMD require and load editor main
      const loadWithRequire = () => {
        try {
          if (!w.require) {
            throw new Error('AMD loader not available');
          }
          w.require.config({
            paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }
          });
          w.require(['vs/editor/editor.main'], () => {
            w._monacoLoaded = true;
            w._monacoLoading = false;
            resolve(w.monaco);
          });
        } catch (err) {
          w._monacoLoading = false;
          reject(err);
        }
      };

      // Start loading
      w._monacoLoading = true;

      // If AMD loader is already present (e.g., another page added the script), use it
      if (w.require && typeof w.require === 'function') {
        return loadWithRequire();
      }

      // Otherwise, inject the AMD loader script
      /** @type {HTMLScriptElement|null} */
      let script = document.querySelector('script[src*="loader.min.js"]');
      if (!script) {
        const newScript = /** @type {HTMLScriptElement} */ (document.createElement('script'));
        newScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
        newScript.crossOrigin = 'anonymous';
        newScript.referrerPolicy = 'no-referrer';
        newScript.onload = loadWithRequire;
        newScript.onerror = () => {
          w._monacoLoading = false;
          reject(new Error('Failed to load Monaco AMD loader'));
        };
        document.head.appendChild(newScript);
      } else {
        // Script tag exists; wait a tick and attempt to use it
        const waitForRequire = setInterval(() => {
          if (w.require) {
            clearInterval(waitForRequire);
            loadWithRequire();
          }
        }, 50);
        setTimeout(() => {
          clearInterval(waitForRequire);
          if (!w.require) {
            w._monacoLoading = false;
            reject(new Error('AMD loader present but not initialized'));
          }
        }, 5000);
      }
    } catch (e) {
      w._monacoLoading = false;
      reject(e);
    }
  });
};

const MonacoCodeEditor = ({ 
  language = 'python', 
  onLanguageChange, 
  value, 
  onChange,
  height = '400px',
  showLanguageSelector = true,
  allowedLanguages = null // Array of allowed languages, null means all languages
}) => {
  const [currentLanguage, setCurrentLanguage] = useState(language || 'python');
  const [code, setCode] = useState('');
  const [monacoLoaded, setMonacoLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const monacoRef = useRef(null);
  const containerRef = useRef(null);

  // Sync currentLanguage with language prop
  useEffect(() => {
    if (language && language !== currentLanguage) {
      setCurrentLanguage(language);
    }
  }, [language, currentLanguage]);


  // Initialize Monaco Editor
  useEffect(() => {
    let mounted = true;

    const initMonaco = async () => {
      try {
        setIsLoading(true);
        const monaco = await loadMonacoEditor();
        
        if (!mounted || !containerRef.current) return;
        
        // Define enhanced dark theme with comprehensive syntax highlighting
        monaco.editor.defineTheme('enhanced-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            // Default text
            { token: '', foreground: 'D4D4D4' },
            
            // Comments - Green
            { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
            { token: 'comment.line', foreground: '6A9955', fontStyle: 'italic' },
            { token: 'comment.block', foreground: '6A9955', fontStyle: 'italic' },
            { token: 'comment.line.double-slash', foreground: '6A9955', fontStyle: 'italic' },
            
            // Keywords - Blue
            { token: 'keyword', foreground: '569CD6' },
            { token: 'keyword.control', foreground: '569CD6' },
            { token: 'keyword.operator', foreground: '569CD6' },
            { token: 'keyword.other', foreground: '569CD6' },
            { token: 'storage.type', foreground: '569CD6' },
            { token: 'storage.modifier', foreground: '569CD6' },
            
            // Preprocessor directives - Purple
            { token: 'keyword.control.directive', foreground: 'C586C0' },
            { token: 'meta.preprocessor', foreground: 'C586C0' },
            { token: 'meta.preprocessor.include', foreground: 'C586C0' },
            
            // Types and classes - Teal
            { token: 'entity.name.type', foreground: '4EC9B0' },
            { token: 'entity.name.class', foreground: '4EC9B0' },
            { token: 'support.type', foreground: '4EC9B0' },
            { token: 'storage.type.primitive', foreground: '569CD6' },
            
            // Strings - Orange
            { token: 'string', foreground: 'CE9178' },
            { token: 'string.quoted', foreground: 'CE9178' },
            { token: 'string.quoted.double', foreground: 'CE9178' },
            { token: 'string.quoted.single', foreground: 'CE9178' },
            { token: 'string.template', foreground: 'CE9178' },
            
            // Numbers - Light Green
            { token: 'constant.numeric', foreground: 'B5CEA8' },
            { token: 'number', foreground: 'B5CEA8' },
            
            // Functions - Yellow
            { token: 'entity.name.function', foreground: 'DCDCAA' },
            { token: 'support.function', foreground: 'DCDCAA' },
            { token: 'meta.function-call', foreground: 'DCDCAA' },
            
            // Variables - Light Blue
            { token: 'variable', foreground: '9CDCFE' },
            { token: 'variable.parameter', foreground: '9CDCFE' },
            { token: 'variable.other', foreground: '9CDCFE' },
            
            // Operators and punctuation
            { token: 'keyword.operator', foreground: 'D4D4D4' },
            { token: 'punctuation', foreground: 'D4D4D4' },
            
            // Delimiters - Gold
            { token: 'delimiter.bracket', foreground: 'FFD700' },
            { token: 'delimiter.parenthesis', foreground: 'FFD700' },
            { token: 'delimiter.square', foreground: 'FFD700' },
            { token: 'delimiter.curly', foreground: 'FFD700' },
          ],
          colors: {
            'editor.background': '#1E1E1E',
            'editor.foreground': '#D4D4D4',
            'editor.lineHighlightBackground': '#2A2A2A',
            'editorLineNumber.foreground': '#BBBBBB',
            'editorLineNumber.activeForeground': '#FFFFFF',
            'editor.selectionBackground': '#264F78',
            'editor.inactiveSelectionBackground': '#3A3D41',
            'editorCursor.foreground': '#AEAFAD',
            'editorWhitespace.foreground': '#404040',
            'editorIndentGuide.background': '#404040',
            'editorIndentGuide.activeBackground': '#707070',
            'editorBracketMatch.background': '#0064001a',
            'editorBracketMatch.border': '#888888',
          }
        });

        // Get initial code value
        const initialCode = value || LANGUAGE_CONFIGS[currentLanguage].template;

        // Create Monaco Editor
        monacoRef.current = monaco.editor.create(containerRef.current, {
          value: initialCode,
          language: LANGUAGE_CONFIGS[currentLanguage].monacoLang,
          theme: 'enhanced-dark',
          fontSize: 14,
          lineHeight: 21,
          fontFamily: '"Fira Code", "SF Mono", Monaco, Consolas, "Courier New", monospace',
          lineNumbers: 'on',
          lineNumbersMinChars: 4,
          glyphMargin: false,
          lineDecorationsWidth: 0,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: 'off',
          renderWhitespace: 'selection',
          renderControlCharacters: false,
          fontLigatures: true,
          cursorBlinking: 'blink',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          mouseWheelZoom: true,
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showFunctions: true,
          },
          foldingStrategy: 'indentation',
          showFoldingControls: 'mouseover',
          matchBrackets: 'always',
          renderLineHighlight: 'all'
        });

        // Add custom CSS for better line number styling and alignment
        const style = document.createElement('style');
        style.textContent = `
          .monaco-editor .margin-view-overlays .line-numbers {
            padding-left: 8px !important;
            padding-right: 8px !important;
            text-align: left !important;
            font-weight: 400 !important;
            line-height: 21px !important;
            height: 21px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            background: transparent !important;
          }
          .monaco-editor .margin-view-overlays {
            background: transparent !important;
            border-right: none !important;
          }
          .monaco-editor .view-lines .view-line {
            line-height: 21px !important;
            height: 21px !important;
          }
          .monaco-editor .lines-content {
            line-height: 21px !important;
          }
        `;
        if (!document.querySelector('style[data-monaco-line-numbers]')) {
          style.setAttribute('data-monaco-line-numbers', 'true');
          document.head.appendChild(style);
        }

        // Set up event listeners
        monacoRef.current.onDidChangeModelContent(() => {
          const newValue = monacoRef.current.getValue();
          setCode(newValue);
          if (onChange) {
            onChange(newValue);
          }
        });

        setCode(initialCode);
        setMonacoLoaded(true);
        setIsLoading(false);

        console.log('Monaco Editor initialized successfully with language:', LANGUAGE_CONFIGS[currentLanguage].monacoLang);
        
      } catch (error) {
        console.error('Failed to load Monaco Editor:', error);
        setIsLoading(false);
        setMonacoLoaded(false);
      }
    };

    initMonaco();

    return () => {
      mounted = false;
      if (monacoRef.current) {
        try {
          monacoRef.current.dispose();
          monacoRef.current = null;
        } catch (error) {
          console.error('Monaco Editor disposal error:', error);
        }
      }
    };
  }, []);

  // Handle language changes
  useEffect(() => {
    if (monacoRef.current && monacoLoaded && language && currentLanguage !== language) {
      try {
        const newLanguage = LANGUAGE_CONFIGS[language];
        if (!newLanguage) {
          console.error('Invalid language:', language);
          return;
        }
        
        const model = monacoRef.current.getModel();
        
        if (model && w.monaco) {
          console.log('Changing language from', currentLanguage, 'to', language);
          
          // Change the language mode
          w.monaco.editor.setModelLanguage(model, newLanguage.monacoLang);
          
          // Update the code content with new template if:
          // 1. No custom value is provided from parent, OR
          // 2. Current code is empty or just contains generic placeholder text, OR
          // 3. Current code is a template from another language
          const currentCode = monacoRef.current.getValue();
          const isGenericPlaceholder = !currentCode || 
            currentCode.trim() === '' || 
            currentCode.trim() === '// Write your code here' ||
            currentCode.trim() === '# Write your code here' ||
            currentCode.includes('// Write your code here') ||
            currentCode.includes('# Write your code here') ||
            currentCode.includes('public class Main') ||
            currentCode.includes('#include <iostream>') ||
            (currentCode.trim().length < 50 && (
              currentCode.includes('Write your code here') ||
              currentCode.includes('public static void main') ||
              currentCode.includes('int main()') ||
              currentCode.includes('def ') ||
              currentCode.includes('function ')
            ));
            
          if (!value || isGenericPlaceholder) {
            console.log('Updating template to:', newLanguage.name);
            monacoRef.current.setValue(newLanguage.template);
            setCode(newLanguage.template);
            // Notify parent component of the change
            if (onChange) {
              onChange(newLanguage.template);
            }
          }
          
          setCurrentLanguage(language);
          console.log('Language changed to:', newLanguage.monacoLang);
        }
      } catch (error) {
        console.error('Monaco Editor language change error:', error);
      }
    }
  }, [language, monacoLoaded, value, onChange, currentLanguage]);

  // Handle external value changes
  useEffect(() => {
    if (monacoRef.current && monacoLoaded && value !== undefined && value !== code) {
      monacoRef.current.setValue(value);
      setCode(value);
    }
  }, [value, monacoLoaded, code]);

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };

  return (
    <div style={{ height, borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #4b5563' }}>
      {showLanguageSelector && (
        <div style={{ 
          background: '#374151', 
          padding: '8px 16px', 
          borderBottom: '1px solid #4b5563',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>
            Code Editor
          </span>
          <select
            value={currentLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={{
              background: '#4b5563',
              color: '#ffffff',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {Object.entries(LANGUAGE_CONFIGS)
              .filter(([key]) => {
                if (!allowedLanguages || allowedLanguages === null) return true;
                if (!Array.isArray(allowedLanguages)) return true;
                return allowedLanguages.includes(key);
              })
              .map(([key, config]) => (
                <option key={key} value={key}>{config.name}</option>
              ))}
          </select>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        style={{ 
          height: showLanguageSelector ? 'calc(100% - 45px)' : '100%',
          background: '#1E1E1E'
        }}
      >
        {isLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            background: '#1E1E1E',
            color: '#D4D4D4'
          }}>
            <div>
              <div style={{ marginBottom: '8px' }}>Loading Monaco Editor...</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                Initializing syntax highlighting for {LANGUAGE_CONFIGS[currentLanguage].name}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonacoCodeEditor;
