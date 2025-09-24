require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

async function testFinalExamData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const courses = await Course.find({ isActive: true });
    console.log(`📚 Found ${courses.length} active courses\n`);

    if (courses.length === 0) {
      console.log('❌ No courses found! Please create courses first.');
      return;
    }

    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      console.log(`${i + 1}. Course: ${course.title}`);
      console.log(`   ID: ${course._id}`);
      
      if (course.finalExam) {
        const mcqCount = course.finalExam.mcqs?.length || 0;
        const codingCount = course.finalExam.codeChallenges?.length || 0;
        console.log(`   ✅ Has finalExam: ${mcqCount} MCQs, ${codingCount} coding challenges`);
        
        if (mcqCount === 0 && codingCount === 0) {
          console.log(`   ⚠️  Final exam is empty!`);
        }
      } else {
        console.log(`   ❌ NO finalExam field`);
      }
      
      // Check lesson content
      let totalMCQs = 0;
      let totalCoding = 0;
      let totalLessons = 0;
      
      if (course.topics && course.topics.length > 0) {
        course.topics.forEach(topic => {
          if (topic.lessons && topic.lessons.length > 0) {
            totalLessons += topic.lessons.length;
            topic.lessons.forEach(lesson => {
              totalMCQs += lesson.mcqs?.length || 0;
              totalCoding += lesson.codeChallenges?.length || 0;
            });
          }
        });
      }
      
      console.log(`   📖 Course content: ${course.topics?.length || 0} topics, ${totalLessons} lessons`);
      console.log(`   📝 Available for final exam: ${totalMCQs} MCQs, ${totalCoding} coding challenges`);
      
      if (totalMCQs === 0 && totalCoding === 0) {
        console.log(`   ⚠️  No lesson content available for final exam generation!`);
      }
      
      console.log(''); // Empty line for readability
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

testFinalExamData();
