const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const UserStreak = require("../models/UserStreak");
const { authenticateToken } = require("../middleware/authMiddleware");

// GET /api/submissions/stats/user - Get user's submission statistics
router.get("/stats/user", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔄 Fetching submission stats for user:', userId);

    // Get user submissions with problem details
    const submissions = await Submission.find({ user: userId })
      .populate('problem', 'score type difficulty title')
      .lean();
    
    console.log(`📊 Found ${submissions.length} total submissions`);

    // Track unique solved problems by type
    const solvedPracticeProblems = new Set();
    const solvedCourseProblems = new Set();
    let totalScore = 0;
    let courseScore = 0;
    let problemScore = 0;

    // Calculate stats
    submissions.forEach(sub => {
      if (sub.isSuccess && sub.problem) {
        const score = sub.problem.score || 0;
        totalScore += score;
        
        if (sub.problem.type === 'course') {
          courseScore += score;
          solvedCourseProblems.add(sub.problem._id.toString());
        } else {
          problemScore += score;
          solvedPracticeProblems.add(sub.problem._id.toString());
        }
      }
    });

    // Get global rankings
    const rankings = await Submission.aggregate([
      {
        $match: {
          isSuccess: true
        }
      },
      {
        $group: {
          _id: "$user",
          totalScore: {
            $sum: "$score"
          }
        }
      },
      {
        $sort: {
          totalScore: -1
        }
      }
    ]);

    // Find user's rank
    const userRank = rankings.findIndex(r => r._id.toString() === userId) + 1;

    // Calculate success rates
    const practiceSubmissions = submissions.filter(s => !s.problem || s.problem.type !== 'course');
    const courseSubmissions = submissions.filter(s => s.problem && s.problem.type === 'course');

    res.json({
      // Overall stats
      totalScore,
      courseScore,
      problemScore,
      totalSubmissions: submissions.length,
      successfulSubmissions: submissions.filter(s => s.isSuccess).length,
      rank: userRank || 1,
      totalUsers: rankings.length,
      
      // Practice problems stats
      practiceStats: {
        totalSolved: solvedPracticeProblems.size,
        submissions: practiceSubmissions.length,
        successfulSubmissions: practiceSubmissions.filter(s => s.isSuccess).length
      },
      
      // Course problems stats
      courseStats: {
        totalSolved: solvedCourseProblems.size,
        submissions: courseSubmissions.length,
        successfulSubmissions: courseSubmissions.filter(s => s.isSuccess).length
      }
    });
  } catch (err) {
    console.error("Error fetching submission stats:", err);
    res.status(500).json({ message: "Error fetching submission stats", error: err.message });
  }
});

// GET /api/submissions/user - Get user's submission history
router.get("/user", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const submissions = await Submission.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('problem');
      
    res.json({ submissions });
  } catch (err) {
    console.error("Error fetching submissions:", err);
    res.status(500).json({ message: "Error fetching submissions" });
  }
});

// GET /api/submissions/activity/:year - Get user's submission activity for a year
router.get("/activity/:year", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const year = parseInt(req.params.year);
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 0);

    const submissions = await Submission.find({
      user: userId,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Group submissions by date
    const activityMap = new Map();
    submissions.forEach(submission => {
      const date = submission.createdAt.toISOString().split('T')[0];
      activityMap.set(date, (activityMap.get(date) || 0) + 1);
    });

    // Create activity data array
    const activityData = Array.from(activityMap.entries()).map(([date, count]) => ({
      date,
      count
    }));

    res.json(activityData);
  } catch (err) {
    console.error("Error fetching activity data:", err);
    res.status(500).json({ message: "Error fetching activity data" });
  }
});

