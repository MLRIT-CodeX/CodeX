const axios = require('axios');

async function testBothEndpoints() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjdjNGYxOGI2MjZjNWExMTgxODA5YSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzYzMTk0MjgyLCJleHAiOjE3NjMyODA2ODJ9.hCGWabfpBDYfnv5vd74KtbGHQcRbQtXnioG3FVzSmRs';
    
    console.log('🔍 Testing BOTH submission endpoints after fix...\n');

    console.log('1️⃣ Testing /api/submissions/stats/user (the first one I fixed):');
    try {
      const stats1 = await axios.get('http://localhost:5000/api/submissions/stats/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`   Total Score: ${stats1.data.totalScore}`);
    } catch (err) {
      console.log(`   Error: ${err.response?.status || err.message}`);
    }

    console.log('\n2️⃣ Testing /api/submissions/user-stats (the one frontend actually calls):');
    try {
      const stats2 = await axios.get('http://localhost:5000/api/submissions/user-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`   Total Score: ${stats2.data.totalScore}`);
    } catch (err) {
      console.log(`   Error: ${err.response?.status || err.message}`);
    }

    console.log('\n🎯 Expected Result:');
    console.log('   Both endpoints should return the SAME score (around 150)');
    console.log('   Frontend will now get 150 instead of 300! 🎉');

  } catch (error) {
    console.error('❌ Connection Error:', error.message);
  }
}

testBothEndpoints();