const axios = require('axios');

async function testMcqTotals() {
  try {
    console.log('🧪 Testing MCQ Totals API...');
    
    // You'll need to replace this with a valid JWT token
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjdjNGYxOGI2MjZjNWExMTgxODA5YSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzYzMTk0MjgyLCJleHAiOjE3NjMyODA2ODJ9.hCGWabfpBDYfnv5vd74KtbGHQcRbQtXnioG3FVzSmRs';
    
    const response = await axios.get('http://localhost:5000/api/courses/mcq-totals', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ MCQ Totals API Response:', response.data);
    
    console.log('\n📊 Expected vs Actual:');
    console.log('Expected Module Test MCQs: 15 (3 modules × 5 MCQs each)');
    console.log('Expected Final Exam MCQs: 20');
    console.log('Expected Total MCQs: 35');
    console.log(`\nActual Module Test MCQs: ${response.data.moduleTestMCQs}`);
    console.log(`Actual Final Exam MCQs: ${response.data.finalExamMCQs}`);
    console.log(`Actual Total MCQs: ${response.data.totalMCQs}`);
    
    const moduleTestMatch = response.data.moduleTestMCQs === 15;
    const finalExamMatch = response.data.finalExamMCQs === 20;
    const totalMatch = response.data.totalMCQs === 35;
    
    console.log('\n🎯 Verification:');
    console.log(`Module Test MCQs: ${moduleTestMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
    console.log(`Final Exam MCQs: ${finalExamMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
    console.log(`Total MCQs: ${totalMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
    
    if (moduleTestMatch && finalExamMatch && totalMatch) {
      console.log('\n🎉 SUCCESS: MCQ counting is now accurate!');
    } else {
      console.log('\n⚠️  Issue: MCQ counts still don\'t match expectations');
    }
    
  } catch (error) {
    console.error('❌ Error testing MCQ totals:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testMcqTotals();