// POST /api/submissions - Save a practice problem submission
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { problemId, code, language, isSuccess } = req.body;

    const newSubmission = new Submission({
      user: req.user.id,
      problem: problemId,
      code,
      language,
      isSuccess,
    });

    await newSubmission.save();
    
    // Record activity for streak tracking
    try {
      await UserStreak.recordActivity(req.user.id, 'problem_submission', {
        problemId: problemId,
        isSuccess: isSuccess,
        language: language
      });
    } catch (streakError) {
      console.error('Error recording streak activity:', streakError);
      // Don't fail the main request if streak tracking fails
    }
    
    res.status(201).json({ message: "Submission saved successfully!" });
  } catch (error) {
    console.error("Error saving submission:", error);
    res.status(500).json({ message: "Server error while saving submission" });
  }
});
// GET /api/submissions/user/:problemId - Get user's submissions for a problem
router.get("/user/:problemId", authenticateToken, async (req, res) => {
  try {
    const submissions = await Submission.find({
      user: req.user.id,
      problem: req.params.problemId,
    }).sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching submissions" });
  }
});

// GET /api/submissions/user-stats - Get user's overall statistics
router.get("/user-stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total problems solved (successful submissions)
    const problemsSolved = await Submission.distinct('problem', {
      user: userId,
      isSuccess: true
    });

    // Get total submissions count
    const totalSubmissions = await Submission.countDocuments({ user: userId });

    // Get successful submissions count
    const successfulSubmissions = await Submission.countDocuments({
      user: userId,
      isSuccess: true
    });

    // Get problems attempted (distinct problems user has submitted to)
    const problemsAttempted = await Submission.distinct('problem', { user: userId });

    // Calculate success rate
    const successRate = totalSubmissions > 0 ? (successfulSubmissions / totalSubmissions) * 100 : 0;

    const userStats = {
      problemsSolved: problemsSolved.length,
      problemsAttempted: problemsAttempted.length,
      totalSubmissions,
      successfulSubmissions,
      successRate: Math.round(successRate * 100) / 100
    };

    res.json(userStats);
  } catch (err) {
    console.error("Error fetching user stats:", err);
    res.status(500).json({ message: "Error fetching user statistics" });
  }
});

// GET /api/submissions/recent-solved - Get user's recently solved problems
router.get("/recent-solved", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5; // Default to 5 recent problems

    // Get recent successful submissions with problem details
    const recentSolved = await Submission.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          isSuccess: true
        }
      },
      {
        $group: {
          _id: "$problem",
          lastSolvedAt: { $max: "$submittedAt" }
        }
      },
      {
        $sort: { lastSolvedAt: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: "problems",
          localField: "_id",
          foreignField: "_id",
          as: "problemDetails"
        }
      },
      {
        $unwind: "$problemDetails"
      },
      {
        $project: {
          _id: "$problemDetails._id",
          title: "$problemDetails.title",
          difficulty: "$problemDetails.difficulty",
          score: { 
            $ifNull: ["$problemDetails.score", 100] 
          },
          problemNumber: "$problemDetails.problemNumber",
          lastSolvedAt: 1
        }
      }
    ]);

    console.log('Recent solved problems query result:', JSON.stringify(recentSolved, null, 2));
    res.json(recentSolved);
  } catch (err) {
    console.error("Error fetching recent solved problems:", err);
    res.status(500).json({ message: "Error fetching recent solved problems" });
  }
});

// GET /api/submissions/difficulty-stats - Get user's difficulty-based statistics
router.get("/difficulty-stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get problems solved by difficulty using aggregation
    const difficultyStats = await Submission.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          isSuccess: true
        }
      },
      {
        $group: {
          _id: "$problem"
        }
      },
      {
        $lookup: {
          from: "problems",
          localField: "_id",
          foreignField: "_id",
          as: "problemDetails"
        }
      },
      {
        $unwind: "$problemDetails"
      },
      {
        $group: {
          _id: "$problemDetails.difficulty",
          count: { $sum: 1 }
        }
      }
    ]);

    // Initialize difficulty counts
    const stats = {
      easy: 0,
      medium: 0,
      hard: 0
    };

    // Populate stats from aggregation results
    difficultyStats.forEach(stat => {
      const difficulty = stat._id.toLowerCase();
      if (stats.hasOwnProperty(difficulty)) {
        stats[difficulty] = stat.count;
      }
    });

    res.json(stats);
  } catch (err) {
    console.error("Error fetching difficulty stats:", err);
    res.status(500).json({ message: "Error fetching difficulty statistics" });
  }
});

module.exports = router;
