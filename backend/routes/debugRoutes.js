const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { authenticateToken } = require('../middleware/authMiddleware');

// GET /api/debug/courses - Display all course data
router.get('/courses', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Fetching course data for display...');
    
    const courses = await Course.find({})
      .select('title description difficulty topics finalExam enrolledUsers createdAt')
      .lean();
    
    console.log(`📚 Found ${courses.length} courses in database`);
    
    const courseAnalysis = courses.map((course, index) => {
      console.log(`\n📖 Course ${index + 1}: "${course.title}"`);
      console.log(`   - ID: ${course._id}`);
      console.log(`   - Difficulty: ${course.difficulty || 'Not specified'}`);
      console.log(`   - Enrolled Users: ${course.enrolledUsers?.length || 0}`);
      console.log(`   - Topics: ${course.topics?.length || 0}`);
      
      let totalLessonMcqs = 0;
      let totalLessonCoding = 0;
      let totalModuleTestMcqs = 0;
      let totalModuleTestCoding = 0;
      
      const topicsAnalysis = [];
      
      if (course.topics && course.topics.length > 0) {
        course.topics.forEach((topic, topicIndex) => {
          console.log(`     📂 Topic ${topicIndex + 1}: "${topic.title}"`);
          
          const topicData = {
            title: topic.title,
            lessonsCount: topic.lessons?.length || 0,
            hasModuleTest: !!topic.moduleTest,
            lessons: [],
            moduleTest: null
          };
          
          if (topic.lessons && topic.lessons.length > 0) {
            topic.lessons.forEach((lesson, lessonIndex) => {
              const lessonMcqCount = lesson.mcqs?.length || 0;
              const lessonCodingCount = lesson.codeChallenges?.length || 0;
              totalLessonMcqs += lessonMcqCount;
              totalLessonCoding += lessonCodingCount;
              
              console.log(`          📝 Lesson ${lessonIndex + 1}: "${lesson.title}" (${lessonMcqCount} MCQs + ${lessonCodingCount} coding)`);
              
              topicData.lessons.push({
                title: lesson.title,
                mcqCount: lessonMcqCount,
                codingCount: lessonCodingCount
              });
            });
          }
          
          if (topic.moduleTest) {
            const mcqCount = topic.moduleTest.mcqs?.length || 0;
            const codingCount = topic.moduleTest.codeChallenges?.length || 0;
            totalModuleTestMcqs += mcqCount;
            totalModuleTestCoding += codingCount;
            
            console.log(`        - Module Test: ${mcqCount} MCQs + ${codingCount} coding challenges`);
            
            topicData.moduleTest = {
              mcqCount,
              codingCount,
              totalMarks: topic.moduleTest.totalMarks || 0
            };
          }
          
          topicsAnalysis.push(topicData);
        });
      }
      
      let finalExamData = null;
      if (course.finalExam) {
        const finalMcqCount = course.finalExam.mcqs?.length || 0;
        const finalCodingCount = course.finalExam.codeChallenges?.length || 0;
        
        console.log(`   🎓 Final Exam: ${finalMcqCount} MCQs + ${finalCodingCount} coding challenges`);
        console.log(`      - Total Marks: ${course.finalExam.totalMarks || 'Not specified'}`);
        
        finalExamData = {
          mcqCount: finalMcqCount,
          codingCount: finalCodingCount,
          totalMarks: course.finalExam.totalMarks || 0,
          passingScore: course.finalExam.passingScore || 0,
          duration: course.finalExam.duration || 0
        };
      }
      
      const courseData = {
        id: course._id,
        title: course.title,
        description: course.description,
        difficulty: course.difficulty,
        enrolledUsers: course.enrolledUsers?.length || 0,
        createdAt: course.createdAt,
        topics: topicsAnalysis,
        finalExam: finalExamData,
        totals: {
          lessonMcqs: totalLessonMcqs,
          lessonCoding: totalLessonCoding,
          moduleTestMcqs: totalModuleTestMcqs,
          moduleTestCoding: totalModuleTestCoding,
          totalMcqs: totalLessonMcqs + totalModuleTestMcqs + (finalExamData?.mcqCount || 0),
          totalCoding: totalLessonCoding + totalModuleTestCoding + (finalExamData?.codingCount || 0)
        }
      };
      
      console.log(`     📊 Course Totals:`);
      console.log(`        - Total MCQs: ${courseData.totals.totalMcqs}`);
      console.log(`        - Total Coding: ${courseData.totals.totalCoding}`);
      
      return courseData;
    });
    
    // Calculate system-wide totals
    const systemTotals = {
      totalCourses: courses.length,
      totalEnrolledUsers: courses.reduce((sum, c) => sum + (c.enrolledUsers?.length || 0), 0),
      coursesWithFinalExams: courses.filter(c => c.finalExam).length,
      totalMcqsSystem: courseAnalysis.reduce((sum, c) => sum + c.totals.totalMcqs, 0),
      totalCodingSystem: courseAnalysis.reduce((sum, c) => sum + c.totals.totalCoding, 0)
    };
    
    console.log('\n📊 System-wide Summary:');
    console.log(`   - Total Courses: ${systemTotals.totalCourses}`);
    console.log(`   - Total Enrolled Users: ${systemTotals.totalEnrolledUsers}`);
    console.log(`   - Courses with Final Exams: ${systemTotals.coursesWithFinalExams}`);
    console.log(`   - Total MCQs across all courses: ${systemTotals.totalMcqsSystem}`);
    console.log(`   - Total Coding Challenges across all courses: ${systemTotals.totalCodingSystem}`);
    
    res.json({
      success: true,
      message: "Course data retrieved successfully",
      systemTotals,
      courses: courseAnalysis
    });
    
  } catch (error) {
    console.error('❌ Error fetching course data:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching course data",
      error: error.message
    });
  }
});

module.exports = router;
