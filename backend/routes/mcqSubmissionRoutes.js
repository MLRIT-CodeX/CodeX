const express = require('express');
const router = express.Router();
const UserProgress = require('../models/UserProgress');
const Course = require('../models/Course');
const { authenticateToken } = require('../middleware/authMiddleware');

// Helper function to calculate MCQ statistics from UserProgress data
const calculateMcqStats = async (userProgressRecords) => {
  let totalMcqQuestions = 0;  // Only MCQ questions
  let correctMcqAnswers = 0;  // Only MCQ correct answers
  let totalAssessments = 0;
  let totalMcqScore = 0;      // Only MCQ scores
  let incompleteDataFound = false;
  
  // Use for...of loop instead of forEach to properly handle async/await
  for (const [progressIndex, progress] of userProgressRecords.entries()) {
    console.log(`📚 Processing UserProgress record ${progressIndex + 1} for course:`, progress.courseId);
    console.log(`  - Topics found: ${progress.topicsProgress?.length || 0}`);
    console.log(`  - Final exam MCQ answers: ${progress.finalExamMcqAnswers?.length || 0}`);
    
    // Process lesson MCQ answers
    if (progress.topicsProgress) {
      for (const [topicIndex, topic] of progress.topicsProgress.entries()) {
        console.log(`  📂 Topic ${topicIndex + 1}: "${topic.topicTitle}"`);
        console.log(`    - Lessons: ${topic.lessons?.length || 0}`);
        console.log(`    - Has module test: ${!!topic.moduleTest}`);
        
        let topicLessonMcqs = 0;
        let topicModuleTestMcqs = 0;
        
        if (topic.lessons) {
          console.log(`    📚 Processing ${topic.lessons.length} lessons for topic "${topic.topicTitle}"`);
          for (const [lessonIndex, lesson] of topic.lessons.entries()) {
            console.log(`    📝 Lesson ${lessonIndex + 1}: ${lesson.lessonId || 'No ID'}`);
            console.log(`      - MCQ Answers: ${lesson.mcqAnswers?.length || 0}`);
            console.log(`      - MCQ Score: ${lesson.mcqScore || 0}`);
            console.log(`      - Lesson completed: ${lesson.completed || false}`);
            
            if (lesson.mcqAnswers && lesson.mcqAnswers.length > 0) {
              totalAssessments++;
              topicLessonMcqs += lesson.mcqAnswers.length;
              console.log(`      ✅ Processing ${lesson.mcqAnswers.length} MCQ answers`);
              
              for (const [answerIndex, answer] of lesson.mcqAnswers.entries()) {
                totalMcqQuestions++;  // Only count MCQ questions
                
                // Check if answer data is complete
                if (answer.questionIndex === undefined || answer.selectedAnswer === undefined) {
                  incompleteDataFound = true;
                  console.log(`        ⚠️  Incomplete MCQ answer data at index ${answerIndex}:`, {
                    questionIndex: answer.questionIndex,
                    selectedAnswer: answer.selectedAnswer,
                    isCorrect: answer.isCorrect,
                    hasId: !!answer._id
                  });
                }
                
                if (answer.isCorrect) {
                  correctMcqAnswers++;  // Only count MCQ correct answers
                }
              }
              totalMcqScore += lesson.mcqScore || 0;  // Only MCQ scores
        } else if (lesson.mcqScore > 0) {
          // Handle case where lesson has MCQ score but no answer records
          // FETCH ACTUAL COURSE DATA - NO ESTIMATIONS!
          totalAssessments++;
          console.log(`      🔧 Lesson has MCQ score but no answers stored - fetching actual course data`);
          
          try {
            // Find the actual course and lesson to get real question marks
            const actualCourse = await Course.findById(progress.courseId);
            if (!actualCourse) {
              console.log(`        ❌ Course not found: ${progress.courseId}`);
              return;
            }
            
            const actualTopic = actualCourse.topics.find(t => t._id.toString() === topic.topicId?.toString());
            if (!actualTopic) {
              console.log(`        ❌ Topic not found in course`);
              return;
            }
            
            const actualLesson = actualTopic.lessons.find(l => l._id.toString() === lesson.lessonId?.toString());
            if (!actualLesson) {
              console.log(`        ❌ Lesson not found in topic`);
              return;
            }
            
            const actualMcqs = actualLesson.mcqs || [];
            console.log(`        ✅ Found actual lesson data: ${actualMcqs.length} MCQs`);
            
            // Calculate EXACT correct answers using individual MCQ marks (same as module test/final exam logic)
            const lessonMcqScore = lesson.mcqScore || 0;
            let actualMcqCorrect = 0;
            
            if (actualMcqs.length > 0 && lessonMcqScore > 0) {
              // Calculate individual MCQ scores like module tests and final exams
              let runningScore = lessonMcqScore;
              
              for (const mcq of actualMcqs) {
                const mcqMarks = mcq.marks || 1;
                if (runningScore >= mcqMarks) {
                  // This MCQ was answered correctly
                  actualMcqCorrect++;
                  runningScore -= mcqMarks;
                  console.log(`          ✅ MCQ ${actualMcqCorrect}: ${mcqMarks} marks - Correct`);
                } else {
                  // Remaining MCQs were answered incorrectly
                  console.log(`          ❌ MCQ ${actualMcqCorrect + 1}: ${mcqMarks} marks - Incorrect (remaining score: ${runningScore})`);
                }
              }
              
              console.log(`        📊 Individual MCQ Breakdown: ${actualMcqCorrect}/${actualMcqs.length} correct, remaining score: ${runningScore}`);
            }
            
            totalMcqQuestions += actualMcqs.length;  // Only MCQ questions
            correctMcqAnswers += actualMcqCorrect;  // Only MCQ correct answers
            topicLessonMcqs += actualMcqs.length;
            totalMcqScore += lessonMcqScore;  // Only MCQ scores
            
            console.log(`      📊 Lesson Scoring (Individual MCQ Scoring - Same as Module Test/Final Exam):`);
            console.log(`        - MCQ Score: ${lessonMcqScore} (${actualMcqCorrect}/${actualMcqs.length} correct)`);
            console.log(`        - Individual MCQ marks: [${actualMcqs.map(m => m.marks || 1).join(', ')}]`);
            console.log(`        - Total possible marks: ${actualMcqs.reduce((s,m) => s + (m.marks||1), 0)}`);
            
          } catch (courseError) {
            console.error(`        ❌ Error fetching course data:`, courseError);
            // Fallback: Don't include this assessment rather than estimate
            totalAssessments--; // Remove from count since we can't calculate accurately
            console.log(`        ⚠️  Skipping this assessment - cannot calculate without course data`);
          }
            } else if (lesson.mcqScore > 0) {
              // Handle case where lesson has MCQ score but no answer records
              // FETCH ACTUAL COURSE DATA - Use individual MCQ scoring like module tests!
              totalAssessments++;
              console.log(`      🔧 Lesson has MCQ score (${lesson.mcqScore}) but no answers stored - fetching actual course data`);
              
              try {
                // Find the actual course and lesson to get real question marks
                const actualCourse = await Course.findById(progress.courseId);
                if (!actualCourse) {
                  console.log(`        ❌ Course not found`);
                  totalAssessments--; // Remove from count
                  return;
                }
                
                const actualTopic = actualCourse.topics.find(t => t._id.toString() === topic.topicId?.toString());
                if (!actualTopic) {
                  console.log(`        ❌ Topic not found in course`);
                  totalAssessments--; // Remove from count
                  return;
                }
                
                const actualLesson = actualTopic.lessons.find(l => l._id.toString() === lesson.lessonId?.toString());
                if (!actualLesson) {
                  console.log(`        ❌ Lesson not found in topic`);
                  totalAssessments--; // Remove from count
                  return;
                }
                
                const actualMcqs = actualLesson.mcqs || [];
                console.log(`        ✅ Found actual lesson data: ${actualMcqs.length} MCQs`);
                
                // Calculate EXACT correct answers using individual MCQ marks (same as module test logic)
                const lessonMcqScore = lesson.mcqScore || 0;
                let actualMcqCorrect = 0;
                
                if (actualMcqs.length > 0 && lessonMcqScore > 0) {
                  // Calculate individual MCQ scores like module tests and final exams
                  let runningScore = lessonMcqScore;
                  
                  for (const [mcqIndex, mcq] of actualMcqs.entries()) {
                    const mcqMarks = mcq.marks || 1;
                    if (runningScore >= mcqMarks) {
                      // This MCQ was answered correctly
                      actualMcqCorrect++;
                      runningScore -= mcqMarks;
                      console.log(`          ✅ MCQ ${mcqIndex + 1}: ${mcqMarks} marks - Correct`);
                    } else {
                      // Remaining MCQs were answered incorrectly
                      console.log(`          ❌ MCQ ${mcqIndex + 1}: ${mcqMarks} marks - Incorrect (remaining score: ${runningScore})`);
                    }
                  }
                  
                  console.log(`        📊 Individual MCQ Breakdown: ${actualMcqCorrect}/${actualMcqs.length} correct, remaining score: ${runningScore}`);
                }
                
                totalMcqQuestions += actualMcqs.length;  // Only MCQ questions
                correctMcqAnswers += actualMcqCorrect;  // Only MCQ correct answers
                topicLessonMcqs += actualMcqs.length;
                totalMcqScore += lessonMcqScore;  // Only MCQ scores
                
                console.log(`      📊 Lesson Scoring (Individual MCQ Scoring - Same as Module Test Logic):`);
                console.log(`        - MCQ Score: ${lessonMcqScore} (${actualMcqCorrect}/${actualMcqs.length} correct)`);
                console.log(`        - Individual MCQ marks: [${actualMcqs.map(m => m.marks || 1).join(', ')}]`);
                console.log(`        - Total possible marks: ${actualMcqs.reduce((s,m) => s + (m.marks||1), 0)}`);
                
              } catch (courseError) {
                console.error(`        ❌ Error fetching course data:`, courseError);
                // Fallback: Don't include this assessment rather than estimate
                totalAssessments--; // Remove from count since we can't calculate accurately
                console.log(`        ⚠️  Skipping this assessment - cannot calculate without course data`);
              }
            } else {
              console.log(`      ❌ No MCQ answers found for lesson ${lessonIndex + 1} and no MCQ score`);
            }
          }
        } else {
          console.log(`    ❌ No lessons found for topic "${topic.topicTitle}"`);
        }
      
      // Process module test MCQ answers
      if (topic.moduleTest) {
        console.log(`    🧪 Module Test:`);
        console.log(`      - MCQ Answers: ${topic.moduleTest.mcqAnswers?.length || 0}`);
        console.log(`      - MCQ Score: ${topic.moduleTest.mcqScore || 0}`);
        console.log(`      - Completed: ${topic.moduleTest.completed || false}`);
        
        if (topic.moduleTest.mcqAnswers && topic.moduleTest.mcqAnswers.length > 0) {
          // Process actual MCQ answers with ModuleTestResultPage logic
          totalAssessments++;
          console.log(`      ✅ Processing ${topic.moduleTest.mcqAnswers.length} MCQ answers + ${topic.moduleTest.codingResults?.length || 0} coding results`);
          
          // Process MCQ answers
          let mcqCorrectCount = 0;
          for (const [answerIndex, answer] of topic.moduleTest.mcqAnswers.entries()) {
            totalMcqQuestions++;  // Only count MCQ questions
            
            // Check if answer data is complete
            if (answer.questionIndex === undefined || answer.selectedAnswer === undefined) {
              incompleteDataFound = true;
              console.log(`        ⚠️  Incomplete module test MCQ answer data at index ${answerIndex}:`, {
                questionIndex: answer.questionIndex,
                selectedAnswer: answer.selectedAnswer,
                isCorrect: answer.isCorrect,
                hasId: !!answer._id
              });
            }
            
            if (answer.isCorrect) {
              correctMcqAnswers++;  // Only count MCQ correct answers
              mcqCorrectCount++;
            }
          }
          
          // Only process MCQ data for MCQ statistics
          topicModuleTestMcqs += topic.moduleTest.mcqAnswers.length;  // Only MCQ questions
          
          // Use only MCQ scoring (exclude coding scores)
          const mcqScore = topic.moduleTest.mcqScore || 0;
          totalMcqScore += mcqScore;  // Only MCQ scores
          
          console.log(`      📊 ModuleTest MCQ Scoring (MCQ Only - No Coding):`);
          console.log(`        - MCQ: ${mcqScore} points (${mcqCorrectCount}/${topic.moduleTest.mcqAnswers.length} correct)`);
          console.log(`        - Coding: Excluded from MCQ statistics`);
          console.log(`        - MCQ Total: ${mcqScore} points, ${mcqCorrectCount}/${topic.moduleTest.mcqAnswers.length} correct`);
        } else if (topic.moduleTest.completed && topic.moduleTest.mcqScore > 0) {
          // Handle case where module test was completed but MCQ answers weren't saved
          // FETCH ACTUAL COURSE DATA - NO ESTIMATIONS!
          totalAssessments++;
          console.log(`      🔧 Module test completed but no MCQ answers stored - fetching actual course data`);
          
          try {
            // Find the actual course and topic to get real question marks
            const actualCourse = await Course.findById(progress.courseId);
            if (!actualCourse) {
              console.log(`        ❌ Course not found: ${progress.courseId}`);
              return;
            }
            
            const actualTopic = actualCourse.topics.find(t => t._id.toString() === topic.topicId?.toString());
            if (!actualTopic || !actualTopic.moduleTest) {
              console.log(`        ❌ Topic or module test not found in course`);
              return;
            }
            
            const actualMcqs = actualTopic.moduleTest.mcqs || [];
            
            console.log(`        ✅ Found actual course data: ${actualMcqs.length} MCQs (excluding coding for MCQ stats)`);
            
            // Calculate EXACT MCQ scores only (exclude coding)
            const mcqScore = topic.moduleTest.mcqScore || 0;
            
            // Calculate actual MCQ correct answers based on marks
            let actualMcqCorrect = 0;
            
            // For MCQs: Calculate how many were correct based on score and actual marks
            if (actualMcqs.length > 0 && mcqScore > 0) {
              const totalMcqMarks = actualMcqs.reduce((sum, mcq) => sum + (mcq.marks || 1), 0);
              // If score equals total marks, all correct; otherwise calculate proportionally
              if (mcqScore === totalMcqMarks) {
                actualMcqCorrect = actualMcqs.length;
              } else {
                // Calculate based on average marks per question
                const avgMarksPerMcq = totalMcqMarks / actualMcqs.length;
                actualMcqCorrect = Math.round(mcqScore / avgMarksPerMcq);
              }
            }
            
            // Only include MCQ data in statistics
            totalMcqQuestions += actualMcqs.length;  // Only MCQ questions
            correctMcqAnswers += actualMcqCorrect;   // Only MCQ correct answers
            topicModuleTestMcqs += actualMcqs.length;
            totalMcqScore += mcqScore;  // Only MCQ scores
            
            console.log(`      📊 ModuleTest MCQ Scoring (EXACT Course Data - MCQ Only):`);
            console.log(`        - MCQ Score: ${mcqScore} (${actualMcqCorrect}/${actualMcqs.length} correct)`);
            console.log(`        - Coding: Excluded from MCQ statistics`);
            console.log(`        - MCQ Total: ${mcqScore} points, ${actualMcqCorrect}/${actualMcqs.length} correct`);
            console.log(`        - Using ACTUAL MCQ marks: ${actualMcqs.reduce((s,m) => s + (m.marks||1), 0)} total marks`);
            
          } catch (courseError) {
            console.error(`        ❌ Error fetching course data:`, courseError);
            // Fallback: Don't include this assessment rather than estimate
            totalAssessments--; // Remove from count since we can't calculate accurately
            console.log(`        ⚠️  Skipping this assessment - cannot calculate without course data`);
          }
        } else {
          console.log(`      ❌ No module test MCQ data found`);
        }
      } else {
        console.log(`    ❌ No module test found`);
      }
      
        console.log(`  📊 Topic Summary: ${topicLessonMcqs} lesson MCQs + ${topicModuleTestMcqs} module test MCQs`);
        console.log(`      - Lesson MCQ Questions Found: ${topicLessonMcqs}`);
        console.log(`      - Module Test MCQ Questions Found: ${topicModuleTestMcqs}`);
        console.log(`      - Topic Total MCQ Questions: ${topicLessonMcqs + topicModuleTestMcqs}`);
      }
    }
    
    // Process final exam MCQ answers
    if (progress.finalExamMcqAnswers && progress.finalExamMcqAnswers.length > 0) {
      totalAssessments++;
      console.log(`  🎓 Final exam: ${progress.finalExamMcqAnswers.length} MCQ answers`);
      
      for (const [answerIndex, answer] of progress.finalExamMcqAnswers.entries()) {
        totalMcqQuestions++;  // Only count MCQ questions
        
        // Check if answer data is complete
        if (answer.questionIndex === undefined || answer.selectedAnswer === undefined) {
          incompleteDataFound = true;
          console.log(`    ⚠️  Incomplete final exam MCQ answer data at index ${answerIndex}:`, {
            questionIndex: answer.questionIndex,
            selectedAnswer: answer.selectedAnswer,
            isCorrect: answer.isCorrect,
            hasId: !!answer._id
          });
        }
        
        if (answer.isCorrect) {
          correctMcqAnswers++;  // Only count MCQ correct answers
        }
      }
      totalMcqScore += progress.finalExamMcqScore || 0;  // Only MCQ scores
    }
  }
  
  const accuracy = totalMcqQuestions > 0 ? Math.round((correctMcqAnswers / totalMcqQuestions) * 100) : 0;
  
  if (incompleteDataFound) {
    console.log('⚠️  WARNING: Some MCQ answer records are missing questionIndex and/or selectedAnswer fields');
    console.log('   This indicates that MCQ submission endpoints are not saving complete answer data');
    console.log('   Expected format: { questionIndex: Number, selectedAnswer: Number, isCorrect: Boolean }');
  }
  
  const wrongMcqAnswers = totalMcqQuestions - correctMcqAnswers;
  
  console.log(`🎯 FINAL MCQ CALCULATION SUMMARY:`);
  console.log(`   - Total MCQ Questions Found: ${totalMcqQuestions} (lessons + module tests + final exams)`);
  console.log(`   - Total MCQ Correct Answers: ${correctMcqAnswers}`);
  console.log(`   - Total MCQ Wrong Answers: ${wrongMcqAnswers}`);
  console.log(`   - Total MCQ Score: ${totalMcqScore}`);
  console.log(`   - MCQ Accuracy: ${accuracy}%`);
  console.log(`   - Assessments Attended: ${totalAssessments}`);
  
  return {
    assessmentsAttended: totalAssessments,
    questionsAttempted: totalMcqQuestions,      // Only MCQ questions
    correctAnswers: correctMcqAnswers,          // Only MCQ correct answers
    wrongAnswers: wrongMcqAnswers,              // Only MCQ wrong answers
    totalScore: totalMcqScore,                  // Only MCQ scores
    accuracy: accuracy,                         // MCQ accuracy only
    dataIntegrityWarning: incompleteDataFound
  };
};

// GET /api/mcq-submissions/user-stats - Get user's MCQ statistics from UserProgress
router.get("/user-stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔍 Fetching MCQ stats from UserProgress for userId:', userId);

    // Get all user progress records
    const userProgressRecords = await UserProgress.find({ userId })
      .populate('courseId', 'title')
      .lean();

    console.log(`📊 Found ${userProgressRecords.length} UserProgress records`);

    if (userProgressRecords.length === 0) {
      return res.json({
        attended: 0,
        solvedCorrectly: 0,
        accuracy: 0,
        totalScore: 0,
        source: 'userProgress'
      });
    }

    // Calculate MCQ statistics using helper function
    const stats = await calculateMcqStats(userProgressRecords);

    console.log('🔍 Raw stats object returned from calculateMcqStats:', stats);
    console.log('📊 MCQ Statistics Summary (MCQ ONLY - Coding Excluded):');
    console.log('  - Assessments Attended:', stats.assessmentsAttended);
    console.log('  - MCQ Questions Attempted:', stats.questionsAttempted);
    console.log('  - MCQ Correct Answers:', stats.correctAnswers);
    console.log('  - MCQ Wrong Answers:', stats.wrongAnswers);
    console.log('  - MCQ Total Score:', stats.totalScore);
    console.log('  - MCQ Accuracy:', stats.accuracy + '%');
    console.log('  - Data Integrity Warning:', stats.dataIntegrityWarning);
    
    console.log('🔍 Detailed Breakdown:');
    console.log('  - UserProgress Records Found:', userProgressRecords.length);
    userProgressRecords.forEach((record, index) => {
      console.log(`  - Record ${index + 1}: Course ${record.courseId}`);
      console.log(`    - Final Exam MCQ Answers: ${record.finalExamMcqAnswers?.length || 0}`);
      console.log(`    - Final Exam MCQ Score: ${record.finalExamMcqScore || 0}`);
      console.log(`    - Topics: ${record.topicsProgress?.length || 0}`);
    });

    const response = {
      attended: stats.assessmentsAttended,
      solvedCorrectly: stats.correctAnswers,
      wrongAnswers: stats.wrongAnswers,
      accuracy: stats.accuracy,
      totalScore: stats.totalScore,
      questionsAttempted: stats.questionsAttempted,
      source: 'userProgress',
      dataIntegrityWarning: stats.dataIntegrityWarning
    };

    console.log('🚀 Final API Response being sent to frontend:', response);
    res.json(response);
  } catch (err) {
    console.error("Error fetching MCQ user stats:", err);
    res.status(500).json({ 
      error: "Failed to fetch MCQ statistics",
      message: err.message 
    });
  }
});

// GET /api/mcq-submissions/recent - Get user's recent MCQ attempts
router.get("/recent", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    console.log(`🔍 Fetching recent MCQ attempts for userId: ${userId}, limit: ${limit}`);

    const userProgressRecords = await UserProgress.find({ userId })
      .populate('courseId', 'title')
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    const recentAttempts = [];

    userProgressRecords.forEach(progress => {
      const courseTitle = progress.courseId?.title || 'Unknown Course';

      // Process lesson MCQ attempts
      progress.topicsProgress?.forEach(topic => {
        topic.lessons?.forEach(lesson => {
          if (lesson.mcqAnswers && lesson.mcqAnswers.length > 0 && lesson.completedAt) {
            const correctAnswers = lesson.mcqAnswers.filter(answer => answer.isCorrect).length;
            recentAttempts.push({
              type: 'lesson',
              courseTitle: courseTitle,
              topicTitle: topic.topicTitle || 'Unknown Topic',
              lessonId: lesson.lessonId,
              questionsAttempted: lesson.mcqAnswers.length,
              correctAnswers: correctAnswers,
              score: lesson.mcqScore || 0,
              accuracy: lesson.mcqAnswers.length > 0 ? Math.round((correctAnswers / lesson.mcqAnswers.length) * 100) : 0,
              completedAt: lesson.completedAt
            });
          }
        });

        // Process module test MCQ attempts
        if (topic.moduleTest && topic.moduleTest.mcqAnswers && topic.moduleTest.mcqAnswers.length > 0 && topic.moduleTest.completedAt) {
          const correctAnswers = topic.moduleTest.mcqAnswers.filter(answer => answer.isCorrect).length;
          recentAttempts.push({
            type: 'moduleTest',
            courseTitle: courseTitle,
            topicTitle: topic.topicTitle || 'Unknown Topic',
            questionsAttempted: topic.moduleTest.mcqAnswers.length,
            correctAnswers: correctAnswers,
            score: topic.moduleTest.mcqScore || 0,
            accuracy: topic.moduleTest.mcqAnswers.length > 0 ? Math.round((correctAnswers / topic.moduleTest.mcqAnswers.length) * 100) : 0,
            completedAt: topic.moduleTest.completedAt
          });
        }
      });

      // Process final exam MCQ attempts
      if (progress.finalExamMcqAnswers && progress.finalExamMcqAnswers.length > 0 && progress.finalExamCompletedAt) {
        const correctAnswers = progress.finalExamMcqAnswers.filter(answer => answer.isCorrect).length;
        recentAttempts.push({
          type: 'finalExam',
          courseTitle: courseTitle,
          questionsAttempted: progress.finalExamMcqAnswers.length,
          correctAnswers: correctAnswers,
          score: progress.finalExamMcqScore || 0,
          accuracy: progress.finalExamMcqAnswers.length > 0 ? Math.round((correctAnswers / progress.finalExamMcqAnswers.length) * 100) : 0,
          completedAt: progress.finalExamCompletedAt
        });
      }
    });

    // Sort by completion date and limit results
    recentAttempts.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    const limitedAttempts = recentAttempts.slice(0, limit);

    console.log(`📊 Found ${limitedAttempts.length} recent MCQ attempts`);
    res.json(limitedAttempts);
  } catch (err) {
    console.error("Error fetching recent MCQ attempts:", err);
    res.status(500).json({ 
      error: "Failed to fetch recent MCQ attempts",
      message: err.message 
    });
  }
});

