const express = require("express");
const router = express.Router();
const UserProgress = require("../models/UserProgress");
const Course = require("../models/Course");
const { authenticateToken } = require("../middleware/authMiddleware");

/* =====================================================
   MCQ STATS with INDIVIDUAL MCQ SCORING
   (ModuleTest + FinalExam - calculates scores based on actual MCQ marks)
   ===================================================== */

router.get("/user-stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`\n🔍 Fetching MCQ stats for user: ${userId}`);

    const progresses = await UserProgress.find({ userId }).lean();
    console.log(`📊 Found ${progresses.length} progress records`);

    let totalAttempted = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalScore = 0;

    for (const progress of progresses) {
      console.log(`\n📚 Processing course: ${progress.courseId}`);
      
      /* -------------------------------
         ⭐ MODULE TEST MCQ ANSWERS - Individual MCQ Scoring
         ------------------------------- */
      for (const module of progress.modulesProgress || []) {
        if (
          module.moduleTest &&
          Array.isArray(module.moduleTest.mcqAnswers) &&
          module.moduleTest.mcqAnswers.length > 0
        ) {
          const answers = module.moduleTest.mcqAnswers;
          console.log(`  🧪 Module Test: ${module.moduleTitle || 'Unknown'} - ${answers.length} answers`);

          // Fetch actual course data to get individual MCQ marks
          try {
            const course = await Course.findById(progress.courseId);
            const courseModule = course?.modules?.id(module.moduleId);
            const mcqData = courseModule?.moduleTest?.mcqs || [];
            
            let moduleScore = 0;
            const moduleCorrect = answers.filter(a => a.isCorrect).length;
            const moduleWrong = answers.filter(a => a.isCorrect === false).length;

            // Calculate score based on individual MCQ marks
            answers.forEach((answer, index) => {
              if (answer.isCorrect && mcqData[index]) {
                moduleScore += mcqData[index].marks || 1; // Add marks for correct answer
              }
            });

            totalAttempted += answers.length;
            totalCorrect += moduleCorrect;
            totalWrong += moduleWrong;
            totalScore += moduleScore;

            console.log(`     ✅ Correct: ${moduleCorrect}, ❌ Wrong: ${moduleWrong}`);
            console.log(`     📊 Individual MCQ Score: ${moduleScore} (based on actual MCQ marks)`);
          } catch (error) {
            console.error(`     ❌ Error fetching course data for individual scoring: ${error.message}`);
            // Fallback to stored score if course data unavailable
            const fallbackScore = module.moduleTest.mcqScore || 0;
            totalScore += fallbackScore;
            console.log(`     📊 Fallback Score: ${fallbackScore}`);
          }
        }
      }

      /* -------------------------------
         ⭐ FINAL EXAM MCQ ANSWERS - Individual MCQ Scoring
         ------------------------------- */
      if (
        Array.isArray(progress.finalExamMcqAnswers) &&
        progress.finalExamMcqAnswers.length > 0
      ) {
        const answers = progress.finalExamMcqAnswers;
        console.log(`  🎓 Final Exam: ${answers.length} answers`);

        // Fetch actual course data to get individual MCQ marks
        try {
          const course = await Course.findById(progress.courseId);
          const finalExamMcqs = course?.finalExam?.mcqs || [];
          
          let finalScore = 0;
          const finalCorrect = answers.filter(a => a.isCorrect).length;
          const finalWrong = answers.filter(a => a.isCorrect === false).length;

          // Calculate score based on individual MCQ marks
          answers.forEach((answer, index) => {
            if (answer.isCorrect && finalExamMcqs[index]) {
              finalScore += finalExamMcqs[index].marks || 1; // Add marks for correct answer
            }
          });

          totalAttempted += answers.length;
          totalCorrect += finalCorrect;
          totalWrong += finalWrong;
          totalScore += finalScore;

          console.log(`     ✅ Correct: ${finalCorrect}, ❌ Wrong: ${finalWrong}`);
          console.log(`     📊 Individual MCQ Score: ${finalScore} (based on actual MCQ marks)`);
        } catch (error) {
          console.error(`     ❌ Error fetching course data for final exam scoring: ${error.message}`);
          // Fallback to stored score if course data unavailable
          const fallbackScore = progress.finalExamMcqScore || 0;
          totalScore += fallbackScore;
          console.log(`     📊 Fallback Score: ${fallbackScore}`);
        }
      }
    }

    const accuracy =
      totalAttempted > 0
        ? Math.round((totalCorrect / totalAttempted) * 100)
        : 0;

    console.log(`\n📈 FINAL MCQ STATISTICS:`);
    console.log(`   📊 Total Attempted: ${totalAttempted}`);
    console.log(`   ✅ Total Correct: ${totalCorrect}`);
    console.log(`   ❌ Total Wrong: ${totalWrong}`);
    console.log(`   🎯 Total Score: ${totalScore}`);
    console.log(`   📈 Accuracy: ${accuracy}%`);

    return res.json({
      questionsAttempted: totalAttempted,
      solvedCorrectly: totalCorrect,
      wrongAnswers: totalWrong,
      totalScore,
      accuracy,
      source: "moduleTest + finalExam (individual MCQ scoring)",
    });

  } catch (err) {
    console.error("❌ Error calculating MCQ stats:", err);
    res.status(500).json({ error: "Failed to fetch MCQ statistics" });
  }
});

