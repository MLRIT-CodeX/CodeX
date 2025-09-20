const axios = require('axios');

const testAPI = async () => {
  try {
    console.log('Testing recent-solved API endpoint...');
    
    // Test without authentication first to see if endpoint exists
    const response = await axios.get('http://localhost:5000/api/submissions/recent-solved?limit=3');
    console.log('API Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('API Error Status:', error.response.status);
      console.log('API Error Data:', error.response.data);
    } else {
      console.log('Network Error:', error.message);
    }
  }
};

testAPI();
