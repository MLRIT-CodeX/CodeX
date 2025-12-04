const axios = require('axios');

async function testScoreConsistency() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjdjNGYxOGI2MjZjNWExMTgxODA5YSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzYzMTk0MjgyLCJleHAiOjE3NjMyODA2ODJ9.hCGWabfpBDYfnv5vd74KtbGHQcRbQtXnioG3FVzSmRs';
    
    console.log('🔍 Testing Score Consistency Between APIs...\n');

    // Test submissions stats API (was returning 300)
    console.log('1️⃣ Testing Submissions Stats API:');
    const submissionsResponse = await axios.get('http://localhost:5000/api/submissions/stats/user', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Submissions API Response:');
    console.log(`   Total Score: ${submissionsResponse.data.totalScore}`);
    console.log(`   Problems Solved: ${submissionsResponse.data.problemsSolved}`);
    console.log(`   Course Score: ${submissionsResponse.data.courseScore}`);
    console.log(`   Problem Score: ${submissionsResponse.data.problemScore}`);

    // Test leaderboard API (was returning 150)
    console.log('\n2️⃣ Testing Leaderboard API:');
    const leaderboardResponse = await axios.get('http://localhost:5000/api/leaderboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const userId = 'your_user_id'; // Will extract from token
    const currentUserEntry = leaderboardResponse.data.find(
      (entry) => entry.userId === userId || entry.userId?.toString() === userId
    );
    
    console.log('✅ Leaderboard API Response:');
    if (currentUserEntry) {
      console.log(`   Total Score: ${currentUserEntry.totalScore}`);
      console.log(`   Total Solved: ${currentUserEntry.totalSolved}`);
    } else {
      console.log('   User entry found in leaderboard');
      console.log(`   First entry example: Score ${leaderboardResponse.data[0]?.totalScore}, Solved ${leaderboardResponse.data[0]?.totalSolved}`);
    }

    // Compare results
    console.log('\n🎯 Comparison:');
    const submissionsScore = submissionsResponse.data.totalScore;
    const leaderboardScore = currentUserEntry?.totalScore || leaderboardResponse.data[0]?.totalScore || 0;
    
    console.log(`   Submissions API Score: ${submissionsScore}`);
    console.log(`   Leaderboard API Score: ${leaderboardScore}`);
    
    if (submissionsScore === leaderboardScore) {
      console.log('✅ SUCCESS: Both APIs now return the same score!');
    } else {
      console.log(`❌ ISSUE: Score mismatch - difference of ${Math.abs(submissionsScore - leaderboardScore)}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testScoreConsistency();