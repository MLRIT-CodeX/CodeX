import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ContentHeader.css';

const ContentHeader = ({
  title,
  subtitle,
  prevPath,
  nextPath,
  moduleId,
  currentTopic
}) => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    if (path) navigate(path);
  };

  return (
    <div className="content-header">
      <div className="content-header-container">
        <div className="header-content">
          {/* Left: Title & Subtitle */}
          <div className="header-text">
            <h1 className="header-title">{title}</h1>
            {subtitle && <p className="header-subtitle">{subtitle}</p>}
          </div>

          {/* Right: Navigation Buttons */}
          <div className="header-navigation">
            <button
              className={`nav-button prev ${!prevPath ? 'disabled' : ''}`}
              onClick={() => handleNavigation(prevPath)}
              disabled={!prevPath}
            >
              <ChevronLeft size={18} />
              <span>Previous</span>
            </button>

            <button
              className={`nav-button next ${!nextPath ? 'disabled' : ''}`}
              onClick={() => handleNavigation(nextPath)}
              disabled={!nextPath}
            >
              <span>Next</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        {(moduleId || currentTopic) && (
          <div className="breadcrumb">
            {moduleId && <span className="breadcrumb-item">Module {moduleId}</span>}
            {currentTopic && (
              <>
                <span className="breadcrumb-separator">›</span>
                <span className="breadcrumb-item active">{currentTopic}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentHeader;
