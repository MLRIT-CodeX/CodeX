# Course Import System - Admin Guide

## 🎯 Overview

The Course Import System allows you to import course content at multiple granularity levels:

- **Complete Course** - Import entire course with all modules and content
- **Individual Modules** - Import one module at a time
- **Bulk Modules** - Import multiple modules simultaneously
- **Specific Content** - Import only lecture content, code snippets, MCQs, or coding challenges

## 🚀 Getting Started

### Prerequisites
1. Admin account with valid authentication token
2. Course content prepared in JSON format
3. API testing tool (Postman, Insomnia, or cURL)

### Base URL
```
http://localhost:5000/api/import
```

## 📦 Import Options

### Option 1: Import Complete Course (Recommended for New Courses)

**Use when:** You have a complete course ready with all modules and content

**Endpoint:** `POST /api/import/course`

**Example:**
```bash
curl -X POST http://localhost:5000/api/import/course \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d @complete-course-example.json
```

**What gets imported:**
- Course metadata (title, description, difficulty)
- All modules with their order
- Theory content for each module
- Lecture content
- Code snippets
- Practice MCQs and challenges
- Module tests
- Scoring configuration

---

### Option 2: Import Individual Module (Recommended for Adding to Existing Course)

**Use when:** You want to add a single module to an existing course

**Endpoint:** `POST /api/import/course/:courseId/module`

**Example:**
```bash
curl -X POST http://localhost:5000/api/import/course/COURSE_ID/module \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d @module-example.json
```

**What gets imported:**
- Module metadata (title, description, order)
- All content within the module
- Module test

---

### Option 3: Bulk Import Modules (Recommended for Multiple Modules)

**Use when:** You want to add multiple modules at once

**Endpoint:** `POST /api/import/course/:courseId/modules/bulk`

**Example:**
```bash
curl -X POST http://localhost:5000/api/import/course/COURSE_ID/modules/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d @bulk-modules-example.json
```

**What gets imported:**
- Multiple modules in one request
- Faster than importing one by one

---

### Option 4: Import Specific Content Types

#### 4a. Import Lecture Content

**Use when:** You want to add/update only lecture content

**Endpoint:** `POST /api/import/course/:courseId/module/:moduleId/lecture`

**Example:**
```bash
curl -X POST http://localhost:5000/api/import/course/COURSE_ID/module/MODULE_ID/lecture \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d @lecture-content-example.json
```

---

#### 4b. Import Code Snippets

**Use when:** You want to add/update code examples

**Endpoint:** `POST /api/import/course/:courseId/module/:moduleId/snippets`

**Example:**
```bash
curl -X POST http://localhost:5000/api/import/course/COURSE_ID/module/MODULE_ID/snippets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d @code-snippets-example.json
```

---

#### 4c. Import Theory Content

**Use when:** You want to add/update theory materials (text, PDFs, PPTs)

**Endpoint:** `POST /api/import/course/:courseId/module/:moduleId/theory`

**Example:**
```bash
curl -X POST http://localhost:5000/api/import/course/COURSE_ID/module/MODULE_ID/theory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d @theory-content-example.json
```

---

#### 4d. Import MCQs

**Use when:** You want to add MCQ questions

**Endpoint:** `POST /api/import/course/:courseId/module/:moduleId/mcqs`

**Important:** Specify target location:
- `"target": "module"` - For practice MCQs
- `"target": "moduleTest"` - For module test MCQs

**Example:**
```bash
curl -X POST http://localhost:5000/api/import/course/COURSE_ID/module/MODULE_ID/mcqs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d @mcqs-example.json
```

---

#### 4e. Import Coding Challenges

**Use when:** You want to add coding problems

**Endpoint:** `POST /api/import/course/:courseId/module/:moduleId/challenges`

**Important:** Specify target location:
- `"target": "module"` - For practice challenges
- `"target": "moduleTest"` - For module test challenges

**Example:**
```bash
curl -X POST http://localhost:5000/api/import/course/COURSE_ID/module/MODULE_ID/challenges \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d @coding-challenges-example.json
```

---

## 📋 Step-by-Step Workflow

### Scenario 1: Creating a Brand New Course

1. **Prepare complete course JSON** using `complete-course-example.json` as template
2. **Import the entire course**
   ```bash
   POST /api/import/course
   ```
3. **Verify** the course was created successfully
4. **Note the course ID** from the response

### Scenario 2: Adding Modules to Existing Course

1. **Get the course ID** from your database or admin panel
2. **Prepare module JSON** using `module-example.json` as template
3. **Import the module**
   ```bash
   POST /api/import/course/{courseId}/module
   ```
4. **Note the module ID** from the response

### Scenario 3: Adding Content to Existing Module

1. **Get course ID and module ID**
2. **Prepare content JSON** (lecture, snippets, theory, MCQs, or challenges)
3. **Import the specific content**
   ```bash
   POST /api/import/course/{courseId}/module/{moduleId}/{contentType}
   ```
