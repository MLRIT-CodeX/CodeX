const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../models/Course');

const COURSE_ID = '690c993dcb21cbd98ce292d8';

async function verifyModuleTests() {
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

    console.log(`\n📚 Course: ${course.title}`);
    console.log(`📊 Total Modules: ${course.modules?.length || 0}`);
    console.log('\n🔍 Module Test Analysis:');

    if (course.modules && course.modules.length > 0) {
      course.modules.forEach((module, index) => {
        console.log(`\n📁 Module ${index + 1}: "${module.title}"`);
        
        if (module.moduleTest) {
          const test = module.moduleTest;
          console.log(`   ✅ Has Module Test: "${test.title}"`);
          console.log(`   📝 Description: ${test.description}`);
          console.log(`   ⏰ Duration: ${test.duration} minutes`);
          console.log(`   🎯 Total Marks: ${test.totalMarks}`);
          console.log(`   📊 Passing Score: ${test.passingScore}%`);
          console.log(`   ❓ MCQs: ${test.mcqs?.length || 0}`);
          console.log(`   💻 Code Challenges: ${test.codeChallenges?.length || 0}`);
          console.log(`   🟢 Active: ${test.isActive ? 'Yes' : 'No'}`);
          console.log(`   📅 Created: ${test.createdAt ? test.createdAt.toLocaleDateString() : 'N/A'}`);
          
          // Show MCQ details
          if (test.mcqs && test.mcqs.length > 0) {
            console.log(`   📋 MCQ Topics:`);
            test.mcqs.forEach((mcq, mcqIndex) => {
              console.log(`      ${mcqIndex + 1}. ${mcq.question.substring(0, 50)}... (${mcq.marks} marks)`);
            });
          }
          
          // Show Code Challenge details
          if (test.codeChallenges && test.codeChallenges.length > 0) {
            console.log(`   💼 Code Challenges:`);
            test.codeChallenges.forEach((challenge, challengeIndex) => {
              console.log(`      ${challengeIndex + 1}. ${challenge.title} (${challenge.marks} marks, ${challenge.timeLimit}s)`);
            });
          }
        } else {
          console.log(`   ❌ No Module Test`);
        }
      });
    } else {
      console.log('❌ No modules found in this course');
    }

    // Summary
    const modulesWithTests = course.modules?.filter(m => m.moduleTest) || [];
    const modulesWithoutTests = course.modules?.filter(m => !m.moduleTest) || [];
    
    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Modules with tests: ${modulesWithTests.length}`);
    console.log(`   ❌ Modules without tests: ${modulesWithoutTests.length}`);
    console.log(`   📊 Test coverage: ${course.modules?.length ? Math.round((modulesWithTests.length / course.modules.length) * 100) : 0}%`);

  } catch (error) {
    console.error('❌ Error verifying module tests:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
}

// Run verification
if (require.main === module) {
  verifyModuleTests();
}

module.exports = { verifyModuleTests };