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
   ================================ */
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const courses = await Course.find({ 'enrolledStudents.userId': userId })
      .select('title description difficulty enrolledCount');
    
    res.json({
      courses,
      totalEnrolled: courses.length,
      stats: {
        easy: courses.filter(c => c.difficulty.toLowerCase() === 'easy').length,
        medium: courses.filter(c => c.difficulty.toLowerCase() === 'medium').length,
        hard: courses.filter(c => c.difficulty.toLowerCase() === 'hard').length
      }
    });
  } catch (err) {
    console.error("❌ Error fetching user's courses:", err);
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

    // Return sorted modules by order
    const modules = course.modules.sort((a, b) => a.order - b.order);
    res.json(modules);
  } catch (err) {
    console.error("❌ Error fetching modules:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================================
   ✅ Get single module by ID
   ================================ */
router.get("/:courseId/modules/:moduleId", authenticateToken, async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // ✅ Fix: ensure proper ObjectId match
    const module = course.modules.find(
      (mod) => mod._id.toString() === moduleId.toString()
    );

    if (!module) {
      return res.status(404).json({
        message: "Module not found",
        availableModules: course.modules.map((m) => ({
          _id: m._id,
          title: m.title,
        })),
      });
    }

    // ✅ Return clean, frontend-safe structure
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
      estimatedDuration: module.estimatedDuration,
    });
  } catch (err) {
    console.error("❌ Error fetching single module:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================================
   ✅ Add New Course (Admin Only)
   ================================ */
router.post(
  "/",
  authenticateToken,
  isAdmin,
  [
    body("title").notEmpty(),
    body("description").notEmpty(),
    body("difficulty").optional().isIn(["easy", "medium", "hard"]),
    body("modules").isArray().optional(),
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
          passingScore: 70,
        },
        scoringConfig,
      });

      const saved = await course.save();
      console.log(`✅ Course "${title}" created with ${modules?.length || 0} modules`);
      res.status(201).json(saved);
    } catch (err) {
      console.error("❌ Error creating course:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/* ================================
   ✅ Update Course Basic Info
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
   ✅ Enroll User in Course
   ================================ */
router.post("/:id/enroll", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.enrolledUsers.includes(userId))
      return res.json({ message: "Already enrolled" });

    course.enrolledUsers.push(userId);
    course.enrolledCount = course.enrolledUsers.length;
    await course.save();

    res.json({
      message: "Enrolled successfully",
      enrolledCount: course.enrolledCount,
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
      enrolledCount: course.enrolledCount,
    });
  } catch (err) {
    console.error("❌ Error unenrolling user:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================================
   ✅ Delete Course (Admin)
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
