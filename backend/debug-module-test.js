const axios = require('axios');

async function testRealModuleTest() {
  try {
    console.log('Testing with real frontend data structure...');
    
    const testData = {
      userId: "6867c4f18b626c5a1181809a",
      courseId: "690c993dcb21cbd98ce292d8", 
      moduleId: "690c993dcb21cbd98ce292d9", // Python Basics module
      answers: [0, 1], // Just the selected answer indices
      codingAnswers: {},
      moduleTitle: "Test Module",
      timeTaken: 300
    };

    console.log('Request data:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://localhost:5000/api/progress/module-test', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjdjNGYxOGI2MjZjNWExMTgxODA5YSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzYzMTk0MjgyLCJleHAiOjE3NjMyODA2ODJ9.hCGWabfpBDYfnv5vd74KtbGHQcRbQtXnioG3FVzSmRs'
      }
    });

    console.log('✅ Success! Status:', response.status);
    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error Status:', error.response?.status);
    console.log('❌ Error Message:', error.response?.data?.message);
    console.log('❌ Full Error Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('❌ Error Stack:', error.stack);
  }
}

testRealModuleTest();