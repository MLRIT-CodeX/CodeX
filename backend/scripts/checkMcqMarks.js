const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../models/Course');

const COURSE_ID = '690c993dcb21cbd98ce292d8';

async function checkMcqMarks() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const course = await Course.findById(COURSE_ID);
    if (!course) {
      console.error('❌ Course not found');
      return;
    }

    console.log('\n📊 MCQ MARKS ANALYSIS');
    console.log('='.repeat(50));
    
    // Check Module Test MCQ marks
    console.log('\n🧪 MODULE TEST MCQ MARKS:');
    course.modules.forEach((module, index) => {
      console.log(`\nModule ${index + 1}: ${module.title}`);
      if (module.moduleTest?.mcqs) {
        console.log(`  MCQs: ${module.moduleTest.mcqs.length}`);
        module.moduleTest.mcqs.forEach((mcq, mcqIndex) => {
          console.log(`    MCQ ${mcqIndex + 1}: ${mcq.marks || 1} marks`);
        });
        
        const totalMarks = module.moduleTest.mcqs.reduce((sum, mcq) => sum + (mcq.marks || 1), 0);
        console.log(`  📊 Total possible marks: ${totalMarks}`);
      } else {
        console.log('  ❌ No MCQs found');
      }
    });

    // Check Final Exam MCQ marks  
    console.log('\n🎓 FINAL EXAM MCQ MARKS:');
    if (course.finalExam?.mcqs) {
      console.log(`  MCQs: ${course.finalExam.mcqs.length}`);
      course.finalExam.mcqs.forEach((mcq, index) => {
        console.log(`    MCQ ${index + 1}: ${mcq.marks || 1} marks`);
      });
      
      const totalMarks = course.finalExam.mcqs.reduce((sum, mcq) => sum + (mcq.marks || 1), 0);
      console.log(`  📊 Total possible marks: ${totalMarks}`);
    } else {
      console.log('  ❌ No final exam MCQs found');
    }

    console.log('\n💡 Individual Scoring Logic:');
    console.log('  - Each correct MCQ answer = its individual marks');
    console.log('  - Wrong answers = 0 marks');
    console.log('  - Total score = sum of marks for all correct answers');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
  }
}

checkMcqMarks();