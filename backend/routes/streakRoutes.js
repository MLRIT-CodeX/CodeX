const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const UserStreak = require("../models/UserStreak");

// GET /api/streak/user - Get user's current streak
router.get("/user", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const streakData = await UserStreak.getUserStreak(userId);
    
    res.json({
      success: true,
      data: streakData
    });
  } catch (err) {
    console.error("Error fetching user streak:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching user streak", 
      error: err.message 
    });
  }
});

// POST /api/streak/activity - Record user activity
router.post("/activity", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { activityType, details } = req.body;
    
    // Validate activity type
    const validActivityTypes = [
      'problem_submission',
      'lesson_completion', 
      'mcq_attempt',
      'module_test_attempt',
      'final_exam_attempt',
      'course_enrollment',
      'contest_participation',
      'theory_reading'
    ];
    
    if (!validActivityTypes.includes(activityType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity type"
      });
    }
    
    const userStreak = await UserStreak.recordActivity(userId, activityType, details);
    
    res.json({
      success: true,
      message: "Activity recorded successfully",
      data: {
        currentStreak: userStreak.currentStreak,
        wasActiveToday: userStreak.wasActiveToday()
      }
    });
  } catch (err) {
    console.error("Error recording activity:", err);
    res.status(500).json({ 
      success: false,
      message: "Error recording activity", 
      error: err.message 
    });
  }
});

// GET /api/streak/user/detailed - Get detailed streak information
router.get("/user/detailed", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userStreak = await UserStreak.getOrCreateUserStreak(userId);
    await userStreak.updateStreak();
    
    // Get last 7 days of activities
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayActivity = userStreak.dailyActivities.find(activity => activity.date === dateString);
      
      last7Days.push({
        date: dateString,
        isActive: dayActivity ? dayActivity.isActive && dayActivity.totalActivities > 0 : false,
        totalActivities: dayActivity ? dayActivity.totalActivities : 0,
        activities: dayActivity ? dayActivity.activities : []
      });
    }
    
    res.json({
      success: true,
      data: {
        currentStreak: userStreak.currentStreak,
        longestStreak: userStreak.longestStreak,
        totalActiveDays: userStreak.totalActiveDays,
        lastActiveDate: userStreak.lastActiveDate,
        streakStartDate: userStreak.streakStartDate,
        last7Days: last7Days,
        wasActiveToday: userStreak.wasActiveToday(),
        wasActiveYesterday: userStreak.wasActiveYesterday()
      }
    });
  } catch (err) {
    console.error("Error fetching detailed streak:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching detailed streak", 
      error: err.message 
    });
  }
});

// POST /api/streak/bulk-activity - Record multiple activities at once
router.post("/bulk-activity", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { activities } = req.body;
    
    if (!Array.isArray(activities)) {
      return res.status(400).json({
        success: false,
        message: "Activities must be an array"
      });
    }
    
    const userStreak = await UserStreak.getOrCreateUserStreak(userId);
    
    for (const activity of activities) {
      const { activityType, details } = activity;
      await userStreak.addActivity(activityType, details);
    }
    
    await userStreak.updateStreak();
    
    res.json({
      success: true,
      message: "Activities recorded successfully",
      data: {
        currentStreak: userStreak.currentStreak,
        totalActivitiesRecorded: activities.length
      }
    });
  } catch (err) {
    console.error("Error recording bulk activities:", err);
    res.status(500).json({ 
      success: false,
      message: "Error recording bulk activities", 
      error: err.message 
    });
  }
});

module.exports = router;
