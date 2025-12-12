import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditProfile.css';

const EditProfile = ({ user, userId, onCancel, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    college: '',
    department: '',
    rollNumber: '',
    phoneNumber: '',
    socialProfiles: { linkedin: '', instagram: '', facebook: '' },
    codingProfiles: {
      leetcode: '',
      codechef: '',
      github: '',
      codeforces: '',
      hackerrank: '',
      geeksforgeeks: '',
    },
    skills: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current profile data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Authentication required. Please login again.');
          setIsLoading(false);
          return;
        }

        // Backend should return the current logged-in user's profile
        const { data } = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          college: data.college || '',
          department: data.department || '',
          rollNumber: data.rollNumber || '',
          phoneNumber: data.phoneNumber || '',
          socialProfiles: {
            linkedin: data.socialProfiles?.linkedin || '',
            instagram: data.socialProfiles?.instagram || '',
            facebook: data.socialProfiles?.facebook || '',
          },
          codingProfiles: {
            leetcode: data.codingProfiles?.leetcode || '',
            codechef: data.codingProfiles?.codechef || '',
            github: data.codingProfiles?.github || '',
            codeforces: data.codingProfiles?.codeforces || '',
            hackerrank: data.codingProfiles?.hackerrank || '',
            geeksforgeeks: data.codingProfiles?.geeksforgeeks || '',
          },
          skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
        alert('Failed to load profile details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]); // userId not strictly needed, but harmless; token identifies user

  const handleChange = (e, section) => {
    const { name, value } = e.target;
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {};
    
    // Only include fields that have actual values to avoid validation errors
    if (formData.college) updatedData.college = formData.college;
    if (formData.department) updatedData.department = formData.department;
    if (formData.rollNumber) updatedData.rollNumber = formData.rollNumber;
    if (formData.phoneNumber) updatedData.phoneNumber = formData.phoneNumber;
    
    // Handle nested objects - only include if they have values
    if (formData.socialProfiles && Object.keys(formData.socialProfiles).length > 0) {
      updatedData.socialProfiles = formData.socialProfiles;
    }
    
    if (formData.codingProfiles && Object.keys(formData.codingProfiles).length > 0) {
      updatedData.codingProfiles = formData.codingProfiles;
    }
    
    // Handle skills array
    if (formData.skills) {
      const skillsArray = formData.skills.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillsArray.length > 0) {
        updatedData.skills = skillsArray;
      }
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }

      const { data } = await axios.put(
        'http://localhost:5000/api/profile',
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (onSaveSuccess) {
        onSaveSuccess(data); // let parent update its user state
      }
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Update failed', err);
      alert(
        'Failed to update profile: ' +
          (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <form className="edit-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>Modify Profile Details</h2>
        <button
          type="button"
          className="close-btn"
          onClick={onCancel}
          aria-label="Close"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <p style={{ padding: '1rem' }}>Loading profile...</p>
      ) : (
        <>
          {/* BLOCK 1: ACADEMIC */}
          <h3 className="section-title">Academic Background</h3>
          <div className="grid-2-col">
            <div className="input-group">
              <label>College</label>
              <select
                name="college"
                value={formData.college}
                onChange={handleChange}
              >
                <option value="MLR Institute of Technology">
                  MLR Institute of Technology
                </option>
                <option value="Marri Laxman Reddy College">
                  Marri Laxman Reddy College
                </option>
                <option value="IARE">IARE</option>
              </select>
            </div>
            <div className="input-group">
              <label>Department</label>
              <input
                name="department"
                value={formData.department}
                onChange={handleChange}
              />
            </div>
            <div className="input-group full-width">
            <label>Roll Number</label>
            <input
            name="rollNumber"
            value={formData.rollNumber}
            onChange={(e) =>
                handleChange({
                target: {
                    name: "rollNumber",
                    value: e.target.value.toUpperCase(),
                },
                })
            }
            />
            </div>

          </div>

          {/* BLOCK 2: PERSONAL & SOCIAL */}
          <h3 className="section-title">
            Personal & Social (Usernames only for Insta/FB)
          </h3>
          <div className="grid-2-col">
            <div className="input-group">
              <label>Phone Number</label>
              <input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>LinkedIn URL</label>
              <input
                name="linkedin"
                placeholder="https://..."
                value={formData.socialProfiles.linkedin}
                onChange={(e) => handleChange(e, 'socialProfiles')}
              />
            </div>
            <div className="input-group">
              <label>Instagram Username</label>
              <input
                name="instagram"
                placeholder="@username"
                value={formData.socialProfiles.instagram}
                onChange={(e) => handleChange(e, 'socialProfiles')}
              />
            </div>
            <div className="input-group">
              <label>Facebook ID</label>
              <input
                name="facebook"
                placeholder="Username"
                value={formData.socialProfiles.facebook}
                onChange={(e) => handleChange(e, 'socialProfiles')}
              />
            </div>
          </div>

          {/* BLOCK 3: CODING */}
          <h3 className="section-title">Coding Profile Links</h3>
          <div className="grid-2-col">
            {[
              'leetcode',
              'codechef',
              'github',
              'codeforces',
              'hackerrank',
              'geeksforgeeks',
            ].map((site) => (
              <div className="input-group" key={site}>
                <label>
                  {site.charAt(0).toUpperCase() + site.slice(1)} URL
                </label>
                <input
                  name={site}
                  placeholder={`https://${site}.com/u/...`}
                  value={formData.codingProfiles[site]}
                  onChange={(e) => handleChange(e, 'codingProfiles')}
                />
              </div>
            ))}
          </div>

          {/* BLOCK 4: SKILLS */}
          <h3 className="section-title">Skills & Tech Stack</h3>
          <div className="input-group full-width">
            <label>Skills (Comma separated)</label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, Node.js, Python..."
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn">
              Save
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default EditProfile;