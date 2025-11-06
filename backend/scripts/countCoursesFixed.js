const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config();

async function countTotalCoursesFixed() {
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

    // FIXED: Get detailed MCQ statistics without double counting
    const mcqStats = await Course.aggregate([
      // First, get lesson MCQs by unwinding topics and lessons
      {
        $facet: {
          lessonMCQs: [
            { $unwind: { path: '$topics', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$topics.lessons', preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: null,
                totalLessonMCQs: { $sum: { $size: { $ifNull: ['$topics.lessons.mcqs', []] } } }
              }
            }
          ],
          moduleTestMCQs: [
            { $unwind: { path: '$topics', preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: null,
                totalModuleTestMCQs: { $sum: { $size: { $ifNull: ['$topics.moduleTest.mcqs', []] } } }
              }
            }
          ],
          finalExamMCQs: [
            // Don't unwind for final exam - it's at course level
            {
              $group: {
                _id: null,
                totalFinalExamMCQs: { $sum: { $size: { $ifNull: ['$finalExam.mcqs', []] } } }
              }
            }
          ]
        }
      }
    ]);

    const lessonMCQs = mcqStats[0]?.lessonMCQs[0]?.totalLessonMCQs || 0;
    const moduleTestMCQs = mcqStats[0]?.moduleTestMCQs[0]?.totalModuleTestMCQs || 0;
    const finalExamMCQs = mcqStats[0]?.finalExamMCQs[0]?.totalFinalExamMCQs || 0;
    const totalMCQs = lessonMCQs + moduleTestMCQs + finalExamMCQs;

    console.log('\n📊 CORRECTED MCQ Statistics:');
    console.log(`  - Lesson MCQs: ${lessonMCQs}`);
    console.log(`  - Module Test MCQs: ${moduleTestMCQs}`);
    console.log(`  - Final Exam MCQs: ${finalExamMCQs}`);
    console.log(`  - Total MCQs: ${totalMCQs}`);

    // Verify with direct count
    console.log('\n🔍 Verification - Direct Count:');
    const directCount = await Course.findOne({}, 'finalExam.mcqs');
    if (directCount && directCount.finalExam && directCount.finalExam.mcqs) {
      console.log(`  - Direct Final Exam MCQ Count: ${directCount.finalExam.mcqs.length}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

countTotalCoursesFixed();
