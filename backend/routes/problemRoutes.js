const express = require("express");
const {
  addProblem,
  getAllProblems,
  deleteProblem,
  getProblemById,
  updateProblem,
  getProblemStats,
  updateAllProblemNumbers,
} = require("../controllers/problemController");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Public: Get all problems
router.get("/", authenticateToken, getAllProblems);

// Public: Get stats for all problems
router.get("/stats", authenticateToken, getProblemStats);

// Public: Get difficulty counts
router.get("/difficulty-counts", authenticateToken, async (req, res) => {
  try {
    const Problem = require("../models/Problem");
    
    // Get all problems and count by difficulty
    const problems = await Problem.find({}).lean();
    
    const practiceProblems = problems.filter(p => p.type === 'practice' || !p.type);
    
    const counts = {
      easy: practiceProblems.filter(p => p.difficulty && p.difficulty.toLowerCase() === 'easy').length,
      medium: practiceProblems.filter(p => p.difficulty && p.difficulty.toLowerCase() === 'medium').length,
      hard: practiceProblems.filter(p => p.difficulty && p.difficulty.toLowerCase() === 'hard').length,
    };
    
    counts.total = counts.easy + counts.medium + counts.hard;
    
    console.log('📊 Problem difficulty counts:', counts);
    res.json(counts);
  } catch (error) {
    console.error('❌ Error fetching problem difficulty counts:', error);
    res.status(500).json({ message: "Error fetching problem difficulty counts", error: error.message });
  }
});

// Admin-only
router.post("/add", authenticateToken, isAdmin, addProblem);
router.put("/:id", authenticateToken, isAdmin, updateProblem);
router.delete("/:id", authenticateToken, isAdmin, deleteProblem);
router.get("/:id", getProblemById);

// Admin-only: Update all existing problems with numbers
router.post("/update-numbers", authenticateToken, isAdmin, updateAllProblemNumbers);

module.exports = router;
