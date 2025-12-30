# Import System Quick Reference

## 📋 Quick Command Reference

### 1. Import Complete Course
```bash
POST /api/import/course
Body: complete-course-example.json
```

### 2. Import Single Module
```bash
POST /api/import/course/{courseId}/module
Body: module-example.json
```

### 3. Import Multiple Modules
```bash
POST /api/import/course/{courseId}/modules/bulk
Body: bulk-modules-example.json
```

### 4. Import Lecture Content
```bash
POST /api/import/course/{courseId}/module/{moduleId}/lecture
Body: lecture-content-example.json
```

### 5. Import Code Snippets
```bash
POST /api/import/course/{courseId}/module/{moduleId}/snippets
Body: code-snippets-example.json
```

### 6. Import Theory Content
```bash
POST /api/import/course/{courseId}/module/{moduleId}/theory
Body: theory-content-example.json
```

### 7. Import MCQs
```bash
POST /api/import/course/{courseId}/module/{moduleId}/mcqs
Body: mcqs-example.json
```

### 8. Import Coding Challenges
```bash
POST /api/import/course/{courseId}/module/{moduleId}/challenges
Body: coding-challenges-example.json
```

---

## 🎯 Import Targets

When importing MCQs or Coding Challenges, specify the target:

- **`"target": "module"`** - For practice questions/challenges
- **`"target": "moduleTest"`** - For module test assessments

---

## 📁 Example Files

All example JSON files are in the `backend/import-examples/` directory:

1. `complete-course-example.json` - Full course with modules
2. `module-example.json` - Single module with all content
3. `bulk-modules-example.json` - Multiple modules at once
4. `lecture-content-example.json` - Lecture content structure
5. `code-snippets-example.json` - Code examples
6. `theory-content-example.json` - Theory with files
7. `mcqs-example.json` - MCQ questions
8. `coding-challenges-example.json` - Coding problems

---

## 🔐 Authentication

All endpoints require admin authentication:

```bash
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## ✅ Validation Checklist

### Course
- [ ] Has title (string)
- [ ] Has description (string)
- [ ] Difficulty is: easy, medium, or hard
- [ ] Modules is an array (if provided)

### Module
- [ ] Has title (string)
- [ ] Has order (number)
- [ ] All nested content is valid

### MCQ
- [ ] Has question (string)
- [ ] Has at least 2 options (array)
- [ ] Correct index is valid (0 to options.length-1)
- [ ] Marks between 0.5 and 100
- [ ] Difficulty is: easy, medium, or hard

### Coding Challenge
- [ ] Has title (string)
- [ ] Has description (string)
- [ ] Difficulty is: easy, medium, or hard
- [ ] Test cases is an array (if provided)

### Lecture Content
- [ ] Has module name (string)
- [ ] Has at least one lecture
- [ ] Each lecture has a topic

### Code Snippets
- [ ] Has codeExamples array
- [ ] Each example has title and code

---

## 🚀 Recommended Workflow

1. **Prepare your data** in JSON format
2. **Validate** against the schema
3. **Test with small dataset** first
4. **Import in order**:
   - Create/get course
   - Import modules
   - Import content to modules
5. **Verify** the import was successful
6. **Check** the course in the admin panel

---

## 💡 Tips

- Use bulk import for multiple modules
- Import modules before their content
- Ensure unique module orders
- Include all required fields
- Test with Postman or curl first
- Check server logs for errors
- Backup data before large imports

---

## 🐛 Common Errors

### "Invalid course ID"
- Check that courseId is a valid MongoDB ObjectId
- Verify the course exists in the database

### "Validation failed"
- Review the error messages
- Check all required fields are present
- Verify data types match schema

### "Module not found"
- Ensure moduleId is correct
- Check that the module exists in the course

### "Unauthorized"
- Verify your admin token is valid
- Check token hasn't expired
- Ensure user has admin role

---

## 📞 Testing with cURL

### Import Complete Course
```bash
curl -X POST http://localhost:5000/api/import/course \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @complete-course-example.json
```

### Import Module
```bash
curl -X POST http://localhost:5000/api/import/course/COURSE_ID/module \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @module-example.json
```

### Import MCQs
```bash
curl -X POST http://localhost:5000/api/import/course/COURSE_ID/module/MODULE_ID/mcqs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @mcqs-example.json
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Content imported successfully",
  "data": {...},
  "stats": {...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...]
}
```

---

## 🔄 Import Order

**Recommended sequence:**

1. Course (if new)
2. Modules (bulk or individual)
3. Theory content
4. Lecture content
5. Code snippets
6. Practice MCQs (target: "module")
7. Practice challenges (target: "module")
8. Module test MCQs (target: "moduleTest")
9. Module test challenges (target: "moduleTest")

---

## 📚 Additional Resources

- Full documentation: `IMPORT_SYSTEM_DOCUMENTATION.md`
- Course schema: `backend/models/Course.js`
- Import controller: `backend/controllers/importController.js`
- Import routes: `backend/routes/importRoutes.js`
