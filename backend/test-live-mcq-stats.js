const axios = require('axios');

async function testLiveMcqStats() {
  try {
    console.log('🔍 Testing live MCQ stats as frontend would see them...');
    
    // Using the same token as shown in the user's terminal
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjdjNGYxOGI2MjZjNWExMTgxODA5YSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzYzMTk0MjgyLCJleHAiOjE3NjMyODA2ODJ9.hCGWabfpBDYfnv5vd74KtbGHQcRbQtXnioG3FVzSmRs';
    
    console.log('\n1️⃣ Testing MCQ User Stats API...');
    const mcqResponse = await axios.get('http://localhost:5000/api/mcq-submissions/user-stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ MCQ Stats Response:');
    console.log(JSON.stringify(mcqResponse.data, null, 2));
    
    console.log('\n2️⃣ Testing MCQ Totals API...');
    const totalsResponse = await axios.get('http://localhost:5000/api/courses/mcq-totals', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ MCQ Totals Response:');
    console.log(JSON.stringify(totalsResponse.data, null, 2));
    
    console.log('\n📋 Frontend Data Mapping Simulation:');
    const frontendStats = {
      totalMCQs: totalsResponse.data.totalMCQs || 0,
      questionsAttempted: mcqResponse.data.questionsAttempted || 0,
      solvedCorrectly: mcqResponse.data.solvedCorrectly || 0,
      wrongAnswers: mcqResponse.data.wrongAnswers || 0,
      totalScore: mcqResponse.data.totalScore || 0,
      accuracy: mcqResponse.data.accuracy || 0
    };
    
    console.log('🎯 What Frontend Should Display:');
    console.log(`   Total MCQ Questions: ${frontendStats.totalMCQs}`);
    console.log(`   Questions Attempted: ${frontendStats.questionsAttempted}`);
    console.log(`   Correct Answers: ${frontendStats.solvedCorrectly}`);
    console.log(`   Wrong Answers: ${frontendStats.wrongAnswers}`);
    console.log(`   MCQ Score: ${frontendStats.totalScore}`);
    console.log(`   Accuracy: ${frontendStats.accuracy}%`);
    
    // Diagnosis
    console.log('\n🩺 Diagnosis:');
    if (frontendStats.questionsAttempted === 0) {
      console.log('❌ ISSUE: questionsAttempted is 0 - this explains the frontend problem!');
      console.log('🔍 Check if mcqResponse.data.questionsAttempted exists:', 
        typeof mcqResponse.data.questionsAttempted, mcqResponse.data.questionsAttempted);
    } else {
      console.log('✅ questionsAttempted looks correct');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testLiveMcqStats();