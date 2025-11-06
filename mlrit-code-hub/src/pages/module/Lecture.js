import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Lightbulb,
  Code,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import CourseSidebar from '../../components/CourseSidebar';
import ContentHeader from '../../components/ContentHeader';
import { useModuleData } from '../../hooks/useModuleData';
import './Lecture.css';

const Lecture = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  // ✅ Fetch data via shared hook
  const { module, loading, error } = useModuleData(courseId, moduleId);

  const [expandedSections, setExpandedSections] = useState(new Set(['introduction']));
  const [completedSections, setCompletedSections] = useState(new Set());

  // ✅ Navigation flow
  const prevPath = `/courses/${courseId}/module/${moduleId}/snippets`;
  const nextPath = `/courses/${courseId}/module/${moduleId}/mcq`;

  // ✅ Section Icons
  const getSectionIcon = (type) => {
    const icons = {
      introduction: <BookOpen size={20} />,
      definitions: <AlertCircle size={20} />,
      examples: <Code size={20} />,
      best_practices: <Star size={20} />,
      takeaways: <Lightbulb size={20} />
    };
    return icons[type] || <BookOpen size={20} />;
  };

  // ✅ Section Title
  const getSectionTitle = (type) => {
    const titles = {
      introduction: 'Introduction',
      definitions: 'Key Definitions',
      examples: 'Real-Time Examples',
      best_practices: 'Best Practices',
      takeaways: 'Key Takeaways'
    };
    return titles[type] || type?.charAt(0).toUpperCase() + type?.slice(1);
  };

  // ✅ Toggle expand/collapse
  const toggleSection = (type) => {
    const newExpanded = new Set(expandedSections);
    newExpanded.has(type) ? newExpanded.delete(type) : newExpanded.add(type);
    setExpandedSections(newExpanded);
  };

  // ✅ Mark as completed
  const markSectionComplete = (type) => {
    const newCompleted = new Set(completedSections);
    newCompleted.add(type);
    setCompletedSections(newCompleted);
  };

  // ✅ Mock data for modules without lecture
  const getMockLectureData = () => ({
    moduleTitle: 'Python Basics',
    lectures: [
      {
        type: 'introduction',
        content: `
          <p>Welcome to the Python Basics Lecture! In this section, you'll learn the fundamentals of Python programming.</p>
          <ul>
            <li>Python Syntax</li>
            <li>Variables and Data Types</li>
            <li>Basic I/O</li>
          </ul>`
      },
      {
        type: 'examples',
        content: `
          <pre><code># Example: Simple Calculator
a = 5
b = 10
print("Sum:", a + b)</code></pre>`
      },
      {
        type: 'takeaways',
        content: `
          <p>✅ Python is easy to learn and highly versatile.</p>
          <p>✅ Great for data science, web development, and automation.</p>`
      }
    ],
    codeExamples: [
      {
        title: 'Print Function',
        language: 'python',
        code: `print("Hello, World!")`,
        explanation: 'This prints a greeting message to the console.'
      }
    ]
  });

  /* ======================================
     🌀 Loading & Error Handling
     ====================================== */
  if (loading) {
    return (
      <div className="lecture-container">
        <div className="lecture-loading">
          <div className="loading-spinner"></div>
          <p>Loading lecture content...</p>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="lecture-container">
        <div className="lecture-error">
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

  /* ======================================
     ✅ Lecture Data Extraction
     ====================================== */
  const lectureData =
    module?.lecture?.lectures?.length > 0
      ? module.lecture
      : getMockLectureData();

  const progressPercent = Math.round(
    (completedSections.size / (lectureData.lectures.length || 1)) * 100
  );

  /* ======================================
     ✅ Render
     ====================================== */
  return (
    <div className="lecture-layout">
      <CourseSidebar courseId={courseId} currentModule={moduleId} />

      <div className="lecture-main">
        <ContentHeader
          title="Interactive Lecture"
          subtitle={module.title}
          prevPath={prevPath}
          nextPath={nextPath}
          currentTopic="Lecture"
        />

        <div className="lecture-content">
          {/* ✅ Progress Tracker */}
          <div className="lecture-progress">
            <div className="progress-header">
              <h3>Lecture Progress</h3>
              <span className="progress-percentage">{progressPercent}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {completedSections.size} of {lectureData.lectures.length} sections
              completed
            </p>
          </div>

          {/* ✅ Lecture Sections */}
          <div className="lecture-sections">
            {lectureData.lectures.map((section, idx) => {
              const sectionType = section?.type || `section-${idx}`;
              const isExpanded = expandedSections.has(sectionType);
              const isCompleted = completedSections.has(sectionType);

              return (
                <div
                  key={sectionType}
                  className={`lecture-section ${isCompleted ? 'completed' : ''}`}
                >
                  <div
                    className="section-header"
                    onClick={() => toggleSection(sectionType)}
                  >
                    <div className="section-info">
                      <div className="section-icon">
                        {getSectionIcon(sectionType)}
                      </div>
                      <div className="section-title-area">
                        <h3 className="section-title">
                          {getSectionTitle(sectionType)}
                        </h3>
                        <span className="section-number">
                          Section {idx + 1}
                        </span>
                      </div>
                    </div>
                    <div className="section-controls">
                      {isCompleted && (
                        <CheckCircle size={20} className="completed-icon" />
                      )}
                      <div className="expand-icon">
                        {isExpanded ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="section-content">
                      <div
                        className="content-body"
                        dangerouslySetInnerHTML={{
                          __html:
                            section.content ||
                            '<p>No content available for this section.</p>'
                        }}
                      />
                      {!isCompleted && (
                        <button
                          className="complete-button"
                          onClick={() => markSectionComplete(sectionType)}
                        >
                          <CheckCircle size={16} /> Mark as Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ✅ Code Examples Section */}
          {lectureData.codeExamples?.length > 0 && (
            <div className="code-examples-section">
              <h3 className="examples-title">Code Examples</h3>
              <div className="code-examples-grid">
                {lectureData.codeExamples.map((example, index) => (
                  <div key={index} className="code-example-card">
                    <div className="example-header">
                      <h4 className="example-title">{example.title}</h4>
                      <span className="language-badge">
                        {example.language || 'python'}
                      </span>
                    </div>
                    <pre className="example-code">
                      <code>{example.code}</code>
                    </pre>
                    <div className="example-explanation">
                      <p>{example.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lecture;
