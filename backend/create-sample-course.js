// Script to create a sample course in MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('./models/Course');

async function createSampleCourse() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const sampleCourse = {
      title: "Python Programming Fundamentals",
      description: "Complete Python course covering basics to advanced topics including data structures, OOP, and more.",
      difficulty: "medium",
      isActive: true,
      testUnlockThreshold: 80,
      scoringConfig: {
        mcqMarks: 10,
        codingMarks: 50,
        lessonMcqMarks: 5,
        lessonCodingMarks: 25,
        moduleTestMcqMarks: 15,
        moduleTestCodingMarks: 75,
        finalExamMcqMarks: 20,
        finalExamCodingMarks: 100
      },
      modules: [
        {
          _id: new mongoose.Types.ObjectId(),
          title: "Python Basics",
          description: "Introduction to Python programming",
          order: 0,
          estimatedDuration: "2-3 hours",
          theory: {
            textContent: "Python is a high-level, interpreted programming language known for its simplicity and readability."
          },
          snippets: {
            codeExamples: [
              {
                title: "Hello World",
                description: "Basic print statement",
                code: "print('Hello, World!')",
                language: "python",
                category: "basics"
              }
            ]
          },
          lecture: {
            module: "Python Basics",
            lectures: [
              {
                topic: "Variables and Data Types",
                content: {
                  definition: ["Variables store data values"],
                  syntax: "variable_name = value",
                  examples: [],
                  keyTakeaways: ["Python is dynamically typed"],
                  practiceSection: {
                    ready_to_practice: "Yes",
                    description: "Practice with variables",
                    mcqs: "5 questions",
                    coding_challenges: "3 challenges"
                  }
                }
              }
            ],
            estimatedDuration: "30-45 min"
          },
          mcqs: [
            {
              question: "What is Python?",
              options: ["A snake", "A programming language", "A framework", "A database"],
              correct: 1,
              explanation: "Python is a high-level programming language",
              marks: 1,
              difficulty: "easy"
            }
          ],
          codeChallenges: [
            {
              title: "Print Your Name",
              description: "Write a program to print your name",
              sampleInput: "",
              sampleOutput: "John Doe",
              constraints: "Use print() function",
              initialCode: "# Write your code here\n",
              language: "python",
              marks: 2,
              difficulty: "easy",
              timeLimit: 30,
              testCases: []
            }
          ],
          moduleTest: {
            mcqs: [
              {
                question: "Which keyword is used to define a function?",
                options: ["function", "def", "func", "define"],
                correct: 1,
                explanation: "The 'def' keyword is used",
                marks: 1,
                difficulty: "easy"
              }
            ],
            codeChallenges: [],
            totalMarks: 100
          }
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: "Data Structures",
          description: "Learn about lists, tuples, dictionaries",
          order: 1,
          estimatedDuration: "3-4 hours",
          theory: {
            textContent: "Data structures are ways of organizing and storing data efficiently."
          },
          snippets: {
            codeExamples: []
          },
          lecture: {
            module: "Data Structures",
            lectures: [],
            estimatedDuration: "45-60 min"
          },
          mcqs: [],
          codeChallenges: [],
          moduleTest: {
            mcqs: [],
            codeChallenges: [],
            totalMarks: 100
          }
        }
      ],
      finalExam: {
        title: "Python Programming Final Exam",
        description: "Comprehensive assessment",
        duration: 120,
        totalMarks: 1000,
        passingScore: 70,
        isActive: true,
        isSecure: true,
        securitySettings: {
          preventCopyPaste: true,
          preventTabSwitch: true,
          preventRightClick: true,
          fullScreenRequired: true,
          webcamMonitoring: false
        },
        mcqs: [],
        codeChallenges: []
      }
    };

    console.log('\nCreating sample course...');
    const course = new Course(sampleCourse);
    await course.save();

    console.log('✅ Sample course created successfully!');
    console.log(`   ID: ${course._id}`);
    console.log(`   Title: ${course.title}`);
    console.log(`   Modules: ${course.modules.length}`);

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
    console.log('\n🎉 You can now view this course in Admin Edit Courses page!');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

createSampleCourse();
