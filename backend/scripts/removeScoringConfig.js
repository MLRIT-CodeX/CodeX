const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config();

async function removeScoringConfigFromCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all courses that have scoringConfig field
    const coursesWithScoringConfig = await Course.find({ scoringConfig: { $exists: true } });
    console.log(`📊 Found ${coursesWithScoringConfig.length} courses with scoringConfig field`);

    if (coursesWithScoringConfig.length === 0) {
      console.log('✅ No courses found with scoringConfig field. Nothing to remove.');
      return;
    }

    // Show current courses with scoringConfig
    console.log('\n📋 Courses with scoringConfig:');
    coursesWithScoringConfig.forEach((course, index) => {
      console.log(`${index + 1}. "${course.title}" - ID: ${course._id}`);
      if (course.scoringConfig) {
        console.log(`   Current scoring config:`, course.scoringConfig);
      }
    });

    // Remove scoringConfig field from all courses
    console.log('\n🔄 Removing scoringConfig field from all courses...');
    
    const result = await Course.updateMany(
      { scoringConfig: { $exists: true } },
      { $unset: { scoringConfig: "" } }
    );

    console.log(`✅ Successfully removed scoringConfig from ${result.modifiedCount} courses`);

    // Verify removal
    const remainingCoursesWithScoringConfig = await Course.find({ scoringConfig: { $exists: true } });
    console.log(`📊 Verification: ${remainingCoursesWithScoringConfig.length} courses still have scoringConfig field`);

    if (remainingCoursesWithScoringConfig.length === 0) {
      console.log('🎉 All scoringConfig fields have been successfully removed!');
    } else {
      console.log('⚠️  Some courses still have scoringConfig field. Manual intervention may be required.');
    }

    // Show updated course structure
    console.log('\n📋 Updated course structure (sample):');
    const sampleCourse = await Course.findOne({});
    if (sampleCourse) {
      console.log(`Course: "${sampleCourse.title}"`);
      console.log('Fields:', Object.keys(sampleCourse.toObject()));
      console.log('Has scoringConfig:', sampleCourse.scoringConfig !== undefined);
    }

  } catch (error) {
    console.error('❌ Error removing scoringConfig:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

removeScoringConfigFromCourses();
