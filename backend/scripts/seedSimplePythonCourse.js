require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mlrit-code-hub';

console.log('Connecting to MongoDB Atlas...');
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('Connected to MongoDB Atlas successfully!');
})
.catch((error) => {
  console.error('MongoDB Atlas connection error:', error);
  process.exit(1);
});

const pythonCourseData = {
  title: "Complete Python Programming Course",
  description: "Learn Python from basics to advanced concepts with hands-on projects and real-world applications.",
  instructor: "Python Expert",
  difficulty: "easy",
  duration: "8-10 weeks",
  modules: [
    {
      title: "Introduction to Python",
      description: "Learn the fundamentals of Python programming language, its features, and how to set up your development environment.",
      order: 1,
      
      // Theory Content
      theory: {
        textContent: `
          # What is Python?
          
          Python is a high-level, interpreted programming language known for its simplicity
          and readability. Created by Guido van Rossum and first released in 1991, Python has
          become one of the most popular programming languages in the world.
          
          ## Key Features
          - Easy to learn and read syntax
          - Interpreted language - no compilation needed
          - Dynamically typed
          - Object-oriented programming support
          - Extensive standard library
          - Large community and ecosystem
          
          ## Why Learn Python?
          Python is versatile and used in various domains including web development,
          data science, machine learning, automation, and more. Its clear syntax makes it
          an excellent first programming language for beginners.
          
          ### Python Applications:
          - Web Development (Django, Flask)
          - Data Analysis (Pandas, NumPy)
          - Machine Learning (TensorFlow, PyTorch)
          - Automation and Scripting
          - Scientific Computing
        `,
        files: {
          pdf: {
            name: 'Introduction_to_Python.pdf',
            url: '/sample-files/python-introduction.pdf',
            downloadUrl: '/sample-files/python-introduction.pdf'
          },
          ppt: {
            name: 'Python_Introduction.pptx',
            url: '/sample-files/python-presentation.pptx',
            slides: [
              { title: 'What is Python?', content: 'Introduction to Python programming language', slideNumber: 1 },
              { title: 'Key Features', content: 'Python features and advantages', slideNumber: 2 },
              { title: 'Installation', content: 'How to install and set up Python', slideNumber: 3 }
            ],
            totalSlides: 3
          },
          doc: {
            name: 'Python_Basics.docx',
            url: '/sample-files/python-documentation.docx',
            downloadUrl: '/sample-files/python-documentation.docx'
          }
        }
      },
      
      // Snippets Content
      snippets: {
        codeExamples: [
          {
            title: "Hello World",
            description: "Basic print statement in Python",
            code: 'print("Hello, World!")',
            language: "python",
            category: "basics",
            tags: ["print", "string"]
          },
          {
            title: "Variables",
            description: "Creating and using variables",
            code: 'name = "Python"\nversion = 3.9\nprint(f"{name} {version}")',
            language: "python",
            category: "variables",
            tags: ["variables", "f-string"]
          }
        ]
      },
      
      // Lecture Content
      lecture: {
        sections: [
          {
            title: "Introduction",
            content: "Welcome to Python programming! In this section, we'll explore what makes Python special.",
            examples: ["print('Hello, World!')", "# This is a comment"],
            order: 1
          },
          {
            title: "Getting Started",
            content: "Let's set up Python and write our first program.",
            examples: ["python --version", "pip install package"],
            order: 2
          }
        ],
        estimatedDuration: "45 min"
      },
      
      // MCQ Questions
      mcqs: [
        {
          question: "Who created the Python programming language?",
          options: ["Guido van Rossum", "Dennis Ritchie", "Bjarne Stroustrup", "James Gosling"],
          correct: 0,
          explanation: "Python was created by Guido van Rossum and first released in 1991.",
          marks: 5
        },
        {
          question: "Which of the following is NOT a key feature of Python?",
          options: ["Easy to read syntax", "Compiled language", "Dynamically typed", "Object-oriented support"],
          correct: 1,
          explanation: "Python is an interpreted language, not a compiled language.",
          marks: 5
        }
      ],
      
      // Code Challenges
      codeChallenges: [
        {
          title: "Hello World Program",
          description: "Write a Python program that prints 'Hello, World!' to the console.",
          initialCode: "# Write your code here\n",
          sampleInput: "",
          sampleOutput: "Hello, World!",
          constraints: "Use the print() function",
          language: "python",
          marks: 10
        }
      ],
      
      // Module Test
      moduleTest: {
        mcqs: [
          {
            question: "Python is primarily known for which characteristic?",
            options: ["Speed of execution", "Readability and simplicity", "Memory efficiency", "Complex syntax"],
            correct: 1,
            explanation: "Python is primarily known for its readable and simple syntax that makes it easy to learn and use.",
            marks: 10
          }
        ],
        codeChallenges: [
          {
            title: "Python Basics Assessment",
            description: "Create a program that demonstrates basic Python concepts: variables, print statements, and comments.",
            initialCode: "# Python Basics Assessment\n# Create variables and print them\n\n",
            sampleInput: "",
            sampleOutput: "Name: Python\nYear: 1991\nIs Popular: True",
            constraints: "Use variables for name, year, and popularity. Include comments.",
            language: "python",
            marks: 25
          }
        ],
        totalMarks: 35
      },
      
      estimatedDuration: "2-3 hours",
      prerequisites: [],
      learningObjectives: [
        "Understand what Python is and its key features",
        "Set up Python development environment",
        "Write basic Python programs"
      ]
    }
  ],
  finalExam: {
    title: "Python Programming Final Assessment",
    description: "Comprehensive test covering all Python fundamentals learned in the course",
    mcqs: [
      {
        question: "What is the correct way to create a comment in Python?",
        options: ["// This is a comment", "/* This is a comment */", "# This is a comment", "<!-- This is a comment -->"],
        correct: 2,
        explanation: "In Python, comments start with the # symbol.",
        marks: 5
      },
      {
        question: "Which of the following is the correct way to create a list in Python?",
        options: ["list = (1, 2, 3)", "list = [1, 2, 3]", "list = {1, 2, 3}", "list = <1, 2, 3>"],
        correct: 1,
        explanation: "Lists in Python are created using square brackets [].",
        marks: 5
      },
      {
        question: "What will len('Python') return?",
        options: ["5", "6", "7", "Error"],
        correct: 1,
        explanation: "The string 'Python' has 6 characters, so len('Python') returns 6.",
        marks: 5
      }
    ],
    codeChallenges: [
      {
        title: "Python Fundamentals Project",
        description: "Create a simple calculator program that can perform basic arithmetic operations.",
        initialCode: "# Simple Calculator\n# Implement functions for add, subtract, multiply, divide\n\n",
        sampleInput: "10 5 +",
        sampleOutput: "Result: 15",
        constraints: "Handle division by zero and invalid operations",
        language: "python",
        marks: 50
      }
    ],
    duration: 120,
    totalMarks: 65,
    passingScore: 70,
    isActive: true
  },
  enrolledUsers: [],
  enrolledCount: 0,
  isActive: true,
  testUnlockThreshold: 80
};

async function seedPythonCourse() {
  try {
    // Check if course already exists
    const existingCourse = await Course.findOne({ title: pythonCourseData.title });
    
    if (existingCourse) {
      console.log('Python course already exists. Updating...');
      await Course.findByIdAndUpdate(existingCourse._id, pythonCourseData);
      console.log('Python course updated successfully!');
    } else {
      console.log('Creating new Python course...');
      const course = new Course(pythonCourseData);
      await course.save();
      console.log('Python course created successfully!');
    }
    
    const course = await Course.findOne({ title: pythonCourseData.title });
    console.log('Course ID:', course._id);
    console.log('Course has', course.modules?.length || 0, 'modules');
    
  } catch (error) {
    console.error('Error seeding Python course:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeding function
seedPythonCourse();