// DEBUG: Get user progress data structure
router.get("/debug-user-progress", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`\n🔍 Debug: Fetching user progress for user: ${userId}`);

    const progresses = await UserProgress.find({ userId }).lean();
    
    const debugInfo = {
      userId,
      totalRecords: progresses.length,
      courses: []
    };

    progresses.forEach((progress, index) => {
      const courseInfo = {
        courseIndex: index,
        courseId: progress.courseId,
        modulesCount: progress.modulesProgress?.length || 0,
        hasFinalExam: !!progress.finalExamMcqAnswers,
        modules: []
      };

      // Analyze modules
      if (progress.modulesProgress) {
        progress.modulesProgress.forEach((module, moduleIndex) => {
          const moduleInfo = {
            moduleIndex,
            moduleTitle: module.moduleTitle,
            hasModuleTest: !!module.moduleTest,
            moduleTestAnswers: module.moduleTest?.mcqAnswers?.length || 0,
            moduleTestScore: module.moduleTest?.mcqScore || 0
          };

          if (module.moduleTest?.mcqAnswers) {
            moduleInfo.sampleAnswers = module.moduleTest.mcqAnswers.slice(0, 3).map(answer => ({
              questionIndex: answer.questionIndex,
              selectedAnswer: answer.selectedAnswer,
              isCorrect: answer.isCorrect,
              hasAllFields: !!(answer.questionIndex !== undefined && answer.selectedAnswer !== undefined && answer.isCorrect !== undefined)
            }));
          }

          courseInfo.modules.push(moduleInfo);
        });
      }

      // Analyze final exam
      if (progress.finalExamMcqAnswers) {
        courseInfo.finalExam = {
          totalAnswers: progress.finalExamMcqAnswers.length,
          score: progress.finalExamMcqScore || 0,
          sampleAnswers: progress.finalExamMcqAnswers.slice(0, 3).map(answer => ({
            questionIndex: answer.questionIndex,
            selectedAnswer: answer.selectedAnswer,
            isCorrect: answer.isCorrect,
            hasAllFields: !!(answer.questionIndex !== undefined && answer.selectedAnswer !== undefined && answer.isCorrect !== undefined)
          }))
        };
      }

      debugInfo.courses.push(courseInfo);
    });

    console.log(`📊 Debug info compiled for ${debugInfo.courses.length} courses`);
    res.json(debugInfo);

  } catch (err) {
    console.error("❌ Error in debug endpoint:", err);
    res.status(500).json({ error: "Failed to fetch debug info" });
  }
});

module.exports = router;
