const axios = require('axios');
const jwt = require('jsonwebtoken');

// Create a test JWT token
const testToken = jwt.sign(
  { userId: '6703aac5675d1fb312bbe428', username: 'testuser' },
  'bda3a105272f459268fc8d436cd5c93579d0c300b2991261276d5d0761a0e803e23a0bc893c7b05903d76d91289cc089c9969a3981a19087496a4c267b76e5e6nod',
  { expiresIn: '1h' }
);

async function testModuleTestEndpoint() {
  try {
    console.log('Testing module-test endpoint with valid token...');
    
    const testData = {
      userId: "6703aac5675d1fb312bbe428",
      courseId: "690c993dcb21cbd98ce292d8",
      moduleId: "66fa4d8f56a0c09e9948a54a",
      answers: [
        { questionIndex: 0, selectedOption: 0, isCorrect: true, marks: 5 },
        { questionIndex: 1, selectedOption: 1, isCorrect: false, marks: 5 }
      ],
      codingAnswers: {},
      moduleTitle: "Test Module",
      timeTaken: 300
    };

    console.log('Sending test data:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://localhost:5000/api/progress/module-test', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      }
    });

    console.log('✅ Response status:', response.status);
    console.log('✅ Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error status:', error.response?.status);
    console.log('❌ Error message:', error.response?.data?.message || error.message);
    console.log('❌ Full error:', JSON.stringify(error.response?.data, null, 2));
  }
}

testModuleTestEndpoint();