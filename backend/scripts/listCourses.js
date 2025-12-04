require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

async function listCourses() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const courses = await Course.find({});
    console.log('\n📚 Available Courses:\n');
    
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   ID: ${course._id}`);
      console.log(`   Modules: ${course.modules?.length || 0}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

listCourses();