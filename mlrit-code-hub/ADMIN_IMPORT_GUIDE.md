# Admin Course Import Guide

## 🎯 Overview

The Course Import System is now integrated into the Admin Create Course page, allowing you to import course content at various levels of granularity.

## 📍 Where to Find Import Feature

### In Admin Create Course Page
1. Navigate to **Admin Home**
2. Click **Create New Course**
3. Look for the **"Import Content"** button in the header actions (next to Save Draft)

## 🚀 How to Use Import

### Step 1: Click Import Content Button
- Located in the top-right header of the Create Course page
- Opens the import modal dialog

### Step 2: Select Import Type
Choose from 8 different import types:

1. **Complete Course** - Import entire course with all modules
2. **Single Module** - Add one module to existing course
3. **Bulk Modules** - Add multiple modules at once
4. **Lecture Content** - Import lecture materials
5. **Code Snippets** - Import code examples
6. **Theory Content** - Import theory text and files
7. **MCQs** - Import MCQ questions
8. **Coding Challenges** - Import coding problems

### Step 3: Configure Import Settings

#### For MCQs and Coding Challenges:
Select **Target Location**:
- **Module Practice** - For practice questions
- **Module Test** - For assessment questions

### Step 4: Select JSON File
- Click "Choose JSON file" button
- Select your prepared JSON file
- File must be in valid JSON format

### Step 5: Download Example (Optional)
- Click "Download Example" to get a template
- Use the template to structure your data correctly

### Step 6: Import
- Click the **"Import"** button
- Wait for the import to complete
- View success message with statistics

## 📁 Example Files Location

Example JSON files are available in:
```
backend/import-examples/
├── complete-course-example.json
├── module-example.json
├── bulk-modules-example.json
├── lecture-content-example.json
├── code-snippets-example.json
├── theory-content-example.json
├── mcqs-example.json
└── coding-challenges-example.json
```

## 🎨 Import Scenarios

### Scenario 1: Starting a New Course from JSON
**Use Case:** You have a complete course prepared in JSON format

**Steps:**
1. Click "Import Content" button
2. Select "Complete Course"
3. Choose your course JSON file
4. Click Import
5. Course will be created automatically
6. Page will refresh to show the new course

**Example File:** `complete-course-example.json`

---

### Scenario 2: Adding Modules to Existing Course
**Use Case:** You want to add modules to a course you're creating

**Steps:**
1. Create course basic info first
2. Save the course (get course ID)
3. Click "Import Content"
4. Select "Single Module" or "Bulk Modules"
5. Provide course ID when prompted
6. Choose your module JSON file
7. Click Import

**Example Files:** 
- `module-example.json` (single)
- `bulk-modules-example.json` (multiple)

---

### Scenario 3: Importing MCQs to Module
**Use Case:** You have MCQ questions prepared separately

**Steps:**
1. Ensure you have course ID and module ID
2. Click "Import Content"
3. Select "MCQs"
4. Choose target: "Module Practice" or "Module Test"
5. Select your MCQs JSON file
6. Click Import

**Example File:** `mcqs-example.json`

**JSON Structure:**
```json
{
  "target": "module",
  "mcqs": [
    {
      "question": "What is Python?",
      "options": ["A snake", "A language", "A framework", "A database"],
      "correct": 1,
      "explanation": "Python is a programming language",
      "marks": 1,
      "difficulty": "easy"
    }
  ]
}
```

---

### Scenario 4: Importing Coding Challenges
**Use Case:** You have coding problems prepared

**Steps:**
1. Ensure you have course ID and module ID
2. Click "Import Content"
3. Select "Coding Challenges"
4. Choose target: "Module Practice" or "Module Test"
5. Select your challenges JSON file
6. Click Import

**Example File:** `coding-challenges-example.json`

---

### Scenario 5: Importing Lecture Content
**Use Case:** You have structured lecture materials

**Steps:**
1. Ensure you have course ID and module ID
2. Click "Import Content"
3. Select "Lecture Content"
4. Select your lecture JSON file
5. Click Import

**Example File:** `lecture-content-example.json`

---

## ✅ Import Requirements

