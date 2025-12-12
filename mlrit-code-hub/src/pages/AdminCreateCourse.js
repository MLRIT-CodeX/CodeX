import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  FileText, Target, Code, CheckCircle, Plus, Trash2, ChevronDown, 
  ChevronUp, BookOpen, Award, Settings, AlertCircle, Save, X,
  Eye, Lock, Monitor, Copy, MousePointer, Maximize, RefreshCw
} from "lucide-react";
import Button from "../components/ui/Button";
import "./AdminCreateCourse.css";

const STORAGE_KEY = "admin_create_course_draft";
const UI_STATE_KEY = "admin_create_course_ui_state";

const AdminCreateCourse = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved UI state
  const loadUIState = () => {
    try {
      const saved = localStorage.getItem(UI_STATE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Error loading UI state:", error);
      return null;
    }
  };

  const savedUIState = loadUIState();
  const [expandedModules, setExpandedModules] = useState(savedUIState?.expandedModules || []);
  const [expandedLectures, setExpandedLectures] = useState(savedUIState?.expandedLectures || {});
  const [showFinalExam, setShowFinalExam] = useState(savedUIState?.showFinalExam || false);
  const [activeTab, setActiveTab] = useState(savedUIState?.activeTab || "basic");

  // Load saved form data
  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        // console.log("Loaded saved course data from localStorage");
        return data;
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
    }
    return {
      title: "",
      description: "",
      difficulty: "medium",
      isActive: true,
      testUnlockThreshold: 80,
      scoringConfig: {
        mcqMarks: 10,
        codingMarks: 50,
        lessonMcqMarks: 5,
        lessonCodingMarks: 25,
        moduleTestMcqMarks: 15,
        moduleTestCodingMarks: 75,
        finalExamMcqMarks: 20,
        finalExamCodingMarks: 100
      },
      modules: [],
      finalExam: {
        title: "Final Course Assessment",
        description: "Comprehensive assessment covering all course topics",
        duration: 120,
        totalMarks: 1000,
        passingScore: 70,
        isActive: true,
        isSecure: true,
        securitySettings: {
          preventCopyPaste: true,
          preventTabSwitch: true,
          preventRightClick: true,
          fullScreenRequired: true,
          webcamMonitoring: false
        },
        mcqs: [],
        codeChallenges: []
      }
    };
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    reset
  } = useForm({
    defaultValues: loadSavedData()
  });

  const {
    fields: moduleFields,
    append: appendModule,
    remove: removeModule
  } = useFieldArray({
    control,
    name: "modules"
  });

  const watchedModules = watch("modules");
  const watchedFinalExam = watch("finalExam");
  const watchedIsActive = watch("isActive");
  const formData = watch();

  // Auto-save form data to localStorage
  useEffect(() => {
    if (autoSaveEnabled) {
      setIsSaving(true);
      const timeoutId = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
          setLastSaved(new Date());
          setIsSaving(false);
          // console.log("Auto-saved course draft");
        } catch (error) {
          console.error("Error auto-saving:", error);
          setIsSaving(false);
        }
      }, 30000); // Debounce for 30 seconds

      return () => {
        clearTimeout(timeoutId);
        setIsSaving(false);
      };
    }
  }, [formData, autoSaveEnabled]);

  // Save UI state to localStorage
  useEffect(() => {
    try {
      const uiState = {
        expandedModules,
        expandedLectures,
        showFinalExam,
        activeTab
      };
      localStorage.setItem(UI_STATE_KEY, JSON.stringify(uiState));
    } catch (error) {
      console.error("Error saving UI state:", error);
    }
  }, [expandedModules, expandedLectures, showFinalExam, activeTab]);

  // Warn user before leaving page if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (localStorage.getItem(STORAGE_KEY) && !autoSaveEnabled) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autoSaveEnabled]);

  // Keyboard shortcut for manual save (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        manualSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData]);

  // Clear draft data
  const clearDraft = () => {
    if (window.confirm("Are you sure you want to clear all saved data? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(UI_STATE_KEY);
      reset(loadSavedData());
      setExpandedModules([]);
      setExpandedLectures({});
      setShowFinalExam(false);
      setActiveTab("basic");
      setLastSaved(null);
      alert("Draft cleared successfully!");
    }
  };

  // Manual save
  const manualSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      setLastSaved(new Date());
      alert("✅ Draft saved successfully!");
    } catch (error) {
      console.error("Error saving:", error);
      alert("❌ Failed to save draft");
    }
  };

  // Export draft as JSON file
  const exportDraft = () => {
    try {
      const dataStr = JSON.stringify(formData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `course-draft-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert("✅ Draft exported successfully!");
    } catch (error) {
      console.error("Error exporting:", error);
      alert("❌ Failed to export draft");
    }
  };

  // Import draft from JSON file
  const importDraft = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const importedData = JSON.parse(result);
          reset(importedData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(importedData));
          setLastSaved(new Date());
          alert("✅ Draft imported successfully!");
        }
      } catch (error) {
        console.error("Error importing:", error);
        alert("❌ Failed to import draft. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  const toggleModule = (index) => {
    setExpandedModules(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleLecture = (moduleIndex, lectureIndex) => {
    const key = `${moduleIndex}-${lectureIndex}`;
    setExpandedLectures(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const addModule = () => {
    appendModule({
      title: "",
      description: "",
      order: moduleFields.length,
      estimatedDuration: "2-3 hours",
      prerequisites: [],
      learningObjectives: [],
      theory: {
        textContent: "",
        files: {
          pdf: { name: "", url: "" },
          ppt: { name: "", url: "", slides: [], totalSlides: 0 },
          doc: { name: "", url: "" }
        }
      },
      snippets: {
        codeExamples: []
      },
      lecture: {
        module: "",
        lectures: [],
        estimatedDuration: "30-45 min"
      },
      mcqs: [],
      codeChallenges: [],
      moduleTest: {
        mcqs: [],
        codeChallenges: [],
        totalMarks: 0
      }
    });
    setExpandedModules(prev => [...prev, moduleFields.length]);
  };

  const addMCQToModule = (moduleIndex, section = "mcqs") => {
    const path = section === "moduleTest" 
      ? `modules.${moduleIndex}.moduleTest.mcqs`
      : `modules.${moduleIndex}.mcqs`;
    
    const currentMcqs = section === "moduleTest"
      ? watchedModules[moduleIndex]?.moduleTest?.mcqs || []
      : watchedModules[moduleIndex]?.mcqs || [];
    
    // @ts-ignore
    setValue(path, [
      ...currentMcqs,
      {
        question: "",
        options: ["", "", "", ""],
        correct: 0,
        explanation: "",
        marks: section === "moduleTest" ? 15 : 10,
        difficulty: "medium"
      }
    ]);
  };

  const removeMCQFromModule = (moduleIndex, mcqIndex, section = "mcqs") => {
    const path = section === "moduleTest"
      ? `modules.${moduleIndex}.moduleTest.mcqs`
      : `modules.${moduleIndex}.mcqs`;
    
    const currentMcqs = section === "moduleTest"
      ? watchedModules[moduleIndex]?.moduleTest?.mcqs || []
      : watchedModules[moduleIndex]?.mcqs || [];
    
    // @ts-ignore
    setValue(path, currentMcqs.filter((_, idx) => idx !== mcqIndex));
  };

  const addCodingChallengeToModule = (moduleIndex, section = "codeChallenges") => {
    const path = section === "moduleTest"
      ? `modules.${moduleIndex}.moduleTest.codeChallenges`
      : `modules.${moduleIndex}.codeChallenges`;
    
    const currentChallenges = section === "moduleTest"
      ? watchedModules[moduleIndex]?.moduleTest?.codeChallenges || []
      : watchedModules[moduleIndex]?.codeChallenges || [];
    
    // @ts-ignore
    setValue(path, [
      ...currentChallenges,
      {
        title: "",
        description: "",
        sampleInput: "",
        sampleOutput: "",
        constraints: "",
        initialCode: "",
        language: "python",
        marks: section === "moduleTest" ? 75 : 50,
        difficulty: "medium",
        timeLimit: 30,
        testCases: []
      }
    ]);
  };

  const removeCodingChallengeFromModule = (moduleIndex, challengeIndex, section = "codeChallenges") => {
    const path = section === "moduleTest"
      ? `modules.${moduleIndex}.moduleTest.codeChallenges`
      : `modules.${moduleIndex}.codeChallenges`;
    
    const currentChallenges = section === "moduleTest"
      ? watchedModules[moduleIndex]?.moduleTest?.codeChallenges || []
      : watchedModules[moduleIndex]?.codeChallenges || [];
    
    // @ts-ignore
    setValue(path, currentChallenges.filter((_, idx) => idx !== challengeIndex));
  };

  const addLectureToModule = (moduleIndex) => {
    const currentLectures = watchedModules[moduleIndex]?.lecture?.lectures || [];
    setValue(`modules.${moduleIndex}.lecture.lectures`, [
      ...currentLectures,
      {
        topic: "",
        content: {
          definition: [""],
          syntax: "",
          examples: [{
            title: "",
            description: "",
            code: "",
            explanation: [""]
          }],
          keyTakeaways: [""],
          practiceSection: {
            ready_to_practice: "",
            description: "",
            mcqs: "",
            coding_challenges: ""
          }
        }
      }
    ]);
  };

  const removeLectureFromModule = (moduleIndex, lectureIndex) => {
    const currentLectures = watchedModules[moduleIndex]?.lecture?.lectures || [];
    setValue(
      `modules.${moduleIndex}.lecture.lectures`,
      currentLectures.filter((_, idx) => idx !== lectureIndex)
    );
  };

  const addCodeExample = (moduleIndex) => {
    const currentExamples = watchedModules[moduleIndex]?.snippets?.codeExamples || [];
    setValue(`modules.${moduleIndex}.snippets.codeExamples`, [
      ...currentExamples,
      {
        title: "",
        description: "",
        code: "",
        language: "python",
        category: "",
        tags: []
      }
    ]);
  };

  const removeCodeExample = (moduleIndex, exampleIndex) => {
    const currentExamples = watchedModules[moduleIndex]?.snippets?.codeExamples || [];
    setValue(
      `modules.${moduleIndex}.snippets.codeExamples`,
      currentExamples.filter((_, idx) => idx !== exampleIndex)
    );
  };

  const addFinalExamMCQ = () => {
    const currentMcqs = watchedFinalExam?.mcqs || [];
    setValue("finalExam.mcqs", [
      ...currentMcqs,
      {
        question: "",
        options: ["", "", "", ""],
        correct: 0,
        explanation: "",
        marks: 20,
        difficulty: "medium"
      }
    ]);
  };

  const addFinalExamCodingChallenge = () => {
    const currentChallenges = watchedFinalExam?.codeChallenges || [];
    setValue("finalExam.codeChallenges", [
      ...currentChallenges,
      {
        title: "",
        description: "",
        sampleInput: "",
        sampleOutput: "",
        constraints: "",
        initialCode: "",
        language: "python",
        marks: 100,
        difficulty: "medium",
        timeLimit: 30,
        testCases: []
      }
    ]);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const cleanedData = {
        ...data,
        finalExam: showFinalExam ? data.finalExam : null
      };

      const response = await axios.post("http://localhost:5000/api/courses", cleanedData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 201) {
        // Clear saved draft on successful submission
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(UI_STATE_KEY);
        alert("✅ Course created successfully!");
        navigate("/admin-home");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      setSubmitError(
        error.response?.data?.message || 
        error.response?.data?.error ||
        "Failed to create course. Please check all required fields."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-create-course">
      <div className="create-course-header">
        <div className="header-content">
          Create New Course
          {isSaving ? (
            <small className="saving-info">
              Saving...
            </small>
          ) : lastSaved ? (
            <small className="last-saved-info">
              Last saved: {lastSaved.toLocaleTimeString()}
            </small>
          ) : null}
        </div>
        <div className="header-actions">
          <div className="auto-save-toggle">
            <label className="toggle-switch small">
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-text">Auto-save</span>
          </div>
          <Button
            type="button"
            onClick={manualSave}
            variant="outline"
            size="sm"
            loading={false}
            disabled={false}
          >
            <Save size={16} />
            Save Draft
          </Button>
          <Button
            type="button"
            onClick={clearDraft}
            variant="outline"
            size="sm"
            loading={false}
            disabled={false}
          >
            <RefreshCw size={16} />
            Clear
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to cancel? Unsaved changes will be preserved in draft.")) {
                navigate("/admin-home");
              }
            }}
            variant="outline"
            size="sm"
            loading={false}
            disabled={false}
          >
            <X size={16} />
            Cancel
          </Button>
        </div>
      </div>

      {/* Draft Info Banner */}
      {localStorage.getItem(STORAGE_KEY) && (
        <div className="draft-info-banner">
          <AlertCircle size={18} />
          <div className="banner-content">
            <strong>Draft Restored</strong>
            <p>Your previous work has been automatically restored. {autoSaveEnabled ? 'Auto-save is enabled.' : 'Auto-save is disabled.'}</p>
          </div>
        </div>
      )}

      <div className="tabs-navigation">
        <button
          type="button"
          className={`tab-button ${activeTab === "basic" ? "active" : ""}`}
          onClick={() => setActiveTab("basic")}
        >
          <BookOpen size={18} />
          Basic Info
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === "modules" ? "active" : ""}`}
          onClick={() => setActiveTab("modules")}
        >
          <FileText size={18} />
          Modules ({moduleFields.length})
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === "finalExam" ? "active" : ""}`}
          onClick={() => setActiveTab("finalExam")}
        >
          <Award size={18} />
          Final Exam
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <Settings size={18} />
          Settings
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="course-form">
        
        {activeTab === "basic" && (
          <div className="tab-content">
            <div className="form-section">
              <div className="section-header">
                <h2>📚 Course Information</h2>
              </div>
              
              <div className="form-group">
                <label htmlFor="title">
                  Course Title <span className="required">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  {...register("title", { required: "Course title is required" })}
                  placeholder="e.g., Complete Python Programming Course"
                  className={errors.title ? "error" : ""}
                />
                {errors.title && <span className="error-text">{String(errors.title.message)}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Course Description <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  {...register("description", { required: "Course description is required" })}
                  placeholder="Provide a comprehensive description of the course..."
                  rows={5}
                  className={errors.description ? "error" : ""}
                />
                {errors.description && <span className="error-text">{String(errors.description.message)}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="difficulty">
                    Difficulty Level <span className="required">*</span>
                  </label>
                  <select
                    id="difficulty"
                    {...register("difficulty")}
                    className="select-input"
                  >
                    <option value="easy">🟢 Easy</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="hard">🔴 Hard</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="testUnlockThreshold">
                    Test Unlock Threshold (%)
                  </label>
                  <input
                    id="testUnlockThreshold"
                    type="number"
                    min="0"
                    max="100"
                    {...register("testUnlockThreshold")}
                    placeholder="80"
                  />
                  <small className="helper-text">
                    Minimum score required to unlock module tests
                  </small>
                </div>
              </div>

              <div className="toggle-group">
                <div className="toggle-item">
                  <div className="toggle-label">
                    <span>Course Active Status</span>
                    <small>Make this course visible to students</small>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      {...register("isActive")}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className={`status-badge ${watchedIsActive ? "active" : "inactive"}`}>
                    {watchedIsActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "modules" && (
          <div className="tab-content">
            <div className="form-section">
              <div className="section-header">
                <h2>📖 Course Modules</h2>
                <Button
                  type="button"
                  onClick={addModule}
                  variant="primary"
                  size="sm"
                  loading={false}
                  disabled={false}
                >
                  <Plus size={16} />
                  Add Module
                </Button>
              </div>

              {moduleFields.length === 0 && (
                <div className="empty-state">
                  <FileText size={48} className="empty-icon" />
                  <h3>No modules yet</h3>
                  <p>Start by adding your first course module</p>
                  <Button
                    type="button"
                    onClick={addModule}
                    variant="primary"
                    loading={false}
                    disabled={false}
                  >
                    <Plus size={16} />
                    Create First Module
                  </Button>
                </div>
              )}

              {moduleFields.map((module, moduleIndex) => (
                <div key={module.id} className="module-card">
                  <div className="module-header" onClick={() => toggleModule(moduleIndex)}>
                    <div className="module-title-section">
                      <span className="module-number">{moduleIndex + 1}</span>
                      <h3>{watchedModules[moduleIndex]?.title || "Untitled Module"}</h3>
                    </div>
                    <div className="module-actions">
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeModule(moduleIndex);
                        }}
                        variant="danger"
                        size="sm"
                        loading={false}
                        disabled={false}
                      >
                        <Trash2 size={14} />
                        Delete
                      </Button>
                      {expandedModules.includes(moduleIndex) ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  </div>

                  {expandedModules.includes(moduleIndex) && (
                    <div className="module-content">
                      <div className="form-group">
                        <label>
                          Module Title <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          {...register(`modules.${moduleIndex}.title`, {
                            required: "Module title is required"
                          })}
                          placeholder="e.g., Introduction to Python"
                        />
                      </div>

                      <div className="form-group">
                        <label>Module Description</label>
                        <textarea
                          {...register(`modules.${moduleIndex}.description`)}
                          placeholder="Describe what students will learn in this module..."
                          rows={3}
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Order</label>
                          <input
                            type="number"
                            min="0"
                            {...register(`modules.${moduleIndex}.order`)}
                            placeholder="0"
                          />
                        </div>

                        <div className="form-group">
                          <label>Estimated Duration</label>
                          <input
                            type="text"
                            {...register(`modules.${moduleIndex}.estimatedDuration`)}
                            placeholder="e.g., 2-3 hours"
                          />
                        </div>
                      </div>

                      <div className="subsection">
                        <h4>📝 Theory Content</h4>
                        <div className="form-group">
                          <label>Text Content</label>
                          <textarea
                            {...register(`modules.${moduleIndex}.theory.textContent`)}
                            placeholder="Enter theoretical content for this module..."
                            rows={6}
                          />
                        </div>

                        <div className="file-upload-group">
                          <h5>📎 Attachments</h5>
                          <div className="form-row">
                            <div className="form-group">
                              <label>PDF File Name</label>
                              <input
                                type="text"
                                {...register(`modules.${moduleIndex}.theory.files.pdf.name`)}
                                placeholder="document.pdf"
                              />
                            </div>
                            <div className="form-group">
                              <label>PDF URL</label>
                              <input
                                type="text"
                                {...register(`modules.${moduleIndex}.theory.files.pdf.url`)}
                                placeholder="https://..."
                              />
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>PPT File Name</label>
                              <input
                                type="text"
                                {...register(`modules.${moduleIndex}.theory.files.ppt.name`)}
                                placeholder="presentation.pptx"
                              />
                            </div>
                            <div className="form-group">
                              <label>PPT URL</label>
                              <input
                                type="text"
                                {...register(`modules.${moduleIndex}.theory.files.ppt.url`)}
                                placeholder="https://..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="subsection">
                        <div className="subsection-header">
                          <h4>💻 Code Examples</h4>
                          <Button
                            type="button"
                            onClick={() => addCodeExample(moduleIndex)}
                            variant="outline"
                            size="sm"
                            loading={false}
                            disabled={false}
                          >
                            <Plus size={14} />
                            Add Example
                          </Button>
                        </div>

                        {watchedModules[moduleIndex]?.snippets?.codeExamples?.map((example, exampleIndex) => (
                          <div key={exampleIndex} className="code-example-card">
                            <div className="card-header">
                              <span>Example {exampleIndex + 1}</span>
                              <Button
                                type="button"
                                onClick={() => removeCodeExample(moduleIndex, exampleIndex)}
                                variant="danger"
                                size="xs"
                                loading={false}
                                disabled={false}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>

                            <div className="form-group">
                              <label>Title</label>
                              <input
                                type="text"
                                {...register(`modules.${moduleIndex}.snippets.codeExamples.${exampleIndex}.title`)}
                                placeholder="Example title"
                              />
                            </div>

                            <div className="form-group">
                              <label>Code</label>
                              <textarea
                                {...register(`modules.${moduleIndex}.snippets.codeExamples.${exampleIndex}.code`)}
                                placeholder="Write your code here..."
                                rows={4}
                                className="code-textarea"
                              />
                            </div>

                            <div className="form-row">
                              <div className="form-group">
                                <label>Language</label>
                                <select
                                  {...register(`modules.${moduleIndex}.snippets.codeExamples.${exampleIndex}.language`)}
                                  className="select-input"
                                >
                                  <option value="python">Python</option>
                                  <option value="javascript">JavaScript</option>
                                  <option value="java">Java</option>
                                  <option value="cpp">C++</option>
                                  <option value="c">C</option>
                                </select>
                              </div>
                              <div className="form-group">
                                <label>Category</label>
                                <input
                                  type="text"
                                  {...register(`modules.${moduleIndex}.snippets.codeExamples.${exampleIndex}.category`)}
                                  placeholder="e.g., loops, functions"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="subsection">
                        <div className="subsection-header">
                          <h4>🎓 Lectures</h4>
                          <Button
                            type="button"
                            onClick={() => addLectureToModule(moduleIndex)}
                            variant="outline"
                            size="sm"
                            loading={false}
                            disabled={false}
                          >
                            <Plus size={14} />
                            Add Lecture
                          </Button>
                        </div>

                        <div className="form-group">
                          <label>Lecture Module Name</label>
                          <input
                            type="text"
                            {...register(`modules.${moduleIndex}.lecture.module`)}
                            placeholder="e.g., Python Basics"
                          />
                        </div>

                        {watchedModules[moduleIndex]?.lecture?.lectures?.map((lecture, lectureIndex) => (
                          <div key={lectureIndex} className="lecture-card">
                            <div 
                              className="lecture-header"
                              onClick={() => toggleLecture(moduleIndex, lectureIndex)}
                            >
                              <span>Lecture {lectureIndex + 1}: {lecture.topic || "Untitled"}</span>
                              <div className="lecture-header-actions">
                                <Button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeLectureFromModule(moduleIndex, lectureIndex);
                                  }}
                                  variant="danger"
                                  size="xs"
                                  loading={false}
                                  disabled={false}
                                >
                                  <Trash2 size={12} />
                                </Button>
                                {expandedLectures[`${moduleIndex}-${lectureIndex}`] ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </div>
                            </div>

                            {expandedLectures[`${moduleIndex}-${lectureIndex}`] && (
                              <div className="lecture-content">
                                <div className="form-group">
                                  <label>Topic</label>
                                  <input
                                    type="text"
                                    {...register(`modules.${moduleIndex}.lecture.lectures.${lectureIndex}.topic`)}
                                    placeholder="e.g., Variables and Data Types"
                                  />
                                </div>

                                <div className="form-group">
                                  <label>Syntax</label>
                                  <textarea
                                    {...register(`modules.${moduleIndex}.lecture.lectures.${lectureIndex}.content.syntax`)}
                                    placeholder="Write syntax..."
                                    rows={2}
                                    className="code-textarea"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="subsection">
                        <div className="subsection-header">
                          <h4>🎯 Module MCQs</h4>
                          <Button
                            type="button"
                            onClick={() => addMCQToModule(moduleIndex)}
                            variant="outline"
                            size="sm"
                            loading={false}
                            disabled={false}
                          >
                            <Plus size={14} />
                            Add MCQ
                          </Button>
                        </div>

                        {watchedModules[moduleIndex]?.mcqs?.map((mcq, mcqIndex) => (
                          <div key={mcqIndex} className="mcq-card">
                            <div className="card-header">
                              <span>MCQ {mcqIndex + 1}</span>
                              <div className="card-header-actions">
                                <select
                                  {...register(`modules.${moduleIndex}.mcqs.${mcqIndex}.difficulty`)}
                                  className="difficulty-select"
                                >
                                  <option value="easy">Easy</option>
                                  <option value="medium">Medium</option>
                                  <option value="hard">Hard</option>
                                </select>
                                <input
                                  type="number"
                                  {...register(`modules.${moduleIndex}.mcqs.${mcqIndex}.marks`)}
                                  placeholder="Marks"
                                  className="marks-input"
                                  min="0.5"
                                />
                                <Button
                                  type="button"
                                  onClick={() => removeMCQFromModule(moduleIndex, mcqIndex)}
                                  variant="danger"
                                  size="xs"
                                  loading={false}
                                  disabled={false}
                                >
                                  <Trash2 size={12} />
                                </Button>
                              </div>
                            </div>

                            <div className="form-group">
                              <label>Question</label>
                              <input
                                type="text"
                                {...register(`modules.${moduleIndex}.mcqs.${mcqIndex}.question`)}
                                placeholder="Enter your question"
                              />
                            </div>

                            <div className="options-grid">
                              {[0, 1, 2, 3].map((optionIndex) => (
                                <div key={optionIndex} className="form-group">
                                  <label>Option {optionIndex + 1}</label>
                                  <input
                                    type="text"
                                    {...register(`modules.${moduleIndex}.mcqs.${mcqIndex}.options.${optionIndex}`)}
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                </div>
                              ))}
                            </div>

                            <div className="form-row">
                              <div className="form-group">
                                <label>Correct Answer</label>
                                <select
                                  {...register(`modules.${moduleIndex}.mcqs.${mcqIndex}.correct`)}
                                  className="select-input"
                                >
                                  <option value={0}>Option 1</option>
                                  <option value={1}>Option 2</option>
                                  <option value={2}>Option 3</option>
                                  <option value={3}>Option 4</option>
                                </select>
                              </div>
                            </div>

                            <div className="form-group">
                              <label>Explanation</label>
                              <textarea
                                {...register(`modules.${moduleIndex}.mcqs.${mcqIndex}.explanation`)}
                                placeholder="Explain the correct answer..."
                                rows={2}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="subsection">
                        <div className="subsection-header">
                          <h4>💻 Coding Challenges</h4>
                          <Button
                            type="button"
                            onClick={() => addCodingChallengeToModule(moduleIndex)}
                            variant="outline"
                            size="sm"
                            loading={false}
                            disabled={false}
                          >
                            <Plus size={14} />
                            Add Challenge
                          </Button>
                        </div>

                        {watchedModules[moduleIndex]?.codeChallenges?.map((challenge, challengeIndex) => (
                          <div key={challengeIndex} className="coding-card">
                            <div className="card-header">
                              <span>Challenge {challengeIndex + 1}</span>
                              <div className="card-header-actions">
                                <select
                                  {...register(`modules.${moduleIndex}.codeChallenges.${challengeIndex}.difficulty`)}
                                  className="difficulty-select"
                                >
                                  <option value="easy">Easy</option>
                                  <option value="medium">Medium</option>
                                  <option value="hard">Hard</option>
                                </select>
                                <input
                                  type="number"
                                  {...register(`modules.${moduleIndex}.codeChallenges.${challengeIndex}.marks`)}
                                  placeholder="Marks"
                                  className="marks-input"
                                  min="1"
                                />
                                <Button
                                  type="button"
                                  onClick={() => removeCodingChallengeFromModule(moduleIndex, challengeIndex)}
                                  variant="danger"
                                  size="xs"
                                  loading={false}
                                  disabled={false}
                                >
                                  <Trash2 size={12} />
                                </Button>
                              </div>
                            </div>

                            <div className="form-group">
                              <label>Title</label>
                              <input
                                type="text"
                                {...register(`modules.${moduleIndex}.codeChallenges.${challengeIndex}.title`)}
                                placeholder="Challenge title"
                              />
                            </div>

                            <div className="form-group">
                              <label>Description</label>
                              <textarea
                                {...register(`modules.${moduleIndex}.codeChallenges.${challengeIndex}.description`)}
                                placeholder="Describe the challenge..."
                                rows={3}
                              />
                            </div>

                            <div className="form-row">
                              <div className="form-group">
                                <label>Language</label>
                                <select
                                  {...register(`modules.${moduleIndex}.codeChallenges.${challengeIndex}.language`)}
                                  className="select-input"
                                >
                                  <option value="python">Python</option>
                                  <option value="javascript">JavaScript</option>
                                  <option value="java">Java</option>
                                  <option value="cpp">C++</option>
                                  <option value="c">C</option>
                                </select>
                              </div>
                              <div className="form-group">
                                <label>Time Limit (minutes)</label>
                                <input
                                  type="number"
                                  {...register(`modules.${moduleIndex}.codeChallenges.${challengeIndex}.timeLimit`)}
                                  placeholder="30"
                                  min="1"
                                />
                              </div>
                            </div>

                            <div className="form-group">
                              <label>Sample Input</label>
                              <textarea
                                {...register(`modules.${moduleIndex}.codeChallenges.${challengeIndex}.sampleInput`)}
                                placeholder="Sample input..."
                                rows={2}
                                className="code-textarea"
                              />
                            </div>

                            <div className="form-group">
                              <label>Sample Output</label>
                              <textarea
                                {...register(`modules.${moduleIndex}.codeChallenges.${challengeIndex}.sampleOutput`)}
                                placeholder="Expected output..."
                                rows={2}
                                className="code-textarea"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="subsection module-test-section">
                        <h4>📝 Module Test</h4>
                        
                        <div className="subsection-header">
                          <h5>Test MCQs</h5>
                          <Button
                            type="button"
                            onClick={() => addMCQToModule(moduleIndex, "moduleTest")}
                            variant="outline"
                            size="sm"
                            loading={false}
                            disabled={false}
                          >
                            <Plus size={14} />
                            Add MCQ
                          </Button>
                        </div>

                        {watchedModules[moduleIndex]?.moduleTest?.mcqs?.map((mcq, mcqIndex) => (
                          <div key={mcqIndex} className="mcq-card compact">
                            <div className="card-header">
                              <span>Test MCQ {mcqIndex + 1}</span>
                              <Button
                                type="button"
                                onClick={() => removeMCQFromModule(moduleIndex, mcqIndex, "moduleTest")}
                                variant="danger"
                                size="xs"
                                loading={false}
                                disabled={false}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>

                            <div className="form-group">
                              <label>Question</label>
                              <input
                                type="text"
                                {...register(`modules.${moduleIndex}.moduleTest.mcqs.${mcqIndex}.question`)}
                                placeholder="Enter question"
                              />
                            </div>

                            <div className="options-grid">
                              {[0, 1, 2, 3].map((optionIndex) => (
                                <div key={optionIndex} className="form-group">
                                  <input
                                    type="text"
                                    {...register(`modules.${moduleIndex}.moduleTest.mcqs.${mcqIndex}.options.${optionIndex}`)}
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                </div>
                              ))}
                            </div>

                            <div className="form-row">
                              <select
                                {...register(`modules.${moduleIndex}.moduleTest.mcqs.${mcqIndex}.correct`)}
                                className="select-input"
                              >
                                <option value={0}>Option 1</option>
                                <option value={1}>Option 2</option>
                                <option value={2}>Option 3</option>
                                <option value={3}>Option 4</option>
                              </select>
                              <input
                                type="number"
                                {...register(`modules.${moduleIndex}.moduleTest.mcqs.${mcqIndex}.marks`)}
                                placeholder="Marks"
                                className="marks-input"
                              />
                            </div>
                          </div>
                        ))}

                        <div className="subsection-header">
                          <h5>Test Coding Challenges</h5>
                          <Button
                            type="button"
                            onClick={() => addCodingChallengeToModule(moduleIndex, "moduleTest")}
                            variant="outline"
                            size="sm"
                            loading={false}
                            disabled={false}
                          >
                            <Plus size={14} />
                            Add Challenge
                          </Button>
                        </div>

                        {watchedModules[moduleIndex]?.moduleTest?.codeChallenges?.map((challenge, challengeIndex) => (
                          <div key={challengeIndex} className="coding-card compact">
                            <div className="card-header">
                              <span>Test Challenge {challengeIndex + 1}</span>
                              <Button
                                type="button"
                                onClick={() => removeCodingChallengeFromModule(moduleIndex, challengeIndex, "moduleTest")}
                                variant="danger"
                                size="xs"
                                loading={false}
                                disabled={false}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>

                            <div className="form-group">
                              <label>Title</label>
                              <input
                                type="text"
                                {...register(`modules.${moduleIndex}.moduleTest.codeChallenges.${challengeIndex}.title`)}
                                placeholder="Challenge title"
                              />
                            </div>

                            <div className="form-group">
                              <label>Description</label>
                              <textarea
                                {...register(`modules.${moduleIndex}.moduleTest.codeChallenges.${challengeIndex}.description`)}
                                placeholder="Describe the challenge..."
                                rows={3}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "finalExam" && (
          <div className="tab-content">
            <div className="form-section">
              <div className="section-header">
                <h2>🏆 Final Course Exam</h2>
                <div className="toggle-item inline">
                  <span>Enable Final Exam</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={showFinalExam}
                      onChange={(e) => setShowFinalExam(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              {showFinalExam && (
                <>
                  <div className="form-group">
                    <label>Exam Title</label>
                    <input
                      type="text"
                      {...register("finalExam.title")}
                      placeholder="Final Course Assessment"
                    />
                  </div>

                  <div className="form-group">
                    <label>Exam Description</label>
                    <textarea
                      {...register("finalExam.description")}
                      placeholder="Describe the final exam..."
                      rows={3}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Duration (minutes)</label>
                      <input
                        type="number"
                        {...register("finalExam.duration")}
                        placeholder="120"
                        min="1"
                      />
                    </div>

                    <div className="form-group">
                      <label>Total Marks</label>
                      <input
                        type="number"
                        {...register("finalExam.totalMarks")}
                        placeholder="1000"
                        min="1"
                      />
                    </div>

                    <div className="form-group">
                      <label>Passing Score (%)</label>
                      <input
                        type="number"
                        {...register("finalExam.passingScore")}
                        placeholder="70"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="subsection security-section">
                    <div className="subsection-header">
                      <h4><Lock size={18} /> Security Settings</h4>
                      <div className="toggle-item inline">
                        <span>Secure Exam Mode</span>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            {...register("finalExam.isSecure")}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>

                    <div className="security-grid">
                      <div className="toggle-item">
                        <div className="toggle-label">
                          <Copy size={16} />
                          <span>Prevent Copy/Paste</span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            {...register("finalExam.securitySettings.preventCopyPaste")}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="toggle-item">
                        <div className="toggle-label">
                          <Eye size={16} />
                          <span>Prevent Tab Switch</span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            {...register("finalExam.securitySettings.preventTabSwitch")}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="toggle-item">
                        <div className="toggle-label">
                          <MousePointer size={16} />
                          <span>Prevent Right Click</span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            {...register("finalExam.securitySettings.preventRightClick")}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="toggle-item">
                        <div className="toggle-label">
                          <Maximize size={16} />
                          <span>Fullscreen Required</span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            {...register("finalExam.securitySettings.fullScreenRequired")}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="toggle-item">
                        <div className="toggle-label">
                          <Monitor size={16} />
                          <span>Webcam Monitoring</span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            {...register("finalExam.securitySettings.webcamMonitoring")}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="subsection">
                    <div className="subsection-header">
                      <h4>📝 Exam MCQs</h4>
                      <Button
                        type="button"
                        onClick={addFinalExamMCQ}
                        variant="outline"
                        size="sm"
                        loading={false}
                        disabled={false}
                      >
                        <Plus size={14} />
                        Add MCQ
                      </Button>
                    </div>

                    {watchedFinalExam?.mcqs?.map((mcq, mcqIndex) => (
                      <div key={mcqIndex} className="mcq-card">
                        <div className="card-header">
                          <span>MCQ {mcqIndex + 1}</span>
                          <div className="card-header-actions">
                            <select
                              {...register(`finalExam.mcqs.${mcqIndex}.difficulty`)}
                              className="difficulty-select"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                            <input
                              type="number"
                              {...register(`finalExam.mcqs.${mcqIndex}.marks`)}
                              placeholder="Marks"
                              className="marks-input"
                            />
                            <Button
                              type="button"
                              onClick={() => {
                                const updated = watchedFinalExam.mcqs.filter((_, idx) => idx !== mcqIndex);
                                setValue("finalExam.mcqs", updated);
                              }}
                              variant="danger"
                              size="xs"
                              loading={false}
                              disabled={false}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Question</label>
                          <input
                            type="text"
                            {...register(`finalExam.mcqs.${mcqIndex}.question`)}
                            placeholder="Enter question"
                          />
                        </div>

                        <div className="options-grid">
                          {[0, 1, 2, 3].map((optionIndex) => (
                            <div key={optionIndex} className="form-group">
                              <label>Option {optionIndex + 1}</label>
                              <input
                                type="text"
                                {...register(`finalExam.mcqs.${mcqIndex}.options.${optionIndex}`)}
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Correct Answer</label>
                            <select
                              {...register(`finalExam.mcqs.${mcqIndex}.correct`)}
                              className="select-input"
                            >
                              <option value={0}>Option 1</option>
                              <option value={1}>Option 2</option>
                              <option value={2}>Option 3</option>
                              <option value={3}>Option 4</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Explanation</label>
                          <textarea
                            {...register(`finalExam.mcqs.${mcqIndex}.explanation`)}
                            placeholder="Explain the answer..."
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="subsection">
                    <div className="subsection-header">
                      <h4>💻 Coding Challenges</h4>
                      <Button
                        type="button"
                        onClick={addFinalExamCodingChallenge}
                        variant="outline"
                        size="sm"
                        loading={false}
                        disabled={false}
                      >
                        <Plus size={14} />
                        Add Challenge
                      </Button>
                    </div>

                    {watchedFinalExam?.codeChallenges?.map((challenge, challengeIndex) => (
                      <div key={challengeIndex} className="coding-card">
                        <div className="card-header">
                          <span>Challenge {challengeIndex + 1}</span>
                          <div className="card-header-actions">
                            <select
                              {...register(`finalExam.codeChallenges.${challengeIndex}.difficulty`)}
                              className="difficulty-select"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                            <input
                              type="number"
                              {...register(`finalExam.codeChallenges.${challengeIndex}.marks`)}
                              placeholder="Marks"
                              className="marks-input"
                            />
                            <Button
                              type="button"
                              onClick={() => {
                                const updated = watchedFinalExam.codeChallenges.filter((_, idx) => idx !== challengeIndex);
                                setValue("finalExam.codeChallenges", updated);
                              }}
                              variant="danger"
                              size="xs"
                              loading={false}
                              disabled={false}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Title</label>
                          <input
                            type="text"
                            {...register(`finalExam.codeChallenges.${challengeIndex}.title`)}
                            placeholder="Challenge title"
                          />
                        </div>

                        <div className="form-group">
                          <label>Description</label>
                          <textarea
                            {...register(`finalExam.codeChallenges.${challengeIndex}.description`)}
                            placeholder="Describe the challenge..."
                            rows={4}
                          />
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Language</label>
                            <select
                              {...register(`finalExam.codeChallenges.${challengeIndex}.language`)}
                              className="select-input"
                            >
                              <option value="python">Python</option>
                              <option value="javascript">JavaScript</option>
                              <option value="java">Java</option>
                              <option value="cpp">C++</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Time Limit (min)</label>
                            <input
                              type="number"
                              {...register(`finalExam.codeChallenges.${challengeIndex}.timeLimit`)}
                              placeholder="30"
                              min="1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {!showFinalExam && (
                <div className="empty-state">
                  <Award size={48} className="empty-icon" />
                  <h3>No Final Exam</h3>
                  <p>Enable the final exam to add comprehensive assessment</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="tab-content">
            <div className="form-section">
              <div className="section-header">
                <h2>⚙️ Scoring Configuration</h2>
                <p className="section-description">Configure marks for different types of assessments</p>
              </div>

              <div className="scoring-grid">
                <div className="scoring-category">
                  <h4>📚 Lesson Assessments</h4>
                  <div className="form-group">
                    <label>MCQ Marks (per question)</label>
                    <input
                      type="number"
                      {...register("scoringConfig.lessonMcqMarks")}
                      placeholder="5"
                      min="0.5"
                    />
                  </div>
                  <div className="form-group">
                    <label>Coding Challenge Marks</label>
                    <input
                      type="number"
                      {...register("scoringConfig.lessonCodingMarks")}
                      placeholder="25"
                      min="1"
                    />
                  </div>
                </div>

                <div className="scoring-category">
                  <h4>📝 Module Test</h4>
                  <div className="form-group">
                    <label>MCQ Marks (per question)</label>
                    <input
                      type="number"
                      {...register("scoringConfig.moduleTestMcqMarks")}
                      placeholder="15"
                      min="0.5"
                    />
                  </div>
                  <div className="form-group">
                    <label>Coding Challenge Marks</label>
                    <input
                      type="number"
                      {...register("scoringConfig.moduleTestCodingMarks")}
                      placeholder="75"
                      min="1"
                    />
                  </div>
                </div>

                <div className="scoring-category">
                  <h4>🏆 Final Exam</h4>
                  <div className="form-group">
                    <label>MCQ Marks (per question)</label>
                    <input
                      type="number"
                      {...register("scoringConfig.finalExamMcqMarks")}
                      placeholder="20"
                      min="0.5"
                    />
                  </div>
                  <div className="form-group">
                    <label>Coding Challenge Marks</label>
                    <input
                      type="number"
                      {...register("scoringConfig.finalExamCodingMarks")}
                      placeholder="100"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions-bar">
          <div className="actions-left">
            {submitError && (
              <div className="error-alert">
                <AlertCircle size={16} />
                <span>{submitError}</span>
              </div>
            )}
            <div className="import-export-actions">
              <input
                type="file"
                id="import-draft"
                accept=".json"
                onChange={importDraft}
                style={{ display: 'none' }}
              />
              <Button
                type="button"
                onClick={() => document.getElementById('import-draft').click()}
                variant="outline"
                size="sm"
                loading={false}
                disabled={isSubmitting}
              >
                📥 Import
              </Button>
              <Button
                type="button"
                onClick={exportDraft}
                variant="outline"
                size="sm"
                loading={false}
                disabled={isSubmitting}
              >
                📤 Export
              </Button>
            </div>
          </div>
          
          <div className="actions-right">
            <Button
              type="button"
              onClick={() => navigate("/admin-home")}
              variant="outline"
              disabled={isSubmitting}
              loading={false}
            >
              <X size={16} />
              Cancel
            </Button>
            
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              variant="primary"
            >
              <Save size={16} />
              {isSubmitting ? "Creating Course..." : "Create Course"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateCourse;
