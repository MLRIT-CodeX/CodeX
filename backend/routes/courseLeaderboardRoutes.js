const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const { 
  getCourseLeaderboard, 
  getUserCourseRank, 
  getUserCourseStats,
  updateUserCourseScore,
  addTestScores,
  updateSkillTestFinalExamScore,
  refreshCourseRanks
} = require("../controllers/courseLeaderboardController");

// Get leaderboard for specific course
router.get("/:courseId", authenticateToken, getCourseLeaderboard);

// Get user's rank in specific course
router.get("/:courseId/user/:userId/rank", authenticateToken, getUserCourseRank);

// Get detailed user statistics for specific course
router.get("/:courseId/user/:userId/stats", authenticateToken, getUserCourseStats);

// Update user score for specific course (called internally by assessment completion)
router.post("/:courseId/update-score", authenticateToken, updateUserCourseScore);

// Test endpoint to add scores (for debugging)
router.post("/:courseId/add-test-scores", authenticateToken, addTestScores);

// Update leaderboard for SkillTest final exam completion
router.post("/:courseId/update-skilltest-final-exam-score", authenticateToken, updateSkillTestFinalExamScore);

// Manual rank refresh (for debugging)
router.post("/:courseId/refresh-ranks", authenticateToken, refreshCourseRanks);

module.exports = router;