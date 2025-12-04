const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../models/Course');

async function analyzeAllCoursesMCQs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all courses
    const courses = await Course.find({}).select('modules topics finalExam title _id');
    console.log(`\n📚 Found ${courses.length} courses in database\n`);

    let grandTotalModuleTestMCQs = 0;
    let grandTotalFinalExamMCQs = 0;

    courses.forEach((course, courseIndex) => {
      console.log(`\n📖 Course ${courseIndex + 1}: "${course.title}"`);
      console.log(`   🆔 ID: ${course._id}`);
      
      // Count module test MCQs - check both 'modules' and 'topics' properties
      const moduleArray = course.modules || course.topics || [];
      let courseModuleTestMCQs = 0;
      
      if (moduleArray && moduleArray.length > 0) {
        console.log(`   📦 Found ${moduleArray.length} modules/topics`);
        
        moduleArray.forEach((module, index) => {
          let moduleMCQs = 0;
          
          console.log(`\n   📁 Module ${index + 1}: "${module.title || 'No Title'}"`);
          console.log(`      🆔 Module ID: ${module._id || 'No ID'}`);
          
          // Check moduleTest.mcqs (the actual property name)
          if (module.moduleTest && module.moduleTest.mcqs) {
            moduleMCQs += module.moduleTest.mcqs.length;
            console.log(`      🧪 Module Test MCQs: ${module.moduleTest.mcqs.length}`);
          }
          
          // Check moduleTest.mcqQuestions (alternative name)
          if (module.moduleTest && module.moduleTest.mcqQuestions) {
            moduleMCQs += module.moduleTest.mcqQuestions.length;
            console.log(`      🧪 Module Test MCQ Questions: ${module.moduleTest.mcqQuestions.length}`);
          }
          
          // Check test.mcqs (legacy naming)
          if (module.test && module.test.mcqs) {
            moduleMCQs += module.test.mcqs.length;
            console.log(`      🧪 Legacy Test MCQs: ${module.test.mcqs.length}`);
          }
          
          // Check test.mcqQuestions (legacy naming)
          if (module.test && module.test.mcqQuestions) {
            moduleMCQs += module.test.mcqQuestions.length;
            console.log(`      🧪 Legacy Test MCQ Questions: ${module.test.mcqQuestions.length}`);
          }
          
          // Also check what we're NOT counting (for reference)
          if (module.mcqs && module.mcqs.length > 0) {
            console.log(`      📋 Direct Module MCQs: ${module.mcqs.length} (NOT counted in totals)`);
          }
          if (module.mcqQuestions && module.mcqQuestions.length > 0) {
            console.log(`      📋 Direct Module MCQ Questions: ${module.mcqQuestions.length} (NOT counted in totals)`);
          }
          
          console.log(`      📊 Total MCQs counted for this module: ${moduleMCQs}`);
          courseModuleTestMCQs += moduleMCQs;
        });
      } else {
        console.log(`   ❌ No modules/topics found`);
      }
      
      // Count final exam MCQs
      let courseFinalExamMCQs = 0;
      if (course.finalExam) {
        console.log(`\n   🎓 Final Exam Analysis:`);
        
        // Check finalExam.mcqs
        if (course.finalExam.mcqs) {
          courseFinalExamMCQs += course.finalExam.mcqs.length;
          console.log(`      📝 Final Exam MCQs: ${course.finalExam.mcqs.length}`);
        }
        
        // Check finalExam.mcqQuestions
        if (course.finalExam.mcqQuestions) {
          courseFinalExamMCQs += course.finalExam.mcqQuestions.length;
          console.log(`      📝 Final Exam MCQ Questions: ${course.finalExam.mcqQuestions.length}`);
        }
        
        // Check if finalExam has questions array
        if (course.finalExam.questions) {
          courseFinalExamMCQs += course.finalExam.questions.length;
          console.log(`      📝 Final Exam Questions: ${course.finalExam.questions.length}`);
        }
        
        console.log(`      📊 Total Final Exam MCQs: ${courseFinalExamMCQs}`);
      } else {
        console.log(`   ❌ No final exam found`);
      }
      
      console.log(`\n   📈 Course Summary:`);
      console.log(`      🧪 Module Test MCQs: ${courseModuleTestMCQs}`);
      console.log(`      🎓 Final Exam MCQs: ${courseFinalExamMCQs}`);
      console.log(`      🎯 Course Total MCQs: ${courseModuleTestMCQs + courseFinalExamMCQs}`);
      
      grandTotalModuleTestMCQs += courseModuleTestMCQs;
      grandTotalFinalExamMCQs += courseFinalExamMCQs;
    });

    const grandTotal = grandTotalModuleTestMCQs + grandTotalFinalExamMCQs;
    
    console.log('\n🌟 GRAND TOTALS ACROSS ALL COURSES:');
    console.log('='.repeat(50));
    console.log(`🧪 Total Module Test MCQs: ${grandTotalModuleTestMCQs}`);
    console.log(`🎓 Total Final Exam MCQs: ${grandTotalFinalExamMCQs}`);
    console.log(`🎯 GRAND TOTAL MCQs: ${grandTotal}`);
    
    console.log('\n🔍 Analysis for Target Course (690c993dcb21cbd98ce292d8):');
    const targetCourse = courses.find(c => c._id.toString() === '690c993dcb21cbd98ce292d8');
    if (targetCourse) {
      console.log('✅ Target course found in analysis above');
      console.log('Expected: 15 module test MCQs (3 modules × 5 each)');
      console.log('If you\'re still getting 19, there might be:');
      console.log('  1. Additional courses with MCQs');
      console.log('  2. Legacy MCQ fields being counted');
      console.log('  3. Data inconsistency in the database');
    } else {
      console.log('❌ Target course not found');
    }

  } catch (error) {
    console.error('❌ Error analyzing courses:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
  }
}

// Run the analysis
if (require.main === module) {
  analyzeAllCoursesMCQs();
}

module.exports = { analyzeAllCoursesMCQs };