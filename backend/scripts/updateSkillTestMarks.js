const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../models/Course');
const SkillTest = require('../models/SkillTest');

const COURSE_ID = '690c993dcb21cbd98ce292d8';

async function updateSkillTestTotalMarks() {
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
    console.log(`🎯 Course Final Exam Total Marks: ${course.finalExam.totalMarks}`);

    // Find the corresponding SkillTest
    const skillTest = await SkillTest.findOne({ 
      courseId: COURSE_ID, 
      isFinalExam: true,
      type: 'final_exam'
    });

    if (skillTest) {
      console.log(`📊 Current SkillTest Total Marks: ${skillTest.totalMarks}`);
      
      if (skillTest.totalMarks !== course.finalExam.totalMarks) {
        console.log(`🔄 Updating SkillTest total marks from ${skillTest.totalMarks} to ${course.finalExam.totalMarks}`);
        
        skillTest.totalMarks = course.finalExam.totalMarks;
        await skillTest.save();
        
        console.log(`✅ SkillTest total marks updated successfully!`);
      } else {
        console.log(`✅ SkillTest total marks already match course final exam`);
      }
    } else {
      console.log(`❌ No SkillTest found for course ${COURSE_ID}`);
    }

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

// Run the update
console.log('🔄 Updating SkillTest Total Marks...\n');
updateSkillTestTotalMarks();