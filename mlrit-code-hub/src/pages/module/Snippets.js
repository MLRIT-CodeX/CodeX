import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModuleNavigationHeader from '../../components/ModuleNavigationHeader';
import ModuleNavigationFooter from '../../components/ModuleNavigationFooter';
import { useModuleData } from '../../hooks/useModuleData';
import './Snippets.css';

const Snippets = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  // ✅ Use shared hook for consistent fetching
  const { module, loading, error } = useModuleData(courseId, moduleId);

  const prevPath = `/courses/${courseId}/module/${moduleId}/theory`;
  const nextPath = `/courses/${courseId}/module/${moduleId}/lecture`;

  // ✅ Loading state
  if (loading) {
    return (
      <div className="snippets-loading-container">
        <div className="loading-spinner"></div>
        <p>Loading snippets...</p>
      </div>
    );
  }

  // ✅ Error / Missing module
  if (error || !module) {
    return (
      <div className="snippets-loading-container">
        <div className="error-box">
          <h2>Error</h2>
          <p>{error || 'Module not found'}</p>
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="back-button"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  // ✅ Fallback if module has no snippets
  const snippets =
    Array.isArray(module?.snippets) && module.snippets.length > 0
      ? module.snippets
      : [
          {
            title: 'Python Basics',
            code: `print("Hello, World!")`,
            explanation: 'This prints a greeting message to the console.',
          },
          {
            title: 'Variables in Python',
            code: `name = "Alice"\nprint("Hello", name)`,
            explanation: 'This snippet shows how to use a variable and print it.',
          },
        ];

  return (
    <div className="snippets-container">
      <ModuleNavigationHeader 
        currentTopic="snippets"
        moduleTitle={module?.title || 'Module'}
        courseTitle="Python Programming"
      />
      
      <div className="snippets-main">
        <div className="snippets-content">
          {snippets.map((snippet, index) => (
            <div key={index} className="snippet-card">
              <h3>{snippet.title}</h3>
              <pre className="snippet-code">
                <code>{snippet.code}</code>
              </pre>
              <p className="snippet-explanation">{snippet.explanation}</p>
            </div>
          ))}
        </div>
      </div>
      
      <ModuleNavigationFooter 
        currentTopic="snippets"
      />
    </div>
  );
};

export default Snippets;
