import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CourseSidebar from '../../components/CourseSidebar';
import ContentHeader from '../../components/ContentHeader';
import { useModuleData } from '../../hooks/useModuleData';
import './Theory.css';

/* ================================
   ✅ Fallback Mock Data
   ================================ */
const getMockTheoryData = () => ({
  textContent: `
  # Welcome to MLRIT Code Hub
  
  This module currently has no theory content. Stay tuned for updates!
  `,
  files: {}
});

const Theory = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  // ✅ Unified data fetching using shared hook
  const { module, loading, error } = useModuleData(courseId, moduleId);

  // ✅ Local UI states
  const [activeTab, setActiveTab] = useState('text');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* ================================
     ✅ Utility Functions
     ================================ */

  // Format markdown-like text
  const formatTextContent = (content) => {
    if (!content) return '';
    return content
      .replace(/```python\n([\s\S]*?)\n```/g, '<pre class="code-block"><code>$1</code></pre>')
      .replace(/```([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>')
      .replace(/^### (.*)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
      .replace(/^- (.*)/gm, '<li>$1</li>')
      .replace(/\n/g, '<br/>');
  };

  const handleSlideChange = (direction, slides) => {
    if (direction === 'next' && currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else if (direction === 'prev' && currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentSlide(0);
  };

  /* ================================
     🌀 Loading / Error Handling
     ================================ */
  if (loading) {
    return (
      <div className="theory-container">
        <div className="theory-loading">
          <div className="loading-spinner"></div>
          <p>Loading theory materials...</p>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="theory-container">
        <div className="theory-error">
          <h2>Error</h2>
          <p>{error || 'Module not found'}</p>
          <button onClick={() => navigate(`/courses/${courseId}`)} className="back-button">
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  /* ================================
     ✅ Render Content
     ================================ */
  const theory = module?.theory || getMockTheoryData();
  const pptSlides = theory.files?.ppt?.slides || [];
  const totalSlides = pptSlides.length || 0;

  return (
    <div className="theory-layout">
      <CourseSidebar courseId={courseId} currentModule={moduleId} />

      <div className="theory-main">
        <ContentHeader
          title="Theory Materials"
          subtitle={module.title}
          currentTopic="Theory"
        />

        <div className="theory-content">
          {/* ✅ Tabs */}
          <div className="theory-tabs">
            {['text', 'pdf', 'ppt', 'doc'].map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabChange(tab)}
                disabled={!theory?.files?.[tab] && tab !== 'text'}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="theory-tab-content">
            {/* ✅ TEXT TAB */}
            {activeTab === 'text' && (
              <div className="text-content">
                <div
                  className="document-content"
                  dangerouslySetInnerHTML={{
                    __html: formatTextContent(theory.textContent),
                  }}
                />
              </div>
            )}

            {/* ✅ PDF TAB */}
            {activeTab === 'pdf' && (
              <div className="pdf-content">
                <div className="pdf-header">
                  <h3>{theory.files?.pdf?.name || 'Theory Material.pdf'}</h3>
                  <a
                    href={theory.files?.pdf?.url || '#'}
                    download
                    className="download-button"
                  >
                    Download PDF
                  </a>
                </div>
                {theory.files?.pdf?.url ? (
                  <iframe
                    src={theory.files?.pdf?.url}
                    className="pdf-frame"
                    title="PDF Viewer"
                  />
                ) : (
                  <p>No PDF available.</p>
                )}
              </div>
            )}

            {/* ✅ PPT TAB */}
            {activeTab === 'ppt' && (
              <div className="ppt-content">
                <div className="ppt-header">
                  <h3>{theory.files?.ppt?.name || 'Presentation.pptx'}</h3>
                  <div className="ppt-controls">
                    <button
                      onClick={() => handleSlideChange('prev', pptSlides)}
                      disabled={currentSlide === 0}
                    >
                      Prev
                    </button>
                    <span>
                      Slide {currentSlide + 1} / {totalSlides}
                    </span>
                    <button
                      onClick={() => handleSlideChange('next', pptSlides)}
                      disabled={currentSlide >= totalSlides - 1}
                    >
                      Next
                    </button>
                    <button onClick={toggleFullscreen}>
                      {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    </button>
                  </div>
                </div>

                <div className="slide-viewer">
                  <h2>{pptSlides[currentSlide]?.title || 'Untitled Slide'}</h2>
                  <div
                    className="slide-body"
                    dangerouslySetInnerHTML={{
                      __html:
                        pptSlides[currentSlide]?.content ||
                        '<p>No content for this slide.</p>',
                    }}
                  />
                </div>
              </div>
            )}

            {/* ✅ DOC TAB */}
            {activeTab === 'doc' && (
              <div className="doc-content">
                <div className="doc-header">
                  <h3>{theory.files?.doc?.name || 'Course Document.docx'}</h3>
                  <a
                    href={theory.files?.doc?.url || '#'}
                    download
                    className="download-button"
                  >
                    Download DOC
                  </a>
                </div>
                <div className="doc-viewer">
                  <div className="document-style-content">
                    <h1>{module.title} - Study Guide</h1>
                    <p>This module covers essential theory for {module.title}.</p>
                    <h2>Estimated Duration</h2>
                    <p>{module.estimatedDuration || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Theory;
