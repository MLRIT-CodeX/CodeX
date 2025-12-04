const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../models/Course');

const COURSE_ID = '690c993dcb21cbd98ce292d8';

async function analyzeCourseStructure() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the specific course
    const course = await Course.findById(COURSE_ID);
    if (!course) {
      console.error(`❌ Course with ID ${COURSE_ID} not found`);
      return;
    }

    console.log('\n📚 COURSE ANALYSIS');
    console.log('='.repeat(60));
    console.log(`📖 Title: ${course.title}`);
    console.log(`🆔 ID: ${course._id}`);
    console.log(`📊 Total Modules: ${course.modules?.length || 0}`);
    
    if (course.modules && course.modules.length > 0) {
      console.log('\n🔍 DETAILED MODULE BREAKDOWN:');
      console.log('-'.repeat(60));
      
      course.modules.forEach((module, index) => {
        console.log(`\n📁 Module ${index + 1}: "${module.title}"`);
        console.log(`   🆔 Module ID: ${module._id}`);
        console.log(`   📝 Description: ${module.description || 'No description'}`);
        console.log(`   📊 Order: ${module.order || 'Not set'}`);
        
        // Check different MCQ locations
        let totalModuleMCQs = 0;
        
        // 1. Direct module MCQs
        if (module.mcqs && module.mcqs.length > 0) {
          console.log(`   🎯 Direct MCQs: ${module.mcqs.length}`);
          totalModuleMCQs += module.mcqs.length;
        }
        
        // 2. Module test MCQs
        if (module.moduleTest) {
          console.log(`   🧪 Has Module Test: Yes`);
          console.log(`      ├─ Test Title: ${module.moduleTest.title || 'No title'}`);
          console.log(`      ├─ Test Description: ${module.moduleTest.description || 'No description'}`);
          console.log(`      ├─ Duration: ${module.moduleTest.duration || 'Not set'} minutes`);
          console.log(`      ├─ Total Marks: ${module.moduleTest.totalMarks || 'Not set'}`);
          console.log(`      ├─ Passing Score: ${module.moduleTest.passingScore || 'Not set'}%`);
          
          if (module.moduleTest.mcqs && module.moduleTest.mcqs.length > 0) {
            console.log(`      ├─ MCQs: ${module.moduleTest.mcqs.length}`);
            totalModuleMCQs += module.moduleTest.mcqs.length;
            
            // Show first few MCQs for debugging
            module.moduleTest.mcqs.slice(0, 3).forEach((mcq, mcqIndex) => {
              console.log(`      │  ├─ MCQ ${mcqIndex + 1}: ${mcq.question?.substring(0, 50)}...`);
              console.log(`      │  ├─ Options: ${mcq.options?.length || 0}`);
              console.log(`      │  ├─ Correct: ${mcq.correct}`);
              console.log(`      │  └─ Marks: ${mcq.marks || 1}`);
            });
            
            if (module.moduleTest.mcqs.length > 3) {
              console.log(`      │  └─ ... and ${module.moduleTest.mcqs.length - 3} more MCQs`);
            }
          } else {
            console.log(`      ├─ MCQs: 0`);
          }
          
          if (module.moduleTest.codeChallenges && module.moduleTest.codeChallenges.length > 0) {
            console.log(`      └─ Code Challenges: ${module.moduleTest.codeChallenges.length}`);
          } else {
            console.log(`      └─ Code Challenges: 0`);
          }
        } else {
          console.log(`   🧪 Has Module Test: No`);
        }
        
        // 3. Theory/Lecture MCQs
        if (module.theory || module.lecture) {
          console.log(`   📖 Has Theory/Lecture Content: Yes`);
          // Add more analysis if needed
        }
        
        console.log(`   📊 Total MCQs in this module: ${totalModuleMCQs}`);
      });
    }
    
    // Check Final Exam
    console.log('\n🎓 FINAL EXAM ANALYSIS:');
    console.log('-'.repeat(40));
    if (course.finalExam) {
      console.log(`✅ Has Final Exam: Yes`);
      console.log(`   📝 Title: ${course.finalExam.title || 'No title'}`);
      console.log(`   📄 Description: ${course.finalExam.description || 'No description'}`);
      console.log(`   🎯 MCQs: ${course.finalExam.mcqs?.length || 0}`);
      console.log(`   💻 Code Challenges: ${course.finalExam.codeChallenges?.length || 0}`);
      console.log(`   📊 Total Marks: ${course.finalExam.totalMarks || 'Not set'}`);
      console.log(`   ⏱️  Duration: ${course.finalExam.duration || 'Not set'} minutes`);
    } else {
      console.log(`❌ Has Final Exam: No`);
    }
    
    // Summary
    console.log('\n📈 SUMMARY:');
    console.log('='.repeat(40));
    
    let totalModuleTestMCQs = 0;
    let totalDirectMCQs = 0;
    
    course.modules?.forEach(module => {
      if (module.mcqs) totalDirectMCQs += module.mcqs.length;
      if (module.moduleTest?.mcqs) totalModuleTestMCQs += module.moduleTest.mcqs.length;
    });
    
    const finalExamMCQs = course.finalExam?.mcqs?.length || 0;
    const totalMCQs = totalDirectMCQs + totalModuleTestMCQs + finalExamMCQs;
    
    console.log(`📊 Direct Module MCQs: ${totalDirectMCQs}`);
    console.log(`🧪 Module Test MCQs: ${totalModuleTestMCQs}`);
    console.log(`🎓 Final Exam MCQs: ${finalExamMCQs}`);
    console.log(`🎯 TOTAL MCQs: ${totalMCQs}`);
    
    console.log('\n🔧 EXPECTED vs ACTUAL:');
    console.log(`Expected: Each module test should have 5 MCQs`);
    console.log(`Actual: Module tests have varying MCQ counts`);
    
    if (totalModuleTestMCQs !== (course.modules?.length * 5)) {
      console.log(`⚠️  DISCREPANCY FOUND!`);
      console.log(`   Expected total: ${course.modules?.length * 5} MCQs (${course.modules?.length} modules × 5 MCQs)`);
      console.log(`   Actual total: ${totalModuleTestMCQs} MCQs`);
    } else {
      console.log(`✅ MCQ counts match expectations`);
    }

  } catch (error) {
    console.error('❌ Error analyzing course:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
  }
}

// Run the analysis
if (require.main === module) {
  analyzeCourseStructure();
}

module.exports = { analyzeCourseStructure };