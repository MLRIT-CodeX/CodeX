import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import UserContext from '../context/UserContext';
import './ProfileEdit.css';
import { FaUserCircle, FaSave, FaTimes, FaUpload } from 'react-icons/fa';

const ProfileEdit = ({ isOpen, onClose }) => {
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [previewPic, setPreviewPic] = useState("");
  const [formData, setFormData] = useState({
    // Standalone Fields
    email: "",
    profilePic: "",
    
    // Personal Information
    personalInfo: {
      name: "",
      phoneNumber: "",
      gender: "",
      dob: ""
    },
    
    // Academic Information
    academic: {
      college: "",
      rollNumber: "",
      year: "",
      department: "",
      currentSemester: "",
      cgpa: ""
    },
    
    // Address Information
    address: {
      street: "",
      district: "",
      city: "",
      state: "",
      pincode: ""
    },
    
    // Coding Profiles
    codingProfiles: {
      leetcode: "",
      codechef: "",
      codeforces: "",
      github: "",
      linkedin: ""
    },
    
    // Professional Profiles
    profiles: {
      portfolioLink: "",
      resumeLink: ""
    },
    
    // Social Links
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: ""
    },
    
    // Skills and Interests (Arrays)
    skills: [],
    interests: []
  });

  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    // Populate form with existing user data
    setFormData({
      email: user.email || "",
      profilePic: user.profilePic || "",
      
      personalInfo: {
        name: user.personalInfo?.name || "",
        phoneNumber: user.personalInfo?.phoneNumber || "",
        gender: user.personalInfo?.gender || "",
        dob: user.personalInfo?.dob ? user.personalInfo.dob.slice(0, 10) : ""
      },
      
      academic: {
        college: user.academic?.college || "",
        rollNumber: user.academic?.rollNumber || "",
        year: user.academic?.year || "",
        department: user.academic?.department || "",
        currentSemester: user.academic?.currentSemester || "",
        cgpa: user.academic?.cgpa || ""
      },
      
      address: {
        street: user.address?.street || "",
        district: user.address?.district || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        pincode: user.address?.pincode || ""
      },
      
      codingProfiles: {
        leetcode: user.codingProfiles?.leetcode || "",
        codechef: user.codingProfiles?.codechef || "",
        codeforces: user.codingProfiles?.codeforces || "",
        github: user.codingProfiles?.github || "",
        linkedin: user.codingProfiles?.linkedin || ""
      },
      
      profiles: {
        portfolioLink: user.profiles?.portfolioLink || "",
        resumeLink: user.profiles?.resumeLink || ""
      },
      
      socialLinks: {
        facebook: user.socialLinks?.facebook || "",
        instagram: user.socialLinks?.instagram || "",
        twitter: user.socialLinks?.twitter || ""
      },
      
      skills: user.skills || [],
      interests: user.interests || []
    });
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setPreviewPic(URL.createObjectURL(file));
    const formDataPic = new FormData();
    formDataPic.append("profilePic", file);
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/profile/upload-pic", formDataPic, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser((prev) => ({ ...prev, profilePic: res.data.url }));
    } catch (error) {
      alert("Image upload failed");
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest("");
    }
  };

  const removeInterest = (interestToRemove) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        academic: {
          ...formData.academic,
          year: formData.academic.year ? Number(formData.academic.year) : undefined,
          cgpa: formData.academic.cgpa ? Number(formData.academic.cgpa) : undefined,
          currentSemester: formData.academic.currentSemester ? Number(formData.academic.currentSemester) : undefined
        },
        address: {
          ...formData.address,
          pincode: formData.address.pincode ? Number(formData.address.pincode) : undefined
        }
      };

      const res = await axios.put("http://localhost:5000/api/profile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data);
      alert("Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Profile update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!user) {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="profile-edit-modal-overlay" onClick={onClose}>
      <div className="profile-edit-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="profile-edit-container">
          <button className="modal-close-btn" onClick={onClose} type="button">
            <FaTimes />
          </button>
      <div className="profile-edit-header">
        <h1 className="profile-edit-title">Edit Profile</h1>
        <p className="profile-edit-subtitle">Update your personal information and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="profile-edit-form">
        {/* Profile Picture Section */}
        <div className="form-section">
          <h2 className="section-title">Profile Picture</h2>
          <div className="profile-pic-section">
            <div className="profile-pic-container">
              {previewPic ? (
                <img src={previewPic} alt="Preview" className="profile-pic-preview" />
              ) : user.profilePic ? (
                <img src={`http://localhost:5000${user.profilePic}`} alt="Profile" className="profile-pic-preview" />
              ) : (
                <FaUserCircle className="profile-pic-placeholder" />
              )}
            </div>
            <div className="profile-pic-upload">
              <label htmlFor="profilePic" className="upload-btn">
                <FaUpload /> Upload Photo
              </label>
              <input
                type="file"
                id="profilePic"
                accept="image/*"
                onChange={handlePicUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="form-section">
          <h2 className="section-title">Personal Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="personalInfo.name"
                value={formData.personalInfo.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="personalInfo.phoneNumber"
                value={formData.personalInfo.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dob">Date of Birth</label>
              <input
                type="date"
                id="dob"
                name="personalInfo.dob"
                value={formData.personalInfo.dob}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="personalInfo.gender"
                value={formData.personalInfo.gender}
                onChange={handleInputChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

          </div>
        </div>

        {/* Academic Information */}
        <div className="form-section">
          <h2 className="section-title">Academic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="rollNumber">Roll Number *</label>
              <input
                type="text"
                id="rollNumber"
                name="academic.rollNumber"
                value={formData.academic.rollNumber}
                onChange={handleInputChange}
                placeholder="Enter your roll number"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="college">College/University *</label>
              <select
                id="college"
                name="academic.college"
                value={formData.academic.college}
                onChange={handleInputChange}
                required
              >
                <option value="">Select College</option>
                <option value="MLRIT">MLRIT</option>
                <option value="MRLS">MRLS</option>
                <option value="IARE">IARE</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select
                id="department"
                name="academic.department"
                value={formData.academic.department}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Department</option>
                <option value="CSE">CSE</option>
                <option value="CSD">CSD</option>
                <option value="CSC">CSC</option>
                <option value="CSM">CSM</option>
                <option value="IT">IT</option>
                <option value="CSIT">CSIT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="AERO">AERO</option>
                <option value="MECH">MECH</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="year">Graduation Year *</label>
              <select
                id="year"
                name="academic.year"
                value={formData.academic.year}
                onChange={handleInputChange}
                required
              >
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

            <div className="form-group">
              <label htmlFor="currentSemester">Current Semester</label>
              <select
                id="currentSemester"
                name="academic.currentSemester"
                value={formData.academic.currentSemester}
                onChange={handleInputChange}
              >
                <option value="">Select Semester</option>
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
                <option value="3">3rd Semester</option>
                <option value="4">4th Semester</option>
                <option value="5">5th Semester</option>
                <option value="6">6th Semester</option>
                <option value="7">7th Semester</option>
                <option value="8">8th Semester</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="cgpa">CGPA</label>
              <input
                type="number"
                id="cgpa"
                name="academic.cgpa"
                value={formData.academic.cgpa}
                onChange={handleInputChange}
                placeholder="Enter your CGPA"
                min="0"
                max="10"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="form-section">
          <h2 className="section-title">Address Information</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="address.street">Street Address</label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                placeholder="Enter your street address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address.district">District</label>
              <input
                type="text"
                id="address.district"
                name="address.district"
                value={formData.address.district}
                onChange={handleInputChange}
                placeholder="Enter your district"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address.city">City</label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                placeholder="Enter your city"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address.state">State</label>
              <input
                type="text"
                id="address.state"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                placeholder="Enter your state"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address.pincode">Pincode</label>
              <input
                type="number"
                id="address.pincode"
                name="address.pincode"
                value={formData.address.pincode}
                onChange={handleInputChange}
                placeholder="Enter your pincode"
              />
            </div>
          </div>
        </div>

        {/* Coding Profiles */}
        <div className="form-section">
          <h2 className="section-title">Coding Profiles</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="codingProfiles.leetcode">LeetCode Username</label>
              <input
                type="text"
                id="codingProfiles.leetcode"
                name="codingProfiles.leetcode"
                value={formData.codingProfiles.leetcode}
                onChange={handleInputChange}
                placeholder="Your LeetCode username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="codingProfiles.codechef">CodeChef Username</label>
              <input
                type="text"
                id="codingProfiles.codechef"
                name="codingProfiles.codechef"
                value={formData.codingProfiles.codechef}
                onChange={handleInputChange}
                placeholder="Your CodeChef username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="codingProfiles.codeforces">Codeforces Username</label>
              <input
                type="text"
                id="codingProfiles.codeforces"
                name="codingProfiles.codeforces"
                value={formData.codingProfiles.codeforces}
                onChange={handleInputChange}
                placeholder="Your Codeforces username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="codingProfiles.github">GitHub Username</label>
              <input
                type="text"
                id="codingProfiles.github"
                name="codingProfiles.github"
                value={formData.codingProfiles.github}
                onChange={handleInputChange}
                placeholder="Your GitHub username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="codingProfiles.linkedin">LinkedIn Profile</label>
              <input
                type="text"
                id="codingProfiles.linkedin"
                name="codingProfiles.linkedin"
                value={formData.codingProfiles.linkedin}
                onChange={handleInputChange}
                placeholder="Your LinkedIn profile URL"
              />
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="form-section">
          <h2 className="section-title">Skills</h2>
          <div className="tags-input-container">
            <div className="tags-input">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <button type="button" onClick={addSkill} className="add-tag-btn">Add</button>
            </div>
            <div className="tags-display">
              {formData.skills.map((skill, index) => (
                <span key={index} className="tag">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="remove-tag">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Interests Section */}
        <div className="form-section">
          <h2 className="section-title">Interests</h2>
          <div className="tags-input-container">
            <div className="tags-input">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add an interest..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              />
              <button type="button" onClick={addInterest} className="add-tag-btn">Add</button>
            </div>
            <div className="tags-display">
              {formData.interests.map((interest, index) => (
                <span key={index} className="tag">
                  {interest}
                  <button type="button" onClick={() => removeInterest(interest)} className="remove-tag">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Professional Profiles */}
        <div className="form-section">
          <h2 className="section-title">Professional Profiles</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="portfolioLink">Portfolio Link</label>
              <input
                type="url"
                id="portfolioLink"
                name="profiles.portfolioLink"
                value={formData.profiles.portfolioLink}
                onChange={handleInputChange}
                placeholder="https://yourportfolio.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="resumeLink">Resume Link</label>
              <input
                type="url"
                id="resumeLink"
                name="profiles.resumeLink"
                value={formData.profiles.resumeLink}
                onChange={handleInputChange}
                placeholder="Link to your resume"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="form-section">
          <h2 className="section-title">Social Links</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="socialLinks.twitter">Twitter</label>
              <input
                type="text"
                id="socialLinks.twitter"
                name="socialLinks.twitter"
                value={formData.socialLinks.twitter}
                onChange={handleInputChange}
                placeholder="Your Twitter handle"
              />
            </div>

            <div className="form-group">
              <label htmlFor="socialLinks.instagram">Instagram</label>
              <input
                type="text"
                id="socialLinks.instagram"
                name="socialLinks.instagram"
                value={formData.socialLinks.instagram}
                onChange={handleInputChange}
                placeholder="Your Instagram handle"
              />
            </div>

            <div className="form-group">
              <label htmlFor="socialLinks.facebook">Facebook</label>
              <input
                type="text"
                id="socialLinks.facebook"
                name="socialLinks.facebook"
                value={formData.socialLinks.facebook}
                onChange={handleInputChange}
                placeholder="Your Facebook profile"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-cancel"
            disabled={loading}
          >
            <FaTimes /> Cancel
          </button>
          <button
            type="submit"
            className="btn btn-save"
            disabled={loading}
          >
            <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
