const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config();

async function countTotalCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Count total courses
    const totalCourses = await Course.countDocuments();
    console.log('📊 Total Courses in Database:', totalCourses);

    // Get course titles for reference
    const courses = await Course.find({}, 'title createdAt').sort({ createdAt: -1 });
    console.log('\n📚 All Courses:');
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} (Created: ${course.createdAt?.toDateString() || 'Unknown'})`);
    });

    // Count courses with MCQ content
    const coursesWithMCQs = await Course.aggregate([
      {
        $match: {
          $or: [
            { 'topics.lessons.mcqs': { $exists: true, $ne: [] } },
            { 'topics.moduleTest.mcqs': { $exists: true, $ne: [] } },
            { 'finalExam.mcqs': { $exists: true, $ne: [] } }
          ]
        }
      },
      { $count: 'coursesWithMCQs' }
    ]);

    console.log('\n📝 Courses with MCQ Content:', coursesWithMCQs[0]?.coursesWithMCQs || 0);

    // Get detailed MCQ statistics
    const mcqStats = await Course.aggregate([
      { $unwind: { path: '$topics', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$topics.lessons', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          totalLessonMCQs: { $sum: { $size: { $ifNull: ['$topics.lessons.mcqs', []] } } },
          totalModuleTestMCQs: { $sum: { $size: { $ifNull: ['$topics.moduleTest.mcqs', []] } } },
          totalFinalExamMCQs: { $sum: { $size: { $ifNull: ['$finalExam.mcqs', []] } } }
        }
      }
    ]);

    if (mcqStats.length > 0) {
      const stats = mcqStats[0];
      const totalMCQs = stats.totalLessonMCQs + stats.totalModuleTestMCQs + stats.totalFinalExamMCQs;
      
      console.log('\n📊 MCQ Statistics:');
      console.log(`  - Lesson MCQs: ${stats.totalLessonMCQs}`);
      console.log(`  - Module Test MCQs: ${stats.totalModuleTestMCQs}`);
      console.log(`  - Final Exam MCQs: ${stats.totalFinalExamMCQs}`);
      console.log(`  - Total MCQs: ${totalMCQs}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

countTotalCourses();
