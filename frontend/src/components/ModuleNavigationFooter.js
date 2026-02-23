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
  Target
} from 'lucide-react';
import './ModuleNavigationFooter.css';

const ModuleNavigationFooter = ({ 
  currentTopic
}) => {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams();

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
  const nextTopic = currentIndex < moduleTopics.length - 1 ? moduleTopics[currentIndex + 1] : null;
  const previousTopic = currentIndex > 0 ? moduleTopics[currentIndex - 1] : null;

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleTestNavigation = () => {
    navigate(`/courses/${courseId}/module/${moduleId}/test`);
  };



  return (
    <div className="module-nav-footer">
      {/* Left - Previous Topic */}
      <div className="footer-nav-left">
        {previousTopic ? (
          <button 
            onClick={() => handleNavigation(previousTopic.path)}
            className="nav-button previous"
          >
            <ArrowLeft size={16} />
            <div className="nav-button-content">
              <span className="nav-label">Previous</span>
              <span className="nav-topic">{previousTopic.label}</span>
            </div>
          </button>
        ) : (
          <div className="nav-placeholder"></div>
        )}
      </div>

      {/* Center - Module Title */}
      <div className="footer-nav-center">
        <div className="module-title-display">
          Module Navigation
        </div>
      </div>

      {/* Right - Next Topic */}
      <div className="footer-nav-right">
        {nextTopic ? (
          <button 
            onClick={() => handleNavigation(nextTopic.path)}
            className="nav-button next"
          >
            <div className="nav-button-content">
              <span className="nav-label">Next</span>
              <span className="nav-topic">{nextTopic.label}</span>
            </div>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button 
            onClick={handleTestNavigation}
            className="nav-button finish"
          >
            <div className="nav-button-content">
              <span className="nav-label">Finish Module</span>
              <span className="nav-topic">Take Test</span>
            </div>
            <Target size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ModuleNavigationFooter;