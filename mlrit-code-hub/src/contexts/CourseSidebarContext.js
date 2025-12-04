import React, { createContext, useContext, useState, useEffect } from 'react';

const CourseSidebarContext = createContext(null);

export const useCourseSidebar = () => {
  const context = useContext(CourseSidebarContext);
  if (!context) {
    throw new Error('useCourseSidebar must be used within a CourseSidebarProvider');
  }
  return context;
};

export const CourseSidebarProvider = ({ children }) => {
  const [sidebarState, setSidebarState] = useState({});

  const getSidebarState = (courseId) => {
    return sidebarState[courseId] || {
      modules: [],
      courseTitle: '',
      expandedModules: new Set(),
      isCollapsed: false,
      scrollPosition: 0,
      isLoading: true
    };
  };

  const updateSidebarState = (courseId, updates) => {
    setSidebarState(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        ...updates
      }
    }));
  };

  const setExpandedModules = (courseId, expandedModules) => {
    updateSidebarState(courseId, { expandedModules });
  };

  const setIsCollapsed = (courseId, isCollapsed) => {
    updateSidebarState(courseId, { isCollapsed });
  };

  const setScrollPosition = (courseId, scrollPosition) => {
    updateSidebarState(courseId, { scrollPosition });
  };

  const setModulesData = (courseId, modules, courseTitle) => {
    updateSidebarState(courseId, { 
      modules, 
      courseTitle, 
      isLoading: false 
    });
  };

  const value = {
    getSidebarState,
    updateSidebarState,
    setExpandedModules,
    setIsCollapsed,
    setScrollPosition,
    setModulesData
  };

  return (
    <CourseSidebarContext.Provider value={value}>
      {children}
    </CourseSidebarContext.Provider>
  );
};