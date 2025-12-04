const axios = require('axios');

async function quickTestMcqTotals() {
  try {
    console.log('🧪 Quick MCQ Totals Test...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjdjNGYxOGI2MjZjNWExMTgxODA5YSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzYzMTk0MjgyLCJleHAiOjE3NjMyODA2ODJ9.hCGWabfpBDYfnv5vd74KtbGHQcRbQtXnioG3FVzSmRs';
    
    const response = await axios.get('http://localhost:5000/api/courses/mcq-totals', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ API Response:', response.data);
    console.log(`Expected: moduleTestMCQs=15, finalExamMCQs=20, totalMCQs=35`);
    console.log(`Actual: moduleTestMCQs=${response.data.moduleTestMCQs}, finalExamMCQs=${response.data.finalExamMCQs}, totalMCQs=${response.data.totalMCQs}`);
    
    const correct = response.data.moduleTestMCQs === 15 && response.data.finalExamMCQs === 20 && response.data.totalMCQs === 35;
    console.log(correct ? '🎉 SUCCESS!' : '❌ STILL INCORRECT');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickTestMcqTotals();