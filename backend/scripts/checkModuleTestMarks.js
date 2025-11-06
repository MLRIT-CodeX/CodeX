const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config();

async function checkModuleTestMarks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get the Python course
    const course = await Course.findOne({ title: "Python Programming Fundamentals" });
    
    if (!course) {
      console.log('❌ Course not found');
      return;
    }

    console.log('📊 MODULE TEST MARKS ANALYSIS\n');
    console.log('🎓 Course:', course.title);
    console.log('=' .repeat(60));
    
    course.topics.forEach((topic, topicIndex) => {
      console.log(`\n📚 Topic ${topicIndex + 1}: "${topic.title}"`);
      
      if (topic.moduleTest) {
        console.log(`🧪 Module Test: "${topic.moduleTest.title || 'Module Assessment'}"`);
        
        // Check MCQ marks
        if (topic.moduleTest.mcqs && topic.moduleTest.mcqs.length > 0) {
          console.log(`\n   📝 MCQ Questions (${topic.moduleTest.mcqs.length} total):`);
          let totalMcqMarks = 0;
          
          topic.moduleTest.mcqs.forEach((mcq, index) => {
            console.log(`   ${index + 1}. "${mcq.question}"`);
            console.log(`      Marks: ${mcq.marks || 'NOT SET'}`);
            console.log(`      Difficulty: ${mcq.difficulty || 'NOT SET'}`);
            totalMcqMarks += mcq.marks || 0;
          });
          
          console.log(`   📊 Total MCQ Marks: ${totalMcqMarks}`);
        }
        
        // Check Coding Challenge marks
        if (topic.moduleTest.codeChallenges && topic.moduleTest.codeChallenges.length > 0) {
          console.log(`\n   💻 Coding Challenges (${topic.moduleTest.codeChallenges.length} total):`);
          let totalCodingMarks = 0;
          
          topic.moduleTest.codeChallenges.forEach((challenge, index) => {
            console.log(`   ${index + 1}. "${challenge.title}"`);
            console.log(`      Marks: ${challenge.marks || 'NOT SET'}`);
            console.log(`      Difficulty: ${challenge.difficulty || 'NOT SET'}`);
            totalCodingMarks += challenge.marks || 0;
          });
          
          console.log(`   📊 Total Coding Marks: ${totalCodingMarks}`);
        }
        
        // Calculate total for this module test
        const mcqTotal = topic.moduleTest.mcqs?.reduce((sum, mcq) => sum + (mcq.marks || 0), 0) || 0;
        const codingTotal = topic.moduleTest.codeChallenges?.reduce((sum, challenge) => sum + (challenge.marks || 0), 0) || 0;
        const moduleTestTotal = mcqTotal + codingTotal;
        
        console.log(`\n   🎯 Module Test Total: ${moduleTestTotal} marks`);
        console.log(`      - MCQ: ${mcqTotal} marks`);
        console.log(`      - Coding: ${codingTotal} marks`);
      } else {
        console.log('   ❌ No module test found');
      }
    });

    // Summary
    const allModuleTests = course.topics.filter(topic => topic.moduleTest);
    const totalPossibleMarks = allModuleTests.reduce((sum, topic) => {
      const mcqMarks = topic.moduleTest.mcqs?.reduce((mcqSum, mcq) => mcqSum + (mcq.marks || 0), 0) || 0;
      const codingMarks = topic.moduleTest.codeChallenges?.reduce((codingSum, challenge) => codingSum + (challenge.marks || 0), 0) || 0;
      return sum + mcqMarks + codingMarks;
    }, 0);

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log(`   • Total Module Tests: ${allModuleTests.length}`);
    console.log(`   • Total Possible Module Test Marks: ${totalPossibleMarks}`);
    console.log(`   • Average Marks per Module Test: ${allModuleTests.length > 0 ? (totalPossibleMarks / allModuleTests.length).toFixed(1) : 0}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkModuleTestMarks();
