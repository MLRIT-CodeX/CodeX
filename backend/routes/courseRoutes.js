// routes/courseRoutes.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Course = require("../models/Course");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

/* ================================
   ✅ Health Check
================================ */
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Course API is running" });
});

/* ================================
   ✅ Get total MCQ count from all courses
================================ */
router.get("/mcq-totals", authenticateToken, async (req, res) => {
  try {
    console.log('� MCQ TOTALS ROUTE HIT! 🚨');
    console.log('�🔍 MCQ Totals API called by user:', req.user?.email || 'Unknown');
    console.log('🔍 Fetching total MCQ counts from all courses...');
    
    const courses = await Course.find({}).select('modules topics finalExam title');
    console.log(`📚 Found ${courses.length} courses in database`);
    
    let totalModuleTestMCQs = 0;
    let totalFinalExamMCQs = 0;
    
    courses.forEach(course => {
      console.log(`📚 Processing course: ${course.title || course._id}`);
      
      // Count module test MCQs - check both 'modules' and 'topics' properties
      const moduleArray = course.modules || course.topics || [];
      
      if (moduleArray && moduleArray.length > 0) {
        console.log(`  Found ${moduleArray.length} modules/topics`);
        moduleArray.forEach((module, index) => {
          // Count ONLY Module Test MCQs (not direct module MCQs)
          let moduleMCQs = 0;
          
          // Check moduleTest.mcqs (the actual property name)
          if (module.moduleTest && module.moduleTest.mcqs) {
            moduleMCQs += module.moduleTest.mcqs.length;
          }
          
          // Check moduleTest.mcqQuestions (alternative name)
          if (module.moduleTest && module.moduleTest.mcqQuestions) {
            moduleMCQs += module.moduleTest.mcqQuestions.length;
          }
          
          // Check test.mcqs (legacy naming)
          if (module.test && module.test.mcqs) {
            moduleMCQs += module.test.mcqs.length;
          }
          
          // Check test.mcqQuestions (legacy naming)
          if (module.test && module.test.mcqQuestions) {
            moduleMCQs += module.test.mcqQuestions.length;
          }
          
          // NOTE: Excluded direct module.mcqs and module.mcqQuestions 
          // to count only actual module test assessments
          
          if (moduleMCQs > 0) {
            console.log(`    Module ${index + 1}: ${moduleMCQs} MCQs`);
            totalModuleTestMCQs += moduleMCQs;
          }
        });
      } else {
        console.log(`  No modules/topics found in course`);
      }
      
        // Count final exam MCQs - check multiple possible locations
      if (course.finalExam) {
        let finalExamMCQs = 0;
        
        // Check finalExam.mcqs
        if (course.finalExam.mcqs) {
          finalExamMCQs += course.finalExam.mcqs.length;
        }
        
        // Check finalExam.mcqQuestions
        if (course.finalExam.mcqQuestions) {
          finalExamMCQs += course.finalExam.mcqQuestions.length;
        }
        
        // Check if finalExam has questions array
        if (course.finalExam.questions) {
          finalExamMCQs += course.finalExam.questions.length;
        }        if (finalExamMCQs > 0) {
          console.log(`  Final Exam: ${finalExamMCQs} MCQs`);
          totalFinalExamMCQs += finalExamMCQs;
        } else {
          console.log(`  Final Exam: no MCQs found`);
        }
      } else {
        console.log(`  No final exam found in course`);
      }
    });
    
    const totalMCQs = totalModuleTestMCQs + totalFinalExamMCQs;
    
    console.log('📊 MCQ Count Summary:');
    console.log(`  - Module Test MCQs: ${totalModuleTestMCQs}`);
    console.log(`  - Final Exam MCQs: ${totalFinalExamMCQs}`);
    console.log(`  - Total MCQs: ${totalMCQs}`);
    
    res.json({
      moduleTestMCQs: totalModuleTestMCQs,
      finalExamMCQs: totalFinalExamMCQs,
      totalMCQs: totalMCQs
    });
  } catch (err) {
    console.error("❌ Error fetching MCQ totals:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================================
   ✅ Get all courses
================================ */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const courses = await Course.find()
      .select("title description difficulty enrolledCount createdAt");
    res.json(courses);
  } catch (err) {
    console.error("❌ Error fetching courses:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================================
   ✅ Get user's enrolled courses
   (ONLY ONE VERSION - CLEAN)
================================ */
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('=== GET USER COURSES DEBUG ===');

    if (req.user.id !== userId && req.user.role !== "admin") {
      console.log("❌ Access denied: User mismatch");
      return res.status(403).json({ message: "Access denied" });
    }

    console.log("Fetching enrolled courses for:", userId);

    const courses = await Course.find({
      enrolledUsers: userId,
      isActive: true
    }).select("_id title description difficulty enrolledCount createdAt");

    res.json({
      courses,
      totalEnrolled: courses.length,
      stats: {
        easy: courses.filter(c => c.difficulty === "easy").length,
        medium: courses.filter(c => c.difficulty === "medium").length,
        hard: courses.filter(c => c.difficulty === "hard").length
      }
    });

  } catch (err) {
    console.error("❌ Error fetching user courses:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================================
   ✅ Get course by ID
================================ */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json(course);
  } catch (err) {
    console.error("❌ Error fetching course by ID:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================================
   ✅ Get all modules for a course
================================ */
router.get("/:courseId/modules", authenticateToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const modules = course.modules.sort((a, b) => a.order - b.order);
    res.json(modules);
  } catch (err) {
    console.error("❌ Error fetching modules:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================================
   ✅ Get single module
================================ */
router.get("/:courseId/modules/:moduleId", authenticateToken, async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const module = course.modules.find(
      (mod) => mod._id.toString() === moduleId.toString()
    );

    if (!module) {
      return res.status(404).json({
        message: "Module not found",
        availableModules: course.modules.map((m) => ({
          _id: m._id,
          title: m.title
        }))
      });
    }

    res.json({
      _id: module._id,
      title: module.title,
      description: module.description,
      order: module.order,
      theory: module.theory || {},
      snippets: module.snippets || {},
      lecture: module.lecture || {},
      mcqPractice: { questions: module.mcqs || [] },
      challenges: { problems: module.codeChallenges || [] },
      moduleTest: module.moduleTest || {},
      learningObjectives: module.learningObjectives || [],
      prerequisites: module.prerequisites || [],
      estimatedDuration: module.estimatedDuration
    });

  } catch (err) {
    console.error("❌ Error fetching module:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================================
   ✅ Get Module Test Data
================================ */
router.get("/:courseId/modules/:moduleId/test", authenticateToken, async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    if (!module.moduleTest || (!module.moduleTest.mcqs?.length && !module.moduleTest.codeChallenges?.length)) {
      return res.status(404).json({ message: "Module test not found" });
    }

    // Return module test data
    res.json({
      moduleTest: {
        title: module.moduleTest.title || `${module.title} Assessment`,
        description: module.moduleTest.description || `Test your understanding of ${module.title}`,
        duration: module.moduleTest.duration || 30,
        totalMarks: module.moduleTest.totalMarks || 100,
        passingScore: module.moduleTest.passingScore || 70,
        mcqs: module.moduleTest.mcqs || [],
        codeChallenges: module.moduleTest.codeChallenges || [],
        isActive: module.moduleTest.isActive !== false
      },
      module: {
        _id: module._id,
        title: module.title,
        description: module.description
      },
      course: {
        _id: course._id,
        title: course.title,
        description: course.description
      }
    });

  } catch (err) {
    console.error("❌ Error fetching module test:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================================
   ✅ Create New Course (Admin)
================================ */
router.post(
  "/",
  authenticateToken,
  isAdmin,
  [
    body("title").notEmpty(),
    body("description").notEmpty(),
    body("difficulty").optional().isIn(["easy", "medium", "hard"]),
    body("modules").isArray().optional()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { title, description, difficulty, modules, scoringConfig } = req.body;

      const allMCQs = [];
      const allCoding = [];

      modules?.forEach((mod) => {
        if (mod.mcqs) allMCQs.push(...mod.mcqs);
        if (mod.codeChallenges) allCoding.push(...mod.codeChallenges);
        if (mod.moduleTest?.mcqs) allMCQs.push(...mod.moduleTest.mcqs);
        if (mod.moduleTest?.codeChallenges)
          allCoding.push(...mod.moduleTest.codeChallenges);
      });

      const selectedMCQs = allMCQs.slice(0, 10);
      const selectedCoding = allCoding.slice(0, 5);

      const mcqMarks = selectedMCQs.reduce((s, m) => s + (m.marks || 1), 0);
      const codeMarks = selectedCoding.reduce((s, c) => s + (c.marks || 2), 0);

      const course = new Course({
        title,
        description,
        difficulty: difficulty?.toLowerCase(),
        modules,
        finalExam: {
          title: `${title} - Final Exam`,
          description: `Comprehensive final exam for ${title}`,
          mcqs: selectedMCQs,
          codeChallenges: selectedCoding,
          totalMarks: mcqMarks + codeMarks,
          duration: 120,
          passingScore: 70
        },
        scoringConfig
      });

      const saved = await course.save();
      res.status(201).json(saved);
    } catch (err) {
      console.error("❌ Error creating course:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/* ================================
   ✅ Update Course Info
================================ */
router.patch("/:id/basic", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, description, difficulty } = req.body;

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (difficulty) updateData.difficulty = difficulty.toLowerCase();

    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Course not found" });

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating course info:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================================
   ✅ Enroll User
================================ */
router.post("/:id/enroll", authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const userId = req.user.id;

    if (!course.enrolledUsers.includes(userId)) {
      course.enrolledUsers.push(userId);
      course.enrolledCount = course.enrolledUsers.length;
      await course.save();
    }

    res.json({
      message: "Enrolled successfully",
      enrolledCount: course.enrolledCount
    });

  } catch (err) {
    console.error("❌ Error enrolling user:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================================
   ✅ Unenroll User
================================ */
router.delete("/:id/unenroll", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.enrolledUsers = course.enrolledUsers.filter(
      (u) => u.toString() !== userId.toString()
    );
    course.enrolledCount = course.enrolledUsers.length;

    await course.save();

    res.json({
      message: "Unenrolled successfully",
      enrolledCount: course.enrolledCount
    });

  } catch (err) {
    console.error("❌ Error unenrolling user:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================================
   ✅ Update Entire Course (Admin)
================================ */
router.put("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, description, difficulty, isActive, testUnlockThreshold, modules, finalExam, scoringConfig } = req.body;

    const updateData = {
      title: title?.trim(),
      description: description?.trim(),
      difficulty: difficulty?.toLowerCase(),
      isActive: isActive !== undefined ? isActive : true,
      testUnlockThreshold: testUnlockThreshold || 80,
      modules: modules || [],
      finalExam: finalExam || null,
      scoringConfig: scoringConfig || {}
    };

    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating course:", err);
    res.status(500).json({ message: err.message, error: err.toString() });
  }
});

/* ================================
   🗑 Delete Course (Admin)
================================ */
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Course not found" });

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting course:", err);
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
