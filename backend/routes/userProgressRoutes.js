const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const UserProgress = require("../models/UserProgress");
const Course = require("../models/Course");
const UserStreak = require("../models/UserStreak");
const { authenticateToken } = require("../middleware/authMiddleware");
const { updateUserCourseScore } = require("../controllers/courseLeaderboardController");

// @route   GET /api/progress?userId=&courseId=
// @desc    Get user progress for a course
router.get("/", authenticateToken, async (req, res) => {
  const { userId, courseId } = req.query;

  try {
    if (!userId || !courseId) {
      return res.status(400).json({ message: "userId and courseId are required." });
    }

    let progress = await UserProgress.findOne({ userId, courseId });

    if (!progress) {
      // Create initial progress if doesn't exist
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found." });
      }

      progress = new UserProgress({
        userId,
        courseId,
        topicsProgress: [],
        overallProgress: 0
      });
      await progress.save();
    }

    res.json(progress);
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   POST /api/progress/lesson
// @desc    Update lesson progress
router.post("/lesson", 
  authenticateToken,
  [
    body("userId").notEmpty().withMessage("userId is required"),
    body("courseId").notEmpty().withMessage("courseId is required"),
    body("topicId").notEmpty().withMessage("topicId is required"),
    body("lessonId").notEmpty().withMessage("lessonId is required"),
    body("completed").optional().isBoolean(),
    body("timeSpent").optional().isNumeric(),
    body("score").optional().isNumeric()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, courseId, topicId, lessonId, completed, timeSpent, score, topicTitle } = req.body;

    try {
      let progress = await UserProgress.findOne({ userId, courseId });

      if (!progress) {
        progress = new UserProgress({
          userId,
          courseId,
          topicsProgress: [],
          overallProgress: 0
        });
      }

      // Check if this lesson is already marked as completed
      const existingTopic = progress.topicsProgress.find(tp => tp.topicId.toString() === topicId);
      const existingLesson = existingTopic?.lessons?.find(lp => lp.lessonId.toString() === lessonId);
      
      if (existingLesson?.completed) {
        return res.status(200).json({ 
          message: "Lesson already completed",
          alreadyCompleted: true,
          progress: progress 
        });
      }

      await progress.updateLessonProgress(topicId, lessonId, {
        completed: completed || false,
        timeSpent: timeSpent || 0,
        score: score || 0,
        topicTitle: topicTitle || 'Unknown Topic'
      });

      // Update leaderboard score if lesson is completed
      if (completed) {
        try {
          const assessmentData = {
            topicId: topicId,
            lessonId: lessonId,
            mcqResults: mcqResults || [],
            codingResults: codingResults || []
          };
          const mockReq = { 
            params: { courseId }, 
            body: { 
              userId, 
              assessmentType: 'lesson', 
              score: score || 0,
              assessmentData: assessmentData
            } 
          };
          const mockRes = { json: () => {}, status: () => ({ json: () => {} }) };
          await updateUserCourseScore(mockReq, mockRes);
        } catch (leaderboardErr) {
          console.error('Error updating leaderboard:', leaderboardErr);
          // Don't fail the main request if leaderboard update fails
        }
      }

      // Record activity for streak tracking
      try {
        await UserStreak.recordActivity(userId, 'lesson_completion', {
          courseId: courseId,
          topicId: topicId,
          lessonId: lessonId,
          score: score || 0,
          timeSpent: timeSpent || 0
        });
      } catch (streakError) {
        console.error('Error recording streak activity:', streakError);
        // Don't fail the main request if streak tracking fails
      }

      res.json({ 
        message: "Lesson progress updated successfully", 
        alreadyCompleted: false,
        progress: progress 
      });
    } catch (err) {
      console.error('Error updating lesson progress:', err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// @route   POST /api/progress/module-test
// @desc    Submit module test results
router.post("/module-test", 
  authenticateToken,
  [
    body("userId").notEmpty().withMessage("userId is required"),
    body("courseId").notEmpty().withMessage("courseId is required"),
    body("topicId").notEmpty().withMessage("topicId is required"),
    body("answers").optional().isArray().withMessage("answers must be an array")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, courseId, topicId, answers, codingAnswers, topicTitle } = req.body;

    try {
      // Get course data to access correct answers
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const topic = course.topics.id(topicId);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }

      if (!topic.moduleTest) {
        return res.status(404).json({ message: "No test available for this topic" });
      }

      // Get MCQs and coding challenges from topic
      const mcqs = topic.moduleTest.mcqs || [];
      const codeChallenges = topic.moduleTest.codeChallenges || [];
      const totalQuestions = mcqs.length + codeChallenges.length;

      // Enhanced score calculation with detailed analysis
      let correctAnswers = 0;
      let wrongAnswers = 0;
      let unattempted = 0;
      let mcqCorrect = 0;
      let codingCorrect = 0;
      let mcqScore = 0;
      let codingScore = 0;
      let mcqAttempted = 0;
      let codingAttempted = 0;
      
      // Detailed MCQ analysis
      const mcqResults = [];
      mcqs.forEach((mcq, index) => {
        const userAnswer = answers && answers[index];
        const isAnswered = userAnswer !== undefined && userAnswer !== null;
        const isCorrect = isAnswered && userAnswer === mcq.correct;
        
        mcqResults.push({
          questionIndex: index,
          userAnswer: userAnswer,
          correctAnswer: mcq.correct,
          isCorrect: isCorrect,
          isAttempted: isAnswered,
          marks: mcq.marks || 1,
          earnedMarks: isCorrect ? (mcq.marks || 1) : 0
        });
        
        if (isAnswered) {
          mcqAttempted++;
          if (isCorrect) {
            correctAnswers++;
            mcqCorrect++;
            mcqScore += mcq.marks || 1;
          } else {
            wrongAnswers++;
          }
        } else {
          unattempted++;
        }
      });
      
      // Detailed coding analysis
      const codingResults = [];
      codeChallenges.forEach((challenge, index) => {
        const questionIndex = index + mcqs.length;
        const userCode = codingAnswers && codingAnswers[questionIndex];
        const hasCode = userCode && userCode.code && userCode.code.trim();
        
        // Enhanced coding evaluation (for now, just check if code exists)
        // TODO: Implement actual code execution and testing
        const isCorrect = hasCode; // Simplified for now
        
        codingResults.push({
          questionIndex: index,
          userCode: userCode ? userCode.code : null,
          language: userCode ? userCode.language : null,
          isCorrect: isCorrect,
          isAttempted: hasCode,
          marks: challenge.marks || 2,
          earnedMarks: isCorrect ? (challenge.marks || 2) : 0
        });
        
        if (hasCode) {
          codingAttempted++;
          if (isCorrect) {
            correctAnswers++;
            codingCorrect++;
            codingScore += challenge.marks || 2;
          } else {
            wrongAnswers++;
          }
        } else {
          unattempted++;
        }
      });

      // Calculate comprehensive scoring
      const totalMcqMarks = mcqs.reduce((sum, mcq) => sum + (mcq.marks || 1), 0);
      const totalCodingMarks = codeChallenges.reduce((sum, challenge) => sum + (challenge.marks || 2), 0);
      const totalMarks = totalMcqMarks + totalCodingMarks;
      const totalScore = mcqScore + codingScore;
      const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;
      
      // Performance metrics
      const mcqPercentage = totalMcqMarks > 0 ? Math.round((mcqScore / totalMcqMarks) * 100) : 0;
      const codingPercentage = totalCodingMarks > 0 ? Math.round((codingScore / totalCodingMarks) * 100) : 0;
      const attemptRate = totalQuestions > 0 ? Math.round(((mcqAttempted + codingAttempted) / totalQuestions) * 100) : 0;

      let progress = await UserProgress.findOne({ userId, courseId });

      if (!progress) {
        progress = new UserProgress({
          userId,
          courseId,
          topicsProgress: [],
          overallProgress: 0
        });
      }

      // Enhanced progress data
      const moduleTestData = {
        score: totalScore,
        totalMarks,
        mcqScore,
        codingScore,
        totalMcqMarks,
        totalCodingMarks,
        correctAnswers,
        wrongAnswers,
        unattempted,
        mcqCorrect,
        codingCorrect,
        mcqAttempted,
        codingAttempted,
        percentage,
        mcqPercentage,
        codingPercentage,
        attemptRate,
        answers: answers || [],
        codingAnswers: codingAnswers || {},
        mcqResults,
        codingResults,
        topicTitle: topicTitle || topic.title || 'Unknown Topic',
        completedAt: new Date(),
        timeTaken: req.body.timeTaken || 0
      };

      await progress.updateModuleTestProgress(topicId, moduleTestData);

      // Update leaderboard score for module test completion
      try {
        // Prepare MCQ results
        const mcqResults = mcqs.map((mcq, index) => ({
          isCorrect: answers[index] !== undefined && answers[index] === mcq.correct
        }));
        
        // Prepare coding results
        const codingResults = codeChallenges.map((challenge, index) => {
          const codingIndex = index + mcqs.length;
          const hasCode = codingAnswers && codingAnswers[codingIndex] && codingAnswers[codingIndex].code && codingAnswers[codingIndex].code.trim();
          return {
            verdict: hasCode ? 'Accepted' : 'Wrong Answer'
          };
        });
        
        const assessmentData = {
          topicId: topicId,
          mcqResults: mcqResults,
          codingResults: codingResults,
          mcqQuestions: mcqs,
          codingQuestions: codeChallenges
        };
        
        console.log('Updating leaderboard with assessment data:', JSON.stringify(assessmentData, null, 2));
        
        const mockReq = { 
          params: { courseId }, 
          body: { 
            userId, 
            assessmentType: 'moduleTest', 
            assessmentData: assessmentData
          } 
        };
        const mockRes = { 
          json: (data) => {
            console.log('✅ Leaderboard update SUCCESS for moduleTest:', {
              userId,
              courseId,
              topicId,
              newScore: data.newScore,
              breakdown: data.breakdown
            });
          }, 
          status: (code) => ({ 
            json: (error) => {
              console.error('❌ Leaderboard update ERROR for moduleTest:', {
                userId,
                courseId,
                topicId,
                statusCode: code,
                error: error
              });
            }
          }) 
        };
        
        console.log('🔄 Calling updateUserCourseScore for moduleTest...');
        await updateUserCourseScore(mockReq, mockRes);
        console.log('✅ updateUserCourseScore call completed for moduleTest');
      } catch (leaderboardErr) {
        console.error('Error updating leaderboard:', leaderboardErr);
        // Don't fail the main request if leaderboard update fails
      }

      // Record activity for streak tracking
      try {
        await UserStreak.recordActivity(userId, 'module_test_attempt', {
          courseId: courseId,
          topicId: topicId,
          score: totalScore,
          totalMarks: totalMarks,
          percentage: percentage
        });
      } catch (streakError) {
        console.error('Error recording streak activity:', streakError);
        // Don't fail the main request if streak tracking fails
      }

      res.json({ 
        message: "Module test submitted successfully", 
        progress: progress,
        testResult: {
          // Basic scores
          totalScore,
          totalMarks,
          percentage,
          
          // Question counts
          totalQuestions,
          correctAnswers,
          wrongAnswers,
          unattempted,
          
          // MCQ specific
          mcqScore,
          totalMcqMarks,
          mcqCorrect,
          mcqAttempted,
          mcqPercentage,
          
          // Coding specific
          codingScore,
          totalCodingMarks,
          codingCorrect,
          codingAttempted,
          codingPercentage,
          
          // Performance metrics
          attemptRate,
          timeTaken: req.body.timeTaken || 0,
          completedAt: new Date(),
          
          // Detailed results
          mcqResults,
          codingResults,
          
          // Topic info
          topicId,
          topicTitle: topicTitle || topic.title || 'Unknown Topic'
        }
      });
    } catch (err) {
      console.error('Error submitting module test:', err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// @route   POST /api/progress (Legacy support)
// @desc    Update progress (backward compatibility)
router.post("/", authenticateToken, async (req, res) => {
  const { userId, courseId, moduleIndex, testAttempt } = req.body;

  try {
    if (!userId || !courseId) {
      return res.status(400).json({ message: "userId and courseId are required." });
    }

    let progress = await UserProgress.findOne({ userId, courseId });

    if (!progress) {
      progress = new UserProgress({
        userId,
        courseId,
        completedModules: [],
        topicsProgress: [],
        testAttempt: testAttempt || {},
      });
    }

    // Add completed module if it's not already completed (backward compatibility)
    if (typeof moduleIndex === "number" && !progress.completedModules.includes(moduleIndex)) {
      progress.completedModules.push(moduleIndex);
    }

    // Update testAttempt if provided (backward compatibility)
    if (testAttempt) {
      progress.testAttempt = {
        score: testAttempt.score || progress.testAttempt?.score || 0,
        totalMarks: testAttempt.total || testAttempt.totalMarks || progress.testAttempt?.totalMarks || 0,
        percentage: 0,
        attemptedAt: new Date(),
        answers: testAttempt.answers || []
      };
      
      // Calculate percentage
      if (progress.testAttempt.totalMarks > 0) {
        progress.testAttempt.percentage = Math.round((progress.testAttempt.score / progress.testAttempt.totalMarks) * 100);
      }
    }

    await progress.save();
    res.json(progress);
  } catch (err) {
    console.error('Error updating progress:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   GET /api/progress/topic/:topicId
// @desc    Get specific topic progress
router.get("/topic/:topicId", authenticateToken, async (req, res) => {
  const { userId, courseId } = req.query;
  const { topicId } = req.params;

  try {
    if (!userId || !courseId) {
      return res.status(400).json({ message: "userId and courseId are required." });
    }

    const progress = await UserProgress.findOne({ userId, courseId });
    
    if (!progress) {
      return res.status(404).json({ message: "No progress found." });
    }

    const topicProgress = progress.topicsProgress.find(tp => tp.topicId === topicId);
    
    if (!topicProgress) {
      return res.status(404).json({ message: "Topic progress not found." });
    }

    res.json(topicProgress);
  } catch (err) {
    console.error('Error fetching topic progress:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   DELETE /api/progress/reset
// @desc    Reset user progress for a course
router.delete("/reset", 
  authenticateToken,
  [
    body("userId").notEmpty().withMessage("userId is required"),
    body("courseId").notEmpty().withMessage("courseId is required")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, courseId } = req.body;

    try {
      const result = await UserProgress.findOneAndDelete({ userId, courseId });
      
      if (!result) {
        return res.status(404).json({ message: "No progress found to reset." });
      }

      res.json({ message: "Progress reset successfully" });
    } catch (err) {
      console.error('Error resetting progress:', err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

module.exports = router;
