import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { 
  Plus, Trash2, Save, X, ArrowLeft, BookOpen, Edit, Download,
  Search, ChevronRight, AlertCircle, CheckCircle
} from "lucide-react";
import CourseImport from "../components/CourseImport";
import ContentImportButton from "../components/ContentImportButton";
import "./AdminEditCourses.css";

const AdminEditCourses = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedCourse, setEditedCourse] = useState(null);
  
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

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setEditedCourse({ ...course });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedCourse(null);
    setEditedCourse(null);
  };

  const handleSave = async () => {
    if (!editedCourse.title || !editedCourse.description) {
      Swal.fire("Error", "Title and description are required.", "error");
      return;
    }

    setIsSaving(true);
    try {
      await axios.put(
        `http://localhost:5000/api/courses/${editedCourse._id}`,
        editedCourse,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Swal.fire("Success", "Course updated successfully!", "success");
      fetchCourses();
      handleCancel();
    } catch (error) {
      console.error("Error updating course:", error);
      Swal.fire("Error", "Failed to update course.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Course?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Deleted!", "Course has been deleted.", "success");
        fetchCourses();
      } catch (error) {
        Swal.fire("Error", "Failed to delete course.", "error");
      }
    }
  };

  const updateField = (field, value) => {
    setEditedCourse(prev => ({ ...prev, [field]: value }));
  };

  const updateModule = (moduleIndex, field, value) => {
    const updatedModules = [...editedCourse.modules];
    updatedModules[moduleIndex] = {
      ...updatedModules[moduleIndex],
      [field]: value
    };
    setEditedCourse(prev => ({ ...prev, modules: updatedModules }));
  };

  const addModule = () => {
    const newModule = {
      _id: `temp-${Date.now()}`,
      title: `New Module ${editedCourse.modules.length + 1}`,
      description: "",
      order: editedCourse.modules.length + 1,
      theory: { textContent: "" },
      snippets: { codeExamples: [] },
      lecture: { lectures: [] },
      mcqs: [],
      codeChallenges: [],
      moduleTest: { mcqs: [], codeChallenges: [], totalMarks: 100 }
    };
    setEditedCourse(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
  };

  const deleteModule = (moduleIndex) => {
    Swal.fire({
      title: "Delete Module?",
      text: "This will remove all content in this module!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete"
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedModules = editedCourse.modules.filter((_, i) => i !== moduleIndex);
        setEditedCourse(prev => ({ ...prev, modules: updatedModules }));
      }
    });
  };

  const exportCourse = (course) => {
    const dataStr = JSON.stringify(course, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${course.title.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isEditing && editedCourse) {
    return (
      <div className="edit-course-page">
        {/* Header */}
        <div className="edit-header">
          <button onClick={handleCancel} className="back-btn">
            <ArrowLeft size={20} />
            Back to Courses
          </button>
          <h1>Edit: {editedCourse.title}</h1>
          <div className="header-actions">
            <button onClick={handleCancel} className="btn-cancel" disabled={isSaving}>
              <X size={18} />
              Cancel
            </button>
            <button onClick={handleSave} className="btn-save" disabled={isSaving}>
              <Save size={18} />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="edit-content">
          {/* Basic Info Section */}
          <div className="edit-section">
            <h2>Basic Information</h2>
            <div className="form-grid">
              <div className="form-field">
                <label>Course Title *</label>
                <input
                  type="text"
                  value={editedCourse.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Enter course title"
                />
              </div>

              <div className="form-field">
                <label>Difficulty</label>
                <select
                  value={editedCourse.difficulty || 'medium'}
                  onChange={(e) => updateField('difficulty', e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-field full-width">
                <label>Description *</label>
                <textarea
                  value={editedCourse.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Enter course description"
                  rows={3}
                />
              </div>

              <div className="form-field">
                <label>Status</label>
                <div className="toggle-field">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editedCourse.isActive !== false}
                    onChange={(e) => updateField('isActive', e.target.checked)}
                  />
                  <label htmlFor="isActive">
                    {editedCourse.isActive !== false ? 'Active' : 'Inactive'}
                  </label>
                </div>
              </div>

              <div className="form-field">
                <label>Test Unlock Threshold (%)</label>
                <input
                  type="number"
                  value={editedCourse.testUnlockThreshold || 80}
                  onChange={(e) => updateField('testUnlockThreshold', parseInt(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Modules Section */}
          <div className="edit-section">
            <div className="section-header">
              <h2>Modules ({editedCourse.modules?.length || 0})</h2>
              <button onClick={addModule} className="btn-add">
                <Plus size={18} />
                Add Module
              </button>
            </div>

            {editedCourse.modules?.length === 0 ? (
              <div className="empty-state">
                <BookOpen size={48} />
                <p>No modules yet</p>
                <button onClick={addModule} className="btn-add">
                  <Plus size={18} />
                  Add First Module
                </button>
              </div>
            ) : (
              <div className="modules-list">
                {editedCourse.modules.map((module, index) => (
                  <div key={module._id || index} className="module-card">
                    <div className="module-header">
                      <span className="module-number">{index + 1}</span>
                      <input
                        type="text"
                        value={module.title || ''}
                        onChange={(e) => updateModule(index, 'title', e.target.value)}
                        placeholder="Module title"
                        className="module-title-input"
                      />
                      <button
                        onClick={() => deleteModule(index)}
                        className="btn-delete-module"
                        title="Delete module"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="module-body">
                      <div className="form-field">
                        <label>Description</label>
                        <textarea
                          value={module.description || ''}
                          onChange={(e) => updateModule(index, 'description', e.target.value)}
                          placeholder="Module description"
                          rows={2}
                        />
                      </div>

                      <div className="module-stats">
                        <div className="stat">
                          <span className="stat-label">Theory</span>
                          <span className="stat-value">
                            {module.theory?.textContent ? '✓' : '—'}
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Lectures</span>
                          <span className="stat-value">
                            {module.lecture?.lectures?.length || 0}
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Snippets</span>
                          <span className="stat-value">
                            {module.snippets?.codeExamples?.length || 0}
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">MCQs</span>
                          <span className="stat-value">
                            {module.mcqs?.length || 0}
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Challenges</span>
                          <span className="stat-value">
                            {module.codeChallenges?.length || 0}
                          </span>
                        </div>
                      </div>

                      {module._id && !module._id.toString().startsWith('temp') && (
                        <div className="module-actions">
                          <ContentImportButton
                            importType="theory"
                            courseId={editedCourse._id}
                            moduleId={module._id}
                            buttonText="Import Theory"
                            buttonSize="xs"
                            onImportSuccess={() => {
                              Swal.fire('Success', 'Theory imported!', 'success');
                              fetchCourses();
                            }}
                          />
                          <ContentImportButton
                            importType="lecture"
                            courseId={editedCourse._id}
                            moduleId={module._id}
                            buttonText="Import Lectures"
                            buttonSize="xs"
                            onImportSuccess={() => {
                              Swal.fire('Success', 'Lectures imported!', 'success');
                              fetchCourses();
                            }}
                          />
                          <ContentImportButton
                            importType="snippets"
                            courseId={editedCourse._id}
                            moduleId={module._id}
                            buttonText="Import Snippets"
                            buttonSize="xs"
                            onImportSuccess={() => {
                              Swal.fire('Success', 'Snippets imported!', 'success');
                              fetchCourses();
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-edit-courses">
      {/* Header */}
      <div className="page-header">
        <h1>Manage Courses</h1>
        <div className="header-actions">
          <CourseImport
            onImportSuccess={() => {
              Swal.fire("Success", "Course imported!", "success");
              fetchCourses();
            }}
          />
          <Link to="/admin/create-course" className="btn-primary">
            <Plus size={18} />
            Create Course
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Courses Grid */}
      <div className="courses-grid">
        {filteredCourses.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={64} />
            <h3>No courses found</h3>
            <p>Create your first course to get started</p>
            <Link to="/admin/create-course" className="btn-primary">
              <Plus size={18} />
              Create Course
            </Link>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course._id} className="course-card">
              <div className="course-header">
                <h3>{course.title}</h3>
                <span className={`difficulty-badge ${course.difficulty}`}>
                  {course.difficulty}
                </span>
              </div>

              <p className="course-description">{course.description}</p>

              <div className="course-meta">
                <div className="meta-item">
                  <BookOpen size={16} />
                  <span>{course.modules?.length || 0} modules</span>
                </div>
                <div className="meta-item">
                  <span className={`status-badge ${course.isActive ? 'active' : 'inactive'}`}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="course-actions">
                <button
                  onClick={() => exportCourse(course)}
                  className="btn-secondary"
                  title="Export as JSON"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => handleEdit(course)}
                  className="btn-primary"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(course._id)}
                  className="btn-danger"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminEditCourses;