4. **Verify** the content was added

### Scenario 4: Bulk Adding Multiple Modules

1. **Get the course ID**
2. **Prepare bulk modules JSON** using `bulk-modules-example.json` as template
3. **Import all modules at once**
   ```bash
   POST /api/import/course/{courseId}/modules/bulk
   ```
4. **Verify** all modules were added

---

## 🎨 Using Postman

### Setup
1. Create a new request in Postman
2. Set method to `POST`
3. Enter the endpoint URL
4. Add headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_ADMIN_TOKEN`
5. In Body tab, select `raw` and `JSON`
6. Paste your JSON content
7. Click Send

### Example: Import Complete Course in Postman

**Method:** POST  
**URL:** `http://localhost:5000/api/import/course`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Body (raw JSON):**
```json
{
  "title": "Python Programming",
  "description": "Complete Python course",
  "difficulty": "medium",
  "modules": [...]
}
```

---

## ✅ Validation

Before importing, ensure your JSON:

### Course Level
- ✅ Has `title` (string, required)
- ✅ Has `description` (string, required)
- ✅ `difficulty` is one of: `easy`, `medium`, `hard`
- ✅ `modules` is an array (if provided)

### Module Level
- ✅ Has `title` (string, required)
- ✅ Has `order` (number, required)
- ✅ All nested content follows schema

### MCQ Level
- ✅ Has `question` (string, required)
- ✅ Has at least 2 `options` (array, required)
- ✅ `correct` is valid index (0 to options.length-1)
- ✅ `marks` is between 0.5 and 100
- ✅ `difficulty` is one of: `easy`, `medium`, `hard`

### Coding Challenge Level
- ✅ Has `title` (string, required)
- ✅ Has `description` (string, required)
- ✅ `difficulty` is one of: `easy`, `medium`, `hard`
- ✅ `testCases` is an array (if provided)

---

## 🔍 Response Examples

### Success Response
```json
{
  "success": true,
  "message": "Course imported successfully",
  "course": {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "title": "Python Programming",
    ...
  },
  "stats": {
    "modulesImported": 5,
    "totalMCQs": 50,
    "totalChallenges": 25
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Module 1: Module must have a valid order number",
    "MCQ 3: MCQ must have at least 2 options"
  ]
}
```

---

## 🐛 Troubleshooting

### Error: "Invalid course ID"
**Solution:** Verify the course ID is correct and the course exists

### Error: "Validation failed"
**Solution:** Check the error messages and fix the JSON structure

### Error: "Unauthorized"
**Solution:** Ensure your admin token is valid and not expired

### Error: "Module not found"
**Solution:** Verify the module ID exists in the specified course

### Import seems slow
**Solution:** Use bulk import for multiple modules instead of individual imports

---

## 💡 Best Practices

1. **Start Small** - Test with a single module before importing entire courses
2. **Validate First** - Check your JSON structure before importing
3. **Backup Data** - Always backup existing data before large imports
4. **Use Bulk Import** - For multiple modules, use bulk import endpoint
5. **Consistent Ordering** - Ensure module orders are sequential and unique
6. **Test Locally** - Test imports on local/dev environment first
7. **Check Logs** - Monitor server logs for detailed error information
8. **Version Control** - Keep your import JSON files in version control

---

## 📚 Example Files Reference

| File | Purpose | Use Case |
|------|---------|----------|
| `complete-course-example.json` | Full course structure | Creating new course |
| `module-example.json` | Single module | Adding one module |
| `bulk-modules-example.json` | Multiple modules | Adding many modules |
| `lecture-content-example.json` | Lecture content | Adding/updating lectures |
| `code-snippets-example.json` | Code examples | Adding code snippets |
| `theory-content-example.json` | Theory materials | Adding theory content |
| `mcqs-example.json` | MCQ questions | Adding MCQs |
| `coding-challenges-example.json` | Coding problems | Adding challenges |

---

## 🔗 Additional Resources

- **Full Documentation:** `IMPORT_SYSTEM_DOCUMENTATION.md`
- **Quick Reference:** `QUICK_REFERENCE.md`
- **Course Schema:** `backend/models/Course.js`
- **Import Controller:** `backend/controllers/importController.js`

---

## 📞 Support

If you encounter issues:
1. Check the error message in the response
2. Review the validation rules
3. Verify your JSON structure matches the examples
4. Check server logs for detailed errors
5. Ensure your admin token is valid

---

## 🎓 Summary

The import system provides flexible options for course content management:

- **Full Control:** Import entire courses or specific content
- **Granular Updates:** Update individual components without affecting others
- **Bulk Operations:** Import multiple modules efficiently
- **Validation:** Automatic validation ensures data integrity
- **Flexibility:** Choose the import level that fits your workflow

Choose the import method that best fits your needs and follow the examples provided!
