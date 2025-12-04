const mongoose = require('mongoose');
const Course = require('./models/Course');

require('dotenv').config();

async function checkCourseModules() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const courseId = "690c993dcb21cbd98ce292d8";
    const course = await Course.findById(courseId);
    
    if (!course) {
      console.log('❌ Course not found');
      return;
    }

    console.log('\n📚 Course:', course.title);
    console.log('📝 Course ID:', course._id.toString());
    console.log('📊 Number of modules:', course.modules?.length || 0);

    if (course.modules && course.modules.length > 0) {
      console.log('\n🔍 Available Modules:');
      course.modules.forEach((module, index) => {
        console.log(`${index + 1}. Module ID: ${module._id}`);
        console.log(`   Title: ${module.title}`);
        console.log(`   Description: ${module.description || 'No description'}`);
        console.log(`   Module Test MCQs: ${module.moduleTest?.mcqs?.length || 0}`);
        console.log(`   Module Test Coding: ${module.moduleTest?.codeChallenges?.length || 0}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  No modules found in this course');
      
      // Let's also check if there are topics instead of modules
      console.log('\n🔍 Checking course structure...');
      console.log('Full course object keys:', Object.keys(course.toObject()));
      
      if (course.topics) {
        console.log('📖 Course has topics:', course.topics.length);
      }
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCourseModules();