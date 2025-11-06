const mongoose = require('mongoose');
const Course = require('../models/Course');
const SkillTest = require('../models/SkillTest');

// Connect to MongoDB Atlas
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testFinalExamMCQs() {
  try {
    console.log('🔍 Testing Final Exam MCQ Count Issue...\n');
    
    // Find all courses with final exams
    const courses = await Course.find({ 
      'finalExam.mcqs': { $exists: true, $ne: [] }
    });
    
    console.log(`Found ${courses.length} courses with final exam MCQs\n`);
    
    for (const course of courses) {
      console.log(`📚 Course: ${course.title}`);
      console.log(`   Course ID: ${course._id}`);
      console.log(`   Final Exam MCQs in Course: ${course.finalExam.mcqs?.length || 0}`);
      
      // Check if SkillTest exists for this course
      const skillTest = await SkillTest.findOne({
        courseId: course._id,
        isFinalExam: true,
        type: 'final_exam'
      });
      
      if (skillTest) {
        console.log(`   SkillTest exists: ✅`);
        console.log(`   SkillTest MCQs (questions field): ${skillTest.questions?.length || 0}`);
        console.log(`   SkillTest Coding Problems: ${skillTest.codingProblems?.length || 0}`);
        
        // Show first few MCQ questions to verify content
        if (skillTest.questions && skillTest.questions.length > 0) {
          console.log(`   First MCQ: "${skillTest.questions[0].question?.substring(0, 50)}..."`);
          console.log(`   Last MCQ: "${skillTest.questions[skillTest.questions.length - 1].question?.substring(0, 50)}..."`);
        }
        
        // Check if there's a mismatch
        const courseMCQCount = course.finalExam.mcqs?.length || 0;
        const skillTestMCQCount = skillTest.questions?.length || 0;
        
        if (courseMCQCount !== skillTestMCQCount) {
          console.log(`   ⚠️  MISMATCH DETECTED!`);
          console.log(`      Course has ${courseMCQCount} MCQs`);
          console.log(`      SkillTest has ${skillTestMCQCount} MCQs`);
        } else {
          console.log(`   ✅ MCQ counts match: ${courseMCQCount}`);
        }
      } else {
        console.log(`   SkillTest exists: ❌ (will be created on first access)`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Test the API endpoint simulation
    console.log('\n🧪 Simulating API Endpoint Logic...\n');
    
    const testCourse = courses[0]; // Use first course for testing
    if (testCourse) {
      console.log(`Testing with course: ${testCourse.title}`);
      
      // Simulate the backend route logic
      let skillTest = await SkillTest.findOne({ 
        courseId: testCourse._id, 
        isFinalExam: true,
        type: 'final_exam'
      });

      // If not exists, create it (like the backend does)
      if (!skillTest) {
        console.log('Creating SkillTest from course data...');
        skillTest = new SkillTest({
          title: testCourse.finalExam.title,
          description: testCourse.finalExam.description,
          duration: testCourse.finalExam.duration,
          type: 'final_exam',
          difficulty: 'Hard',
          questions: testCourse.finalExam.mcqs || [],
          codingProblems: testCourse.finalExam.codeChallenges || [],
          courseId: testCourse._id,
          isFinalExam: true,
          passingScore: testCourse.finalExam.passingScore,
          totalMarks: testCourse.finalExam.totalMarks,
          securitySettings: testCourse.finalExam.securitySettings || {},
          isActive: true
        });
        await skillTest.save();
        console.log('SkillTest created successfully');
      }
      
      // Simulate the response that would be sent to frontend
      const responseData = {
        exam: {
          _id: skillTest._id,
          title: skillTest.title,
          description: skillTest.description,
          duration: skillTest.duration,
          totalMarks: skillTest.totalMarks,
          passingScore: skillTest.passingScore,
          mcqs: skillTest.questions, // This is what frontend receives as 'mcqs'
          codeChallenges: skillTest.codingProblems,
          securitySettings: skillTest.securitySettings
        }
      };
      
      console.log(`\n📤 Response that would be sent to frontend:`);
      console.log(`   exam.mcqs.length: ${responseData.exam.mcqs?.length || 0}`);
      console.log(`   exam.codeChallenges.length: ${responseData.exam.codeChallenges?.length || 0}`);
      
      if (responseData.exam.mcqs && responseData.exam.mcqs.length > 0) {
        console.log(`   First MCQ in response: "${responseData.exam.mcqs[0].question?.substring(0, 50)}..."`);
      }
    }
    
  } catch (error) {
    console.error('Error testing final exam MCQs:', error);
  } finally {
    mongoose.connection.close();
  }
}

testFinalExamMCQs();
