// Quick script to check course modules in database
require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

async function checkCourseModules() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all courses
    const courses = await Course.find({});
    
    console.log('\n=== COURSE MODULES CHECK ===\n');
    
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   ID: ${course._id}`);
      console.log(`   Modules: ${course.modules?.length || 0}`);
      
      if (course.modules && course.modules.length > 0) {
        course.modules.forEach((module, mIndex) => {
          console.log(`     ${mIndex + 1}. ${module.title || module.module || 'Untitled'}`);
        });
      } else {
        console.log('     ⚠️ NO MODULES');
      }
      console.log('');
    });

    console.log('=== END OF CHECK ===\n');
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCourseModules();
