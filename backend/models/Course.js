const mongoose = require('mongoose');

/* ================================
   ✅ MCQ Question Sub-Schema
   ================================ */
const mcqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: v => v.length >= 2
  },
  correct: {
    type: Number,
    required: true,
    validate: {
      validator: function(val) {
        return val >= 0 && val < this.options.length;
      },
      message: 'Correct index must be within options range'
    }
  },
  explanation: String,
  marks: { 
    type: Number, 
    required: true, 
    default: 1,
    min: [0.5, 'Marks must be at least 0.5'],
    max: [100, 'Marks cannot exceed 100']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, { _id: false });

/* Debug Hooks for MCQs */
mcqSchema.pre('save', function (next) {
  console.log('Saving MCQ:', this.question);
  next();
});
mcqSchema.pre('validate', function (next) {
  console.log('Validating MCQ:', this.question);
  next();
});

/* ================================
   ✅ Coding Challenge Sub-Schema
   ================================ */
const codeChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  sampleInput: String,
  sampleOutput: String,
  constraints: String,
  initialCode: String,
  language: { type: String, default: 'python' },
  marks: { type: Number, default: 2 },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  timeLimit: { type: Number, default: 30 },
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: { type: Boolean, default: false }
  }]
}, { _id: false });

codeChallengeSchema.pre('save', function (next) {
  console.log('Saving Coding Challenge:', this.title);
  next();
});

/* ================================
   ✅ Theory & Snippets Sub-Schemas
   ================================ */
const theorySchema = new mongoose.Schema({
  textContent: { type: String, default: '' },
  files: {
    pdf: { name: String, url: String },
    ppt: {
      name: String,
      url: String,
      slides: [{
        title: String,
        content: String,
        slideNumber: Number
      }],
      totalSlides: { type: Number, default: 0 }
    },
    doc: { name: String, url: String }
  }
}, { _id: false });

const snippetsSchema = new mongoose.Schema({
  codeExamples: [{
    title: { type: String, required: true },
    description: String,
    code: { type: String, required: true },
    language: { type: String, default: 'python' },
    category: String,
    tags: [String]
  }]
}, { _id: false });

/* ================================
   ✅ UPDATED LECTURE SCHEMA (NEW FORMAT)
   ================================ */
const lectureSchema = new mongoose.Schema({
  module: { type: String, required: true }, // e.g., "Python Basics"
  lectures: [{
    topic: { type: String, required: true }, // e.g., "Variables and Data Types"
    content: {
      definition: [{ type: String }],  // multiple lines allowed
      syntax: { type: String },
      examples: [{
        title: { type: String },
        description: { type: String },
        code: { type: String },
        explanation: [{ type: String }]
      }],
      keyTakeaways: [{ type: String }],
      practiceSection: {
        ready_to_practice: { type: String },
        description: { type: String },
        mcqs: { type: String },
        coding_challenges: { type: String }
      }
    }
  }],
  estimatedDuration: { type: String, default: '30-45 min' }
}, { _id: false });

/* ================================
   ✅ MODULE SCHEMA
   ================================ */
const moduleSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true, default: () => new mongoose.Types.ObjectId() },
  title: { type: String, required: true },
  description: String,
  order: { type: Number, required: true, default: 0 },

  // Content Types
  theory: theorySchema,
  snippets: snippetsSchema,
  lecture: lectureSchema,

  // Assessments
  mcqs: { type: [mcqSchema], default: [] },
  codeChallenges: { type: [codeChallengeSchema], default: [] },

  // Module Test
  moduleTest: {
    mcqs: { type: [mcqSchema], default: [] },
    codeChallenges: { type: [codeChallengeSchema], default: [] },
    totalMarks: Number
  },

  // Metadata
  estimatedDuration: { type: String, default: '2-3 hours' },
  prerequisites: [String],
  learningObjectives: [String]
});

/* ================================
   ✅ SCORING CONFIG
   ================================ */
const scoringConfigSchema = new mongoose.Schema({
  mcqMarks: { type: Number, default: 10 },
  codingMarks: { type: Number, default: 50 },
  lessonMcqMarks: { type: Number, default: 5 },
  lessonCodingMarks: { type: Number, default: 25 },
  moduleTestMcqMarks: { type: Number, default: 15 },
  moduleTestCodingMarks: { type: Number, default: 75 },
  finalExamMcqMarks: { type: Number, default: 20 },
  finalExamCodingMarks: { type: Number, default: 100 }
}, { _id: false });

/* ================================
   ✅ FINAL EXAM SCHEMA
   ================================ */
const finalExamSchema = new mongoose.Schema({
  title: { type: String, default: 'Final Course Assessment' },
  description: { type: String, default: 'Comprehensive assessment covering all course topics' },
  mcqs: { type: [mcqSchema], default: [] },
  codeChallenges: { type: [codeChallengeSchema], default: [] },
  totalMarks: { type: Number, default: 1000 },
  duration: { type: Number, default: 120 },
  passingScore: { type: Number, default: 70 },
  isSecure: { type: Boolean, default: true },
  securitySettings: {
    preventCopyPaste: { type: Boolean, default: true },
    preventTabSwitch: { type: Boolean, default: true },
    preventRightClick: { type: Boolean, default: true },
    fullScreenRequired: { type: Boolean, default: true },
    webcamMonitoring: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true }
});

/* ================================
   ✅ COURSE SCHEMA
   ================================ */
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  modules: { type: [moduleSchema], default: [] },
  finalExam: { type: finalExamSchema, default: null },
  scoringConfig: { type: scoringConfigSchema },
  testUnlockThreshold: { type: Number, default: 80 },
  enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  enrolledCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

/* ================================
   ✅ PRE-HOOKS AND LOGS
   ================================ */
courseSchema.pre('save', function (next) {
  this.enrolledCount = this.enrolledUsers.length;
  if (this.difficulty) this.difficulty = this.difficulty.toLowerCase();
  console.log('Saving course:', this.title, 'Modules:', this.modules.length);
  next();
});

/* ================================
   ✅ EXPORT MODEL
   ================================ */
const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
