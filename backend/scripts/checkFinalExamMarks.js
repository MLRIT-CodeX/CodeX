const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../models/Course');

const COURSE_ID = '690c993dcb21cbd98ce292d8';

async function checkFinalExamMarks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the course
    const course = await Course.findById(COURSE_ID);
    if (!course) {
      console.error(`❌ Course with ID ${COURSE_ID} not found`);
      return;
    }

    console.log(`📚 Course: ${course.title}`);
    
    if (course.finalExam) {
      console.log(`🎯 Final Exam Total Marks: ${course.finalExam.totalMarks}`);
      console.log(`📊 Final Exam Duration: ${course.finalExam.duration} minutes`);
      console.log(`🎓 Passing Score: ${course.finalExam.passingScore}%`);
      console.log(`📝 MCQ Questions: ${course.finalExam.mcqs.length}`);
      console.log(`💻 Coding Challenges: ${course.finalExam.codeChallenges.length}`);
      
      // Calculate actual total
      const mcqMarks = course.finalExam.mcqs.reduce((sum, mcq) => sum + mcq.marks, 0);
      const codingMarks = course.finalExam.codeChallenges.reduce((sum, challenge) => sum + challenge.marks, 0);
      const actualTotal = mcqMarks + codingMarks;
      
      console.log(`\n📊 Actual Calculation:`);
      console.log(`   MCQ Marks: ${mcqMarks}`);
      console.log(`   Coding Marks: ${codingMarks}`);
      console.log(`   Calculated Total: ${actualTotal}`);
      console.log(`   Configured Total: ${course.finalExam.totalMarks}`);
      console.log(`   Match: ${actualTotal === course.finalExam.totalMarks ? '✅ YES' : '❌ NO'}`);
    } else {
      console.log('❌ No final exam found');
    }

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

// Run the check
console.log('🔍 Checking Final Exam Marks in Database...\n');
checkFinalExamMarks();