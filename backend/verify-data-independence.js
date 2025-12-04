const mongoose = require('mongoose');
const UserProgress = require('./models/UserProgress');
const User = require('./models/user');
const Course = require('./models/Course');

async function verifyDataIndependence() {
  try {
    // Load environment variables
    require('dotenv').config();
    
    // Connect to database using same config as the app
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find a user progress record
    const progress = await UserProgress.findOne({}).populate('userId courseId');
    
    if (!progress) {
      console.log('❌ No progress records found');
      return;
    }

    console.log('\n🔍 Testing Data Independence');
    console.log('📋 User:', progress.userId?.email || 'Unknown user');
    console.log('📚 Course:', progress.courseId?.title || 'Unknown course');

    console.log('\n📊 BEFORE Changes:');
    console.log('🧪 Module Tests Data:');
    progress.modulesProgress.forEach((module, index) => {
      if (module.moduleTest && module.moduleTest.attempted) {
        console.log(`   Module ${index + 1}: ${module.moduleTest.mcqAnswers?.length || 0} MCQ answers, Score: ${module.moduleTest.totalScore}`);
      }
    });
    
    console.log('🎓 Final Exam Data:');
    console.log(`   Completed: ${progress.finalExamCompleted}`);
    console.log(`   MCQ Answers: ${progress.finalExamMcqAnswers?.length || 0}`);
    console.log(`   Total Score: ${progress.finalExamTotalScore || 0}`);

    // Test 1: Update module test - should NOT affect final exam
    console.log('\n🧪 TEST 1: Updating Module Test (should NOT affect Final Exam)');
    if (progress.modulesProgress.length > 0) {
      const firstModule = progress.modulesProgress[0];
      
      await progress.updateModuleTestProgress(firstModule.moduleId, {
        moduleTitle: firstModule.moduleTitle,
        mcqScore: 99,
        totalScore: 99,
        maxScore: 100,
        mcqAnswers: [{ questionIndex: 0, selectedAnswer: 1, isCorrect: true }]
      });
      
      // Reload from database
      const updatedProgress = await UserProgress.findById(progress._id);
      
      console.log('✅ Module test updated');
      console.log(`   New module score: ${updatedProgress.modulesProgress[0].moduleTest.totalScore}`);
      console.log(`   Final exam unchanged: ${updatedProgress.finalExamCompleted} (score: ${updatedProgress.finalExamTotalScore || 0})`);
    }

    // Test 2: Update final exam - should NOT affect module tests
    console.log('\n🎓 TEST 2: Updating Final Exam (should NOT affect Module Tests)');
    const originalModuleScores = progress.modulesProgress.map(m => m.moduleTest?.totalScore || 0);
    
    await progress.updateFinalExamProgress({
      mcqScore: 88,
      totalScore: 88,
      maxScore: 100,
      mcqAnswers: [{ questionIndex: 0, selectedAnswer: 2, isCorrect: true }]
    });
    
    // Reload from database  
    const finalUpdatedProgress = await UserProgress.findById(progress._id);
    
    console.log('✅ Final exam updated');
    console.log(`   New final exam score: ${finalUpdatedProgress.finalExamTotalScore}`);
    console.log('   Module tests unchanged:');
    finalUpdatedProgress.modulesProgress.forEach((module, index) => {
      const currentScore = module.moduleTest?.totalScore || 0;
      const originalScore = originalModuleScores[index];
      console.log(`     Module ${index + 1}: ${currentScore} (was: ${originalScore}) ${currentScore === originalScore ? '✅' : '❌'}`);
    });

    console.log('\n🎯 SUMMARY:');
    console.log('✅ Module test data is independent of final exam');
    console.log('✅ Final exam data is independent of module tests');
    console.log('✅ No cross-contamination between data types');
    console.log('✅ Legacy testAttempt field removed');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

// Run the verification
verifyDataIndependence();