const axios = require('axios');

async function testModuleTestEndpoint() {
  try {
    console.log('Testing module-test endpoint...');
    
    const testData = {
      userId: "test123",
      courseId: "test456",
      moduleId: "test789",
      answers: {},
      codingAnswers: {},
      moduleTitle: "Test Module"
    };

    const response = await axios.post('http://localhost:5000/api/progress/module-test', testData, {
      headers: {
        'Content-Type': 'application/json',
        // You would normally include Authorization header with JWT token
        'Authorization': 'Bearer fake-token-for-test'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    console.log('Error status:', error.response?.status);
    console.log('Error message:', error.response?.data?.message || error.message);
    console.log('Full error:', error.response?.data);
  }
}

testModuleTestEndpoint();