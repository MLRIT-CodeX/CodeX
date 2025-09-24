// models/Leaderboard.js
const mongoose = require("mongoose");

// Individual Assessment Score Schema
const assessmentScoreSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['lesson', 'moduleTest', 'finalExam', 'skillTestFinalExam'], 
    required: true 
  },
  topicId: { type: mongoose.Schema.Types.ObjectId }, // For lesson and moduleTest
  lessonId: { type: mongoose.Schema.Types.ObjectId }, // For lesson only
  skillTestId: { type: mongoose.Schema.Types.ObjectId }, // For skillTestFinalExam
  attemptId: { type: mongoose.Schema.Types.ObjectId }, // For skillTestFinalExam attempt reference
  mcqScore: { type: Number, default: 0 },
  codingScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  maxScore: { type: Number, required: true },
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  timeSpent: { type: Number, default: 0 }, // in minutes
  completedAt: { type: Date, default: Date.now }
}, { _id: false });

const leaderboardSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Course", 
    required: true 
  },
  
  // Detailed Score Breakdown
  lessonScores: [assessmentScoreSchema],
  moduleTestScores: [assessmentScoreSchema],
  finalExamScore: assessmentScoreSchema, // Course-based final exam
  skillTestFinalExamScores: [assessmentScoreSchema], // SkillTest-based final exams
  
  // Aggregate Scores
  totalLessonScore: { type: Number, default: 0 },
  totalModuleTestScore: { type: Number, default: 0 },
  totalFinalExamScore: { type: Number, default: 0 },
  totalSkillTestFinalExamScore: { type: Number, default: 0 },
  overallScore: { type: Number, default: 0 },
  
  // Ranking and Performance
  rank: { type: Number },
  percentile: { type: Number },
  
  // Progress Tracking
  lessonsCompleted: { type: Number, default: 0 },
  moduleTestsCompleted: { type: Number, default: 0 },
  finalExamCompleted: { type: Boolean, default: false },
  skillTestFinalExamsCompleted: { type: Number, default: 0 },
  
  // Performance Metrics
  averageScore: { type: Number, default: 0 },
  strongestArea: { type: String }, // 'mcq' or 'coding'
  improvementAreas: [{ type: String }],
  
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Compound index for efficient querying
leaderboardSchema.index({ courseId: 1, overallScore: -1 });
leaderboardSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Methods to calculate scores
leaderboardSchema.methods.calculateOverallScore = function() {
  this.overallScore = this.totalLessonScore + this.totalModuleTestScore + this.totalFinalExamScore + this.totalSkillTestFinalExamScore;
  const totalAssessments = this.lessonsCompleted + this.moduleTestsCompleted + (this.finalExamCompleted ? 1 : 0) + this.skillTestFinalExamsCompleted;
  this.averageScore = totalAssessments > 0 ? this.overallScore / totalAssessments : 0;
  return this.overallScore;
};

leaderboardSchema.methods.updateLessonScore = function(topicId, lessonId, mcqScore, codingScore, maxScore) {
  const existingIndex = this.lessonScores.findIndex(
    score => score.topicId.toString() === topicId.toString() && 
             score.lessonId.toString() === lessonId.toString()
  );
  
  const scoreData = {
    type: 'lesson',
    topicId,
    lessonId,
    mcqScore,
    codingScore,
    totalScore: mcqScore + codingScore,
    maxScore,
    completedAt: new Date()
  };
  
  if (existingIndex >= 0) {
    this.lessonScores[existingIndex] = scoreData;
  } else {
    this.lessonScores.push(scoreData);
    this.lessonsCompleted += 1;
  }
  
  this.totalLessonScore = this.lessonScores.reduce((sum, score) => sum + score.totalScore, 0);
  this.calculateOverallScore();
  this.lastUpdated = new Date();
};

leaderboardSchema.methods.updateModuleTestScore = function(topicId, mcqScore, codingScore, maxScore) {
  const existingIndex = this.moduleTestScores.findIndex(
    score => score.topicId.toString() === topicId.toString()
  );
  
  const scoreData = {
    type: 'moduleTest',
    topicId,
    mcqScore,
    codingScore,
    totalScore: mcqScore + codingScore,
    maxScore,
    completedAt: new Date()
  };
  
  if (existingIndex >= 0) {
    this.moduleTestScores[existingIndex] = scoreData;
  } else {
    this.moduleTestScores.push(scoreData);
    this.moduleTestsCompleted += 1;
  }
  
  this.totalModuleTestScore = this.moduleTestScores.reduce((sum, score) => sum + score.totalScore, 0);
  this.calculateOverallScore();
  this.lastUpdated = new Date();
};

leaderboardSchema.methods.updateFinalExamScore = function(mcqScore, codingScore, maxScore) {
  this.finalExamScore = {
    type: 'finalExam',
    mcqScore,
    codingScore,
    totalScore: mcqScore + codingScore,
    maxScore,
    completedAt: new Date()
  };
  
  this.totalFinalExamScore = this.finalExamScore.totalScore;
  this.finalExamCompleted = true;
  this.calculateOverallScore();
  this.lastUpdated = new Date();
};

// Method to update SkillTest final exam scores
leaderboardSchema.methods.updateSkillTestFinalExamScore = function(skillTestId, attemptId, score, maxScore, percentage, passed, timeSpent) {
  const existingIndex = this.skillTestFinalExamScores.findIndex(
    examScore => examScore.skillTestId.toString() === skillTestId.toString()
  );
  
  const scoreData = {
    type: 'skillTestFinalExam',
    skillTestId,
    attemptId,
    mcqScore: 0, // SkillTest doesn't separate MCQ/coding scores
    codingScore: 0,
    totalScore: score,
    maxScore,
    percentage,
    passed,
    timeSpent,
    completedAt: new Date()
  };
  
  if (existingIndex >= 0) {
    // Update existing score only if new score is better
    if (score > this.skillTestFinalExamScores[existingIndex].totalScore) {
      this.skillTestFinalExamScores[existingIndex] = scoreData;
    }
  } else {
    this.skillTestFinalExamScores.push(scoreData);
    this.skillTestFinalExamsCompleted += 1;
  }
  
  this.totalSkillTestFinalExamScore = this.skillTestFinalExamScores.reduce((sum, score) => sum + score.totalScore, 0);
  this.calculateOverallScore();
  this.lastUpdated = new Date();
};

module.exports = mongoose.model("Leaderboard", leaderboardSchema);
