require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

// Helper: Generate final exam from course content
function generateFinalExamData(course) {
  console.log(`Generating final exam for course: ${course.title}`);
  console.log(`Course has ${course.topics?.length || 0} topics`);
  
  // Collect all MCQs and coding challenges from lessons
  const allMCQs = [];
  const allCodingChallenges = [];
  
  course.topics.forEach((topic, topicIndex) => {
    console.log(`  Topic ${topicIndex + 1}: ${topic.title} (${topic.lessons?.length || 0} lessons)`);
    
    if (topic.lessons && topic.lessons.length > 0) {
      topic.lessons.forEach((lesson, lessonIndex) => {
        console.log(`    Lesson ${lessonIndex + 1}: ${lesson.title} (${lesson.mcqs?.length || 0} MCQs, ${lesson.codeChallenges?.length || 0} coding challenges)`);
        
        // Collect MCQs
        if (lesson.mcqs && lesson.mcqs.length > 0) {
          lesson.mcqs.forEach((mcq, mcqIndex) => {
            allMCQs.push({
              question: mcq.question,
              options: mcq.options,
              correct: mcq.correct,
              explanation: mcq.explanation,
              marks: course.scoringConfig?.finalExamMcqMarks || 20,
              difficulty: course.difficulty || 'medium'
            });
          });
        }
        
        // Collect coding challenges
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
              marks: course.scoringConfig?.finalExamCodingMarks || 100,
              difficulty: course.difficulty || 'medium',
              timeLimit: challenge.timeLimit || 300,
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
    }
  });
  
  if (allMCQs.length === 0 && allCodingChallenges.length === 0) {
    console.log(`⚠️ No MCQs or coding challenges found in course: ${course.title}`);
    return null;
  }
  
  // Select questions for final exam (sample selection)
  const selectedMCQs = allMCQs.slice(0, Math.min(10, allMCQs.length)); // Max 10 MCQs
  const selectedCoding = allCodingChallenges.slice(0, Math.min(5, allCodingChallenges.length)); // Max 5 coding challenges
  
  // Calculate total marks
  const mcqMarks = selectedMCQs.reduce((sum, mcq) => sum + (mcq.marks || 20), 0);
  const codingMarks = selectedCoding.reduce((sum, challenge) => sum + (challenge.marks || 100), 0);
  const totalMarks = mcqMarks + codingMarks;
  
  // Create final exam object
  const finalExamData = {
    title: `${course.title} - Final Exam`,
    description: `Comprehensive final examination covering all topics in ${course.title}. This exam tests your mastery of the complete course curriculum.`,
    mcqs: selectedMCQs,
    codeChallenges: selectedCoding,
    totalMarks: totalMarks > 0 ? totalMarks : 1000,
    duration: 120, // 2 hours
    passingScore: 70,
    isSecure: true,
    securitySettings: {
      preventCopyPaste: true,
      preventTabSwitch: true,
      preventRightClick: true,
      fullScreenRequired: true,
      webcamMonitoring: true,
      timeLimit: 120
    },
    isActive: true
  };
  
  console.log(`✅ Generated final exam with ${selectedMCQs.length} MCQs and ${selectedCoding.length} coding challenges`);
  return finalExamData;
}

async function populateFinalExamsForAllCourses() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not set in environment variables');
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // First, let's see all courses
    const allCourses = await Course.find({ isActive: true });
    console.log(`📚 Found ${allCourses.length} total active courses`);
    
    // Check each course's final exam status
    const coursesNeedingExams = [];
    for (const course of allCourses) {
      console.log(`\n🔍 Checking course: ${course.title}`);
      console.log(`   - Has finalExam field: ${!!course.finalExam}`);
      
      if (course.finalExam) {
        console.log(`   - MCQs count: ${course.finalExam.mcqs?.length || 0}`);
        console.log(`   - Coding challenges count: ${course.finalExam.codeChallenges?.length || 0}`);
        
        // Check if final exam is empty (no questions)
        const hasMCQs = course.finalExam.mcqs && course.finalExam.mcqs.length > 0;
        const hasCoding = course.finalExam.codeChallenges && course.finalExam.codeChallenges.length > 0;
        
        if (!hasMCQs && !hasCoding) {
          console.log(`   - ❌ Final exam exists but is empty`);
          coursesNeedingExams.push(course);
        } else {
          console.log(`   - ✅ Final exam exists and has content`);
        }
      } else {
        console.log(`   - ❌ No final exam field`);
        coursesNeedingExams.push(course);
      }
    }
    
    console.log(`\n📊 Summary: ${coursesNeedingExams.length} courses need final exams`);
    const courses = coursesNeedingExams;

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const course of courses) {
      try {
        console.log(`\n🔄 Processing course: ${course.title}`);
        
        const finalExamData = generateFinalExamData(course);
        
        if (finalExamData) {
          // Update the course with the final exam
          await Course.findByIdAndUpdate(
            course._id,
            { finalExam: finalExamData },
            { new: true }
          );
          
          successCount++;
          console.log(`✅ Final exam populated for: ${course.title}`);
        } else {
          skipCount++;
          console.log(`⏭️ Skipped course (no content): ${course.title}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to populate final exam for ${course.title}:`, error.message);
      }
    }

    console.log(`\n📊 Final Report:`);
    console.log(`✅ Successfully populated: ${successCount} final exams`);
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
  populateFinalExamsForAllCourses();
}

module.exports = { generateFinalExamData, populateFinalExamsForAllCourses };
