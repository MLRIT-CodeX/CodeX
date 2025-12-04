const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const UserProgress = require("../models/UserProgress");
const Course = require("../models/Course");
const UserStreak = require("../models/UserStreak");
const { authenticateToken } = require("../middleware/authMiddleware");
const { updateUserCourseScore } = require("../controllers/courseLeaderboardController");

/* ===========================================================
   ⭐ 1. GET USER PROGRESS FOR A COURSE
   =========================================================== */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { userId, courseId } = req.query;

    if (!userId || !courseId) {
      return res.status(400).json({ message: "userId and courseId are required." });
    }

    let progress = await UserProgress.findOne({ userId, courseId });

    if (!progress) {
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });

      progress = new UserProgress({
        userId,
        courseId,
        modulesProgress: [],
        overallProgress: 0
      });

      await progress.save();
    }

    res.json(progress);
  } catch (err) {
    console.error("❌ Error fetching progress:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ===========================================================
   ⭐ 2. UPDATE LECTURE PROGRESS  (MCQ IGNORE IN STATS)
   =========================================================== */
router.post(
  "/lecture",
  authenticateToken,
  [
    body("userId").notEmpty(),
    body("courseId").notEmpty(),
    body("moduleId").notEmpty(),
    body("lectureId").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const {
        userId,
        courseId,
        moduleId,
        lectureId,
        completed,
        timeSpent,
        mcqScore,
        codingScore,
        totalScore,
        moduleTitle,
        topic
      } = req.body;

      let progress = await UserProgress.findOne({ userId, courseId });

      if (!progress) {
        progress = new UserProgress({
          userId,
          courseId,
          modulesProgress: [],
        });
      }

      await progress.updateLectureProgress(moduleId, lectureId, {
        completed: completed || false,
        timeSpent: timeSpent || 0,
        mcqScore: mcqScore || 0,
        codingScore: codingScore || 0,
        totalScore: totalScore || 0,
        moduleTitle: moduleTitle || "Unknown Module",
        topic: topic || "Unknown Topic"
      });

      // RECORD STREAK
      try {
        await UserStreak.recordActivity(userId, "lecture_completion", {
          courseId,
          moduleId,
          lectureId,
        });
      } catch (err) {
        console.error("❌ Streak update failed:", err);
      }

      res.json({ message: "Lecture progress updated", progress });
    } catch (err) {
      console.error("❌ Error updating lecture:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/* ===========================================================
   ⭐ 3. SUBMIT MODULE TEST (MCQ + CODING)
   - Only MCQ is counted for global MCQ STATS
   =========================================================== */
router.post(
  "/module-test",
  authenticateToken,
  [
    body("userId").notEmpty(),
    body("courseId").notEmpty(),
    body("moduleId").notEmpty()
  ],
  async (req, res) => {
    try {
      const {
        userId,
        courseId,
        moduleId,
        answers,
        codingAnswers,
        moduleTitle
      } = req.body;

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });

      const module = course.modules.id(moduleId);
      if (!module) return res.status(404).json({ message: "Module not found" });

      const mcqs = module.moduleTest?.mcqs || [];
      const codeChallenges = module.moduleTest?.codeChallenges || [];

      /* -----------------------------
         ⭐ MCQ processing
      ----------------------------- */
      let mcqCorrect = 0;
      let mcqScore = 0;
      let mcqResults = [];

      mcqs.forEach((mcq, index) => {
        const userAnswer = answers?.[index];
        const isCorrect = userAnswer === mcq.correct;

        mcqResults.push({
          questionIndex: index,
          selectedAnswer: userAnswer,
          isCorrect
        });

        if (isCorrect) {
          mcqCorrect++;
          mcqScore += mcq.marks || 1;
        }
      });

      /* -----------------------------
         ⭐ Coding processing
      ----------------------------- */
      const codingResults = [];
      let codingScore = 0;
      
      if (codingAnswers && typeof codingAnswers === 'object') {
        // Handle codingAnswers as object (frontend sends it this way)
        Object.entries(codingAnswers).forEach(([questionIndex, answerData]) => {
          const index = parseInt(questionIndex);
          const challenge = codeChallenges[index];
          const hasValidCode = answerData?.code && answerData.code.trim().length > 0;
          const score = hasValidCode ? (challenge?.marks || 2) : 0;
          
          codingResults.push({
            challengeIndex: index,
            verdict: hasValidCode ? "Accepted" : "Wrong Answer",
            score: score
          });
          
          codingScore += score;
        });
      }

      const totalScore = mcqScore + codingScore;

      /* -----------------------------
         ⭐ Save to UserProgress
      ----------------------------- */
      let progress = await UserProgress.findOne({ userId, courseId });
      if (!progress) {
        progress = new UserProgress({ userId, courseId, modulesProgress: [] });
      }

      await progress.updateModuleTestProgress(moduleId, {
        mcqScore,
        codingScore,
        totalScore,
        mcqAnswers: mcqResults,
        codingResults,
        moduleTitle: moduleTitle || module.title
      });

      /* -----------------------------
         ⭐ Leaderboard update
      ----------------------------- */
      try {
        const mockReq = {
          params: { courseId },
          body: {
            userId,
            assessmentType: "moduleTest",
            assessmentData: { 
              topicId: moduleId, // Add moduleId as topicId for leaderboard compatibility
              mcqResults, 
              codingResults 
            },
          },
        };
        const mockRes = { json: () => {}, status: () => ({ json: () => {} }) };
        await updateUserCourseScore(mockReq, mockRes);
      } catch (err) {
        console.error("❌ Leaderboard update failed:", err);
      }

      // Calculate additional metrics for frontend
      const totalQuestions = mcqs.length + codeChallenges.length;
      const answeredQuestions = mcqCorrect + (codingResults.length);
      const wrongAnswers = (answers?.filter(a => a !== undefined && a !== null).length || 0) - mcqCorrect;
      const totalMarks = mcqs.reduce((sum, mcq) => sum + (mcq.marks || 1), 0) + 
                        codeChallenges.reduce((sum, challenge) => sum + (challenge.marks || 2), 0);
      const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;

      res.json({
        message: "Module Test Submitted",
        testResult: {
          totalScore,
          totalMarks,
          percentage,
          correctAnswers: mcqCorrect,
          wrongAnswers,
          unattempted: totalQuestions - answeredQuestions,
          totalQuestions,
          mcqScore,
          codingScore,
          totalMcqMarks: mcqs.reduce((sum, mcq) => sum + (mcq.marks || 1), 0),
          totalCodingMarks: codeChallenges.reduce((sum, challenge) => sum + (challenge.marks || 2), 0),
          mcqCorrect,
          codingCorrect: codingResults.filter(r => r.verdict === "Accepted").length,
          codingIncorrect: codingResults.filter(r => r.verdict !== "Accepted").length,
          timeTaken: req.body.timeTaken || 0
        },
        scores: {
          mcqScore,
          codingScore,
          totalScore,
          correctMCQs: mcqCorrect,
          totalMCQs: mcqs.length
        }
      });
    } catch (err) {
      console.error("❌ Error submitting module test:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/* ===========================================================
   ⭐ 4. RESET PROGRESS
   =========================================================== */
router.delete(
  "/reset",
  authenticateToken,
  [body("userId").notEmpty(), body("courseId").notEmpty()],
  async (req, res) => {
    try {
      const { userId, courseId } = req.body;

      const deleted = await UserProgress.findOneAndDelete({ userId, courseId });

      if (!deleted)
        return res.status(404).json({ message: "No progress found to reset." });

      res.json({ message: "Progress reset successfully" });
    } catch (err) {
      console.error("❌ Error resetting progress:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

module.exports = router;
