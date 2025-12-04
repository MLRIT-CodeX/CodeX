const axios = require('axios');

async function testFrontendScenario() {
  try {
    console.log('Testing exact frontend scenario...');
    
    // Simulate exact frontend request structure
    const testData = {
      userId: "6867c4f18b626c5a1181809a",
      courseId: "690c993dcb21cbd98ce292d8",
      moduleId: "690c993dcb21cbd98ce292d9",
      answers: [0, 1, 2, null, null], // 3 answered, 2 unanswered out of 5 MCQs
      codingAnswers: {
        5: { // Coding question at index 5
          code: "console.log('Hello World');",
          hasRun: true,
          lastRunTime: Date.now()
        },
        6: { // Coding question at index 6
          code: "",
          hasRun: false
        }
      },
      moduleTitle: "Python Basics",
      timeTaken: 450
    };

    console.log('Request payload:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://localhost:5000/api/progress/module-test', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjdjNGYxOGI2MjZjNWExMTgxODA5YSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzYzMTk0MjgyLCJleHAiOjE3NjMyODA2ODJ9.hCGWabfpBDYfnv5vd74KtbGHQcRbQtXnioG3FVzSmRs'
      }
    });

    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Test individual MCQ scoring API to see updated scores
    console.log('\n📊 Checking updated MCQ stats...');
    const statsResponse = await axios.get('http://localhost:5000/api/mcq-submissions/user-stats', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjdjNGYxOGI2MjZjNWExMTgxODA5YSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzYzMTk0MjgyLCJleHAiOjE3NjMyODA2ODJ9.hCGWabfpBDYfnv5vd74KtbGHQcRbQtXnioG3FVzSmRs'
      }
    });
    
    console.log('MCQ Stats after submission:');
    console.log('  Total Score:', statsResponse.data.totalScore);
    console.log('  Source:', statsResponse.data.source);

  } catch (error) {
    console.log('❌ ERROR DETAILS:');
    console.log('  Status:', error.response?.status);
    console.log('  Message:', error.response?.data?.message);
    console.log('  Full Response:', JSON.stringify(error.response?.data, null, 2));
    console.log('  Error Stack:', error.stack);
  }
}

testFrontendScenario();