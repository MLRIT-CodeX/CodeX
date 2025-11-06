// Test script for MCQ endpoint
const axios = require('axios');

async function testMCQEndpoint() {
  try {
    console.log('🧪 Testing MCQ endpoint...');
    
    // You'll need to replace this with a valid JWT token
    const token = 'YOUR_JWT_TOKEN_HERE';
    
    const response = await axios.get('http://localhost:5000/api/mcq-submissions/user-stats', {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    console.log('✅ MCQ API Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    // Validate response structure
    const data = response.data;
    const requiredFields = ['attended', 'solvedCorrectly', 'accuracy', 'totalScore', 'maxScore', 'assessments', 'source'];
    
    console.log('\n🔍 Validating response structure:');
    requiredFields.forEach(field => {
      if (data.hasOwnProperty(field)) {
        console.log(`✅ ${field}: ${data[field]} (${typeof data[field]})`);
      } else {
        console.log(`❌ Missing field: ${field}`);
      }
    });
    
    // Validate data types and ranges
    console.log('\n🔍 Validating data integrity:');
    console.log(`✅ Attended (Total Questions) >= 0: ${data.attended >= 0}`);
    console.log(`✅ SolvedCorrectly (Correct Answers) >= 0: ${data.solvedCorrectly >= 0}`);
    console.log(`✅ Accuracy 0-100: ${data.accuracy >= 0 && data.accuracy <= 100}`);
    console.log(`✅ TotalScore (Points) >= 0: ${data.totalScore >= 0}`);
    console.log(`✅ MaxScore >= 0: ${data.maxScore >= 0}`);
    console.log(`✅ Assessments >= 0: ${data.assessments >= 0}`);
    console.log(`✅ Source is string: ${typeof data.source === 'string'}`);
    
    // Validate logical relationships
    console.log('\n🔍 Validating logical relationships:');
    console.log(`✅ Correct answers <= Total questions: ${data.solvedCorrectly <= data.attended}`);
    console.log(`✅ Points <= Max score: ${data.totalScore <= data.maxScore}`);
    
    // Display meaningful interpretation
    console.log('\n📊 Data Interpretation:');
    console.log(`📝 Total MCQ Questions Available: ${data.attended}`);
    console.log(`✅ Correct Answers Given: ${data.solvedCorrectly}`);
    console.log(`❌ Wrong Answers: ${data.attended - data.solvedCorrectly}`);
    console.log(`🎯 Accuracy Rate: ${data.accuracy}%`);
    console.log(`🏆 Points Earned: ${data.totalScore}/${data.maxScore}`);
    console.log(`📚 Assessments Completed: ${data.assessments}`);
    
  } catch (error) {
    console.error('❌ MCQ API Test Failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Full error:', error.response?.data);
  }
}

// Instructions for running this test
console.log('📋 MCQ Endpoint Test Instructions:');
console.log('1. Make sure the backend server is running on port 5000');
console.log('2. Replace YOUR_JWT_TOKEN_HERE with a valid JWT token');
console.log('3. Run: node test-mcq-endpoint.js');
console.log('4. Check the console output for test results\n');

// Uncomment the line below to run the test (after adding a valid token)
// testMCQEndpoint();

module.exports = { testMCQEndpoint };
