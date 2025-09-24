require('dotenv').config();
const mongoose = require('mongoose');
const SkillTest = require('../models/SkillTest');

async function resetFinalExamAttempts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all final exam SkillTests
    const finalExams = await SkillTest.find({ 
      isFinalExam: true,
      type: 'final_exam'
    });

    console.log(`📚 Found ${finalExams.length} final exams`);

    let totalAttemptsCleared = 0;

    for (const exam of finalExams) {
      const attemptCount = exam.attempts?.length || 0;
      console.log(`\n📝 ${exam.title}`);
      console.log(`   Course ID: ${exam.courseId}`);
      console.log(`   Current attempts: ${attemptCount}`);
      
      if (attemptCount > 0) {
        // Clear all attempts
        exam.attempts = [];
        await exam.save();
        totalAttemptsCleared += attemptCount;
        console.log(`   ✅ Cleared ${attemptCount} attempts`);
      } else {
        console.log(`   ⏭️ No attempts to clear`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Total attempts cleared: ${totalAttemptsCleared}`);
    console.log(`📝 Final exams processed: ${finalExams.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
resetFinalExamAttempts();
