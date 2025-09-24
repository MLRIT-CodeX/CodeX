const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const Course = require('../models/Course');

// Test route to simulate module test results
router.post('/simulate-module-test', authenticateToken, async (req, res) => {
  try {
    const { courseId, topicId } = req.body;
    
    // Get course data
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const topic = course.topics.id(topicId);
    if (!topic || !topic.moduleTest) {
      return res.status(404).json({ message: "Module test not found" });
    }

    // Simulate test results with sample data
    const mcqs = topic.moduleTest.mcqs || [];
    const codeChallenges = topic.moduleTest.codeChallenges || [];
    
    // Generate random performance
    const mcqCorrect = Math.floor(Math.random() * mcqs.length);
    const codingCorrect = Math.floor(Math.random() * codeChallenges.length);
    
    const mcqScore = mcqs.slice(0, mcqCorrect).reduce((sum, mcq) => sum + (mcq.marks || 1), 0);
    const codingScore = codeChallenges.slice(0, codingCorrect).reduce((sum, challenge) => sum + (challenge.marks || 2), 0);
    
    const totalMcqMarks = mcqs.reduce((sum, mcq) => sum + (mcq.marks || 1), 0);
    const totalCodingMarks = codeChallenges.reduce((sum, challenge) => sum + (challenge.marks || 2), 0);
    
    const totalScore = mcqScore + codingScore;
    const totalMarks = totalMcqMarks + totalCodingMarks;
    const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;
    
    const simulatedResult = {
      // Basic scores
      totalScore,
      totalMarks,
      percentage,
      
      // Question counts
      totalQuestions: mcqs.length + codeChallenges.length,
      correctAnswers: mcqCorrect + codingCorrect,
      wrongAnswers: (mcqs.length - mcqCorrect) + (codeChallenges.length - codingCorrect),
      unattempted: 0,
      
      // MCQ specific
      mcqScore,
      totalMcqMarks,
      mcqCorrect,
      mcqAttempted: mcqs.length,
      mcqPercentage: totalMcqMarks > 0 ? Math.round((mcqScore / totalMcqMarks) * 100) : 0,
      
      // Coding specific
      codingScore,
      totalCodingMarks,
      codingCorrect,
      codingAttempted: codeChallenges.length,
      codingPercentage: totalCodingMarks > 0 ? Math.round((codingScore / totalCodingMarks) * 100) : 0,
      
      // Performance metrics
      attemptRate: 100,
      timeTaken: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
      completedAt: new Date(),
      
      // Topic info
      topicId,
      topicTitle: topic.title
    };

    res.json({
      message: "Simulated module test results",
      testResult: simulatedResult
    });

  } catch (error) {
    console.error('Error simulating module test:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
