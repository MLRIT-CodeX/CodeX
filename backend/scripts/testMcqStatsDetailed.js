const axios = require('axios');

async function testMcqStats() {
  try {
    console.log('🧪 Testing MCQ Stats with detailed logging...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjdjNGYxOGI2MjZjNWExMTgxODA5YSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzYzMTk0MjgyLCJleHAiOjE3NjMyODA2ODJ9.hCGWabfpBDYfnv5vd74KtbGHQcRbQtXnioG3FVzSmRs';
    
    // Test MCQ stats
    const response = await axios.get('http://localhost:5000/api/mcq-submissions/user-stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('\n✅ MCQ Stats Response:', response.data);
    
    // Also test debug endpoint
    console.log('\n🔍 Testing debug endpoint...');
    const debugResponse = await axios.get('http://localhost:5000/api/mcq-submissions/debug-user-progress', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('\n📊 Debug Response Summary:');
    console.log(`   Total Records: ${debugResponse.data.totalRecords}`);
    console.log(`   Total Courses: ${debugResponse.data.courses.length}`);
    
    debugResponse.data.courses.forEach((course, index) => {
      console.log(`\n   Course ${index + 1}:`);
      console.log(`     ID: ${course.courseId}`);
      console.log(`     Modules: ${course.modulesCount}`);
      console.log(`     Has Final Exam: ${course.hasFinalExam}`);
      
      if (course.modules.length > 0) {
        console.log(`     Module Tests:`);
        course.modules.forEach(module => {
          if (module.hasModuleTest) {
            console.log(`       - ${module.moduleTitle}: ${module.moduleTestAnswers} answers, Score: ${module.moduleTestScore}`);
          }
        });
      }
      
      if (course.finalExam) {
        console.log(`     Final Exam: ${course.finalExam.totalAnswers} answers, Score: ${course.finalExam.score}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testMcqStats();