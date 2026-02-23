import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfileEdit.css';

const ProfileEdit = ({ user, userId, onCancel, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    profilePic: '',
    college: '',
    department: '',
    year: '',
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
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getProfilePicUrl = (pic) => {
    if (!pic) return '';
    if (pic.startsWith('http')) return pic;
    return `http://localhost:5000${pic}`;
  };

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

        const { data } = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          name: data.name || '',
          profilePic: data.profilePic || '',
          college: data.college || '',
          department: data.department || '',
          year: data.year || '',
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
        setProfilePreview(getProfilePicUrl(data.profilePic));
      } catch (err) {
        console.error('Failed to fetch profile', err);
        alert('Failed to load profile details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Add ESC key handler to close modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && onCancel) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [onCancel]);

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

  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let profilePicToSave = formData.profilePic;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }

      if (profileFile) {
        setIsUploadingPic(true);
        try {
          const picData = new FormData();
          picData.append('profilePic', profileFile);

          const uploadRes = await axios.post('http://localhost:5000/api/profile/upload-pic', picData, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
          });

          const uploadedUrl = uploadRes.data?.url;
          if (uploadedUrl) {
            profilePicToSave = uploadedUrl;
            setFormData((prev) => ({ ...prev, profilePic: uploadedUrl }));
            setProfilePreview(getProfilePicUrl(uploadedUrl));
          }
        } finally {
          setIsUploadingPic(false);
        }
      }

      const updatedData = {};
      if (formData.name) updatedData.name = formData.name;
      if (formData.college) updatedData.college = formData.college;
      if (formData.department) updatedData.department = formData.department;
      if (formData.year) updatedData.year = formData.year;
      if (formData.rollNumber) updatedData.rollNumber = formData.rollNumber;
      if (formData.phoneNumber) updatedData.phoneNumber = formData.phoneNumber;

      if (formData.socialProfiles && Object.keys(formData.socialProfiles).length > 0) {
        updatedData.socialProfiles = formData.socialProfiles;
      }

      if (formData.codingProfiles && Object.keys(formData.codingProfiles).length > 0) {
        updatedData.codingProfiles = formData.codingProfiles;
      }

      if (formData.skills) {
        const skillsArray = formData.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        if (skillsArray.length > 0) {
          updatedData.skills = skillsArray;
        }
      }

      if (profilePicToSave) {
        updatedData.profilePic = profilePicToSave;
      }

      const { data } = await axios.put('http://localhost:5000/api/profile', updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (onSaveSuccess) onSaveSuccess(data);
    } catch (err) {
      console.error('Update failed', err);
      alert('Failed to update profile: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="profile-edit-modal-overlay" onClick={onCancel}>
      <div className="profile-edit-modal-content" onClick={(e) => e.stopPropagation()}>
        <form className="profile-edit-form" onSubmit={handleSubmit}>
          <div className="profile-edit-header">
            <h2 className="profile-edit-title">Modify Profile Details</h2>
            <button type="button" className="modal-close-btn" onClick={onCancel} aria-label="Close">
              <span>×</span>
            </button>
          </div>

      {isLoading ? (
        <p style={{ padding: '1rem' }}>Loading profile...</p>
      ) : (
        <>
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" />
              </div>
              <div className="form-group">
                <label>Profile Picture</label>
                <div className="profile-pic-upload">
                  <div className="profile-pic-preview">
                    {profilePreview ? (
                      <img src={profilePreview} alt="Profile preview" />
                    ) : (
                      <div className="profile-pic-placeholder">No image</div>
                    )}
                  </div>
                  <input
                    id="profilePicInput"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="profile-file-input"
                  />
                  <label htmlFor="profilePicInput" className="file-trigger-btn">
                    Choose file
                  </label>
                  {isUploadingPic && <small>Uploading picture...</small>}
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Academic Background</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>College</label>
                <select name="college" value={formData.college} onChange={handleChange}>
                  <option value="MLR Institute of Technology">MLR Institute of Technology</option>
                  <option value="Marri Laxman Reddy College">Marri Laxman Reddy College</option>
                  <option value="IARE">IARE</option>
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <input name="department" value={formData.department} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Year</label>
                <select name="year" value={formData.year} onChange={handleChange}>
                  <option value="">Select Year</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                  <option value="2031">2031</option>
                  <option value="2032">2032</option>
                  <option value="2033">2033</option>
                  <option value="2034">2034</option>
                  <option value="2035">2035</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Roll Number</label>
                <input
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={(e) =>
                    handleChange({
                      target: { name: 'rollNumber', value: e.target.value.toUpperCase() },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Personal & Social</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Phone Number</label>
                <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>LinkedIn URL</label>
                <input
                  name="linkedin"
                  placeholder="https://..."
                  value={formData.socialProfiles.linkedin}
                  onChange={(e) => handleChange(e, 'socialProfiles')}
                />
              </div>
              <div className="form-group">
                <label>Instagram Username</label>
                <input
                  name="instagram"
                  placeholder="@username"
                  value={formData.socialProfiles.instagram}
                  onChange={(e) => handleChange(e, 'socialProfiles')}
                />
              </div>
              <div className="form-group">
                <label>Facebook ID</label>
                <input
                  name="facebook"
                  placeholder="Username"
                  value={formData.socialProfiles.facebook}
                  onChange={(e) => handleChange(e, 'socialProfiles')}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Coding Profile Links</h3>
            <div className="form-grid">
              {['leetcode', 'codechef', 'github', 'codeforces', 'hackerrank', 'geeksforgeeks'].map((site) => (
                <div className="form-group" key={site}>
                  <label>{site.charAt(0).toUpperCase() + site.slice(1)} URL</label>
                  <input
                    name={site}
                    placeholder={`https://${site}.com/u/...`}
                    value={formData.codingProfiles[site]}
                    onChange={(e) => handleChange(e, 'codingProfiles')}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Skills & Tech Stack</h3>
            <div className="form-group full-width">
              <label>Skills (Comma separated)</label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, Node.js, Python..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-save">
              Save
            </button>
          </div>
        </>
      )}
    </form>
  </div>
</div>
);
};

export default ProfileEdit;
