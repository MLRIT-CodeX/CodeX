import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Download } from 'lucide-react';
import axios from 'axios';
import './CourseImportModal.css';

const CourseImportModal = ({ isOpen, onClose, onSuccess, courseId = null, moduleId = null }) => {
  const [importType, setImportType] = useState('course');
  const [importTarget, setImportTarget] = useState('module'); // for MCQs and challenges
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const token = localStorage.getItem('token');

  const importTypes = [
    { value: 'course', label: 'Complete Course', icon: '📚', description: 'Import entire course with all modules' },
    { value: 'module', label: 'Single Module', icon: '📖', description: 'Import one module to existing course', requiresCourseId: true },
    { value: 'modules-bulk', label: 'Bulk Modules', icon: '📚', description: 'Import multiple modules at once', requiresCourseId: true },
    { value: 'lecture', label: 'Lecture Content', icon: '🎓', description: 'Import lecture content', requiresModuleId: true },
    { value: 'snippets', label: 'Code Snippets', icon: '💻', description: 'Import code examples', requiresModuleId: true },
    { value: 'theory', label: 'Theory Content', icon: '📝', description: 'Import theory materials', requiresModuleId: true },
    { value: 'mcqs', label: 'MCQs', icon: '❓', description: 'Import MCQ questions', requiresModuleId: true },
    { value: 'challenges', label: 'Coding Challenges', icon: '🏆', description: 'Import coding problems', requiresModuleId: true }
  ];

  const getImportEndpoint = () => {
    const base = 'http://localhost:5000/api/import';
    
    switch (importType) {
      case 'course':
        return `${base}/course`;
      case 'module':
        return `${base}/course/${courseId}/module`;
      case 'modules-bulk':
        return `${base}/course/${courseId}/modules/bulk`;
      case 'lecture':
        return `${base}/course/${courseId}/module/${moduleId}/lecture`;
      case 'snippets':
        return `${base}/course/${courseId}/module/${moduleId}/snippets`;
      case 'theory':
        return `${base}/course/${courseId}/module/${moduleId}/theory`;
      case 'mcqs':
        return `${base}/course/${courseId}/module/${moduleId}/mcqs`;
      case 'challenges':
        return `${base}/course/${courseId}/module/${moduleId}/challenges`;
      default:
        return null;
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile);
      setImportStatus(null);
      setImportErrors([]);
    } else {
      alert('Please select a valid JSON file');
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file to import');
      return;
    }

    const selectedType = importTypes.find(t => t.value === importType);
    if (selectedType?.requiresCourseId && !courseId) {
      alert('Course ID is required for this import type');
      return;
    }
    if (selectedType?.requiresModuleId && !moduleId) {
      alert('Module ID is required for this import type');
      return;
    }

    setIsImporting(true);
    setImportStatus(null);
    setImportErrors([]);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          
          // Add target for MCQs and challenges
          let requestData = jsonData;
          if (importType === 'mcqs' || importType === 'challenges') {
            requestData = {
              ...jsonData,
              target: importTarget
            };
          }

          const endpoint = getImportEndpoint();
          const response = await axios.post(endpoint, requestData, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          setImportStatus('success');
          setImportErrors([]);
          
          // Show success message with stats
          const stats = response.data.stats || {};
          let successMessage = response.data.message || 'Import successful!';
          
          if (stats.modulesImported) {
            successMessage += `\n${stats.modulesImported} modules imported`;
          }
          if (stats.totalMCQs) {
            successMessage += `\n${stats.totalMCQs} MCQs imported`;
          }
          if (stats.totalChallenges) {
            successMessage += `\n${stats.totalChallenges} challenges imported`;
          }
          if (stats.importedCount) {
            successMessage += `\n${stats.importedCount} items imported`;
          }

          alert(successMessage);
          
          // Call success callback
          if (onSuccess) {
            onSuccess(response.data);
          }

          // Reset and close
          setTimeout(() => {
            handleClose();
          }, 1500);

        } catch (error) {
          console.error('Import error:', error);
          setImportStatus('error');
          
          const errorData = error.response?.data;
          if (errorData?.errors && Array.isArray(errorData.errors)) {
            setImportErrors(errorData.errors);
          } else {
            setImportErrors([errorData?.message || 'Failed to import. Please check the file format.']);
          }
        } finally {
          setIsImporting(false);
        }
      };

      reader.onerror = () => {
        setImportStatus('error');
        setImportErrors(['Failed to read file']);
        setIsImporting(false);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('File reading error:', error);
      setImportStatus('error');
      setImportErrors(['Failed to process file']);
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportType('course');
    setImportTarget('module');
    setImportStatus(null);
    setImportErrors([]);
    onClose();
  };

  const downloadExampleFile = (type) => {
    const exampleFiles = {
      'course': 'complete-course-example.json',
      'module': 'module-example.json',
      'modules-bulk': 'bulk-modules-example.json',
      'lecture': 'lecture-content-example.json',
      'snippets': 'code-snippets-example.json',
      'theory': 'theory-content-example.json',
      'mcqs': 'mcqs-example.json',
      'challenges': 'coding-challenges-example.json'
    };

    const filename = exampleFiles[type];
    if (filename) {
      alert(`Example file: ${filename}\nPlease download from backend/import-examples/ directory`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="import-modal-overlay">
      <div className="import-modal">
        <div className="import-modal-header">
          <h2>
            <Upload size={24} />
            Import Course Content
          </h2>
          <button onClick={handleClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="import-modal-body">
          {/* Import Type Selection */}
          <div className="import-type-section">
            <label className="section-label">Select Import Type</label>
            <div className="import-type-grid">
              {importTypes.map((type) => {
                const isDisabled = 
                  (type.requiresCourseId && !courseId) || 
                  (type.requiresModuleId && !moduleId);
                
                return (
                  <button
                    key={type.value}
                    type="button"
                    className={`import-type-card ${importType === type.value ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => !isDisabled && setImportType(type.value)}
                    disabled={isDisabled}
                  >
                    <span className="import-type-icon">{type.icon}</span>
                    <span className="import-type-label">{type.label}</span>
                    <span className="import-type-desc">{type.description}</span>
                    {isDisabled && (
                      <span className="disabled-badge">
                        {type.requiresModuleId ? 'Requires Module' : 'Requires Course'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Selection for MCQs and Challenges */}
          {(importType === 'mcqs' || importType === 'challenges') && (
            <div className="target-selection">
              <label className="section-label">Import Target</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="module"
                    checked={importTarget === 'module'}
                    onChange={(e) => setImportTarget(e.target.value)}
                  />
                  <span>Module Practice</span>
                  <small>For practice questions/challenges</small>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="moduleTest"
                    checked={importTarget === 'moduleTest'}
                    onChange={(e) => setImportTarget(e.target.value)}
                  />
                  <span>Module Test</span>
                  <small>For module test assessments</small>
                </label>
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="file-upload-section">
            <label className="section-label">Upload JSON File</label>
            <div className="file-upload-area">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                id="import-file-input"
                className="file-input"
              />
              <label htmlFor="import-file-input" className="file-upload-label">
                <FileText size={32} />
                <span className="upload-text">
                  {file ? file.name : 'Click to select JSON file'}
                </span>
                <span className="upload-hint">
                  Only .json files are accepted
                </span>
              </label>
            </div>
          </div>

          {/* Example File Link */}
          <div className="example-file-section">
            <button
              type="button"
              onClick={() => downloadExampleFile(importType)}
              className="example-file-btn"
            >
              <Download size={16} />
              View Example File Format
            </button>
          </div>

          {/* Import Status */}
          {importStatus && (
            <div className={`import-status ${importStatus}`}>
              {importStatus === 'success' ? (
                <>
                  <CheckCircle size={20} />
                  <span>Import successful!</span>
                </>
              ) : (
                <>
                  <AlertCircle size={20} />
                  <span>Import failed</span>
                </>
              )}
            </div>
          )}

          {/* Import Errors */}
          {importErrors.length > 0 && (
            <div className="import-errors">
              <h4>Validation Errors:</h4>
              <ul>
                {importErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Context Info */}
          {courseId && (
            <div className="context-info">
              <small>Course ID: {courseId}</small>
              {moduleId && <small>Module ID: {moduleId}</small>}
            </div>
          )}
        </div>

        <div className="import-modal-footer">
          <button
            type="button"
            onClick={handleClose}
            className="btn-secondary"
            disabled={isImporting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="btn-primary"
            disabled={!file || isImporting}
          >
            {isImporting ? (
              <>
                <span className="spinner"></span>
                Importing...
              </>
            ) : (
              <>
                <Upload size={16} />
                Import
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseImportModal;
