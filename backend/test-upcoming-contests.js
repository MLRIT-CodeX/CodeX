const axios = require('axios');

async function testUpcomingContests() {
  try {
    console.log('Testing upcoming contests API endpoint...');
    
    const response = await axios.get('http://localhost:5000/api/contests/upcoming');
    
    console.log('✅ API endpoint working!');
    console.log('Response status:', response.status);
    console.log('Number of upcoming contests:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('Sample contest data:');
      console.log(JSON.stringify(response.data[0], null, 2));
    } else {
      console.log('No upcoming contests found (this is expected if no contests are scheduled)');
    }
    
  } catch (error) {
    console.error('❌ API endpoint failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testUpcomingContests();
