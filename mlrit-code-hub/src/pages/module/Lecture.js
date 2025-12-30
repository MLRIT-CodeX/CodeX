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
import ModuleNavigationHeader from '../../components/ModuleNavigationHeader';
import ModuleNavigationFooter from '../../components/ModuleNavigationFooter';
import { useModuleData } from '../../hooks/useModuleData';
import './Lecture.css';

const Lecture = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  // ✅ Fetch data via shared hook
  const { module, loading, error } = useModuleData(courseId, moduleId);

  const [expandedSections, setExpandedSections] = useState(new Set(['introduction']));

  // ✅ Navigation flow
  const prevPath = `/courses/${courseId}/module/${moduleId}/snippets`;
  const nextPath = `/courses/${courseId}/module/${moduleId}/mcq`;

  // ✅ Toggle expand/collapse
  const toggleSection = (type) => {
    const newExpanded = new Set(expandedSections);
    newExpanded.has(type) ? newExpanded.delete(type) : newExpanded.add(type);
    setExpandedSections(newExpanded);
  };

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
  const lectureData = module?.lecture || null;
  
  console.log('=== LECTURE DEBUG ===');
  console.log('Module:', module);
  console.log('Lecture data:', lectureData);
  console.log('Lectures array:', lectureData?.lectures);

  // If no lecture data, show message
  if (!lectureData || !lectureData.lectures || lectureData.lectures.length === 0) {
    return (
      <div className="lecture-layout">
        <ModuleNavigationHeader 
          currentTopic="lecture"
          moduleTitle={module?.title || 'Module'}
          courseTitle="Python Programming"
        />
        
        <div className="lecture-main">
          <div className="lecture-content">
            <div className="lecture-empty">
              <BookOpen size={64} style={{ opacity: 0.3 }} />
              <h2>No Lecture Content Available</h2>
              <p>This module doesn't have lecture content yet.</p>
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="back-button"
              >
                Back to Course
              </button>
            </div>
          </div>
        </div>
        
        <ModuleNavigationFooter currentTopic="lecture" />
      </div>
    );
  }



  /* ======================================
     ✅ Render
     ====================================== */
  return (
    <div className="lecture-layout">
      <ModuleNavigationHeader 
        currentTopic="lecture"
        moduleTitle={module?.title || 'Module'}
        courseTitle="Python Programming"
      />
      
      <div className="lecture-main">
        <div className="lecture-content">
          <div className="lecture-header">
            <h1>{lectureData.module || module.title}</h1>
            {lectureData.estimatedDuration && (
              <span className="duration-badge">{lectureData.estimatedDuration}</span>
            )}
          </div>

          {/* ✅ Lecture Topics */}
          <div className="lecture-sections">
            {lectureData.lectures.map((lecture, idx) => {
              const sectionType = `lecture-${idx}`;
              const isExpanded = expandedSections.has(sectionType);

              return (
                <div key={sectionType} className="lecture-section">
                  <div
                    className="section-header"
                    onClick={() => toggleSection(sectionType)}
                  >
                    <div className="section-info">
                      <div className="section-icon">
                        <BookOpen size={20} />
                      </div>
                      <div className="section-title-area">
                        <h3 className="section-title">{lecture.topic}</h3>
                      </div>
                    </div>
                    <div className="section-controls">
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
                      {/* Definition */}
                      {lecture.content?.definition && (
                        <div className="content-block">
                          <h4 className="block-title">
                            <AlertCircle size={18} />
                            Definition
                          </h4>
                          <div className="block-content">
                            {Array.isArray(lecture.content.definition) ? (
                              <ul>
                                {lecture.content.definition.map((def, i) => (
                                  <li key={i}>{def}</li>
                                ))}
                              </ul>
                            ) : (
                              <p>{lecture.content.definition}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Syntax */}
                      {lecture.content?.syntax && (
                        <div className="content-block">
                          <h4 className="block-title">
                            <Code size={18} />
                            Syntax
                          </h4>
                          <pre className="syntax-code">
                            <code>{lecture.content.syntax}</code>
                          </pre>
                        </div>
                      )}

                      {/* Examples */}
                      {lecture.content?.examples && lecture.content.examples.length > 0 && (
                        <div className="content-block">
                          <h4 className="block-title">
                            <Code size={18} />
                            Examples
                          </h4>
                          <div className="examples-grid">
                            {lecture.content.examples.map((example, i) => (
                              <div key={i} className="example-card">
                                <div className="example-header">
                                  <h5>{example.title}</h5>
                                  {example.description && (
                                    <p className="example-desc">{example.description}</p>
                                  )}
                                </div>
                                <pre className="example-code">
                                  <code>{example.code}</code>
                                </pre>
                                {example.explanation && (
                                  <div className="example-explanation">
                                    <strong>Explanation:</strong>
                                    {Array.isArray(example.explanation) ? (
                                      <ul>
                                        {example.explanation.map((exp, j) => (
                                          <li key={j}>{exp}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p>{example.explanation}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Key Takeaways */}
                      {lecture.content?.keyTakeaways && lecture.content.keyTakeaways.length > 0 && (
                        <div className="content-block">
                          <h4 className="block-title">
                            <Lightbulb size={18} />
                            Key Takeaways
                          </h4>
                          <ul className="takeaways-list">
                            {lecture.content.keyTakeaways.map((takeaway, i) => (
                              <li key={i}>
                                <CheckCircle size={16} />
                                {takeaway}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Practice Section */}
                      {lecture.content?.practiceSection && (
                        <div className="content-block practice-block">
                          <h4 className="block-title">
                            <Star size={18} />
                            Ready to Practice?
                          </h4>
                          <div className="practice-info">
                            <p>{lecture.content.practiceSection.description}</p>
                            <div className="practice-stats">
                              {lecture.content.practiceSection.mcqs && (
                                <span className="practice-stat">
                                  📝 {lecture.content.practiceSection.mcqs}
                                </span>
                              )}
                              {lecture.content.practiceSection.coding_challenges && (
                                <span className="practice-stat">
                                  💻 {lecture.content.practiceSection.coding_challenges}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <ModuleNavigationFooter currentTopic="lecture" />
    </div>
  );
};

export default Lecture;
