import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Trophy, 
  Clock, 
  Users, 
  Calendar, 
  Search, 
  Filter,
  Play,
  Award,
  Target,
  Zap
} from 'lucide-react';
import './Contests.css';

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [filteredContests, setFilteredContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, ongoing, upcoming, completed
  const [filterDifficulty, setFilterDifficulty] = useState('all'); // all, easy, medium, hard

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    filterContests();
  }, [contests, searchTerm, filterStatus, filterDifficulty]);

  const fetchContests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/contests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Add sample contests if none exist
      if (response.data.length === 0) {
        const sampleContests = [
          {
            _id: '1',
            title: 'Weekly Coding Challenge',
            description: 'Test your skills with our weekly programming challenges',
            startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            duration: 120, // 2 hours
            maxParticipants: 100,
            currentParticipants: 45,
            difficulty: 'medium',
            status: 'upcoming',
            prizes: ['1st: $500', '2nd: $300', '3rd: $200']
          },
          {
            _id: '2',
            title: 'Algorithm Mastery Contest',
            description: 'Advanced algorithms and data structures challenge',
            startTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
            duration: 180, // 3 hours
            maxParticipants: 50,
            currentParticipants: 32,
            difficulty: 'hard',
            status: 'ongoing',
            prizes: ['1st: $1000', '2nd: $600', '3rd: $400']
          },
          {
            _id: '3',
            title: 'Beginner Friendly Contest',
            description: 'Perfect for those starting their coding journey',
            startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 1 week + 2 hours
            duration: 90, // 1.5 hours
            maxParticipants: 200,
            currentParticipants: 0,
            difficulty: 'easy',
            status: 'upcoming',
            prizes: ['1st: $200', '2nd: $100', '3rd: $50']
          }
        ];
        setContests(sampleContests);
      } else {
        setContests(response.data);
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
      setError('Failed to load contests');
    } finally {
      setLoading(false);
    }
  };

  const filterContests = () => {
    let filtered = contests.filter(contest => {
      const matchesSearch = contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contest.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || contest.status === filterStatus;
      const matchesDifficulty = filterDifficulty === 'all' || contest.difficulty === filterDifficulty;
      
      return matchesSearch && matchesStatus && matchesDifficulty;
    });
    
    setFilteredContests(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing': return '#10b981';
      case 'upcoming': return '#3b82f6';
      case 'completed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  if (loading) {
    return (
      <div className="contests-page">
        <Navbar />
        <div className="contests-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading contests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contests-page">
      <Navbar />
      <div className="contests-container">
        {/* Header Section */}
        <div className="contests-header">
          <div className="header-content">
            <div className="header-title">
              <Trophy className="header-icon" />
              <h1>Programming Contests</h1>
            </div>
            <p className="header-subtitle">
              Compete with fellow programmers and test your skills in exciting coding challenges
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="contests-filters">
          <div className="search-section">
            <div className="search-input-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search contests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="filter-section">
            <div className="filter-group">
              <Filter className="filter-icon" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Contests</option>
                <option value="ongoing">Ongoing</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="filter-group">
              <Target className="filter-icon" />
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contests Grid */}
        {error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={fetchContests} className="retry-btn">
              Try Again
            </button>
          </div>
        ) : filteredContests.length === 0 ? (
          <div className="no-contests-container">
            <Trophy className="no-contests-icon" />
            <h3>No contests found</h3>
            <p>Try adjusting your search or filters to find more contests.</p>
          </div>
        ) : (
          <div className="contests-grid">
            {filteredContests.map(contest => (
              <div key={contest._id} className="contest-card">
                <div className="contest-card-header">
                  <div className="contest-title-section">
                    <h3 className="contest-title">{contest.title}</h3>
                    <div className="contest-badges">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(contest.status) }}
                      >
                        {contest.status}
                      </span>
                      <span 
                        className="difficulty-badge"
                        style={{ backgroundColor: getDifficultyColor(contest.difficulty) }}
                      >
                        {contest.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="contest-card-body">
                  <p className="contest-description">{contest.description}</p>
                  
                  <div className="contest-details">
                    <div className="detail-item">
                      <Calendar className="detail-icon" />
                      <span>Starts: {formatDate(contest.startTime)}</span>
                    </div>
                    <div className="detail-item">
                      <Clock className="detail-icon" />
                      <span>Duration: {contest.duration} minutes</span>
                    </div>
                    <div className="detail-item">
                      <Users className="detail-icon" />
                      <span>{contest.currentParticipants}/{contest.maxParticipants} participants</span>
                    </div>
                  </div>

                  {contest.status === 'ongoing' && (
                    <div className="time-remaining">
                      <Zap className="time-icon" />
                      <span>{getTimeRemaining(contest.endTime)}</span>
                    </div>
                  )}

                  {contest.prizes && contest.prizes.length > 0 && (
                    <div className="prizes-section">
                      <Award className="prizes-icon" />
                      <div className="prizes-list">
                        {contest.prizes.map((prize, index) => (
                          <span key={index} className="prize-item">{prize}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="contest-card-footer">
                  <Link 
                    to={`/contest/${contest._id}`} 
                    className="contest-btn"
                  >
                    <Play className="btn-icon" />
                    {contest.status === 'ongoing' ? 'Join Contest' : 
                     contest.status === 'upcoming' ? 'View Details' : 'View Results'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contests;
