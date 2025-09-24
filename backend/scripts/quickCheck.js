require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

async function quickCheck() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const courses = await Course.find({});
    console.log(`📚 Found ${courses.length} total courses`);
    
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      console.log(`\n${i + 1}. ${course.title}`);
      console.log(`   Active: ${course.isActive}`);
      console.log(`   Has finalExam: ${!!course.finalExam}`);
      
      if (course.finalExam) {
        const mcqCount = course.finalExam.mcqs?.length || 0;
        const codingCount = course.finalExam.codeChallenges?.length || 0;
        console.log(`   Final exam: ${mcqCount} MCQs, ${codingCount} coding challenges`);
        
        if (mcqCount === 0 && codingCount === 0) {
          console.log(`   ❌ Final exam is empty - needs population`);
        } else {
          console.log(`   ✅ Final exam has content`);
        }
      } else {
        console.log(`   ❌ No final exam - needs creation`);
      }
      
      // Check available content for final exam generation
      let totalMCQs = 0;
      let totalCoding = 0;
      
      if (course.topics) {
        course.topics.forEach(topic => {
          if (topic.lessons) {
            topic.lessons.forEach(lesson => {
              totalMCQs += lesson.mcqs?.length || 0;
              totalCoding += lesson.codeChallenges?.length || 0;
            });
          }
        });
      }
      
      console.log(`   Available content: ${totalMCQs} MCQs, ${totalCoding} coding challenges`);
      
      if (totalMCQs === 0 && totalCoding === 0) {
        console.log(`   ⚠️ No lesson content available for final exam generation`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

quickCheck();
