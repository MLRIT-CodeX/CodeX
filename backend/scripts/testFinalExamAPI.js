require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const SkillTest = require('../models/SkillTest');
const UserProgress = require('../models/UserProgress');

async function testFinalExamAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get first active course
    const course = await Course.findOne({ isActive: true });
    if (!course) {
      console.log('❌ No active courses found');
      return;
    }

    console.log(`\n📚 Testing with course: ${course.title}`);
    console.log(`Course ID: ${course._id}`);

    // Check if course has final exam data
    if (course.finalExam) {
      console.log('✅ Course has finalExam field');
      console.log(`   MCQs: ${course.finalExam.mcqs?.length || 0}`);
      console.log(`   Coding Challenges: ${course.finalExam.codeChallenges?.length || 0}`);
      console.log(`   Total Marks: ${course.finalExam.totalMarks || 'Not set'}`);
      console.log(`   Duration: ${course.finalExam.duration || 'Not set'} minutes`);
      console.log(`   Is Active: ${course.finalExam.isActive}`);
    } else {
      console.log('❌ Course has no finalExam field');
    }

    // Check if SkillTest exists
    const skillTest = await SkillTest.findOne({ 
      courseId: course._id, 
      isFinalExam: true,
      type: 'final_exam'
    });

    if (skillTest) {
      console.log('✅ SkillTest exists');
      console.log(`   Questions: ${skillTest.questions?.length || 0}`);
      console.log(`   Coding Problems: ${skillTest.codingProblems?.length || 0}`);
      console.log(`   Total Marks: ${skillTest.totalMarks}`);
      console.log(`   Attempts: ${skillTest.attempts?.length || 0}`);
    } else {
      console.log('❌ No SkillTest found');
    }

    // Check enrolled users
    console.log(`\n👥 Enrolled users: ${course.enrolledUsers?.length || 0}`);
    if (course.enrolledUsers && course.enrolledUsers.length > 0) {
      const firstUserId = course.enrolledUsers[0];
      console.log(`First enrolled user ID: ${firstUserId}`);
      
      // Check UserProgress
      const userProgress = await UserProgress.findOne({ 
        userId: firstUserId, 
        courseId: course._id 
      });
      
      if (userProgress) {
        console.log('✅ UserProgress exists for first user');
      } else {
        console.log('❌ No UserProgress found for first user');
      }
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`Course has final exam: ${!!course.finalExam}`);
    console.log(`SkillTest exists: ${!!skillTest}`);
    console.log(`Has enrolled users: ${!!(course.enrolledUsers && course.enrolledUsers.length > 0)}`);
    
    if (course.finalExam && (course.finalExam.mcqs?.length > 0 || course.finalExam.codeChallenges?.length > 0)) {
      console.log('✅ Final exam should work!');
    } else {
      console.log('❌ Final exam needs content to be populated');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

testFinalExamAPI();
