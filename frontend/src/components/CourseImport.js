import React, { useState } from 'react';
import { Upload, FileJson, AlertCircle, CheckCircle, X, Download, FileText } from 'lucide-react';
import Button from './ui/Button';
import axios from 'axios';
import './CourseImport.css';

const CourseImport = ({ onImportSuccess, courseId = null, moduleId = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [importType, setImportType] = useState('course');
  const [file, setFile] = useState(null);
  const [target, setTarget] = useState('module'); // for MCQs and challenges
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  const importTypes = [
    { value: 'course', label: 'Complete Course', needsCourseId: false, needsModuleId: false },
    { value: 'module', label: 'Single Module', needsCourseId: true, needsModuleId: false },
    { value: 'bulkModules', label: 'Bulk Modules', needsCourseId: true, needsModuleId: false },
    { value: 'lecture', label: 'Lecture Content', needsCourseId: true, needsModuleId: true },
    { value: 'snippets', label: 'Code Snippets', needsCourseId: true, needsModuleId: true },
    { value: 'theory', label: 'Theory Content', needsCourseId: true, needsModuleId: true },
    { value: 'mcqs', label: 'MCQs', needsCourseId: true, needsModuleId: true },
    { value: 'challenges', label: 'Coding Challenges', needsCourseId: true, needsModuleId: true },
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid JSON file');
      setFile(null);
    }
  };

  const getImportEndpoint = () => {
    const baseUrl = 'http://localhost:5000/api/import';
    
    switch (importType) {
      case 'course':
        return `${baseUrl}/course`;
      case 'module':
        return `${baseUrl}/course/${courseId}/module`;
      case 'bulkModules':
        return `${baseUrl}/course/${courseId}/modules/bulk`;
      case 'lecture':
        return `${baseUrl}/course/${courseId}/module/${moduleId}/lecture`;
      case 'snippets':
        return `${baseUrl}/course/${courseId}/module/${moduleId}/snippets`;
      case 'theory':
        return `${baseUrl}/course/${courseId}/module/${moduleId}/theory`;
      case 'mcqs':
        return `${baseUrl}/course/${courseId}/module/${moduleId}/mcqs`;
      case 'challenges':
        return `${baseUrl}/course/${courseId}/module/${moduleId}/challenges`;
      default:
        return null;
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    const selectedType = importTypes.find(t => t.value === importType);
    if (selectedType.needsCourseId && !courseId) {
      setError('Course ID is required for this import type');
      return;
    }
    if (selectedType.needsModuleId && !moduleId) {
      setError('Module ID is required for this import type');
      return;
    }

    setIsImporting(true);
    setError(null);
    setImportResult(null);

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
              target: target
            };
          }

          const endpoint = getImportEndpoint();
          const response = await axios.post(endpoint, requestData, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          setImportResult(response.data);
          setFile(null);
          
          // Call success callback after a short delay to show success message
          setTimeout(() => {
            if (onImportSuccess) {
              onImportSuccess(response.data);
            }
          }, 2000);

        } catch (parseError) {
          console.error('Import error:', parseError);
          setError(
            parseError.response?.data?.message || 
            parseError.response?.data?.errors?.join(', ') ||
            'Failed to import. Please check the file format.'
          );
        } finally {
          setIsImporting(false);
        }
      };

      reader.onerror = () => {
        setError('Failed to read file');
        setIsImporting(false);
      };

      reader.readAsText(file);
    } catch (err) {
      console.error('File reading error:', err);
      setError('Failed to process file');
      setIsImporting(false);
    }
  };

  const downloadExampleFile = (type) => {
    const exampleFiles = {
      course: 'complete-course-example.json',
      module: 'module-example.json',
      bulkModules: 'bulk-modules-example.json',
      lecture: 'lecture-content-example.json',
      snippets: 'code-snippets-example.json',
      theory: 'theory-content-example.json',
      mcqs: 'mcqs-example.json',
      challenges: 'coding-challenges-example.json'
    };

    const filename = exampleFiles[type];
    if (filename) {
      window.open(`/import-examples/${filename}`, '_blank');
    }
  };

  const resetForm = () => {
    setFile(null);
    setError(null);
    setImportResult(null);
    setImportType('course');
    setTarget('module');
  };

  const closeModal = () => {
    resetForm();
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        loading={false}
        disabled={false}
      >
        <Upload size={16} />
        Import Content
      </Button>
    );
  }

  return (
    <div className="import-modal-overlay" onClick={closeModal}>
      <div className="import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="import-modal-header">
          <div className="header-title">
            <FileJson size={24} />
            <h2>Import Course Content</h2>
          </div>
          <button className="close-button" onClick={closeModal}>
            <X size={20} />
          </button>
        </div>

        <div className="import-modal-body">
          {importResult ? (
            <div className="import-success">
              <CheckCircle size={48} className="success-icon" />
              <h3>Import Successful!</h3>
              <p>{importResult.message}</p>
              {importResult.stats && (
                <div className="import-stats">
                  {importResult.stats.modulesImported && (
                    <div className="stat-item">
                      <span className="stat-label">Modules:</span>
                      <span className="stat-value">{importResult.stats.modulesImported}</span>
                    </div>
                  )}
                  {importResult.stats.totalMCQs !== undefined && (
                    <div className="stat-item">
                      <span className="stat-label">MCQs:</span>
                      <span className="stat-value">{importResult.stats.totalMCQs}</span>
                    </div>
                  )}
                  {importResult.stats.totalChallenges !== undefined && (
                    <div className="stat-item">
                      <span className="stat-label">Challenges:</span>
                      <span className="stat-value">{importResult.stats.totalChallenges}</span>
                    </div>
                  )}
                  {importResult.importedCount !== undefined && (
                    <div className="stat-item">
                      <span className="stat-label">Imported:</span>
                      <span className="stat-value">{importResult.importedCount}</span>
                    </div>
                  )}
                </div>
              )}
              <Button
                type="button"
                onClick={closeModal}
                variant="primary"
                loading={false}
                disabled={false}
              >
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Import Type</label>
                <select
                  value={importType}
                  onChange={(e) => {
                    setImportType(e.target.value);
                    setFile(null);
                    setError(null);
                  }}
                  className="select-input"
                >
                  {importTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <small className="helper-text">
                  Select what type of content you want to import
                </small>
              </div>

              {(importType === 'mcqs' || importType === 'challenges') && (
                <div className="form-group">
                  <label>Target Location</label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="select-input"
                  >
                    <option value="module">Module Practice</option>
                    <option value="moduleTest">Module Test</option>
                  </select>
                  <small className="helper-text">
                    Choose where to add the {importType === 'mcqs' ? 'MCQs' : 'challenges'}
                  </small>
                </div>
              )}

              <div className="form-group">
                <label>Select JSON File</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="file-input"
                    id="import-file"
                  />
                  <label htmlFor="import-file" className="file-input-label">
                    <Upload size={20} />
                    {file ? file.name : 'Choose JSON file'}
                  </label>
                </div>
                {file && (
                  <div className="file-selected">
                    <FileJson size={16} />
                    <span>{file.name}</span>
                    <button
                      onClick={() => {
                        setFile(null);
                        document.getElementById('import-file').value = '';
                      }}
                      className="remove-file"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="example-download">
                <FileText size={16} />
                <span>Need an example?</span>
                <button
                  onClick={() => downloadExampleFile(importType)}
                  className="download-example-btn"
                >
                  <Download size={14} />
                  Download Example
                </button>
              </div>

              {error && (
                <div className="error-alert">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="import-info">
                <AlertCircle size={16} />
                <div className="info-content">
                  <strong>Import Requirements:</strong>
                  <ul>
                    {importTypes.find(t => t.value === importType)?.needsCourseId && (
                      <li>Course ID: {courseId || '❌ Not provided'}</li>
                    )}
                    {importTypes.find(t => t.value === importType)?.needsModuleId && (
                      <li>Module ID: {moduleId || '❌ Not provided'}</li>
                    )}
                    <li>Valid JSON file format</li>
                    <li>All required fields must be present</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>

        {!importResult && (
          <div className="import-modal-footer">
            <Button
              type="button"
              onClick={closeModal}
              variant="outline"
              disabled={isImporting}
              loading={false}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              variant="primary"
              loading={isImporting}
              disabled={isImporting || !file}
            >
              {isImporting ? 'Importing...' : 'Import'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseImport;
