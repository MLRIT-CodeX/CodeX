const mongoose = require("mongoose");

/* ============================================================
   ⭐ LECTURE PROGRESS SCHEMA
   ============================================================ */
const lectureProgressSchema = new mongoose.Schema({
  lectureId: { type: String, required: true },
  topic: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  timeSpent: { type: Number, default: 0 },
  mcqScore: { type: Number, default: 0 },
  codingScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  mcqAnswers: [{ questionIndex: Number, selectedAnswer: Number, isCorrect: Boolean }],
  codingResults: [{ challengeIndex: Number, verdict: String, score: Number }]
}, { _id: false });

/* ============================================================
   ⭐ MODULE TEST PROGRESS
   ============================================================ */
const moduleTestProgressSchema = new mongoose.Schema({
  attempted: { type: Boolean, default: false },
  completed: { type: Boolean, default: false },
  mcqScore: { type: Number, default: 0 },
  codingScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  attemptedAt: { type: Date },
  completedAt: { type: Date },
  mcqAnswers: [{ questionIndex: Number, selectedAnswer: Number, isCorrect: Boolean }],
  codingResults: [{ challengeIndex: Number, verdict: String, score: Number }]
}, { _id: false });

/* ============================================================
   ⭐ MODULE PROGRESS
   ============================================================ */
const moduleProgressSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, required: true },
  moduleTitle: { type: String, required: true },
  lectures: [lectureProgressSchema],
  moduleTest: moduleTestProgressSchema,
  completed: { type: Boolean, default: false },
  completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  completedAt: { type: Date },
  startedAt: { type: Date, default: Date.now }
}, { _id: false });

/* ============================================================
   ⭐ USER PROGRESS MAIN SCHEMA
   ============================================================ */
const UserProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },

  modulesProgress: [moduleProgressSchema],
  overallProgress: { type: Number, default: 0 },

  /* ⭐ Final Exam */
  finalExamCompleted: { type: Boolean, default: false },
  finalExamMcqScore: { type: Number, default: 0 },
  finalExamCodingScore: { type: Number, default: 0 },
  finalExamTotalScore: { type: Number, default: 0 },
  finalExamMaxScore: { type: Number, default: 0 },
  finalExamAttempts: { type: Number, default: 0 },
  finalExamCompletedAt: { type: Date },
  finalExamMcqAnswers: [{ questionIndex: Number, selectedAnswer: Number, isCorrect: Boolean }],
  finalExamCodingResults: [{ challengeIndex: Number, verdict: String, score: Number }],
  certificateEarned: { type: Boolean, default: false },

  startedAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date, default: Date.now },

}, { timestamps: true });

/* ============================================================
   ⭐ INDEX FOR PERFORMANCE
   ============================================================ */
UserProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

/* ============================================================
   ⭐ CALCULATE OVERALL PROGRESS
   ============================================================ */
UserProgressSchema.methods.calculateOverallProgress = function () {
  if (!this.modulesProgress.length) return 0;

  const total = this.modulesProgress.length;
  const completed = this.modulesProgress.filter(m => m.completed).length;

  this.overallProgress = Math.round((completed / total) * 100);
  return this.overallProgress;
};

/* ============================================================
   ⭐ UPDATE LECTURE PROGRESS
   ============================================================ */
UserProgressSchema.methods.updateLectureProgress = function (moduleId, lectureId, progressData) {
  let module = this.modulesProgress.find(m => m.moduleId.toString() === moduleId.toString());

  if (!module) {
    module = {
      moduleId,
      moduleTitle: progressData.moduleTitle || "Unknown Module",
      lectures: [],
      completed: false,
      completionPercentage: 0,
      startedAt: new Date()
    };
    this.modulesProgress.push(module);
  }

  let lecture = module.lectures.find(l => l.lectureId === lectureId);

  if (!lecture) {
    lecture = {
      lectureId,
      topic: progressData.topic || "Unknown Topic",
      completed: false,
      mcqScore: 0,
      codingScore: 0,
      totalScore: 0,
      attempts: 0,
      mcqAnswers: [],
      codingResults: []
    };
    module.lectures.push(lecture);
  }

  Object.assign(lecture, progressData);
  lecture.attempts += 1;

  if (progressData.completed) {
    lecture.completed = true;
    lecture.completedAt = new Date();
  }

  const completedLectures = module.lectures.filter(l => l.completed).length;
  module.completionPercentage = Math.round((completedLectures / module.lectures.length) * 100);
  module.completed = module.completionPercentage === 100;

  if (module.completed) module.completedAt = new Date();

  this.calculateOverallProgress();
  this.lastAccessedAt = new Date();

  this.markModified("modulesProgress");

  return this.save();
};

/* ============================================================
   ⭐ UPDATE MODULE TEST PROGRESS — FIXED VERSION
   ============================================================ */
UserProgressSchema.methods.updateModuleTestProgress = function (moduleId, testData) {
  let moduleIndex = this.modulesProgress.findIndex(
    m => m.moduleId.toString() === moduleId.toString()
  );

  if (moduleIndex === -1) {
    this.modulesProgress.push({
      moduleId,
      moduleTitle: testData.moduleTitle || "Unknown Module",
      lectures: [],
      completed: false,
      completionPercentage: 0,
      startedAt: new Date(),
      moduleTest: {}
    });
    moduleIndex = this.modulesProgress.length - 1;
  }

  const module = this.modulesProgress[moduleIndex];

  module.moduleTest = {
    attempted: true,
    completed: true,
    mcqScore: testData.mcqScore || 0,
    codingScore: testData.codingScore || 0,
    totalScore: testData.totalScore || 0,
    maxScore: testData.maxScore || 0,
    percentage: testData.maxScore > 0
      ? Math.round((testData.totalScore / testData.maxScore) * 100)
      : 0,
    attemptedAt: new Date(),
    completedAt: new Date(),
    mcqAnswers: testData.mcqAnswers || [],
    codingResults: testData.codingResults || [],
  };

  this.lastAccessedAt = new Date();

  // ⭐ The critical fix — mark exact nested path
  this.markModified(`modulesProgress.${moduleIndex}.moduleTest`);

  return this.save();
};

/* ============================================================
   ⭐ UPDATE FINAL EXAM PROGRESS
   ============================================================ */
UserProgressSchema.methods.updateFinalExamProgress = function (examData) {
  this.finalExamCompleted = true;
  this.finalExamMcqScore = examData.mcqScore;
  this.finalExamCodingScore = examData.codingScore;
  this.finalExamTotalScore = examData.totalScore;
  this.finalExamMaxScore = examData.maxScore;
  this.finalExamAttempts = (this.finalExamAttempts || 0) + 1;
  this.finalExamCompletedAt = new Date();
  this.finalExamMcqAnswers = examData.mcqAnswers;
  this.finalExamCodingResults = examData.codingResults;

  this.lastAccessedAt = new Date();

  this.markModified("finalExamMcqAnswers");
  this.markModified("finalExamCodingResults");

  return this.save();
};

module.exports = mongoose.model("UserProgress", UserProgressSchema);
