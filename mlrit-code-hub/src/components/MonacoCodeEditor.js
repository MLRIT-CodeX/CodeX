import React, { useEffect, useState, useRef } from 'react';

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
  javascript: {
    name: "JavaScript",
    template: "// Write your code here\n\n",
    monacoLang: "javascript",
  },
};

// Monaco Editor loader utility
const loadMonacoEditor = () => {
  return new Promise((resolve, reject) => {
    // Check if Monaco is already loaded
    if (window.monaco && window._monacoLoaded) {
      resolve(window.monaco);
      return;
    }

    // Check if Monaco is currently loading
    if (window._monacoLoading) {
      const checkInterval = setInterval(() => {
        if (window.monaco && window._monacoLoaded) {
          clearInterval(checkInterval);
          resolve(window.monaco);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Monaco loading timeout'));
      }, 10000);
      return;
    }

    // Start loading Monaco
    window._monacoLoading = true;
    
    // Check if loader script already exists
    if (!document.querySelector('script[src*="loader.min.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
      script.onload = () => {
        window.require.config({ 
          paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }
        });
        window.require(['vs/editor/editor.main'], () => {
          window._monacoLoaded = true;
          window._monacoLoading = false;
          resolve(window.monaco);
        });
      };
      script.onerror = () => {
        window._monacoLoading = false;
        reject(new Error('Failed to load Monaco'));
      };
      document.head.appendChild(script);
    }
  });
};

const MonacoCodeEditor = ({ 
  language = 'python', 
  onLanguageChange, 
  value, 
  onChange,
  height = '400px',
  showLanguageSelector = true 
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
        
        if (model && window.monaco) {
          console.log('Changing language from', currentLanguage, 'to', language);
          
          // Change the language mode
          window.monaco.editor.setModelLanguage(model, newLanguage.monacoLang);
          
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
    <div style={{ height, border: '2px solid #8b5cf6', borderRadius: '0.75rem', overflow: 'hidden' }}>
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
            {Object.entries(LANGUAGE_CONFIGS).map(([key, config]) => (
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
