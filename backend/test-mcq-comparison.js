const axios = require('axios');

async function compareMcqStats() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3M2RlOTdjMzQ0NzQzOTk1NGE1ZmRkNSIsImlhdCI6MTczMjEwNjY0NSwiZXhwIjoxNzMyMTkyOTk5fQ.QJ7JGzhcHoY9QZfevPBWrx2BCm7dJEeLmoYWt2xAYeg'; // Replace with valid token
    
    console.log('🔍 Comparing MCQ Statistics...\n');
    
    // Get MCQ performance stats
    console.log('📊 Fetching MCQ Performance Stats...');
    const mcqStatsResponse = await axios.get('http://localhost:5000/api/mcq-submissions/user-stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('MCQ Performance Stats:');
    console.log('  - Questions Attempted:', mcqStatsResponse.data.questionsAttempted);
    console.log('  - Solved Correctly:', mcqStatsResponse.data.solvedCorrectly);
    console.log('  - Wrong Answers:', mcqStatsResponse.data.wrongAnswers);
    console.log('  - Accuracy:', mcqStatsResponse.data.accuracy + '%');
    console.log();
    
    // Get contribution stats
    console.log('📅 Fetching Contribution Stats...');
    const contributionResponse = await axios.get('http://localhost:5000/api/contributions/calendar?year=2025', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Contribution Stats:');
    console.log('  - Total Coding Problems:', contributionResponse.data.stats.totalCodingProblems);
    console.log('  - Total Course Activities:', contributionResponse.data.stats.totalCourseActivities);
    console.log('  - Total Module Tests:', contributionResponse.data.stats.totalModuleTests);
    console.log('  - Total Activity:', contributionResponse.data.stats.totalActivity);
    console.log();
    
    // Calculate the discrepancy
    const mcqCorrect = mcqStatsResponse.data.solvedCorrectly;
    const contributionTotal = contributionResponse.data.stats.totalCourseActivities + contributionResponse.data.stats.totalModuleTests;
    
    console.log('🔍 Comparison:');
    console.log('  - MCQ Stats Correct Answers:', mcqCorrect);
    console.log('  - Contribution Calendar Total:', contributionTotal);
    console.log('  - Discrepancy:', Math.abs(mcqCorrect - contributionTotal));
    
    if (mcqCorrect === contributionTotal) {
      console.log('✅ Numbers match perfectly!');
    } else {
      console.log('❌ Numbers do not match - investigating...');
      
      // Show individual contribution entries
      console.log('\n📅 Individual Contribution Days:');
      contributionResponse.data.contributions.forEach(day => {
        if (day.courseActivities > 0 || day.moduleTests > 0) {
          console.log(`  ${day.date}: Course=${day.courseActivities}, Tests=${day.moduleTests}, Total=${day.totalActivity}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }
}

compareMcqStats();