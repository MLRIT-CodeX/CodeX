const mongoose = require('mongoose');
const Course = require('../models/Course');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function createUnifiedModuleCourse() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('🚀 Creating unified module course...');

    const unifiedCourse = new Course({
      title: "JavaScript Unified Course",
      description: "Complete JavaScript course with unified module structure",
      difficulty: "intermediate",
      structureType: "unified",
      
      settings: {
        enableWPSViewer: true,
        enablePresentationMode: true,
        autoSaveProgress: true,
        allowSkipSections: false
      },
      
      modules: [
        {
          title: "JavaScript Fundamentals",
          description: "Core JavaScript concepts",
          order: 1,
          difficulty: "beginner",
          estimatedDuration: "2-3 hours",
          
          theoryContent: {
            title: "JavaScript Theory",
            displayMode: "document",
            content: `<h2>JavaScript Basics</h2><p>JavaScript is a programming language for web development.</p><h3>Variables</h3><p>Use let, const, and var to declare variables.</p>`,
            files: [
              {
                name: "JS Guide.pdf",
                url: "/resources/js-guide.pdf",
                type: "pdf",
                size: 1024000
              }
            ]
          },
          
          codeSnippets: {
            title: "Code Examples",
            snippets: [
              {
                title: "Variables",
                code: `let name = "John";\nconst age = 25;\nvar city = "NYC";`,
                description: "Variable declaration examples",
                language: "javascript"
              }
            ]
          },
          
          lectureContent: {
            title: "JavaScript Lecture",
            content: `<h2>Learning JavaScript</h2><p>Interactive lecture content.</p>`,
            videoUrl: "https://example.com/js-lecture"
          },
          
          mcqSection: {
            title: "Practice Questions",
            isRequired: true,
            passingScore: 70,
            mcqs: [
              {
                question: "Which keyword declares a constant?",
                options: ["const", "let", "var", "final"],
                correct: 0,
                explanation: "const declares constants in JavaScript",
                wrongExplanation: "const is the correct keyword",
                hint: "Think about unchangeable values",
                marks: 2,
                difficulty: "easy"
              }
            ]
          },
          
          codingSection: {
            title: "Coding Practice",
            isRequired: false,
            challenges: [
              {
                title: "Sum Function",
                description: "Create a function that adds two numbers",
                sampleInput: "5, 3",
                sampleOutput: "8",
                constraints: "Numbers between 1-1000",
                initialCode: "function sum(a, b) {\n  return 0;\n}",
                language: "javascript",
                marks: 10,
                difficulty: "easy"
              }
            ]
          },
          
          moduleTest: {
            title: "Module Assessment",
            description: "Test your JavaScript knowledge",
            duration: 60,
            passingScore: 70,
            mcqs: [
              {
                question: "What is JavaScript?",
                options: ["Programming language", "Database", "OS", "Browser"],
                correct: 0,
                explanation: "JavaScript is a programming language",
                marks: 5,
                difficulty: "easy"
              }
            ],
            codeChallenges: [
              {
                title: "Variable Test",
                description: "Declare a variable with value 42",
                sampleInput: "",
                sampleOutput: "42",
                initialCode: "// Declare variable here",
                language: "javascript",
                marks: 15,
                difficulty: "easy"
              }
            ],
            totalMarks: 20
          }
        }
      ]
    });

    const savedCourse = await unifiedCourse.save();
    console.log('✅ Course created successfully!');
    console.log(`Course ID: ${savedCourse._id}`);
    console.log(`Modules: ${savedCourse.modules.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

createUnifiedModuleCourse();
