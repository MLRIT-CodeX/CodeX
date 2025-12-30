// Test script to check if courses exist in MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('./models/Course');

async function testFetch() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\nFetching all courses...');
    const courses = await Course.find();
    
    console.log(`\n📊 Total courses found: ${courses.length}`);
    
    if (courses.length > 0) {
      console.log('\n📚 Courses in database:');
      courses.forEach((course, index) => {
        console.log(`\n${index + 1}. ${course.title}`);
        console.log(`   ID: ${course._id}`);
        console.log(`   Description: ${course.description?.substring(0, 50)}...`);
        console.log(`   Difficulty: ${course.difficulty}`);
        console.log(`   Modules: ${course.modules?.length || 0}`);
        console.log(`   Active: ${course.isActive}`);
        console.log(`   Created: ${course.createdAt}`);
      });

      console.log('\n📋 First course full data:');
      console.log(JSON.stringify(courses[0], null, 2));
    } else {
      console.log('\n⚠️  No courses found in database!');
      console.log('Please create a course first or import one.');
    }

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

testFetch();
