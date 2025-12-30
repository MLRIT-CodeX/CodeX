# Course Import System Documentation

## Overview
The Course Import System provides granular control for importing course content at different levels:
- **Entire Course** - Import complete course with all modules and content
- **Individual Modules** - Import single or multiple modules
- **Specific Content Types** - Import lecture content, code snippets, MCQs, coding challenges, theory content

## API Endpoints

### 1. Import Entire Course
**Endpoint:** `POST /api/import/course`  
**Access:** Admin only  
**Description:** Import a complete course with all modules, content, and assessments

**Request Body:**
```json
{
  "title": "Python Programming Fundamentals",
  "description": "Complete Python course from basics to advanced",
  "difficulty": "medium",
  "modules": [...],
  "scoringConfig": {...},
  "testUnlockThreshold": 80
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course imported successfully",
  "course": {...},
  "stats": {
    "modulesImported": 5,
    "totalMCQs": 50,
    "totalChallenges": 25
  }
}
```

---

### 2. Import Individual Module
**Endpoint:** `POST /api/import/course/:courseId/module`  
**Access:** Admin only  
**Description:** Import a single module to an existing course

**Request Body:**
```json
{
  "title": "Python Basics",
  "description": "Introduction to Python programming",
  "order": 1,
  "theory": {...},
  "snippets": {...},
  "lecture": {...},
  "mcqs": [...],
  "codeChallenges": [...],
  "moduleTest": {...}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Module imported successfully",
  "module": {...},
  "courseId": "...",
  "totalModules": 6
}
```

---

### 3. Bulk Import Modules
**Endpoint:** `POST /api/import/course/:courseId/modules/bulk`  
**Access:** Admin only  
**Description:** Import multiple modules at once

**Request Body:**
```json
{
  "modules": [
    {
      "title": "Module 1",
      "order": 1,
      ...
    },
    {
      "title": "Module 2",
      "order": 2,
      ...
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Modules bulk imported successfully",
  "importedCount": 3,
  "totalModules": 8,
  "courseId": "..."
}
```

---

### 4. Import Lecture Content
**Endpoint:** `POST /api/import/course/:courseId/module/:moduleId/lecture`  
**Access:** Admin only  
**Description:** Import lecture content to a specific module

**Request Body:**
```json
{
  "module": "Python Basics",
  "lectures": [
    {
      "topic": "Variables and Data Types",
      "content": {
        "definition": ["Variables store data..."],
        "syntax": "variable_name = value",
        "examples": [...],
        "keyTakeaways": [...],
        "practiceSection": {...}
      }
    }
  ],
  "estimatedDuration": "30-45 min"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lecture content imported successfully",
  "lecture": {...},
  "moduleId": "...",
  "totalLectures": 5
}
```

---

### 5. Import Code Snippets
**Endpoint:** `POST /api/import/course/:courseId/module/:moduleId/snippets`  
**Access:** Admin only  
**Description:** Import code examples to a specific module

**Request Body:**
```json
{
  "codeExamples": [
    {
      "title": "Hello World",
      "description": "Basic print statement",
      "code": "print('Hello, World!')",
      "language": "python",
      "category": "basics",
      "tags": ["print", "basics"]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Code snippets imported successfully",
  "snippets": {...},
  "moduleId": "...",
  "totalSnippets": 10
}
```

---

### 6. Import Theory Content
**Endpoint:** `POST /api/import/course/:courseId/module/:moduleId/theory`  
**Access:** Admin only  
**Description:** Import theory content (text, PDFs, PPTs, docs)

**Request Body:**
```json
{
  "textContent": "Python is a high-level programming language...",
  "files": {
    "pdf": {
      "name": "python_basics.pdf",
      "url": "https://example.com/files/python_basics.pdf"
    },
    "ppt": {
      "name": "python_intro.pptx",
      "url": "https://example.com/files/python_intro.pptx",
      "slides": [...],
      "totalSlides": 20
    },
    "doc": {
      "name": "python_notes.docx",
      "url": "https://example.com/files/python_notes.docx"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Theory content imported successfully",
  "theory": {...},
  "moduleId": "..."
}
```

---

### 7. Import MCQs
**Endpoint:** `POST /api/import/course/:courseId/module/:moduleId/mcqs`  
**Access:** Admin only  
**Description:** Import MCQs to module practice or module test

**Request Body:**
```json
{
  "target": "module",
  "mcqs": [
    {
      "question": "What is Python?",
      "options": [
        "A snake",
        "A programming language",
        "A framework",
        "A database"
      ],
      "correct": 1,
      "explanation": "Python is a high-level programming language",
      "marks": 1,
      "difficulty": "easy"
    }
  ]
}
```

**Parameters:**
- `target`: `"module"` (for practice MCQs) or `"moduleTest"` (for module test MCQs)

