const mongoose = require('mongoose');
const UserProgress = require('../models/UserProgress');
const Course = require('../models/Course');
require('dotenv').config();

const USER_ID = '6867c4f18b626c5a1181809a';

async function testIndividualMcqScoring() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧪 Testing Individual MCQ Scoring Logic');
    console.log('='.repeat(50));

    const progresses = await UserProgress.find({ userId: USER_ID }).lean();
    console.log(`📊 Found ${progresses.length} progress records for user: ${USER_ID}`);

    let totalAttempted = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalScore = 0;
    let oldTotalScore = 0; // For comparison

    for (const progress of progresses) {
      console.log(`\n📚 Processing course: ${progress.courseId}`);

      // MODULE TEST MCQ SCORING
      for (const module of progress.modulesProgress || []) {
        if (
          module.moduleTest &&
          Array.isArray(module.moduleTest.mcqAnswers) &&
          module.moduleTest.mcqAnswers.length > 0
        ) {
          const answers = module.moduleTest.mcqAnswers;
          console.log(`  🧪 Module Test: ${module.moduleTitle || 'Unknown'} - ${answers.length} answers`);

          // Fetch course data for individual MCQ marks
          const course = await Course.findById(progress.courseId);
          const courseModule = course?.modules?.id(module.moduleId);
          const mcqData = courseModule?.moduleTest?.mcqs || [];
          
          let moduleScore = 0;
          const oldModuleScore = module.moduleTest.mcqScore || 0;
          const moduleCorrect = answers.filter(a => a.isCorrect).length;
          const moduleWrong = answers.filter(a => a.isCorrect === false).length;

          // Calculate score based on individual MCQ marks
          answers.forEach((answer, index) => {
            if (answer.isCorrect && mcqData[index]) {
              const mcqMarks = mcqData[index].marks || 1;
              moduleScore += mcqMarks;
              console.log(`    ✅ MCQ ${index + 1}: +${mcqMarks} marks`);
            } else if (!answer.isCorrect) {
              console.log(`    ❌ MCQ ${index + 1}: 0 marks`);
            }
          });

          totalAttempted += answers.length;
          totalCorrect += moduleCorrect;
          totalWrong += moduleWrong;
          totalScore += moduleScore;
          oldTotalScore += oldModuleScore;

          console.log(`     📊 Module Scoring:`);
          console.log(`       Old Score: ${oldModuleScore}`);
          console.log(`       New Individual Score: ${moduleScore}`);
          console.log(`       Correct: ${moduleCorrect}, Wrong: ${moduleWrong}`);
        }
      }

      // FINAL EXAM MCQ SCORING
      if (
        Array.isArray(progress.finalExamMcqAnswers) &&
        progress.finalExamMcqAnswers.length > 0
      ) {
        const answers = progress.finalExamMcqAnswers;
        console.log(`  🎓 Final Exam: ${answers.length} answers`);

        const course = await Course.findById(progress.courseId);
        const finalExamMcqs = course?.finalExam?.mcqs || [];
        
        let finalScore = 0;
        const oldFinalScore = progress.finalExamMcqScore || 0;
        const finalCorrect = answers.filter(a => a.isCorrect).length;
        const finalWrong = answers.filter(a => a.isCorrect === false).length;

        // Calculate score based on individual MCQ marks
        answers.forEach((answer, index) => {
          if (answer.isCorrect && finalExamMcqs[index]) {
            const mcqMarks = finalExamMcqs[index].marks || 1;
            finalScore += mcqMarks;
            console.log(`    ✅ MCQ ${index + 1}: +${mcqMarks} marks`);
          } else if (!answer.isCorrect) {
            console.log(`    ❌ MCQ ${index + 1}: 0 marks`);
          }
        });

        totalAttempted += answers.length;
        totalCorrect += finalCorrect;
        totalWrong += finalWrong;
        totalScore += finalScore;
        oldTotalScore += oldFinalScore;

        console.log(`     📊 Final Exam Scoring:`);
        console.log(`       Old Score: ${oldFinalScore}`);
        console.log(`       New Individual Score: ${finalScore}`);
        console.log(`       Correct: ${finalCorrect}, Wrong: ${finalWrong}`);
      }
    }

    const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

    console.log('\n🎯 FINAL COMPARISON:');
    console.log('='.repeat(30));
    console.log(`📊 Questions Attempted: ${totalAttempted}`);
    console.log(`✅ Correct Answers: ${totalCorrect}`);
    console.log(`❌ Wrong Answers: ${totalWrong}`);
    console.log(`📈 Accuracy: ${accuracy}%`);
    console.log(`\n💰 SCORING COMPARISON:`);
    console.log(`   Old Total Score: ${oldTotalScore}`);
    console.log(`   New Individual Score: ${totalScore}`);
    console.log(`   Difference: ${totalScore - oldTotalScore}`);
    
    if (totalScore !== oldTotalScore) {
      console.log(`\n🎉 Individual MCQ scoring is working! Score changed from ${oldTotalScore} to ${totalScore}`);
    } else {
      console.log(`\n⚠️  Scores are the same - might need to check the logic`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
  }
}

testIndividualMcqScoring();