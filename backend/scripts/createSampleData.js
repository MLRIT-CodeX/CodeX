const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const User = require('../models/user');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mlrit-code-hub');

const createSampleData = async () => {
  try {
    console.log('Creating sample data for testing...');
    
    // First, create some sample problems with scores
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
        problemStatement: "You are given two non-empty linked lists representing two non-negative integers.",
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
        title: "Longest Substring",
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
    
    // Clear existing data
    await Problem.deleteMany({});
    await Submission.deleteMany({});
    console.log('Cleared existing problems and submissions');
    
    // Create problems
    const createdProblems = await Problem.insertMany(sampleProblems);
    console.log(`Created ${createdProblems.length} problems with scores`);
    
    // Find or create a test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword', // In real app, this would be properly hashed
        rollNumber: 'TEST001',
        year: '2024',
        department: 'CSE',
        college: 'MLRIT'
      });
      await testUser.save();
      console.log('Created test user');
    }
    
    // Create successful submissions for the first 2 problems
    const successfulSubmissions = [
      {
        user: testUser._id,
        problem: createdProblems[0]._id,
        code: 'console.log("Two Sum solution");',
        language: 'javascript',
        isSuccess: true,
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        user: testUser._id,
        problem: createdProblems[1]._id,
        code: 'console.log("Add Two Numbers solution");',
        language: 'javascript',
        isSuccess: true,
        submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      }
    ];
    
    await Submission.insertMany(successfulSubmissions);
    console.log(`Created ${successfulSubmissions.length} successful submissions`);
    
    console.log('\nSample data created successfully!');
    console.log('Test user email: test@example.com');
    console.log('Problems created with scores: 100, 200, 300');
    console.log('Successful submissions created for first 2 problems');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating sample data:', error);
    await mongoose.disconnect();
  }
};

createSampleData();
