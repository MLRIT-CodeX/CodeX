import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, Trash2, ChevronDown, ChevronUp, Save, X, ArrowLeft,
  BookOpen, Code, FileText, Award, Settings, Edit, Upload, Download,
  Eye, Lock, Monitor, Copy, MousePointer, Maximize
} from "lucide-react";
import "./AdminEditCourses.css";

const AdminEditCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditingFullScreen, setIsEditingFullScreen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingMode, setEditingMode] = useState("basic");
  const [expandedModules, setExpandedModules] = useState([]);
  const [expandedLectures, setExpandedLectures] = useState({});
  
  const coursesPerPage = 5;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      Swal.fire("Error", "Failed to fetch courses.", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "This course will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmDelete.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Deleted!", "Course has been deleted.", "success");
        fetchCourses();
      } catch (error) {
        console.error("Error deleting course:", error);
        Swal.fire("Error", "Course could not be deleted.", "error");
      }
    }
  };

  const openEditModal = (course) => {
    setSelectedCourse({ 
      ...course,
      modules: course.modules || [],
      finalExam: course.finalExam || {
        title: "Final Course Assessment",
        duration: 120,
        totalMarks: 1000,
        passingScore: 70,
        isActive: false,
        isSecure: false,
        securitySettings: {
          preventCopyPaste: false,
          preventTabSwitch: false,
          preventRightClick: false,
          fullScreenRequired: false,
          webcamMonitoring: false
        },
        mcqs: [],
        codeChallenges: []
      },
      scoringConfig: course.scoringConfig || {
        mcqMarks: 10,
        codingMarks: 50,
        lessonMcqMarks: 5,
        lessonCodingMarks: 25,
        moduleTestMcqMarks: 15,
        moduleTestCodingMarks: 75,
        finalExamMcqMarks: 20,
        finalExamCodingMarks: 100
      }
    });
    setExpandedModules([]);
    setExpandedLectures({});
    setIsEditingFullScreen(true);
  };

  const closeModal = () => {
    setIsEditingFullScreen(false);
    setSelectedCourse(null);
    setIsUpdating(false);
    setEditingMode("basic");
    setExpandedModules([]);
    setExpandedLectures({});
  };

  // Import course from JSON
  const importCourse = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      if (!e.target || !(e.target instanceof HTMLInputElement)) return;
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const result = event.target.result;
          if (typeof result === 'string') {
            const courseData = JSON.parse(result);
            
            // Remove _id to create new course
            delete courseData._id;
            delete courseData.__v;
            delete courseData.createdAt;
            delete courseData.updatedAt;

            const response = await axios.post(
              'http://localhost:5000/api/courses',
              courseData,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            Swal.fire("Success", "Course imported successfully!", "success");
            fetchCourses();
          }
        } catch (error) {
          console.error("Import error:", error);
          Swal.fire("Error", "Failed to import course. Please check the file format.", "error");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Export course as JSON
  const exportCourse = (course) => {
    const dataStr = JSON.stringify(course, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${course.title.replace(/\s+/g, '_')}_course.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    if (!selectedCourse.title || !selectedCourse.description) {
      Swal.fire("Error", "Title and description are required.", "error");
      setIsUpdating(false);
      return;
    }

    if (!selectedCourse._id) {
      Swal.fire("Error", "Course ID is missing. Please close and reopen the editor.", "error");
      setIsUpdating(false);
      return;
    }

    try {
      const courseData = {
        title: selectedCourse.title.trim(),
        description: selectedCourse.description.trim(),
        difficulty: selectedCourse.difficulty || "medium",
        isActive: selectedCourse.isActive !== undefined ? selectedCourse.isActive : true,
        testUnlockThreshold: selectedCourse.testUnlockThreshold || 80,
        modules: selectedCourse.modules || [],
        finalExam: selectedCourse.finalExam,
        scoringConfig: selectedCourse.scoringConfig
      };

      console.log("Updating course with ID:", selectedCourse._id);
      console.log("Course data:", courseData);

      const response = await axios.put(
        `http://localhost:5000/api/courses/${selectedCourse._id}`, 
        courseData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Success", "Course updated successfully!", "success");
      fetchCourses();
      closeModal();
    } catch (error) {
      console.error("Error updating course:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Failed to update the course.";
      Swal.fire("Error", errorMessage, "error");
      setIsUpdating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectedCourse((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const toggleModuleExpansion = (index) => {
    setExpandedModules(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const toggleLectureExpansion = (moduleIndex, lectureIndex) => {
    const key = `${moduleIndex}-${lectureIndex}`;
    setExpandedLectures(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Module Management
  const addModule = () => {
    const newModule = {
      module: `Module ${(selectedCourse.modules?.length || 0) + 1}`,
      theory: { textContent: "" },
      snippets: { codeExamples: [] },
      lectures: [],
      mcqs: [],
      codeChallenges: [],
      moduleTest: {
        totalMarks: 100,
        mcqs: [],
        codeChallenges: []
      }
    };

    setSelectedCourse(prev => ({
      ...prev,
      modules: [...(prev.modules || []), newModule]
    }));
  };

  const removeModule = (index) => {
    Swal.fire({
      title: "Delete Module?",
      text: "This will delete all content in this module!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = selectedCourse.modules.filter((_, i) => i !== index);
        setSelectedCourse(prev => ({ ...prev, modules: updated }));
      }
    });
  };

  const updateModuleField = (index, field, value) => {
    const updated = [...selectedCourse.modules];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updated[index] = {
        ...updated[index],
        [parent]: { ...updated[index][parent], [child]: value }
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setSelectedCourse(prev => ({ ...prev, modules: updated }));
  };

  // Lecture Management
  const addLecture = (moduleIndex) => {
    const newLecture = {
      title: `Lecture ${(selectedCourse.modules[moduleIndex].lectures?.length || 0) + 1}`,
      content: "",
      mcqs: [],
      codeChallenges: []
    };

    const updated = [...selectedCourse.modules];
    updated[moduleIndex].lectures = [...(updated[moduleIndex].lectures || []), newLecture];
    setSelectedCourse(prev => ({ ...prev, modules: updated }));
  };

  const removeLecture = (moduleIndex, lectureIndex) => {
    const updated = [...selectedCourse.modules];
    updated[moduleIndex].lectures.splice(lectureIndex, 1);
    setSelectedCourse(prev => ({ ...prev, modules: updated }));
  };

  const updateLectureField = (moduleIndex, lectureIndex, field, value) => {
    const updated = [...selectedCourse.modules];
    updated[moduleIndex].lectures[lectureIndex] = {
      ...updated[moduleIndex].lectures[lectureIndex],
      [field]: value
    };
    setSelectedCourse(prev => ({ ...prev, modules: updated }));
  };

  // Code Example Management
  const addCodeExample = (moduleIndex) => {
    const updated = [...selectedCourse.modules];
    if (!updated[moduleIndex].snippets) {
      updated[moduleIndex].snippets = { codeExamples: [] };
    }
    updated[moduleIndex].snippets.codeExamples.push({
      language: "javascript",
      code: "",
      explanation: ""
    });
    setSelectedCourse(prev => ({ ...prev, modules: updated }));
  };

  const removeCodeExample = (moduleIndex, exampleIndex) => {
    const updated = [...selectedCourse.modules];
    updated[moduleIndex].snippets.codeExamples.splice(exampleIndex, 1);
    setSelectedCourse(prev => ({ ...prev, modules: updated }));
  };

  // MCQ Management (Module Level)
  const addMCQToModule = (moduleIndex) => {
    const updated = [...selectedCourse.modules];
    updated[moduleIndex].mcqs = [...(updated[moduleIndex].mcqs || []), {
      question: "",
      options: ["", "", "", ""],
      correct: 0,
      explanation: "",
      marks: 1,
      difficulty: "medium"
    }];
    setSelectedCourse(prev => ({ ...prev, modules: updated }));
  };

  const removeMCQFromModule = (moduleIndex, mcqIndex) => {
    const updated = [...selectedCourse.modules];
    updated[moduleIndex].mcqs.splice(mcqIndex, 1);
    setSelectedCourse(prev => ({ ...prev, modules: updated }));
  };

  const updateModuleMCQ = (moduleIndex, mcqIndex, field, value) => {
    const updated = [...selectedCourse.modules];
    updated[moduleIndex].mcqs[mcqIndex] = {
      ...updated[moduleIndex].mcqs[mcqIndex],
      [field]: value
    };
    setSelectedCourse(prev => ({ ...prev, modules: updated }));
  };

  // Coding Challenge Management (Module Level)
  const addCodingChallengeToModule = (moduleIndex) => {
    const updated = [...selectedCourse.modules];
    updated[moduleIndex].codeChallenges = [...(updated[moduleIndex].codeChallenges || []), {
      title: "",
      description: "",
      sampleInput: "",
      sampleOutput: "",
      language: "python",
      marks: 2,
      difficulty: "medium",
      timeLimit: 30
    }];
    setSelectedCourse(prev => ({ ...prev, modules: updated }));
  };

  const removeCodingChallengeFromModule = (moduleIndex, challengeIndex) => {
    const updated = [...selectedCourse.modules];
    updated[moduleIndex].codeChallenges.splice(challengeIndex, 1);
    setSelectedCourse(prev => ({ ...prev, modules: updated }));
  };

  const updateModuleCodingChallenge = (moduleIndex, challengeIndex, field, value) => {
    const updated = [...selectedCourse.modules];
    updated[moduleIndex].codeChallenges[challengeIndex] = {
      ...updated[moduleIndex].codeChallenges[challengeIndex],
      [field]: value
    };
    setSelectedCourse(prev => ({ ...prev, modules: updated }));
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * coursesPerPage;
  const indexOfFirst = indexOfLast - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <>
    {!isEditingFullScreen ? (
    <div className="admin-container">
      <h1 className="admin-heading">Manage Courses</h1>
      
      <div className="admin-actions">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={importCourse} className="import-btn">
            <Upload size={18} style={{ marginRight: '8px' }} />
            Import Course
          </button>
          <Link to="/admin/create-course" className="add-course-btn">
            <Plus size={18} style={{ marginRight: '8px' }} />
            Add New Course
          </Link>
        </div>
      </div>

      <div className="courses-list">
        {currentCourses.length > 0 ? (
          currentCourses.map((course) => (
            <div key={course._id} className="course-card">
              <div className="course-info">
                <h2>{course.title}</h2>
                <p>{course.description}</p>
                <div className="course-meta">
                  <span className={`difficulty-badge difficulty-${course.difficulty?.toLowerCase()}`}>
                    {course.difficulty}
                  </span>
                  <span className="modules-count">
                    <BookOpen size={16} />
                    {course.modules?.length || 0} modules
                  </span>
                  <span className={`status-badge ${course.isActive ? 'active' : 'inactive'}`}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="course-buttons">
                <button
                  onClick={() => exportCourse(course)}
                  className="export-btn"
                  title="Export course as JSON"
                >
                  <Download size={16} />
                  Export
                </button>
                <button
                  onClick={() => openEditModal(course)}
                  className="edit-btn"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(course._id)}
                  className="delete-btn"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-courses">
            <p>No courses found matching your search criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={handlePrev} disabled={currentPage === 1}>
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={handleNext} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}

    </div>
    ) : null}

      {/* Full Screen Editor */}
      {isEditingFullScreen && selectedCourse && (
        <div className="fullscreen-editor">
          <div className="editor-header">
            <div className="editor-header-left">
              <button onClick={closeModal} className="back-btn">
                <ArrowLeft size={20} />
                Back to Courses
              </button>
              <h2 className="editor-title">Edit Course: {selectedCourse?.title}</h2>
            </div>
            <div className="editor-header-right">
              <span className="save-indicator">
                {isUpdating ? "Saving..." : "Ready"}
              </span>
            </div>
          </div>

          <div className="editor-content">
            {/* Editing Mode Tabs */}
            <div className="tabs-navigation">
                <button
                  type="button"
                  onClick={() => setEditingMode("basic")}
                  className={`tab-button ${editingMode === "basic" ? "active" : ""}`}
                >
                  <FileText size={16} />
                  Basic Info
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMode("modules")}
                  className={`tab-button ${editingMode === "modules" ? "active" : ""}`}
                >
                  <BookOpen size={16} />
                  Modules
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMode("finalExam")}
                  className={`tab-button ${editingMode === "finalExam" ? "active" : ""}`}
                >
                  <Award size={16} />
                  Final Exam
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMode("settings")}
                  className={`tab-button ${editingMode === "settings" ? "active" : ""}`}
                >
                  <Settings size={16} />
                  Settings
                </button>
              </div>

              <form onSubmit={handleUpdate} className="editor-form">
                {/* Basic Info Tab */}
                {editingMode === "basic" && (
                  <div>
                    <div className="form-group">
                      <label>Course Title</label>
                      <input
                        type="text"
                        name="title"
                        value={selectedCourse?.title || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={selectedCourse?.description || ""}
                        onChange={handleInputChange}
                        required
                        rows={4}
                      />
                    </div>

                    <div className="form-group">
                      <label>Difficulty</label>
                      <select
                        name="difficulty"
                        value={selectedCourse?.difficulty || "medium"}
                        onChange={handleInputChange}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Course Status</label>
                      <div className="toggle-container">
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={selectedCourse?.isActive !== undefined ? selectedCourse.isActive : true}
                            onChange={handleInputChange}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                        <span className="toggle-label">
                          {selectedCourse?.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Test Unlock Threshold (%)</label>
                      <input
                        type="number"
                        name="testUnlockThreshold"
                        value={selectedCourse?.testUnlockThreshold || 80}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                      />
                      <small style={{ color: '#94a3b8', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                        Minimum percentage required to unlock module tests
                      </small>
                    </div>
                  </div>
                )}

                {/* Modules Tab */}
                {editingMode === "modules" && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ color: '#8A00C4' }}>Course Modules</h3>
                      <button
                        type="button"
                        onClick={addModule}
                        style={{
                          padding: '8px 16px',
                          background: '#8A00C4',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Plus size={16} />
                        Add Module
                      </button>
                    </div>

                    {selectedCourse?.modules?.length === 0 && (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                        <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                        <p>No modules yet. Click "Add Module" to get started.</p>
                      </div>
                    )}

                    {selectedCourse?.modules?.map((module, moduleIndex) => (
                      <div key={moduleIndex} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                          <div style={{ flex: 1, marginRight: '15px' }}>
                            <input
                              type="text"
                              value={module.module}
                              onChange={(e) => updateModuleField(moduleIndex, 'module', e.target.value)}
                              style={{ 
                                width: '100%',
                                padding: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                backgroundColor: '#111827',
                                border: '1px solid #374151',
                                borderRadius: '4px',
                                color: 'white'
                              }}
                              placeholder="Module Name"
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => toggleModuleExpansion(moduleIndex)}
                              style={{
                                padding: '6px 12px',
                                background: '#374151',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {expandedModules.includes(moduleIndex) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeModule(moduleIndex)}
                              style={{
                                padding: '6px 12px',
                                background: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {expandedModules.includes(moduleIndex) && (
                          <div>
                            {/* Theory Content */}
                            <div style={{ marginBottom: '15px' }}>
                              <label style={{ display: 'block', marginBottom: '8px', color: '#e5e7eb', fontSize: '14px', fontWeight: '500' }}>
                                Theory Content
                              </label>
                              <textarea
                                value={module.theory?.textContent || ""}
                                onChange={(e) => updateModuleField(moduleIndex, 'theory.textContent', e.target.value)}
                                placeholder="Enter theory content for this module..."
                                style={{
                                  width: '100%',
                                  minHeight: '100px',
                                  padding: '10px',
                                  backgroundColor: '#111827',
                                  border: '1px solid #374151',
                                  borderRadius: '4px',
                                  color: 'white',
                                  resize: 'vertical'
                                }}
                              />
                            </div>

                            {/* Lectures */}
                            <div style={{ marginBottom: '15px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <label style={{ color: '#e5e7eb', fontSize: '14px', fontWeight: '500' }}>
                                  Lectures ({module.lectures?.length || 0})
                                </label>
                                <button
                                  type="button"
                                  onClick={() => addLecture(moduleIndex)}
                                  style={{
                                    padding: '4px 10px',
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Plus size={14} />
                                  Add Lecture
                                </button>
                              </div>

                              {module.lectures?.map((lecture, lectureIndex) => (
                                <div key={lectureIndex} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#111827', borderRadius: '4px', border: '1px solid #374151' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <input
                                      type="text"
                                      value={lecture.title}
                                      onChange={(e) => updateLectureField(moduleIndex, lectureIndex, 'title', e.target.value)}
                                      placeholder="Lecture Title"
                                      style={{
                                        flex: 1,
                                        padding: '6px',
                                        backgroundColor: '#1f2937',
                                        border: '1px solid #374151',
                                        borderRadius: '3px',
                                        color: 'white',
                                        fontSize: '14px'
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeLecture(moduleIndex, lectureIndex)}
                                      style={{
                                        marginLeft: '8px',
                                        padding: '4px 8px',
                                        background: '#dc2626',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        fontSize: '11px'
                                      }}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                  <textarea
                                    value={lecture.content}
                                    onChange={(e) => updateLectureField(moduleIndex, lectureIndex, 'content', e.target.value)}
                                    placeholder="Lecture Content"
                                    style={{
                                      width: '100%',
                                      minHeight: '60px',
                                      padding: '6px',
                                      backgroundColor: '#1f2937',
                                      border: '1px solid #374151',
                                      borderRadius: '3px',
                                      color: 'white',
                                      fontSize: '13px',
                                      resize: 'vertical'
                                    }}
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Module Summary */}
                            <div style={{ 
                              padding: '10px', 
                              backgroundColor: 'rgba(138, 0, 196, 0.1)', 
                              borderRadius: '4px',
                              display: 'flex',
                              gap: '20px',
                              fontSize: '13px',
                              color: '#94a3b8'
                            }}>
                              <span>📝 {module.mcqs?.length || 0} MCQs</span>
                              <span>💻 {module.codeChallenges?.length || 0} Challenges</span>
                              <span>📚 {module.lectures?.length || 0} Lectures</span>
                              <span>🧩 {module.snippets?.codeExamples?.length || 0} Code Examples</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Final Exam Tab */}
                {editingMode === "finalExam" && (
                  <div>
                    <div style={{ padding: '20px', backgroundColor: 'rgba(138, 0, 196, 0.1)', borderRadius: '8px' }}>
                      <h3 style={{ color: '#8A00C4', marginBottom: '15px' }}>Final Exam Configuration</h3>
                      
                      <div className="form-group">
                        <label>Enable Final Exam</label>
                        <div className="toggle-container">
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={selectedCourse?.finalExam?.isActive || false}
                              onChange={(e) => setSelectedCourse(prev => ({
                                ...prev,
                                finalExam: { ...prev.finalExam, isActive: e.target.checked }
                              }))}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                          <span className="toggle-label">
                            {selectedCourse?.finalExam?.isActive ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>

                      {selectedCourse?.finalExam?.isActive && (
                        <>
                          <div className="form-group">
                            <label>Exam Title</label>
                            <input
                              type="text"
                              value={selectedCourse?.finalExam?.title || ""}
                              onChange={(e) => setSelectedCourse(prev => ({
                                ...prev,
                                finalExam: { ...prev.finalExam, title: e.target.value }
                              }))}
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                              <label>Duration (minutes)</label>
                              <input
                                type="number"
                                value={selectedCourse?.finalExam?.duration || 120}
                                onChange={(e) => setSelectedCourse(prev => ({
                                  ...prev,
                                  finalExam: { ...prev.finalExam, duration: parseInt(e.target.value) }
                                }))}
                                min="30"
                              />
                            </div>

                            <div className="form-group">
                              <label>Passing Score (%)</label>
                              <input
                                type="number"
                                value={selectedCourse?.finalExam?.passingScore || 70}
                                onChange={(e) => setSelectedCourse(prev => ({
                                  ...prev,
                                  finalExam: { ...prev.finalExam, passingScore: parseInt(e.target.value) }
                                }))}
                                min="0"
                                max="100"
                              />
                            </div>
                          </div>

                          {/* Security Settings */}
                          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1f2937', borderRadius: '6px' }}>
                            <h4 style={{ color: '#e5e7eb', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Lock size={18} />
                              Security Settings
                            </h4>
                            
                            <div className="security-toggles">
                              <div className="security-toggle-item">
                                <label className="toggle-switch">
                                  <input
                                    type="checkbox"
                                    checked={selectedCourse?.finalExam?.securitySettings?.preventCopyPaste || false}
                                    onChange={(e) => setSelectedCourse(prev => ({
                                      ...prev,
                                      finalExam: {
                                        ...prev.finalExam,
                                        securitySettings: {
                                          ...prev.finalExam.securitySettings,
                                          preventCopyPaste: e.target.checked
                                        }
                                      }
                                    }))}
                                  />
                                  <span className="toggle-slider"></span>
                                </label>
                                <div className="security-toggle-label">
                                  <Copy size={16} />
                                  <span>Prevent Copy/Paste</span>
                                </div>
                              </div>

                              <div className="security-toggle-item">
                                <label className="toggle-switch">
                                  <input
                                    type="checkbox"
                                    checked={selectedCourse?.finalExam?.securitySettings?.preventTabSwitch || false}
                                    onChange={(e) => setSelectedCourse(prev => ({
                                      ...prev,
                                      finalExam: {
                                        ...prev.finalExam,
                                        securitySettings: {
                                          ...prev.finalExam.securitySettings,
                                          preventTabSwitch: e.target.checked
                                        }
                                      }
                                    }))}
                                  />
                                  <span className="toggle-slider"></span>
                                </label>
                                <div className="security-toggle-label">
                                  <Monitor size={16} />
                                  <span>Prevent Tab Switch</span>
                                </div>
                              </div>

                              <div className="security-toggle-item">
                                <label className="toggle-switch">
                                  <input
                                    type="checkbox"
                                    checked={selectedCourse?.finalExam?.securitySettings?.preventRightClick || false}
                                    onChange={(e) => setSelectedCourse(prev => ({
                                      ...prev,
                                      finalExam: {
                                        ...prev.finalExam,
                                        securitySettings: {
                                          ...prev.finalExam.securitySettings,
                                          preventRightClick: e.target.checked
                                        }
                                      }
                                    }))}
                                  />
                                  <span className="toggle-slider"></span>
                                </label>
                                <div className="security-toggle-label">
                                  <MousePointer size={16} />
                                  <span>Prevent Right Click</span>
                                </div>
                              </div>

                              <div className="security-toggle-item">
                                <label className="toggle-switch">
                                  <input
                                    type="checkbox"
                                    checked={selectedCourse?.finalExam?.securitySettings?.fullScreenRequired || false}
                                    onChange={(e) => setSelectedCourse(prev => ({
                                      ...prev,
                                      finalExam: {
                                        ...prev.finalExam,
                                        securitySettings: {
                                          ...prev.finalExam.securitySettings,
                                          fullScreenRequired: e.target.checked
                                        }
                                      }
                                    }))}
                                  />
                                  <span className="toggle-slider"></span>
                                </label>
                                <div className="security-toggle-label">
                                  <Maximize size={16} />
                                  <span>Full Screen Required</span>
                                </div>
                              </div>

                              <div className="security-toggle-item">
                                <label className="toggle-switch">
                                  <input
                                    type="checkbox"
                                    checked={selectedCourse?.finalExam?.securitySettings?.webcamMonitoring || false}
                                    onChange={(e) => setSelectedCourse(prev => ({
                                      ...prev,
                                      finalExam: {
                                        ...prev.finalExam,
                                        securitySettings: {
                                          ...prev.finalExam.securitySettings,
                                          webcamMonitoring: e.target.checked
                                        }
                                      }
                                    }))}
                                  />
                                  <span className="toggle-slider"></span>
                                </label>
                                <div className="security-toggle-label">
                                  <Eye size={16} />
                                  <span>Webcam Monitoring</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1f2937', borderRadius: '6px' }}>
                            <p style={{ color: '#e5e7eb', marginBottom: '10px' }}>Exam Content:</p>
                            <div style={{ display: 'flex', gap: '20px', color: '#94a3b8', fontSize: '14px' }}>
                              <span>📝 {selectedCourse.finalExam.mcqs?.length || 0} MCQs</span>
                              <span>💻 {selectedCourse.finalExam.codeChallenges?.length || 0} Coding Challenges</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Settings Tab */}
                {editingMode === "settings" && (
                  <div>
                    <h3 style={{ color: '#8A00C4', marginBottom: '20px' }}>Scoring Configuration</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="form-group">
                        <label>MCQ Marks (Default)</label>
                        <input
                          type="number"
                          value={selectedCourse?.scoringConfig?.mcqMarks || 10}
                          onChange={(e) => setSelectedCourse(prev => ({
                            ...prev,
                            scoringConfig: { ...prev.scoringConfig, mcqMarks: parseFloat(e.target.value) }
                          }))}
                          step="0.5"
                          min="0.5"
                        />
                      </div>

                      <div className="form-group">
                        <label>Coding Marks (Default)</label>
                        <input
                          type="number"
                          value={selectedCourse?.scoringConfig?.codingMarks || 50}
                          onChange={(e) => setSelectedCourse(prev => ({
                            ...prev,
                            scoringConfig: { ...prev.scoringConfig, codingMarks: parseFloat(e.target.value) }
                          }))}
                          step="0.5"
                          min="0.5"
                        />
                      </div>

                      <div className="form-group">
                        <label>Lesson MCQ Marks</label>
                        <input
                          type="number"
                          value={selectedCourse?.scoringConfig?.lessonMcqMarks || 5}
                          onChange={(e) => setSelectedCourse(prev => ({
                            ...prev,
                            scoringConfig: { ...prev.scoringConfig, lessonMcqMarks: parseFloat(e.target.value) }
                          }))}
                          step="0.5"
                          min="0.5"
                        />
                      </div>

                      <div className="form-group">
                        <label>Lesson Coding Marks</label>
                        <input
                          type="number"
                          value={selectedCourse?.scoringConfig?.lessonCodingMarks || 25}
                          onChange={(e) => setSelectedCourse(prev => ({
                            ...prev,
                            scoringConfig: { ...prev.scoringConfig, lessonCodingMarks: parseFloat(e.target.value) }
                          }))}
                          step="0.5"
                          min="0.5"
                        />
                      </div>

                      <div className="form-group">
                        <label>Module Test MCQ Marks</label>
                        <input
                          type="number"
                          value={selectedCourse?.scoringConfig?.moduleTestMcqMarks || 15}
                          onChange={(e) => setSelectedCourse(prev => ({
                            ...prev,
                            scoringConfig: { ...prev.scoringConfig, moduleTestMcqMarks: parseFloat(e.target.value) }
                          }))}
                          step="0.5"
                          min="0.5"
                        />
                      </div>

                      <div className="form-group">
                        <label>Module Test Coding Marks</label>
                        <input
                          type="number"
                          value={selectedCourse?.scoringConfig?.moduleTestCodingMarks || 75}
                          onChange={(e) => setSelectedCourse(prev => ({
                            ...prev,
                            scoringConfig: { ...prev.scoringConfig, moduleTestCodingMarks: parseFloat(e.target.value) }
                          }))}
                          step="0.5"
                          min="0.5"
                        />
                      </div>

                      <div className="form-group">
                        <label>Final Exam MCQ Marks</label>
                        <input
                          type="number"
                          value={selectedCourse?.scoringConfig?.finalExamMcqMarks || 20}
                          onChange={(e) => setSelectedCourse(prev => ({
                            ...prev,
                            scoringConfig: { ...prev.scoringConfig, finalExamMcqMarks: parseFloat(e.target.value) }
                          }))}
                          step="0.5"
                          min="0.5"
                        />
                      </div>

                      <div className="form-group">
                        <label>Final Exam Coding Marks</label>
                        <input
                          type="number"
                          value={selectedCourse?.scoringConfig?.finalExamCodingMarks || 100}
                          onChange={(e) => setSelectedCourse(prev => ({
                            ...prev,
                            scoringConfig: { ...prev.scoringConfig, finalExamCodingMarks: parseFloat(e.target.value) }
                          }))}
                          step="0.5"
                          min="0.5"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="modal-buttons" style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    onClick={closeModal} 
                    className="cancel-btn"
                    style={{
                      padding: '10px 20px',
                      background: 'transparent',
                      color: '#94a3b8',
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="save-btn" 
                    disabled={isUpdating}
                    style={{
                      padding: '10px 20px',
                      background: isUpdating ? '#6b21a8' : '#8A00C4',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: isUpdating ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Save size={16} />
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  };

export default AdminEditCourses;