### For Complete Course Import:
- ✅ Valid JSON file
- ✅ Course title and description
- ✅ At least one module (recommended)

### For Module Import:
- ✅ Valid JSON file
- ✅ Course ID (existing course)
- ✅ Module title and order

### For Content Import (Lecture, Snippets, Theory):
- ✅ Valid JSON file
- ✅ Course ID
- ✅ Module ID

### For MCQs/Challenges Import:
- ✅ Valid JSON file
- ✅ Course ID
- ✅ Module ID
- ✅ Target selection (module or moduleTest)

## 🔍 Validation

The system automatically validates:
- JSON file format
- Required fields presence
- Data types correctness
- Value ranges (marks, difficulty, etc.)
- Array structures

If validation fails, you'll see detailed error messages.

## 📊 Import Success Indicators

After successful import, you'll see:
- ✅ Success message
- 📊 Import statistics:
  - Number of modules imported
  - Total MCQs added
  - Total challenges added
  - Other relevant counts

## 🐛 Troubleshooting

### Error: "Please select a valid JSON file"
**Solution:** Ensure your file has `.json` extension and valid JSON format

### Error: "Course ID is required"
**Solution:** You need an existing course ID for this import type. Create the course first.

### Error: "Module ID is required"
**Solution:** You need an existing module ID. Import or create the module first.

### Error: "Validation failed"
**Solution:** Check the error details. Common issues:
- Missing required fields
- Invalid data types
- Incorrect value ranges
- Malformed arrays

### Import button is disabled
**Solution:** 
- Ensure you've selected a file
- Check that all required IDs are provided
- Verify file is valid JSON

## 💡 Best Practices

### 1. Start with Examples
- Always download and review example files first
- Use examples as templates for your data

### 2. Validate Before Import
- Check JSON syntax using online validators
- Ensure all required fields are present
- Verify data types match schema

### 3. Import Order
Recommended sequence:
1. Import complete course OR create course manually
2. Import modules (if not included in course)
3. Import content to modules:
   - Theory content
   - Lecture content
   - Code snippets
   - Practice MCQs
   - Practice challenges
   - Module test MCQs
   - Module test challenges

### 4. Use Bulk Operations
- Import multiple modules at once using bulk import
- More efficient than importing one by one

### 5. Backup Your Data
- Keep copies of your JSON files
- Export course data regularly
- Version control your import files

### 6. Test Imports
- Test with small datasets first
- Verify imported content appears correctly
- Check all fields are populated

## 🎓 Quick Tips

### Tip 1: Prepare Data in Spreadsheet
- Use Excel/Google Sheets to organize data
- Export to CSV, then convert to JSON
- Use online CSV to JSON converters

### Tip 2: Use JSON Editors
- VS Code with JSON extension
- Online JSON editors with validation
- JSONLint for syntax checking

### Tip 3: Incremental Imports
- Don't try to import everything at once
- Import and verify in stages
- Easier to identify and fix issues

### Tip 4: Keep Examples Handy
- Bookmark the example files location
- Reference them when creating new content
- Copy-paste structure and modify

### Tip 5: Document Your Imports
- Keep notes on what was imported when
- Track course IDs and module IDs
- Maintain import logs

## 📞 Getting Help

### Check Documentation
- `IMPORT_SYSTEM_DOCUMENTATION.md` - Complete API docs
- `QUICK_REFERENCE.md` - Quick command reference
- `import-examples/README.md` - Detailed examples

### Common Resources
- Example JSON files in `backend/import-examples/`
- Course schema in `backend/models/Course.js`
- Import controller in `backend/controllers/importController.js`

### Error Messages
- Read error messages carefully
- Check validation errors list
- Verify against example files

## 🎯 Summary

The import system provides:
- ✅ **Flexible Import Options** - 8 different import types
- ✅ **Easy to Use** - Simple modal interface
- ✅ **Validation** - Automatic data validation
- ✅ **Examples** - Downloadable templates
- ✅ **Feedback** - Clear success/error messages
- ✅ **Statistics** - Import result summaries

Use the import feature to:
- Quickly create courses from existing data
- Bulk add content to courses
- Migrate content from other systems
- Share course templates with team
- Backup and restore course data

Happy importing! 🚀
