const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Submission = require("../models/Submission");
const UserProgress = require("../models/UserProgress");
const { authenticateToken } = require("../middleware/authMiddleware");

// GET /api/contributions/calendar - Get user's contribution calendar data
router.get("/calendar", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    
    console.log(`📅 Fetching contribution calendar for user: ${userId}, year: ${year}`);
    
    // Get date range for the year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    
    console.log(`📅 Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Get coding problem submissions by date
    const codingSubmissions = await Submission.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          isSuccess: true,
          submittedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$submittedAt" },
            month: { $month: "$submittedAt" },
            day: { $dayOfMonth: "$submittedAt" },
            problem: "$problem"
          }
        }
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month", 
            day: "$_id.day"
          },
          problemsSolved: { $sum: 1 }
        }
      }
    ]);

    console.log(`🎯 Found ${codingSubmissions.length} coding activity days`);

    // Get course progress activities by date (only correct MCQ answers)
    const courseActivities = await UserProgress.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          $or: [
            { "modulesProgress.lectures.completedAt": { $gte: startDate, $lte: endDate } },
            { "modulesProgress.moduleTest.completedAt": { $gte: startDate, $lte: endDate } },
            { "finalExamCompletedAt": { $gte: startDate, $lte: endDate } }
          ]
        }
      },
      {
        $unwind: "$modulesProgress"
      },
      {
        $unwind: "$modulesProgress.lectures"
      },
      {
        $match: {
          "modulesProgress.lectures.completedAt": { $gte: startDate, $lte: endDate }
        }
      },
      {
        $addFields: {
          correctMcqs: {
            $size: {
              $filter: {
                input: "$modulesProgress.lectures.mcqAnswers",
                as: "answer",
                cond: { $eq: ["$$answer.isCorrect", true] }
              }
            }
          }
        }
      },
      {
        $match: {
          correctMcqs: { $gt: 0 } // Only include days with correct MCQ answers
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$modulesProgress.lectures.completedAt" },
            month: { $month: "$modulesProgress.lectures.completedAt" },
            day: { $dayOfMonth: "$modulesProgress.lectures.completedAt" }
          },
          lecturesCompleted: { $sum: 1 },
          correctMcqsAnswered: { $sum: "$correctMcqs" }
        }
      }
    ]);

    console.log(`📚 Found ${courseActivities.length} course activity days`);

    // Get module test activities (only correct answers)
    const moduleTestActivities = await UserProgress.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          "modulesProgress.moduleTest.completedAt": { $gte: startDate, $lte: endDate }
        }
      },
      {
        $unwind: "$modulesProgress"
      },
      {
        $match: {
          "modulesProgress.moduleTest.completedAt": { $gte: startDate, $lte: endDate }
        }
      },
      {
        $addFields: {
          correctTestMcqs: {
            $size: {
              $filter: {
                input: "$modulesProgress.moduleTest.mcqAnswers",
                as: "answer",
                cond: { $eq: ["$$answer.isCorrect", true] }
              }
            }
          }
        }
      },
      {
        $match: {
          correctTestMcqs: { $gt: 0 } // Only include days with correct test answers
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$modulesProgress.moduleTest.completedAt" },
            month: { $month: "$modulesProgress.moduleTest.completedAt" },
            day: { $dayOfMonth: "$modulesProgress.moduleTest.completedAt" }
          },
          testsCompleted: { $sum: 1 },
          correctMcqsAnswered: { $sum: "$correctTestMcqs" }
        }
      }
    ]);

    console.log(`🧪 Found ${moduleTestActivities.length} module test activity days (correct answers only)`);
    if (moduleTestActivities.length > 0) {
      console.log('📊 Sample module test activity:', moduleTestActivities[0]);
    }

    // Get final exam activities (only correct answers)
    const finalExamActivities = await UserProgress.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          "finalExamCompletedAt": { $gte: startDate, $lte: endDate },
          "finalExamMcqAnswers": { $exists: true, $ne: [] }
        }
      },
      {
        $addFields: {
          correctFinalMcqs: {
            $size: {
              $filter: {
                input: "$finalExamMcqAnswers",
                as: "answer",
                cond: { $eq: ["$$answer.isCorrect", true] }
              }
            }
          }
        }
      },
      {
        $match: {
          correctFinalMcqs: { $gt: 0 } // Only include days with correct final exam answers
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$finalExamCompletedAt" },
            month: { $month: "$finalExamCompletedAt" },
            day: { $dayOfMonth: "$finalExamCompletedAt" }
          },
          finalExamsCompleted: { $sum: 1 },
          correctFinalMcqs: { $sum: "$correctFinalMcqs" }
        }
      }
    ]);

    console.log(`🎓 Found ${finalExamActivities.length} final exam activity days (correct answers only)`);
    if (finalExamActivities.length > 0) {
      console.log('📊 Sample final exam activity:', finalExamActivities[0]);
    }

    // Combine all activities by date
    const contributionMap = new Map();

    // Process coding submissions
    codingSubmissions.forEach(activity => {
      const dateKey = `${activity._id.year}-${activity._id.month}-${activity._id.day}`;
      const existing = contributionMap.get(dateKey) || {
        date: new Date(activity._id.year, activity._id.month - 1, activity._id.day),
        codingProblems: 0,
        courseActivities: 0,
        moduleTests: 0,
        totalActivity: 0
      };
      
      existing.codingProblems += activity.problemsSolved;
      existing.totalActivity += activity.problemsSolved;
      contributionMap.set(dateKey, existing);
    });

    // Process course activities
    courseActivities.forEach(activity => {
      const dateKey = `${activity._id.year}-${activity._id.month}-${activity._id.day}`;
      const existing = contributionMap.get(dateKey) || {
        date: new Date(activity._id.year, activity._id.month - 1, activity._id.day),
        codingProblems: 0,
        courseActivities: 0,
        moduleTests: 0,
        totalActivity: 0
      };
      
      existing.courseActivities += (activity.correctMcqsAnswered || 0);
      existing.totalActivity += (activity.correctMcqsAnswered || 0);
      contributionMap.set(dateKey, existing);
    });

    // Process module test activities
    moduleTestActivities.forEach(activity => {
      const dateKey = `${activity._id.year}-${activity._id.month}-${activity._id.day}`;
      const existing = contributionMap.get(dateKey) || {
        date: new Date(activity._id.year, activity._id.month - 1, activity._id.day),
        codingProblems: 0,
        courseActivities: 0,
        moduleTests: 0,
        totalActivity: 0
      };
      
      existing.moduleTests += (activity.correctMcqsAnswered || 0);
      existing.totalActivity += (activity.correctMcqsAnswered || 0);
      contributionMap.set(dateKey, existing);
    });

    // Process final exam activities  
    finalExamActivities.forEach(activity => {
      const dateKey = `${activity._id.year}-${activity._id.month}-${activity._id.day}`;
      const existing = contributionMap.get(dateKey) || {
        date: new Date(activity._id.year, activity._id.month - 1, activity._id.day),
        codingProblems: 0,
        courseActivities: 0,
        moduleTests: 0,
        totalActivity: 0
      };
      
      existing.courseActivities += (activity.correctFinalMcqs || 0);
      existing.totalActivity += (activity.correctFinalMcqs || 0);
      contributionMap.set(dateKey, existing);
    });

    // Convert to array and sort by date
    const contributions = Array.from(contributionMap.values()).sort((a, b) => a.date - b.date);

    // Calculate stats
    const totalDays = contributions.length;
    const totalCodingProblems = contributions.reduce((sum, day) => sum + day.codingProblems, 0);
    const totalCourseActivities = contributions.reduce((sum, day) => sum + day.courseActivities, 0);
    const totalModuleTests = contributions.reduce((sum, day) => sum + day.moduleTests, 0);
    
    console.log('📊 Contribution Calculation Debug:');
    console.log('  - Course Activities Total:', totalCourseActivities);
    console.log('  - Module Tests Total:', totalModuleTests);
    console.log('  - Combined MCQ Total:', totalCourseActivities + totalModuleTests);
    const currentStreak = calculateCurrentStreak(contributions);
    const longestStreak = calculateLongestStreak(contributions);

    console.log(`📊 Contribution summary:`, {
      totalDays,
      totalCodingProblems,
      totalCourseActivities,
      totalModuleTests,
      currentStreak,
      longestStreak
    });

    res.json({
      year,
      contributions,
      stats: {
        totalDays,
        totalCodingProblems,
        totalCourseActivities, 
        totalModuleTests,
        currentStreak,
        longestStreak,
        totalActivity: totalCodingProblems + totalCourseActivities + totalModuleTests
      }
    });

  } catch (err) {
    console.error("Error fetching contribution calendar:", err);
    res.status(500).json({ message: "Error fetching contribution data", error: err.message });
  }
});

// Helper function to calculate current streak
function calculateCurrentStreak(contributions) {
  if (contributions.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if user has activity today or yesterday (to account for timezone differences)
  const recentDays = contributions.filter(day => {
    const daysDiff = Math.floor((today - day.date) / (1000 * 60 * 60 * 24));
    return daysDiff <= 1 && day.totalActivity > 0;
  });
  
  if (recentDays.length === 0) return 0;
  
  // Count consecutive days backwards from most recent activity
  const sortedDays = contributions.filter(day => day.totalActivity > 0)
    .sort((a, b) => b.date - a.date);
  
  let currentDate = sortedDays[0]?.date;
  if (!currentDate) return 0;
  
  for (const day of sortedDays) {
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - streak);
    
    if (Math.abs(day.date - expectedDate) < 24 * 60 * 60 * 1000) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

// Helper function to calculate longest streak
function calculateLongestStreak(contributions) {
  if (contributions.length === 0) return 0;
  
  let maxStreak = 0;
  let currentStreak = 0;
  
  const activeDays = contributions.filter(day => day.totalActivity > 0)
    .sort((a, b) => a.date - b.date);
  
  for (let i = 0; i < activeDays.length; i++) {
    if (i === 0) {
      currentStreak = 1;
    } else {
      const daysDiff = Math.floor((activeDays[i].date - activeDays[i-1].date) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }
  }
  
  return Math.max(maxStreak, currentStreak);
}

module.exports = router;