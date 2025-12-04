import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Code, 
  MessageSquare, 
  HelpCircle, 
  Zap,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import './ModuleNavigationHeader.css';

const ModuleNavigationHeader = ({ 
  currentTopic, 
  moduleTitle, 
  courseTitle
}) => {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams();

  // Define the navigation sequence for modules
  const moduleTopics = [
    { 
      id: 'theory', 
      label: 'Theory', 
      icon: BookOpen, 
      path: `/courses/${courseId}/module/${moduleId}/theory`,
      description: 'Learn concepts'
    },
    { 
      id: 'snippets', 
      label: 'Snippets', 
      icon: Code, 
      path: `/courses/${courseId}/module/${moduleId}/snippets`,
      description: 'Code examples'
    },
    { 
      id: 'lecture', 
      label: 'Lecture', 
      icon: MessageSquare, 
      path: `/courses/${courseId}/module/${moduleId}/lecture`,
      description: 'Video content'
    },
    { 
      id: 'mcq', 
      label: 'MCQs', 
      icon: HelpCircle, 
      path: `/courses/${courseId}/module/${moduleId}/mcq`,
      description: 'Practice questions'
    },
    { 
      id: 'challenges', 
      label: 'Challenges', 
      icon: Zap, 
      path: `/courses/${courseId}/module/${moduleId}/challenges`,
      description: 'Coding challenges'
    }
  ];

  const currentIndex = moduleTopics.findIndex(topic => topic.id === currentTopic);
  const previousTopic = currentIndex > 0 ? moduleTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex < moduleTopics.length - 1 ? moduleTopics[currentIndex + 1] : null;

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleHomeNavigation = () => {
    navigate(`/courses/${courseId}`);
  };

  const getCurrentTopicInfo = () => {
    return moduleTopics.find(topic => topic.id === currentTopic) || moduleTopics[0];
  };

  const currentTopicInfo = getCurrentTopicInfo();
  const IconComponent = currentTopicInfo.icon;

  return (
    <div className="module-nav-header">
      {/* Left Section - Course Navigation */}
      <div className="nav-header-left">
        <div className="course-info">
          <span className="course-title">{courseTitle}</span>
          <span className="module-title">{moduleTitle}</span>
        </div>
      </div>

      {/* Center Section - Current Topic */}
      <div className="nav-header-center">
        <div className="current-topic-display">
          <div className="topic-icon-wrapper">
            <IconComponent size={20} />
          </div>
          <div className="topic-info">
            <h2 className="topic-title">{currentTopicInfo.label}</h2>
            <p className="topic-description">{currentTopicInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Right Section - Navigation Controls */}
      <div className="nav-header-right">
        <div className="nav-controls">
          <button 
            onClick={() => handleNavigation(previousTopic.path)}
            disabled={!previousTopic}
            className="nav-control prev"
            title={previousTopic ? `Previous: ${previousTopic.label}` : 'No previous topic'}
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
            {previousTopic && (
              <div className="nav-tooltip">
                <previousTopic.icon size={14} />
                <span>{previousTopic.label}</span>
              </div>
            )}
          </button>
          
          <span className="nav-divider">|</span>
          
          <button 
            onClick={() => handleNavigation(nextTopic.path)}
            disabled={!nextTopic}
            className="nav-control next"
            title={nextTopic ? `Next: ${nextTopic.label}` : 'No next topic'}
          >
            <span>Next</span>
            <ChevronRight size={16} />
            {nextTopic && (
              <div className="nav-tooltip">
                <nextTopic.icon size={14} />
                <span>{nextTopic.label}</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleNavigationHeader;