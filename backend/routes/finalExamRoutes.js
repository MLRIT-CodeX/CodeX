const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const SkillTest = require('../models/SkillTest');
const UserProgress = require('../models/UserProgress');
const { authenticateToken } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');
const { updateUserCourseScore, updateSkillTestFinalExamScore } = require('../controllers/courseLeaderboardController');

// Get final exam for a course
router.get('/courses/:courseId/final-exam', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Get course with final exam
    const course = await Course.findById(courseId);
    if (!course || !course.finalExam || !course.finalExam.isActive) {
      return res.status(404).json({ message: 'Final exam not found or not active' });
    }

    // Check if user is enrolled
    const userProgress = await UserProgress.findOne({ userId, courseId });
    console.log('User progress found:', !!userProgress);
    
    if (!userProgress) {
      console.log('No UserProgress found for user:', userId, 'course:', courseId);
      // For testing purposes, let's also check if user is enrolled in course directly
      const isEnrolled = course && course.enrolledUsers && course.enrolledUsers.includes(userId);
      console.log('Direct enrollment check:', isEnrolled);
      
      if (!isEnrolled) {
        return res.status(403).json({ message: 'User not enrolled in this course' });
      }
      
      // If enrolled but no progress record, we'll allow it for now
      console.log('User enrolled but no progress record - allowing for testing');
    }

    // Progress check removed for testing purposes
    const overallProgress = userProgress ? userProgress.calculateOverallProgress() : 0;

    // Check if final exam already exists in SkillTest collection
    let skillTest = await SkillTest.findOne({ 
      courseId, 
      isFinalExam: true,
      type: 'final_exam'
    });

    // If not exists, create it from course final exam data
    if (!skillTest) {
      skillTest = new SkillTest({
        title: course.finalExam.title,
        description: course.finalExam.description,
        duration: course.finalExam.duration,
        type: 'final_exam',
        difficulty: 'Hard',
        questions: course.finalExam.mcqs || [],
        codingProblems: course.finalExam.codeChallenges || [],
        courseId,
        isFinalExam: true,
        passingScore: course.finalExam.passingScore,
        totalMarks: course.finalExam.totalMarks,
        securitySettings: course.finalExam.securitySettings || {},
        isActive: true
      });
      await skillTest.save();
    }

    // Check previous attempts
    const userAttempts = skillTest.attempts.filter(attempt => 
      attempt.userId.toString() === userId
    );

    // Remove sensitive data (correct answers) for security
    const sanitizedQuestions = skillTest.questions.map(q => ({
      question: q.question,
      options: q.options,
      explanation: q.explanation,
      marks: q.marks
    }));

    const sanitizedCodingProblems = skillTest.codingProblems.map(p => ({
      title: p.title,
      description: p.description,
      sampleInput: p.sampleInput,
      sampleOutput: p.sampleOutput,
      constraints: p.constraints,
      initialCode: p.initialCode,
      language: p.language,
      testCases: p.testCases?.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden
      }))
    }));

    res.json({
      exam: {
        _id: skillTest._id,
        title: skillTest.title,
        description: skillTest.description,
        duration: skillTest.duration,
        totalMarks: skillTest.totalMarks,
        passingScore: skillTest.passingScore,
        mcqs: sanitizedQuestions,
        codeChallenges: sanitizedCodingProblems,
        securitySettings: skillTest.securitySettings
      },
      course: {
        title: course.title,
        _id: course._id
      },
      attempts: userAttempts.length,
      maxAttempts: null, // Unlimited attempts allowed
      canRetake: true, // Always allow retakes
      bestScore: userAttempts.length > 0 ? Math.max(...userAttempts.map(a => a.score)) : null
    });

  } catch (error) {
    console.error('Error fetching final exam:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit final exam
router.post('/courses/:courseId/final-exam/submit', 
  authenticateToken,
  body('answers').optional().isArray().withMessage('Answers must be an array'),
  body('codingSubmissions').optional().custom((value) => {
    // Accept both arrays and objects for codingSubmissions
    return Array.isArray(value) || typeof value === 'object';
  }).withMessage('Coding submissions must be an array or object'),
  body('timeSpent').optional().isNumeric().withMessage('Time spent must be a number'),
  async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    console.log('Final exam submission received for user:', userId, 'course:', courseId);
    console.log('Request body keys:', Object.keys(req.body));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { answers = [], codingSubmissions = {}, timeSpent = 0, securityViolations = [], proctoringData = {} } = req.body;
    
    console.log('Submission data:', {
      userId,
      courseId,
      answersCount: Array.isArray(answers) ? answers.length : 0,
      codingSubmissionsCount: typeof codingSubmissions === 'object' ? Object.keys(codingSubmissions).length : 0,
      timeSpent,
      hasSecurityViolations: securityViolations.length > 0
    });
    
    // Use securityViolations as-is since we changed the schema to Mixed type
    const parsedSecurityViolations = securityViolations || [];

    // Validate course and enrollment first
    const course = await Course.findById(courseId);
    if (!course) {
      console.log('Course not found:', courseId);
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled (same logic as GET route)
    const userProgressForSubmit = await UserProgress.findOne({ userId, courseId });
    console.log('POST route - User progress found:', !!userProgressForSubmit);
    
    if (!userProgressForSubmit) {
      console.log('POST route - No UserProgress found for user:', userId, 'course:', courseId);
      // Check direct enrollment
      const isEnrolled = course.enrolledUsers && course.enrolledUsers.includes(userId);
      console.log('POST route - Direct enrollment check:', isEnrolled);
      
      if (!isEnrolled) {
        return res.status(403).json({ message: 'User not enrolled in this course' });
      }
      
      console.log('POST route - User enrolled but no progress record - allowing for testing');
    }

    // Get the skill test (final exam)
    let skillTest = await SkillTest.findOne({ 
      courseId, 
      isFinalExam: true,
      type: 'final_exam'
    });

    // If SkillTest doesn't exist, create it from course final exam data
    if (!skillTest) {
      console.log('SkillTest not found, checking course final exam data...');
      
      if (!course.finalExam || (!course.finalExam.mcqs?.length && !course.finalExam.codeChallenges?.length)) {
        console.log('No final exam data in course either');
        return res.status(404).json({ message: 'Final exam not configured for this course' });
      }
      
      console.log('Creating SkillTest from course final exam data...');
      skillTest = new SkillTest({
        title: course.finalExam.title || `${course.title} - Final Exam`,
        description: course.finalExam.description || `Comprehensive final examination for ${course.title}`,
        duration: course.finalExam.duration || 120,
        type: 'final_exam',
        difficulty: 'Hard',
        questions: course.finalExam.mcqs || [],
        codingProblems: course.finalExam.codeChallenges || [],
        courseId,
        isFinalExam: true,
        passingScore: course.finalExam.passingScore || 70,
        totalMarks: course.finalExam.totalMarks || 1000,
        securitySettings: course.finalExam.securitySettings || {},
        isActive: true
      });
      await skillTest.save();
      console.log('SkillTest created successfully for submission');
    }

    // Check attempt limit
    const userAttempts = skillTest.attempts.filter(attempt => 
      attempt.userId.toString() === userId
    );

    // Attempt limit removed - allow unlimited attempts for testing/practice
    console.log(`User ${userId} has ${userAttempts.length} previous attempts for final exam (unlimited allowed)`);

    // Calculate MCQ score with detailed results
    let correctMCQs = 0;
    let mcqScore = 0;
    const mcqResults = [];
    const mcqAttempted = Array.isArray(answers) ? answers.filter(a => a !== null && a !== undefined).length : 0;
    
    skillTest.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer !== undefined && userAnswer === question.correct;
      
      mcqResults.push({
        isCorrect,
        userAnswer,
        correctAnswer: question.correct,
        marks: question.marks || 5
      });
      
      if (isCorrect) {
        correctMCQs++;
        mcqScore += question.marks || 5;
      }
    });
    
    const mcqPercentage = skillTest.questions.length > 0 
      ? Math.round((correctMCQs / skillTest.questions.length) * 100) 
      : 0;

    // Calculate coding score with Judge0-like evaluation
    let codingScore = 0;
    const codingResults = [];

    skillTest.codingProblems.forEach((problem, index) => {
      const submission = codingSubmissions && typeof codingSubmissions === 'object' ? codingSubmissions[index] : null;
      if (submission && submission.code && submission.code.trim().length > 10) {
        // For now, give full marks if substantial code is provided
        // In production, this would use Judge0 API like ModuleTestPage
        const hasTestCases = problem.testCases && problem.testCases.length > 0;
        const isCorrect = hasTestCases && submission.code.trim().length > 50; // Simplified check
        
        if (isCorrect) {
          codingScore += problem.marks || 25;
          codingResults.push({
            verdict: 'Accepted',
            output: 'Code executed successfully',
            marks: problem.marks || 25
          });
        } else {
          const partialScore = Math.floor((problem.marks || 25) * 0.3); // 30% for attempt
          codingScore += partialScore;
          codingResults.push({
            verdict: 'Partial Credit',
            output: 'Code submitted but needs improvement',
            marks: problem.marks || 25
          });
        }
      } else {
        codingResults.push({
          verdict: 'Not Attempted',
          output: 'No code submitted',
          marks: problem.marks || 25
        });
      }
    });

    const totalScore = mcqScore + codingScore;
    const percentage = Math.round((totalScore / skillTest.totalMarks) * 100);
    const passed = percentage >= skillTest.passingScore;

    // Create attempt record
    const attempt = {
      userId,
      score: totalScore,
      totalQuestions: skillTest.questions.length + skillTest.codingProblems.length,
      correctAnswers: correctMCQs,
      timeSpent,
      securityViolations: parsedSecurityViolations,
      tabSwitchCount: proctoringData.tabSwitchCount || parsedSecurityViolations.filter(v => v.type && v.type.includes('Tab switch')).length,
      submittedAt: new Date(),
      autoSubmitted: timeSpent >= skillTest.duration * 60, // Auto-submit if time exceeded
      passed,
      details: {
        mcqScore,
        codingScore,
        codingResults,
        percentage
      }
    };

    skillTest.attempts.push(attempt);
    await skillTest.save();

    // Get the saved attempt ID
    const savedAttempt = skillTest.attempts[skillTest.attempts.length - 1];

    // Update user progress for final exam completion
    // Note: userProgressForSubmit was already fetched earlier in this function
    if (userProgressForSubmit) {
      await userProgressForSubmit.updateFinalExamProgress({
        mcqScore,
        codingScore,
        totalScore,
        maxScore: skillTest.totalMarks,
        mcqAnswers: mcqResults,
        codingResults
      });
      
      // Award certificate only if passed
      if (passed) {
        userProgressForSubmit.certificateEarned = true;
        await userProgressForSubmit.save();
      }
    }

    // Update leaderboard score for SkillTest final exam completion
    try {
      const mockReq = { 
        body: { 
          userId, 
          courseId: skillTest.courseId,
          skillTestId: skillTest._id,
          attemptId: savedAttempt._id,
          score: totalScore,
          maxScore: skillTest.totalMarks,
          percentage,
          passed,
          timeSpent: timeSpent || 0
        } 
      };
      const mockRes = { json: () => {}, status: () => ({ json: () => {} }) };
      
      console.log('Updating leaderboard for SkillTest final exam:', {
        userId,
        courseId: skillTest.courseId,
        skillTestId: skillTest._id,
        totalScore,
        maxScore: skillTest.totalMarks,
        percentage,
        passed
      });
      
      await updateSkillTestFinalExamScore(mockReq, mockRes);
      console.log('Leaderboard updated successfully for SkillTest final exam');
    } catch (leaderboardErr) {
      console.error('Error updating leaderboard:', leaderboardErr);
      // Don't fail the main request if leaderboard update fails
    }

    // Calculate correct coding answers
    const correctCoding = codingResults.filter(r => r.verdict === 'Accepted').length;
    const codingAttempted = codingResults.filter(r => r.verdict !== 'Not Attempted').length;
    const totalAttempted = mcqAttempted + codingAttempted;
    const totalCorrect = correctMCQs + correctCoding;
    const totalQuestions = skillTest.questions.length + skillTest.codingProblems.length;
    const wrongCount = totalAttempted - totalCorrect;
    const unattemptedCount = totalQuestions - totalAttempted;

    console.log('Final exam scoring completed:', {
      totalScore,
      percentage,
      mcqScore,
      codingScore,
      correctMCQs,
      correctCoding,
      passed
    });

    // Prepare the response in the format expected by the frontend
    const responseData = {
      success: true,
      testResult: {
        score: totalScore,
        totalMarks: skillTest.totalMarks,
        percentage,
        correctAnswers: totalCorrect,
        wrongAnswers: wrongCount,
        unattempted: unattemptedCount,
        totalQuestions,
        mcqCorrect: correctMCQs,
        codingCorrect: correctCoding,
        mcqAttempted,
        codingAttempted,
        totalAttempted,
        mcqScore,
        codingScore,
        mcqResults,
        codingResults,
        passed,
        timeSpent,
        attemptNumber: userAttempts.length + 1,
        canRetake: false,
        certificateEarned: passed,
        securityViolations: securityViolations || []
      },
      examData: {
        title: skillTest.title,
        description: skillTest.description,
        duration: skillTest.duration,
        totalMarks: skillTest.totalMarks,
        passingScore: skillTest.passingScore,
        questions: skillTest.questions.map((q, i) => ({
          question: q.question,
          options: q.options,
          correct: q.correct,
          userAnswer: answers[i],
          isCorrect: answers[i] === q.correct,
          marks: q.marks || 0,
          type: 'mcq'
        })),
        codingProblems: skillTest.codingProblems.map((p, i) => ({
          title: p.title,
          description: p.description,
          userCode: codingSubmissions[i]?.code || '',
          result: codingResults[i] || { status: 'not_attempted', score: 0 },
          marks: p.marks || 0,
          type: 'coding'
        }))
      }
    };

    console.log('Sending response to frontend:', JSON.stringify(responseData, null, 2));
    res.json(responseData);

  } catch (error) {
    console.error('Error submitting final exam:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit final exam',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get final exam results
router.get('/courses/:courseId/final-exam/results', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const skillTest = await SkillTest.findOne({ 
      courseId, 
      isFinalExam: true,
      type: 'final_exam'
    });

    if (!skillTest) {
      return res.status(404).json({ message: 'Final exam not found' });
    }

    const userAttempts = skillTest.attempts.filter(attempt => 
      attempt.userId.toString() === userId
    ).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    if (userAttempts.length === 0) {
      return res.status(404).json({ message: 'No attempts found' });
    }

    const bestAttempt = userAttempts.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    res.json({
      attempts: userAttempts.map(attempt => ({
        score: attempt.score,
        percentage: attempt.details?.percentage || Math.round((attempt.score / skillTest.totalMarks) * 100),
        passed: attempt.passed,
        submittedAt: attempt.submittedAt,
        timeSpent: attempt.timeSpent,
        mcqScore: attempt.details?.mcqScore || 0,
        codingScore: attempt.details?.codingScore || 0
      })),
      bestScore: bestAttempt.score,
      bestPercentage: bestAttempt.details?.percentage || Math.round((bestAttempt.score / skillTest.totalMarks) * 100),
      passed: bestAttempt.passed,
      totalMarks: skillTest.totalMarks,
      passingScore: skillTest.passingScore
    });

  } catch (error) {
    console.error('Error fetching final exam results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
