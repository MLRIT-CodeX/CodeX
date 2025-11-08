const mongoose = require('mongoose');

const dailyActivitySchema = new mongoose.Schema({
  date: { type: String, required: true },
  activities: [{
    type: { 
      type: String,
      required: true,
      enum: [
        'problem_submission',
        'lesson_completion',
        'mcq_attempt',
        'module_test_attempt',
        'final_exam_attempt',
        'course_enrollment',
        'contest_participation',
        'theory_reading'
      ]
    },
    timestamp: { type: Date, default: Date.now },
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
  totalActivities: { type: Number, default: 0 }
});

const userStreakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActivityDate: { type: Date, default: Date.now },
  dailyActivities: [dailyActivitySchema]
});

userStreakSchema.statics.getUserStreak = async function(userId) {
  try {
    let streak = await this.findOne({ userId });
    
    if (!streak) {
      streak = await this.create({
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date()
      });
    }

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActivityDate: streak.lastActivityDate
    };
  } catch (err) {
    console.error("Error in getUserStreak:", err);
    throw err;
  }
};

userStreakSchema.statics.updateStreak = async function(userId) {
  try {
    const today = new Date();
    let streak = await this.findOne({ userId });

    if (!streak) {
      return await this.create({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today
      });
    }

    const lastActivity = new Date(streak.lastActivityDate);
    const daysSinceLastActivity = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

    if (daysSinceLastActivity === 0) {
      return streak;
    } else if (daysSinceLastActivity === 1) {
      streak.currentStreak += 1;
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
    } else {
      streak.currentStreak = 1;
    }
    
    streak.lastActivityDate = today;
    return await streak.save();
  } catch (err) {
    console.error("Error in updateStreak:", err);
    throw err;
  }
};

module.exports = mongoose.model("UserStreak", userStreakSchema);
