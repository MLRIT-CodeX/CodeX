import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Home,
  BookOpen,
  Code,
  MessageSquare,
  HelpCircle,
  Zap,
  ChevronDown,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useCourseSidebar } from '../contexts/CourseSidebarContext';
import './CourseSidebar.css';

const CourseSidebar = ({ courseId, currentModule }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  
  const {
    getSidebarState,
    setExpandedModules,
    setIsCollapsed,
    setScrollPosition,
    setModulesData
  } = useCourseSidebar();

  // Get persistent state for this course
  const {
    modules,
    courseTitle,
    expandedModules,
    isCollapsed,
    scrollPosition,
    isLoading
  } = getSidebarState(courseId);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        // Only fetch if we don't have data yet or if it's loading
        if (modules.length > 0 && !isLoading) return;
        
        const res = await axios.get(`http://localhost:5000/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setModulesData(courseId, res.data.modules || [], res.data.title || 'Untitled Course');
        
        // Ensure current module is expanded when modules load
        if (currentModule) {
          const newExpanded = new Set(expandedModules);
          newExpanded.add(currentModule.toString());
          setExpandedModules(courseId, newExpanded);
        }
      } catch (err) {
        console.error('Error fetching course modules:', err);
      }
    };

    if (courseId && token) fetchModules();
  }, [courseId, token, currentModule]);

  // Restore scroll position when component mounts
  useEffect(() => {
    if (sidebarRef.current && scrollPosition > 0) {
      sidebarRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  // Save scroll position when scrolling
  const handleScroll = () => {
    if (sidebarRef.current) {
      setScrollPosition(courseId, sidebarRef.current.scrollTop);
    }
  };

  const toggleModule = (moduleId) => {
    const updated = new Set(expandedModules);
    updated.has(moduleId) ? updated.delete(moduleId) : updated.add(moduleId);
    setExpandedModules(courseId, updated);
  };

  const handleCollapse = () => {
    setIsCollapsed(courseId, !isCollapsed);
  };

  const handleNavigation = (path) => {
    console.log('🔗 Navigating to:', path);
    navigate(path);
    setIsMobileOpen(false);
  };

  const isActiveRoute = (path) => location.pathname === path;

  const getModuleTopics = (moduleId) => [
    {
      id: 'theory',
      label: 'Theory',
      icon: BookOpen,
      path: `/courses/${courseId}/module/${moduleId}/theory`
    },
    {
      id: 'snippets',
      label: 'Snippets',
      icon: Code,
      path: `/courses/${courseId}/module/${moduleId}/snippets`
    },
    {
      id: 'lecture',
      label: 'Lecture',
      icon: MessageSquare,
      path: `/courses/${courseId}/module/${moduleId}/lecture`
    },
    {
      id: 'mcqs',
      label: 'MCQs',
      icon: HelpCircle,
      path: `/courses/${courseId}/module/${moduleId}/mcq`
    },
    {
      id: 'challenges',
      label: 'Challenges',
      icon: Zap,
      path: `/courses/${courseId}/module/${moduleId}/challenges`
    }
  ];

  if (!modules.length) {
    return (
      <div className={`course-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <button
        className="mobile-sidebar-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu size={24} />
      </button>

      {isMobileOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div 
        className={`course-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
        ref={sidebarRef}
        onScroll={handleScroll}
      >
        {/* Header */}
        <div className="sidebar-header">
          <button
            className="home-button"
            onClick={() => handleNavigation(`/courses/${courseId}`)}
          >
            <Home size={20} />
            {!isCollapsed && <span>Course Home</span>}
          </button>

          <button
            className="collapse-button"
            onClick={handleCollapse}
          >
            <ChevronRight size={20} className={isCollapsed ? '' : 'rotated'} />
          </button>

          {isMobileOpen && (
            <button
              className="mobile-close-button"
              onClick={() => setIsMobileOpen(false)}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Course Title */}
        {!isCollapsed && (
          <div className="course-title">
            <h3>{courseTitle}</h3>
          </div>
        )}

        {/* Modules Navigation */}
        <div className="modules-navigation">
          {modules.map((mod, idx) => {
            if (!mod || !mod._id) return null;
            const isExpanded = expandedModules.has(mod._id.toString());
            const topics = getModuleTopics(mod._id);
            const isCurrent = currentModule && currentModule.toString() === mod._id.toString();

            return (
              <div key={mod._id} className="module-section">
                <button
                  className={`module-header ${isCurrent ? 'current' : ''}`}
                  onClick={() => toggleModule(mod._id.toString())}
                >
                  <div className="module-info">
                    <span className="module-number">{mod.order || idx + 1}</span>
                    {!isCollapsed && <span className="module-title">{mod.title}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown
                      size={16}
                      className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
                    />
                  )}
                </button>

                {isExpanded && !isCollapsed && (
                  <div className="module-topics">
                    {topics.map((topic) => {
                      const Icon = topic.icon;
                      const active = isActiveRoute(topic.path);
                      return (
                        <button
                          key={topic.id}
                          className={`topic-link ${active ? 'active' : ''}`}
                          onClick={() => handleNavigation(topic.path)}
                        >
                          <Icon size={16} />
                          <span>{topic.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="sidebar-footer">
            <div className="progress-summary">
              <span>
                Module {modules.findIndex(m => m._id === currentModule) + 1} of {modules.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CourseSidebar;
