const mongoose = require('mongoose');
const Course = require('../models/Course');

// Connect to MongoDB Atlas
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createDummyCourse() {
  try {
    console.log('🚀 Creating dummy course with specified requirements...\n');

    // Create 20 MCQs for module test
    const moduleTestMCQs = [];
    for (let i = 1; i <= 20; i++) {
      moduleTestMCQs.push({
        question: `Module Test MCQ ${i}: What is the correct syntax for defining a variable in JavaScript?`,
        options: [
          `Option A for question ${i}`,
          `Option B for question ${i}`,
          `Option C for question ${i}`,
          `Option D for question ${i}`
        ],
        correct: i % 4, // Distribute correct answers across options
        explanation: `Explanation for module test MCQ ${i}: This demonstrates proper JavaScript syntax.`,
        marks: 2,
        difficulty: i <= 7 ? 'easy' : i <= 14 ? 'medium' : 'hard'
      });
    }

    // Create 2 coding challenges for module test
    const moduleTestCoding = [
      {
        title: "Module Test Coding 1: Sum of Two Numbers",
        description: "Write a function that takes two numbers and returns their sum.",
        sampleInput: "5, 3",
        sampleOutput: "8",
        constraints: "1 <= numbers <= 1000",
        initialCode: "function sum(a, b) {\n    // Your code here\n    return 0;\n}",
        language: "javascript",
        marks: 25,
        difficulty: "easy",
        testCases: [
          { input: "5, 3", expectedOutput: "8", isHidden: false },
          { input: "10, 20", expectedOutput: "30", isHidden: true },
          { input: "0, 0", expectedOutput: "0", isHidden: true }
        ]
      },
      {
        title: "Module Test Coding 2: Reverse String",
        description: "Write a function that reverses a given string.",
        sampleInput: "hello",
        sampleOutput: "olleh",
        constraints: "1 <= string length <= 100",
        initialCode: "function reverseString(str) {\n    // Your code here\n    return '';\n}",
        language: "javascript",
        marks: 25,
        difficulty: "medium",
        testCases: [
          { input: "hello", expectedOutput: "olleh", isHidden: false },
          { input: "world", expectedOutput: "dlrow", isHidden: true },
          { input: "a", expectedOutput: "a", isHidden: true }
        ]
      }
    ];

    // Create 20 MCQs for final exam
    const finalExamMCQs = [];
    for (let i = 1; i <= 20; i++) {
      finalExamMCQs.push({
        question: `Final Exam MCQ ${i}: Which of the following is a JavaScript framework?`,
        options: [
          `React (Question ${i})`,
          `Python (Question ${i})`,
          `MySQL (Question ${i})`,
          `CSS (Question ${i})`
        ],
        correct: 0, // React is always correct
        explanation: `Explanation for final exam MCQ ${i}: React is a popular JavaScript library for building user interfaces.`,
        marks: 3,
        difficulty: i <= 6 ? 'easy' : i <= 13 ? 'medium' : 'hard'
      });
    }

    // Create 2 coding challenges for final exam
    const finalExamCoding = [
      {
        title: "Final Exam Coding 1: Find Maximum",
        description: "Write a function that finds the maximum number in an array.",
        sampleInput: "[1, 5, 3, 9, 2]",
        sampleOutput: "9",
        constraints: "1 <= array length <= 1000, -1000 <= numbers <= 1000",
        initialCode: "function findMax(arr) {\n    // Your code here\n    return 0;\n}",
        language: "javascript",
        marks: 30,
        difficulty: "medium",
        testCases: [
          { input: "[1, 5, 3, 9, 2]", expectedOutput: "9", isHidden: false },
          { input: "[10, 20, 5]", expectedOutput: "20", isHidden: true },
          { input: "[-1, -5, -2]", expectedOutput: "-1", isHidden: true }
        ]
      },
      {
        title: "Final Exam Coding 2: Palindrome Check",
        description: "Write a function that checks if a string is a palindrome.",
        sampleInput: "racecar",
        sampleOutput: "true",
        constraints: "1 <= string length <= 100",
        initialCode: "function isPalindrome(str) {\n    // Your code here\n    return false;\n}",
        language: "javascript",
        marks: 30,
        difficulty: "hard",
        testCases: [
          { input: "racecar", expectedOutput: "true", isHidden: false },
          { input: "hello", expectedOutput: "false", isHidden: true },
          { input: "a", expectedOutput: "true", isHidden: true }
        ]
      }
    ];

    // Create the dummy course
    const dummyCourse = new Course({
      title: "Dummy Test Course - JavaScript Fundamentals",
      description: "A comprehensive dummy course for testing MCQ and coding functionality with module tests and final exams.",
      instructor: "Test Instructor",
      duration: "8 weeks",
      level: "Intermediate",
      category: "Programming",
      tags: ["JavaScript", "Programming", "Web Development", "Testing"],
      enrolledUsers: [], // Empty for now
      topics: [
        {
          title: "JavaScript Basics",
          description: "Introduction to JavaScript programming concepts",
          lessons: [
            {
              title: "Variables and Data Types",
              content: "Learn about JavaScript variables and data types. JavaScript supports various data types including numbers, strings, booleans, objects, and arrays. Variables can be declared using var, let, or const keywords.",
              review: "In this lesson, we covered the fundamental concepts of JavaScript variables and data types. Remember that var has function scope, let has block scope, and const creates immutable bindings.",
              videoUrl: "https://example.com/video1",
              mcqs: [
                {
                  question: "Which keyword is used to declare a variable in JavaScript?",
                  options: ["var", "int", "string", "declare"],
                  correct: 0,
                  explanation: "The 'var' keyword is used to declare variables in JavaScript.",
                  marks: 1,
                  difficulty: "easy"
                }
              ]
            }
          ],
          moduleTest: {
            title: "JavaScript Basics Module Test",
            description: "Test your knowledge of JavaScript basics",
            duration: 90, // 90 minutes
            mcqs: moduleTestMCQs,
            codeChallenges: moduleTestCoding,
            totalMarks: (20 * 2) + (2 * 25), // 20 MCQs * 2 marks + 2 coding * 25 marks = 90 marks
            passingScore: 70,
            isActive: true
          }
        }
      ],
      finalExam: {
        title: "JavaScript Fundamentals Final Exam",
        description: "Comprehensive final examination covering all JavaScript concepts",
        mcqs: finalExamMCQs,
        codeChallenges: finalExamCoding,
        totalMarks: (20 * 3) + (2 * 30), // 20 MCQs * 3 marks + 2 coding * 30 marks = 120 marks
        duration: 120, // 2 hours
        passingScore: 75,
        isSecure: true,
        securitySettings: {
          preventCopyPaste: true,
          preventTabSwitch: true,
          preventRightClick: true,
          fullScreenRequired: true,
          webcamMonitoring: false,
          timeLimit: 120
        },
        isActive: true
      },
      testUnlockThreshold: 80,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save the course
    const savedCourse = await dummyCourse.save();
    
    console.log('✅ Dummy course created successfully!');
    console.log(`📚 Course Title: ${savedCourse.title}`);
    console.log(`🆔 Course ID: ${savedCourse._id}`);
    console.log(`\n📊 Course Statistics:`);
    console.log(`   Topics: ${savedCourse.topics.length}`);
    console.log(`   Lessons: ${savedCourse.topics.reduce((acc, topic) => acc + topic.lessons.length, 0)}`);
    
    // Module Test Stats
    const moduleTest = savedCourse.topics[0].moduleTest;
    console.log(`\n🧪 Module Test:`);
    console.log(`   MCQs: ${moduleTest.mcqs.length}`);
    console.log(`   Coding Challenges: ${moduleTest.codeChallenges.length}`);
    console.log(`   Total Marks: ${moduleTest.totalMarks}`);
    console.log(`   Duration: ${moduleTest.duration} minutes`);
    
    // Final Exam Stats
    const finalExam = savedCourse.finalExam;
    console.log(`\n🎓 Final Exam:`);
    console.log(`   MCQs: ${finalExam.mcqs.length}`);
    console.log(`   Coding Challenges: ${finalExam.codeChallenges.length}`);
    console.log(`   Total Marks: ${finalExam.totalMarks}`);
    console.log(`   Duration: ${finalExam.duration} minutes`);
    
    console.log(`\n🎯 Summary:`);
    console.log(`   ✅ Module Test: ${moduleTest.mcqs.length} MCQs + ${moduleTest.codeChallenges.length} Coding`);
    console.log(`   ✅ Final Exam: ${finalExam.mcqs.length} MCQs + ${finalExam.codeChallenges.length} Coding`);
    
  } catch (error) {
    console.error('❌ Error creating dummy course:', error);
  } finally {
    mongoose.connection.close();
  }
}

createDummyCourse();