// GET /api/mcq-submissions/course-stats/:courseId - Get MCQ stats for a specific course
router.get("/course-stats/:courseId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    console.log(`🔍 Fetching MCQ stats for userId: ${userId}, courseId: ${courseId}`);

    const progress = await UserProgress.findOne({ userId, courseId })
      .populate('courseId', 'title')
      .lean();

    if (!progress) {
      return res.json({
        attended: 0,
        solvedCorrectly: 0,
        accuracy: 0,
        totalScore: 0,
        courseTitle: 'Unknown Course'
      });
    }

    // Calculate MCQ stats for this specific course
    const stats = await calculateMcqStats([progress]);

    console.log(`📊 Course MCQ Stats for ${progress.courseId?.title}:`, stats);

    res.json({
      attended: stats.assessmentsAttended,
      solvedCorrectly: stats.correctAnswers,
      accuracy: stats.accuracy,
      totalScore: stats.totalScore,
      questionsAttempted: stats.questionsAttempted,
      courseTitle: progress.courseId?.title || 'Unknown Course'
    });
  } catch (err) {
    console.error("Error fetching course MCQ stats:", err);
    res.status(500).json({ 
      error: "Failed to fetch course MCQ statistics",
      message: err.message 
    });
  }
});

// GET /api/mcq-submissions/debug-mcq-data - Debug endpoint to examine MCQ answer data structure
router.get("/debug-mcq-data", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔍 Debug: Examining MCQ answer data structure for userId:', userId);

    const userProgressRecords = await UserProgress.find({ userId })
      .populate('courseId', 'title')
      .lean();

    const debugInfo = {
      userId,
      recordsFound: userProgressRecords.length,
      mcqDataAnalysis: []
    };

    userProgressRecords.forEach((progress, progressIndex) => {
      const courseAnalysis = {
        courseId: progress.courseId,
        courseTitle: progress.courseId?.title || 'Unknown Course',
        topics: []
      };

      // Analyze lesson MCQ answers
      progress.topicsProgress?.forEach((topic, topicIndex) => {
        const topicAnalysis = {
          topicTitle: topic.topicTitle,
          lessons: [],
          moduleTest: null
        };

        topic.lessons?.forEach((lesson, lessonIndex) => {
          if (lesson.mcqAnswers && lesson.mcqAnswers.length > 0) {
            const lessonAnalysis = {
              lessonId: lesson.lessonId,
              mcqAnswersCount: lesson.mcqAnswers.length,
              mcqScore: lesson.mcqScore,
              sampleAnswers: lesson.mcqAnswers.slice(0, 3).map(answer => ({
                questionIndex: answer.questionIndex,
                selectedAnswer: answer.selectedAnswer,
                isCorrect: answer.isCorrect,
                hasId: !!answer._id,
                allFields: Object.keys(answer)
              })),
              dataIntegrityIssues: {
                missingQuestionIndex: lesson.mcqAnswers.some(a => a.questionIndex === undefined),
                missingSelectedAnswer: lesson.mcqAnswers.some(a => a.selectedAnswer === undefined),
                missingIsCorrect: lesson.mcqAnswers.some(a => a.isCorrect === undefined)
              }
            };
            topicAnalysis.lessons.push(lessonAnalysis);
          }
        });

        // Analyze module test MCQ answers
        if (topic.moduleTest && topic.moduleTest.mcqAnswers && topic.moduleTest.mcqAnswers.length > 0) {
          topicAnalysis.moduleTest = {
            mcqAnswersCount: topic.moduleTest.mcqAnswers.length,
            mcqScore: topic.moduleTest.mcqScore,
            sampleAnswers: topic.moduleTest.mcqAnswers.slice(0, 3).map(answer => ({
              questionIndex: answer.questionIndex,
              selectedAnswer: answer.selectedAnswer,
              isCorrect: answer.isCorrect,
              hasId: !!answer._id,
              allFields: Object.keys(answer)
            })),
            dataIntegrityIssues: {
              missingQuestionIndex: topic.moduleTest.mcqAnswers.some(a => a.questionIndex === undefined),
              missingSelectedAnswer: topic.moduleTest.mcqAnswers.some(a => a.selectedAnswer === undefined),
              missingIsCorrect: topic.moduleTest.mcqAnswers.some(a => a.isCorrect === undefined)
            }
          };
        }

        if (topicAnalysis.lessons.length > 0 || topicAnalysis.moduleTest) {
          courseAnalysis.topics.push(topicAnalysis);
        }
      });

      // Analyze final exam MCQ answers
      if (progress.finalExamMcqAnswers && progress.finalExamMcqAnswers.length > 0) {
        courseAnalysis.finalExam = {
          mcqAnswersCount: progress.finalExamMcqAnswers.length,
          mcqScore: progress.finalExamMcqScore,
          sampleAnswers: progress.finalExamMcqAnswers.slice(0, 3).map(answer => ({
            questionIndex: answer.questionIndex,
            selectedAnswer: answer.selectedAnswer,
            isCorrect: answer.isCorrect,
            hasId: !!answer._id,
            allFields: Object.keys(answer)
          })),
          dataIntegrityIssues: {
            missingQuestionIndex: progress.finalExamMcqAnswers.some(a => a.questionIndex === undefined),
            missingSelectedAnswer: progress.finalExamMcqAnswers.some(a => a.selectedAnswer === undefined),
            missingIsCorrect: progress.finalExamMcqAnswers.some(a => a.isCorrect === undefined)
          }
        };
      }

      if (courseAnalysis.topics.length > 0 || courseAnalysis.finalExam) {
        debugInfo.mcqDataAnalysis.push(courseAnalysis);
      }
    });

    // Generate summary
    debugInfo.summary = {
      totalCourses: debugInfo.mcqDataAnalysis.length,
      hasDataIntegrityIssues: debugInfo.mcqDataAnalysis.some(course => 
        course.topics.some(topic => 
          topic.lessons.some(lesson => 
            lesson.dataIntegrityIssues.missingQuestionIndex || 
            lesson.dataIntegrityIssues.missingSelectedAnswer
          ) ||
          (topic.moduleTest && (
            topic.moduleTest.dataIntegrityIssues.missingQuestionIndex ||
            topic.moduleTest.dataIntegrityIssues.missingSelectedAnswer
          ))
        ) ||
        (course.finalExam && (
          course.finalExam.dataIntegrityIssues.missingQuestionIndex ||
          course.finalExam.dataIntegrityIssues.missingSelectedAnswer
        ))
      ),
      recommendedAction: "Check MCQ submission endpoints to ensure they save complete answer data with questionIndex, selectedAnswer, and isCorrect fields"
    };

    res.json(debugInfo);
  } catch (err) {
    console.error("Error in MCQ debug endpoint:", err);
    res.status(500).json({ 
      error: "Failed to analyze MCQ data structure",
      message: err.message 
    });
  }
});

module.exports = router;
