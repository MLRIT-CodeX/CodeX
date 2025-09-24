require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

async function checkCourses() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not set in environment variables');
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all courses
    const courses = await Course.find({});
    console.log(`📚 Found ${courses.length} total courses`);
    
    if (courses.length === 0) {
      console.log('❌ No courses found in database!');
      console.log('💡 You may need to create some courses first using the admin interface.');
      return;
    }

    courses.forEach((course, index) => {
      console.log(`\n📖 Course ${index + 1}: ${course.title}`);
      console.log(`   - ID: ${course._id}`);
      console.log(`   - Active: ${course.isActive}`);
      console.log(`   - Difficulty: ${course.difficulty}`);
      console.log(`   - Topics: ${course.topics?.length || 0}`);
      console.log(`   - Has finalExam: ${!!course.finalExam}`);
      
      if (course.finalExam) {
        console.log(`   - Final Exam MCQs: ${course.finalExam.mcqs?.length || 0}`);
        console.log(`   - Final Exam Coding: ${course.finalExam.codeChallenges?.length || 0}`);
      }
      
      // Check topics and lessons
      if (course.topics && course.topics.length > 0) {
        let totalLessons = 0;
        let totalMCQs = 0;
        let totalCoding = 0;
        
        course.topics.forEach((topic, topicIndex) => {
          const lessonCount = topic.lessons?.length || 0;
          totalLessons += lessonCount;
          
          if (topic.lessons) {
            topic.lessons.forEach(lesson => {
              totalMCQs += lesson.mcqs?.length || 0;
              totalCoding += lesson.codeChallenges?.length || 0;
            });
          }
        });
        
        console.log(`   - Total Lessons: ${totalLessons}`);
        console.log(`   - Total Lesson MCQs: ${totalMCQs}`);
        console.log(`   - Total Lesson Coding Challenges: ${totalCoding}`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the check
checkCourses();
