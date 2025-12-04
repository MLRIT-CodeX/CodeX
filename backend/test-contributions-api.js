const axios = require('axios');

async function testContributionsAPI() {
  try {
    console.log('🔍 Testing contributions API...');
    
    // Test if the endpoint exists (without auth first)
    const testResponse = await axios.get('http://localhost:5000/api/contributions/calendar?year=2025')
      .catch(err => {
        console.log('❌ API Error:', err.response?.status, err.response?.statusText);
        console.log('❌ This suggests the route is not registered properly');
        return null;
      });
    
    if (testResponse) {
      console.log('✅ Contributions API is working!');
    } else {
      console.log('❌ Contributions API not found - route not registered');
    }

  } catch (error) {
    console.error('❌ Connection Error:', error.message);
  }
}

testContributionsAPI();