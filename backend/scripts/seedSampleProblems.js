const mongoose = require('mongoose');
const Problem = require('../models/Problem');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mlrit-code-hub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedSampleProblems = async () => {
  try {
    console.log('Starting to seed sample problems...');
    
    // Clear existing problems first
    await Problem.deleteMany({});
    console.log('Cleared existing problems');
    
    // Create sample problems with scores
    const sampleProblems = [
      {
        title: "Two Sum",
        difficulty: "Easy",
        score: 100,
        problemStatement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        inputFormat: "First line contains n (number of elements). Second line contains n integers. Third line contains target.",
        outputFormat: "Print two indices separated by space.",
        constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
        sampleTestCases: [
          {
            input: "4\n2 7 11 15\n9",
            output: "0 1",
            explanation: "nums[0] + nums[1] = 2 + 7 = 9"
          }
        ],
        hiddenTestCases: [
          {
            input: "3\n3 2 4\n6",
            output: "1 2"
          }
        ],
        tags: ["Array", "Hash Table"]
      },
      {
        title: "Add Two Numbers",
        difficulty: "Medium",
        score: 200,
        problemStatement: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
        inputFormat: "Two lines, each containing a number represented as a linked list.",
        outputFormat: "Print the result as a linked list.",
        constraints: ["The number of nodes in each linked list is in the range [1, 100]", "0 <= Node.val <= 9"],
        sampleTestCases: [
          {
            input: "2 4 3\n5 6 4",
            output: "7 0 8",
            explanation: "342 + 465 = 807"
          }
        ],
        hiddenTestCases: [
          {
            input: "0\n0",
            output: "0"
          }
        ],
        tags: ["Linked List", "Math"]
      },
      {
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Hard",
        score: 300,
        problemStatement: "Given a string s, find the length of the longest substring without repeating characters.",
        inputFormat: "Single line containing string s.",
        outputFormat: "Print the length of longest substring.",
        constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
        sampleTestCases: [
          {
            input: "abcabcbb",
            output: "3",
            explanation: "The answer is 'abc', with the length of 3."
          }
        ],
        hiddenTestCases: [
          {
            input: "bbbbb",
            output: "1"
          }
        ],
        tags: ["Hash Table", "String", "Sliding Window"]
      }
    ];
    
    // Insert sample problems
    const createdProblems = await Problem.insertMany(sampleProblems);
    console.log(`Created ${createdProblems.length} sample problems:`);
    
    createdProblems.forEach(problem => {
      console.log(`- ${problem.title} (${problem.difficulty}, ${problem.score} pts)`);
    });
    
    console.log('Sample problems seeded successfully!');
  } catch (error) {
    console.error('Error seeding sample problems:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedSampleProblems();