**Response:**
```json
{
  "success": true,
  "message": "MCQs imported successfully",
  "target": "module",
  "moduleId": "...",
  "importedCount": 10,
  "totalMCQs": 25
}
```

---

### 8. Import Coding Challenges
**Endpoint:** `POST /api/import/course/:courseId/module/:moduleId/challenges`  
**Access:** Admin only  
**Description:** Import coding challenges to module practice or module test

**Request Body:**
```json
{
  "target": "moduleTest",
  "challenges": [
    {
      "title": "Sum of Two Numbers",
      "description": "Write a function to add two numbers",
      "sampleInput": "5, 3",
      "sampleOutput": "8",
      "constraints": "Numbers are integers",
      "initialCode": "def add(a, b):\n    # Your code here\n    pass",
      "language": "python",
      "marks": 2,
      "difficulty": "easy",
      "timeLimit": 30,
      "testCases": [
        {
          "input": "5, 3",
          "expectedOutput": "8",
          "isHidden": false
        },
        {
          "input": "10, 20",
          "expectedOutput": "30",
          "isHidden": true
        }
      ]
    }
  ]
}
```

**Parameters:**
- `target`: `"module"` (for practice challenges) or `"moduleTest"` (for module test challenges)

**Response:**
```json
{
  "success": true,
  "message": "Coding challenges imported successfully",
  "target": "moduleTest",
  "moduleId": "...",
  "importedCount": 5,
  "totalChallenges": 15
}
```

---

## Validation Rules

### Course Validation
- ✅ Must have `title` (string)
- ✅ Must have `description` (string)
- ✅ `difficulty` must be: `easy`, `medium`, or `hard`
- ✅ `modules` must be an array (if provided)

### Module Validation
- ✅ Must have `title` (string)
- ✅ Must have `order` (number)
- ✅ All nested content (MCQs, challenges, etc.) must be valid

### MCQ Validation
- ✅ Must have `question` (string)
- ✅ Must have at least 2 `options` (array)
- ✅ `correct` index must be valid (0 to options.length-1)
- ✅ `marks` must be between 0.5 and 100
- ✅ `difficulty` must be: `easy`, `medium`, or `hard`

### Coding Challenge Validation
- ✅ Must have `title` (string)
- ✅ Must have `description` (string)
- ✅ `difficulty` must be: `easy`, `medium`, or `hard`
- ✅ `testCases` must be an array (if provided)

### Lecture Content Validation
- ✅ Must have `module` name (string)
- ✅ Must have at least one lecture in `lectures` array
- ✅ Each lecture must have a `topic`

### Code Snippets Validation
- ✅ Must have `codeExamples` array
- ✅ Each example must have `title` and `code`

---

## Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "MCQ 1: MCQ must have a valid question",
    "Module 2: Module must have a valid order number"
  ]
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Course not found"
}
```

### Server Error
```json
{
  "success": false,
  "message": "Failed to import course",
  "error": "Detailed error message"
}
```

---

## Usage Examples

### Example 1: Import Entire Course
```bash
curl -X POST http://localhost:5000/api/import/course \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d @complete_course.json
```

### Example 2: Import Single Module
```bash
curl -X POST http://localhost:5000/api/import/course/COURSE_ID/module \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d @module.json
```

### Example 3: Import MCQs to Module Test
```bash
curl -X POST http://localhost:5000/api/import/course/COURSE_ID/module/MODULE_ID/mcqs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "target": "moduleTest",
    "mcqs": [...]
  }'
```

---

## Best Practices

1. **Always validate data** before importing
2. **Use bulk import** for multiple modules to reduce API calls
3. **Import in order**: Course → Modules → Content
4. **Backup existing data** before large imports
5. **Test with small datasets** first
6. **Use appropriate target** (`module` vs `moduleTest`) for MCQs and challenges
7. **Ensure unique module orders** to avoid conflicts
8. **Include all required fields** to pass validation

---

## Import Workflow

### Recommended Import Order:
1. **Create Course** (if new) or get existing course ID
2. **Import Modules** (individual or bulk)
3. **Import Content** to each module:
   - Theory content
   - Lecture content
   - Code snippets
   - Practice MCQs (target: "module")
   - Practice challenges (target: "module")
   - Module test MCQs (target: "moduleTest")
   - Module test challenges (target: "moduleTest")

---

## Security

- All import endpoints require **admin authentication**
- Tokens must be valid and not expired
- Only users with `role: "admin"` can access import endpoints
- All data is validated before database insertion

---

## Support

For issues or questions:
1. Check validation errors in response
2. Verify JSON structure matches schema
3. Ensure all required fields are present
4. Check authentication token is valid
5. Review server logs for detailed errors
