import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import CourseSidebar from './CourseSidebar';
import { useCourseSidebar } from '../contexts/CourseSidebarContext';
import './CourseLayout.css';

const CourseLayout = () => {
  const { courseId, moduleId } = useParams();
  const { getSidebarState } = useCourseSidebar();
  const { isCollapsed } = getSidebarState(courseId);
  const location = useLocation();

  // Check if we're on a module test page
  const isModuleTestPage = location.pathname.endsWith('/test');

  return (
    <div className={`course-layout ${isCollapsed ? 'sidebar-collapsed' : ''} ${isModuleTestPage ? 'hide-sidebar' : ''}`}>
      {!isModuleTestPage && (
        <CourseSidebar 
          courseId={courseId} 
          currentModule={moduleId}
        />
      )}
      <div className="course-content">
        <Outlet />
      </div>
    </div>
  );
};

export default CourseLayout;