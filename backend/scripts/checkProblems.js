const mongoose = require('mongoose');
const Problem = require('../models/Problem');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mlrit-code-hub');

const checkProblems = async () => {
  try {
    console.log('Checking problems in database...');
    
    const problems = await Problem.find({}).limit(5);
    console.log(`Found ${problems.length} problems:`);
    
    problems.forEach((problem, index) => {
      console.log(`\nProblem ${index + 1}:`);
      console.log(`  Title: ${problem.title}`);
      console.log(`  Difficulty: ${problem.difficulty}`);
      console.log(`  Score: ${problem.score}`);
      console.log(`  Score type: ${typeof problem.score}`);
      console.log(`  Has score field: ${problem.score !== undefined}`);
    });
    
    await mongoose.disconnect();
    console.log('\nDatabase check completed');
  } catch (error) {
    console.error('Error checking problems:', error);
    await mongoose.disconnect();
  }
};

checkProblems();
