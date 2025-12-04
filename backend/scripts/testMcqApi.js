const http = require('http');

function testMcqApi() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjdjNGYxOGI2MjZjNWExMTgxODA5YSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzYzMTk0MjgyLCJleHAiOjE3NjMyODA2ODJ9.hCGWabfpBDYfnv5vd74KtbGHQcRbQtXnioG3FVzSmRs';
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/mcq-submissions/user-stats',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  console.log('🧪 Testing MCQ API with updated individual scoring...');

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('\n✅ MCQ API Response:');
        console.log(`   Questions Attempted: ${response.questionsAttempted}`);
        console.log(`   Correct Answers: ${response.solvedCorrectly}`);
        console.log(`   Wrong Answers: ${response.wrongAnswers}`);
        console.log(`   Total Score: ${response.totalScore}`);
        console.log(`   Accuracy: ${response.accuracy}%`);
        console.log(`   Source: ${response.source}`);
        
        if (response.totalScore === 62) {
          console.log('\n🎉 SUCCESS! Individual MCQ scoring is working - Score is 62');
        } else if (response.totalScore === 10) {
          console.log('\n❌ Still showing old score of 10 - Server may not be updated');
        } else {
          console.log(`\n🤔 Unexpected score: ${response.totalScore}`);
        }
      } catch (error) {
        console.error('❌ Error parsing response:', error);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error);
  });

  req.end();
}

testMcqApi();