// Simple network test to check if backend is accessible from frontend perspective
async function testBackendConnection() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🔍 Testing backend connectivity...');
  
  try {
    // Test basic connection
    const response = await fetch(`${baseUrl}/`);
    const text = await response.text();
    console.log('✅ Backend reachable:', text);
    
    // Test API endpoint
    const apiResponse = await fetch(`${baseUrl}/api/progress/module-test`, {
      method: 'OPTIONS' // CORS preflight
    });
    console.log('✅ CORS preflight for module-test endpoint:', apiResponse.status);
    
    // Test with actual POST (should fail with 401 but shows endpoint is accessible)
    try {
      const postResponse = await fetch(`${baseUrl}/api/progress/module-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: 'data' })
      });
      console.log('📡 POST test response status:', postResponse.status);
      const errorData = await postResponse.json();
      console.log('📡 POST test response:', errorData);
    } catch (postError) {
      console.log('❌ POST test error:', postError.message);
    }
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    console.error('   Error code:', error.code || 'Unknown');
    console.error('   This indicates the backend server is not running or not accessible');
  }
}

testBackendConnection();