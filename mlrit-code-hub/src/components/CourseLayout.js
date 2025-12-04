import React, { useState, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import CourseSidebar from './CourseSidebar';
import { useCourseSidebar } from '../contexts/CourseSidebarContext';
import './CourseLayout.css';

const CourseLayout = () => {
  const { courseId, moduleId } = useParams();
  const { getSidebarState } = useCourseSidebar();
  const { isCollapsed } = getSidebarState(courseId);

  return (
    <div className={`course-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <CourseSidebar 
        courseId={courseId} 
        currentModule={moduleId}
      />
      <div className="course-content">
        <Outlet />
      </div>
    </div>
  );
};

export default CourseLayout;