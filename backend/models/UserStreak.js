const mongoose = require("mongoose");

// Daily activity tracking schema
const dailyActivitySchema = new mongoose.Schema({
  date: { 
    type: String, 
    required: true 
  }, // Format: YYYY-MM-DD
  activities: [{
    type: { 
      type: String, 
      required: true,
      enum: [
        'problem_submission',      // Any problem submission (correct or wrong)
        'lesson_completion',       // Completing a lesson
        'mcq_attempt',            // Attempting MCQ questions
        'module_test_attempt',    // Attempting module tests
        'final_exam_attempt',     // Attempting final exams
        'course_enrollment',      // Enrolling in a course
        'contest_participation',  // Participating in contests
        'theory_reading'          // Reading theory content
      ]
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    },
    details: {
      courseId: String,
      problemId: String,
      lessonId: String,
      topicId: String,
      score: Number,
      isSuccess: Boolean,
      timeSpent: Number
    }
  }],
  totalActivities: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { _id: false });

const userStreakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: String // Format: YYYY-MM-DD
  },
  dailyActivities: [dailyActivitySchema],
  streakStartDate: {
    type: String // Format: YYYY-MM-DD
  },
  totalActiveDays: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for performance
userStreakSchema.index({ userId: 1 });
userStreakSchema.index({ lastActiveDate: 1 });

// Helper method to get today's date string
userStreakSchema.statics.getTodayString = function() {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Helper method to get yesterday's date string
userStreakSchema.statics.getYesterdayString = function() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

// Method to add activity for today
userStreakSchema.methods.addActivity = function(activityType, details = {}) {
  const today = this.constructor.getTodayString();
  
  // Find or create today's activity record
  let todayActivity = this.dailyActivities.find(activity => activity.date === today);
  
  if (!todayActivity) {
    todayActivity = {
      date: today,
      activities: [],
      totalActivities: 0,
      isActive: true
    };
    this.dailyActivities.push(todayActivity);
  }
  
  // Add the new activity
  todayActivity.activities.push({
    type: activityType,
    timestamp: new Date(),
    details: details
  });
  
  todayActivity.totalActivities += 1;
  todayActivity.isActive = true;
  
  // Update last active date
  this.lastActiveDate = today;
  
  // Update streak if this is the first activity today
  if (todayActivity.activities.length === 1) {
    this.updateStreak();
  }
  
  return this.save();
};

// Method to update streak based on daily activities
userStreakSchema.methods.updateStreak = function() {
  const today = this.constructor.getTodayString();
  const yesterday = this.constructor.getYesterdayString();
  
  // Sort daily activities by date (most recent first)
  this.dailyActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let currentStreak = 0;
  let streakStartDate = null;
  let totalActiveDays = 0;
  
  // Count consecutive active days
  for (let i = 0; i < this.dailyActivities.length; i++) {
    const activity = this.dailyActivities[i];
    
    if (activity.isActive && activity.totalActivities > 0) {
      totalActiveDays++;
      
      // Check if this day is consecutive
      if (i === 0) {
        // Most recent day
        if (activity.date === today || activity.date === yesterday) {
          currentStreak = 1;
          streakStartDate = activity.date;
        }
      } else {
        // Check if this day is consecutive with the previous day
        const prevActivity = this.dailyActivities[i - 1];
        const currentDate = new Date(activity.date);
        const prevDate = new Date(prevActivity.date);
        const dayDiff = Math.floor((prevDate - currentDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1 && currentStreak > 0) {
          currentStreak++;
          if (!streakStartDate) {
            streakStartDate = activity.date;
          }
        } else if (dayDiff === 1 && currentStreak === 0) {
          // Start new streak
          currentStreak = 1;
          streakStartDate = activity.date;
        } else {
          // Streak broken
          break;
        }
      }
    }
  }
  
  // Update streak data
  this.currentStreak = currentStreak;
  this.longestStreak = Math.max(this.longestStreak, currentStreak);
  this.streakStartDate = streakStartDate;
  this.totalActiveDays = totalActiveDays;
  
  return this.save();
};

// Method to check if user was active today
userStreakSchema.methods.wasActiveToday = function() {
  const today = this.constructor.getTodayString();
  const todayActivity = this.dailyActivities.find(activity => activity.date === today);
  return todayActivity && todayActivity.isActive && todayActivity.totalActivities > 0;
};

// Method to check if user was active yesterday
userStreakSchema.methods.wasActiveYesterday = function() {
  const yesterday = this.constructor.getYesterdayString();
  const yesterdayActivity = this.dailyActivities.find(activity => activity.date === yesterday);
  return yesterdayActivity && yesterdayActivity.isActive && yesterdayActivity.totalActivities > 0;
};

// Static method to get or create user streak
userStreakSchema.statics.getOrCreateUserStreak = async function(userId) {
  let userStreak = await this.findOne({ userId });
  
  if (!userStreak) {
    userStreak = new this({
      userId,
      currentStreak: 0,
      longestStreak: 0,
      dailyActivities: [],
      totalActiveDays: 0
    });
    await userStreak.save();
  }
  
  return userStreak;
};

// Static method to record activity
userStreakSchema.statics.recordActivity = async function(userId, activityType, details = {}) {
  const userStreak = await this.getOrCreateUserStreak(userId);
  await userStreak.addActivity(activityType, details);
  return userStreak;
};

// Static method to get user's current streak
userStreakSchema.statics.getUserStreak = async function(userId) {
  const userStreak = await this.getOrCreateUserStreak(userId);
  
  // Update streak before returning
  await userStreak.updateStreak();
  
  return {
    currentStreak: userStreak.currentStreak,
    longestStreak: userStreak.longestStreak,
    totalActiveDays: userStreak.totalActiveDays,
    lastActiveDate: userStreak.lastActiveDate,
    streakStartDate: userStreak.streakStartDate,
    wasActiveToday: userStreak.wasActiveToday(),
    wasActiveYesterday: userStreak.wasActiveYesterday()
  };
};

module.exports = mongoose.model("UserStreak", userStreakSchema);
