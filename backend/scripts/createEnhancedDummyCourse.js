const mongoose = require('mongoose');
const Course = require('../models/Course');
const path = require('path');

// Load environment variables from the backend directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('MongoDB URI loaded:', process.env.MONGO_URI ? 'Yes' : 'No');

mongoose.connect(process.env.MONGO_URI);

async function createEnhancedDummyCourse() {
  try {
    console.log('🚀 Creating enhanced dummy course...\n');

    const dummyCourse = new Course({
      title: "Enhanced JavaScript Course",
      description: "Complete JavaScript course with all lesson formats",
      difficulty: "medium",
      topics: [
        {
          title: "JavaScript Fundamentals",
          description: "Learn JavaScript basics with different lesson formats",
          order: 1,
          lessons: [
            // Theory Lesson
            {
              title: "Introduction to JavaScript",
              format: "theory",
              content: `<h2>JavaScript Overview</h2><p>JavaScript is a programming language for web development.</p>`,
              review: "We learned about JavaScript basics and its applications.",
              files: [
                {
                  name: "JS Guide.pdf",
                  url: "/resources/js-guide.pdf",
                  type: "pdf",
                  size: 1024000
                }
              ],
              order: 1
            },
            // Syntax Lesson
            {
              title: "Variables and Data Types",
              format: "syntax",
              syntaxContent: `<h2>Variables</h2><p>Use let, const, and var to declare variables.</p>`,
              codeExamples: [
                {
                  title: "Variable Declaration",
                  code: `let name = "John";\nconst age = 25;\nvar city = "NYC";`,
                  explanation: "Different ways to declare variables",
                  language: "javascript"
                }
              ],
              order: 2
            },
            // MCQ Lesson
            {
              title: "JavaScript Quiz",
              format: "mcq",
              mcqs: [
                {
                  question: "Which keyword declares a constant?",
                  options: ["const", "let", "var", "final"],
                  correct: 0,
                  explanation: "const declares constants in JavaScript",
                  wrongExplanation: "const is the correct keyword for constants",
                  hint: "Think about unchangeable values",
                  marks: 2,
                  difficulty: "easy"
                }
              ],
              order: 3
            },
            // Coding Lesson
            {
              title: "Coding Practice",
              format: "coding",
              language: "javascript",
              codeChallenges: [
                {
                  title: "Sum Function",
                  description: "Create a function that adds two numbers",
                  sampleInput: "5, 3",
                  sampleOutput: "8",
                  constraints: "Numbers between 1-1000",
                  initialCode: "function sum(a, b) {\n  // Your code here\n  return 0;\n}",
                  language: "javascript",
                  marks: 10,
                  difficulty: "easy"
                }
              ],
              order: 4
            }
          ]
        }
      ]
    });

    const savedCourse = await dummyCourse.save();
    console.log('✅ Enhanced course created!');
    console.log(`Course ID: ${savedCourse._id}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createEnhancedDummyCourse();
