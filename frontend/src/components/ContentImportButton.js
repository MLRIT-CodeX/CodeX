import React, { useState } from 'react';
import { Upload, FileJson, AlertCircle, CheckCircle, X, Download } from 'lucide-react';
import Button from './ui/Button';
import axios from 'axios';
import './ContentImportButton.css';

const ContentImportButton = ({ 
  importType, 
  courseId, 
  moduleId, 
  onImportSuccess,
  buttonText,
  buttonSize = "sm",
  target = "module" // for MCQs and challenges
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(target);

  const token = localStorage.getItem('token');

  const importTypeConfig = {
    lecture: {
      label: 'Lecture Content',
      endpoint: `/api/import/course/${courseId}/module/${moduleId}/lecture`,
      exampleFile: 'lecture-content-example.json',
      needsTarget: false
    },
    snippets: {
      label: 'Code Snippets',
      endpoint: `/api/import/course/${courseId}/module/${moduleId}/snippets`,
      exampleFile: 'code-snippets-example.json',
      needsTarget: false
    },
    theory: {
      label: 'Theory Content',
      endpoint: `/api/import/course/${courseId}/module/${moduleId}/theory`,
      exampleFile: 'theory-content-example.json',
      needsTarget: false
    },
    mcqs: {
      label: 'MCQs',
      endpoint: `/api/import/course/${courseId}/module/${moduleId}/mcqs`,
      exampleFile: 'mcqs-example.json',
      needsTarget: true
    },
    challenges: {
      label: 'Coding Challenges',
      endpoint: `/api/import/course/${courseId}/module/${moduleId}/challenges`,
      exampleFile: 'coding-challenges-example.json',
      needsTarget: true
    }
  };

  const config = importTypeConfig[importType];

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

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
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
          
          // For "temp" IDs, we're in form mode - just return the data
          if (courseId === 'temp' || courseId.startsWith('temp-')) {
            // Return the imported data directly to the callback
            const result = {
              success: true,
              message: 'Content loaded successfully',
              ...jsonData
            };
            
            setImportResult(result);
            setFile(null);
            
            setTimeout(() => {
              if (onImportSuccess) {
                onImportSuccess(result);
              }
              setIsOpen(false);
              setImportResult(null);
            }, 1500);
            
            setIsImporting(false);
            return;
          }

          // Otherwise, make API call for existing courses
          let requestData = jsonData;
          if (config.needsTarget) {
            requestData = {
              ...jsonData,
              target: selectedTarget
            };
          }

          const response = await axios.post(
            `http://localhost:5000${config.endpoint}`,
            requestData,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }
          );

          setImportResult(response.data);
          setFile(null);
          
          // Call success callback after a short delay
          setTimeout(() => {
            if (onImportSuccess) {
              onImportSuccess(response.data);
            }
            setIsOpen(false);
            setImportResult(null);
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

  const downloadExampleFile = () => {
    if (config.exampleFile) {
      window.open(`/import-examples/${config.exampleFile}`, '_blank');
    }
  };

  const resetForm = () => {
    setFile(null);
    setError(null);
    setImportResult(null);
    setSelectedTarget(target);
  };

  const closeModal = () => {
    resetForm();
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="content-import-trigger-btn"
        style={{
          padding: buttonSize === 'xs' ? '4px 8px' : '6px 12px',
          fontSize: buttonSize === 'xs' ? '11px' : '13px'
        }}
      >
        <Upload size={buttonSize === 'xs' ? 12 : 14} />
        {buttonText || `Import ${config.label}`}
      </button>
    );
  }

  return (
    <div className="content-import-inline">
      <div className="content-import-card">
        <div className="content-import-header">
          <div className="header-title">
            <FileJson size={18} />
            <h4>Import {config.label}</h4>
          </div>
          <button className="close-button" onClick={closeModal} type="button">
            <X size={16} />
          </button>
        </div>

        <div className="content-import-body">
          {importResult ? (
            <div className="import-success">
              <CheckCircle size={36} className="success-icon" />
              <h5>Import Successful!</h5>
              <p>{importResult.message}</p>
              {importResult.importedCount !== undefined && (
                <div className="import-stat">
                  <span className="stat-label">Imported:</span>
                  <span className="stat-value">{importResult.importedCount}</span>
                </div>
              )}
            </div>
          ) : (
            <>
              {config.needsTarget && (
                <div className="form-group">
                  <label>Target Location</label>
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="select-input"
                  >
                    <option value="module">Module Practice</option>
                    <option value="moduleTest">Module Test</option>
                  </select>
                  <small className="helper-text">
                    Choose where to add the {config.label.toLowerCase()}
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
                    id={`import-file-${importType}`}
                  />
                  <label htmlFor={`import-file-${importType}`} className="file-input-label">
                    <Upload size={16} />
                    {file ? file.name : 'Choose JSON file'}
                  </label>
                </div>
                {file && (
                  <div className="file-selected">
                    <FileJson size={14} />
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        document.getElementById(`import-file-${importType}`).value = '';
                      }}
                      className="remove-file"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div className="example-download">
                <span>Need an example?</span>
                <button
                  type="button"
                  onClick={downloadExampleFile}
                  className="download-example-btn"
                >
                  <Download size={12} />
                  Download Example
                </button>
              </div>

              {error && (
                <div className="error-alert">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
            </>
          )}
        </div>

        {!importResult && (
          <div className="content-import-footer">
            <button
              type="button"
              onClick={closeModal}
              className="btn-cancel"
              disabled={isImporting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              className="btn-import"
              disabled={isImporting || !file}
            >
              {isImporting ? 'Importing...' : 'Import'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentImportButton;
