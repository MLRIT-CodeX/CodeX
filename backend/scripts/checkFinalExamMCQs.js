const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config();

async function checkFinalExamMCQs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all courses and their final exam MCQs
    const courses = await Course.find({}, 'title finalExam');
    
    console.log('📚 Checking Final Exam MCQs in all courses:\n');
    
    let totalFinalExamMCQs = 0;
    
    courses.forEach((course, index) => {
      console.log(`${index + 1}. Course: "${course.title}"`);
      
      if (course.finalExam && course.finalExam.mcqs && course.finalExam.mcqs.length > 0) {
        console.log(`   🎓 Final Exam MCQs: ${course.finalExam.mcqs.length}`);
        totalFinalExamMCQs += course.finalExam.mcqs.length;
        
        // Show each MCQ question
        course.finalExam.mcqs.forEach((mcq, mcqIndex) => {
          console.log(`   ${mcqIndex + 1}. Question: "${mcq.question}"`);
          console.log(`      Options: [${mcq.options.join(', ')}]`);
          console.log(`      Correct Answer: ${mcq.options[mcq.correct]} (Index: ${mcq.correct})`);
          console.log(`      Marks: ${mcq.marks}`);
          console.log(`      Difficulty: ${mcq.difficulty || 'Not specified'}`);
          if (mcq.explanation) {
            console.log(`      Explanation: ${mcq.explanation}`);
          }
          console.log('');
        });
      } else {
        console.log('   ❌ No Final Exam MCQs found');
      }
      console.log('');
    });
    
    console.log(`📊 Summary:`);
    console.log(`   - Total Courses: ${courses.length}`);
    console.log(`   - Total Final Exam MCQs: ${totalFinalExamMCQs}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkFinalExamMCQs();
