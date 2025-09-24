require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const SkillTest = require('../models/SkillTest');

// Helper: Generate final exam from course content
async function generateFinalExam(course, scoringConfig = {}) {
  try {
    console.log(`Generating final exam for course: ${course.title}`);
    
    // Check if final exam already exists
    const existingExam = await SkillTest.findOne({ 
      courseId: course._id, 
      isFinalExam: true,
      type: 'final_exam'
    });
    
    if (existingExam) {
      console.log(`⚠️ Final exam already exists for course: ${course.title}`);
      return existingExam;
    }
    
    // Collect all MCQs and coding challenges from all lessons
    const allMCQs = [];
    const allCodingChallenges = [];
    
    course.topics.forEach((topic, topicIndex) => {
      topic.lessons.forEach((lesson, lessonIndex) => {
        // Add MCQs with enhanced metadata
        if (lesson.mcqs && lesson.mcqs.length > 0) {
          lesson.mcqs.forEach((mcq, mcqIndex) => {
            allMCQs.push({
              question: mcq.question,
              options: mcq.options,
              correct: mcq.correct,
              explanation: mcq.explanation,
              marks: scoringConfig?.finalExamMcqMarks || 20,
              difficulty: course.difficulty || 'Medium',
              topicTitle: topic.title,
              lessonTitle: lesson.title,
              source: `Topic ${topicIndex + 1}, Lesson ${lessonIndex + 1}, MCQ ${mcqIndex + 1}`
            });
          });
        }
        
        // Add coding challenges with enhanced metadata
        if (lesson.codeChallenges && lesson.codeChallenges.length > 0) {
          lesson.codeChallenges.forEach((challenge, challengeIndex) => {
            allCodingChallenges.push({
              title: challenge.title,
              description: challenge.description,
              sampleInput: challenge.sampleInput,
              sampleOutput: challenge.sampleOutput,
              constraints: challenge.constraints,
              initialCode: challenge.initialCode,
              language: challenge.language || 'python',
              marks: scoringConfig?.finalExamCodingMarks || 100,
              difficulty: course.difficulty || 'Medium',
              timeLimit: 300, // 5 minutes per coding challenge
              topicTitle: topic.title,
              lessonTitle: lesson.title,
              source: `Topic ${topicIndex + 1}, Lesson ${lessonIndex + 1}, Challenge ${challengeIndex + 1}`,
              testCases: challenge.testCases || [
                {
                  input: challenge.sampleInput || "",
                  expectedOutput: challenge.sampleOutput || "",
                  isHidden: false
                }
              ]
            });
          });
        }
      });
    });
    
    if (allMCQs.length === 0 && allCodingChallenges.length === 0) {
      console.log(`⚠️ No MCQs or coding challenges found in course: ${course.title}`);
      return null;
    }
    
    // Select questions for final exam (sample selection - you can make this more sophisticated)
    const selectedMCQs = allMCQs.slice(0, Math.min(10, allMCQs.length)); // Max 10 MCQs
    const selectedCoding = allCodingChallenges.slice(0, Math.min(5, allCodingChallenges.length)); // Max 5 coding challenges
    
    // Calculate total marks
    const mcqMarks = selectedMCQs.reduce((sum, mcq) => sum + (mcq.marks || 20), 0);
    const codingMarks = selectedCoding.reduce((sum, challenge) => sum + (challenge.marks || 100), 0);
    const totalMarks = mcqMarks + codingMarks;
    
    // Create final exam SkillTest
    const finalExam = new SkillTest({
      title: `${course.title} - Final Exam`,
      description: `Comprehensive final examination covering all topics in ${course.title}. This exam tests your mastery of the complete course curriculum.`,
      duration: 120, // 2 hours
      type: 'final_exam',
      difficulty: course.difficulty || 'Medium',
      courseId: course._id,
      isFinalExam: true,
      passingScore: 70,
      totalMarks: totalMarks,
      questions: selectedMCQs,
      codingProblems: selectedCoding,
      securitySettings: {
        preventCopyPaste: true,
        preventTabSwitch: true,
        preventRightClick: true,
        fullScreenRequired: true,
        webcamMonitoring: true,
        timeLimit: 120
      },
      attempts: [],
      isActive: true,
      createdBy: null
    });
    
    const savedExam = await finalExam.save();
    console.log(`✅ Final exam created successfully with ID: ${savedExam._id}`);
    console.log(`📊 Exam stats: ${selectedMCQs.length} MCQs, ${selectedCoding.length} coding challenges, ${totalMarks} total marks`);
    
    return savedExam;
  } catch (error) {
    console.error('❌ Error generating final exam:', error);
    throw error;
  }
}

async function generateFinalExamsForAllCourses() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not set in environment variables');
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all active courses
    const courses = await Course.find({ isActive: true });
    console.log(`📚 Found ${courses.length} active courses`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const course of courses) {
      try {
        console.log(`\n🔄 Processing course: ${course.title}`);
        
        const finalExam = await generateFinalExam(course, course.scoringConfig);
        
        if (finalExam) {
          successCount++;
          console.log(`✅ Final exam generated for: ${course.title}`);
        } else {
          skipCount++;
          console.log(`⏭️ Skipped course (no content): ${course.title}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to generate final exam for ${course.title}:`, error.message);
      }
    }

    console.log(`\n📊 Final Report:`);
    console.log(`✅ Successfully generated: ${successCount} final exams`);
    console.log(`⏭️ Skipped: ${skipCount} courses`);
    console.log(`❌ Errors: ${errorCount} courses`);

  } catch (error) {
    console.error('❌ Error in main process:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  generateFinalExamsForAllCourses();
}

module.exports = { generateFinalExam, generateFinalExamsForAllCourses };
