const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../models/Course');

const COURSE_ID = '690c993dcb21cbd98ce292d8';

// Comprehensive Final Exam Data
const finalExamData = {
  title: "Comprehensive Programming Final Exam",
  description: "A comprehensive final examination covering Python, Java, and C programming concepts including basics, control structures, functions, and data structures.",
  duration: 120, // 2 hours
  totalMarks: 436, // Actual sum: 236 (MCQ) + 200 (Coding) = 436
  passingScore: 70, // percentage
  isActive: true,
  mcqs: [
    // Python Questions
    {
      question: "What is the output of the following Python code?\n```python\nx = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)\n```",
      options: [
        "[1, 2, 3]",
        "[1, 2, 3, 4]",
        "[4]",
        "Error"
      ],
      correct: 1,
      explanation: "In Python, lists are mutable and y = x creates a reference to the same list object, so modifying y also modifies x.",
      marks: 15,
      difficulty: "medium"
    },
    {
      question: "Which of the following is NOT a valid Python data type?",
      options: [
        "list",
        "tuple",
        "dictionary",
        "array"
      ],
      correct: 3,
      explanation: "While Python has list, tuple, and dictionary as built-in types, 'array' is not a built-in type (though it exists in the array module).",
      marks: 10,
      difficulty: "easy"
    },
    {
      question: "What does the following Python expression evaluate to?\n```python\n'Hello' + 'World' * 2\n```",
      options: [
        "HelloWorldWorld",
        "HelloWorld2",
        "HelloWorldHelloWorld",
        "Error"
      ],
      correct: 0,
      explanation: "String concatenation with + and repetition with * - 'World' * 2 becomes 'WorldWorld', then concatenated with 'Hello'.",
      marks: 12,
      difficulty: "medium"
    },
    {
      question: "In Python, which method is used to remove and return an element from a list?",
      options: [
        "remove()",
        "delete()",
        "pop()",
        "extract()"
      ],
      correct: 2,
      explanation: "The pop() method removes and returns an element from a list at a specified index (or last element if no index is given).",
      marks: 10,
      difficulty: "easy"
    },
    {
      question: "What is the result of the following Python code?\n```python\ndef func(a, b=2, c=3):\n    return a + b + c\nprint(func(1, c=5))\n```",
      options: [
        "6",
        "8",
        "9",
        "Error"
      ],
      correct: 1,
      explanation: "func(1, c=5) uses a=1, default b=2, and c=5, so 1+2+5=8.",
      marks: 15,
      difficulty: "hard"
    },

    // Java Questions
    {
      question: "Which of the following is the correct way to declare a constant in Java?",
      options: [
        "const int x = 10;",
        "final int x = 10;",
        "static int x = 10;",
        "readonly int x = 10;"
      ],
      correct: 1,
      explanation: "In Java, the 'final' keyword is used to declare constants.",
      marks: 10,
      difficulty: "easy"
    },
    {
      question: "What is the output of the following Java code?\n```java\nint[] arr = {1, 2, 3, 4, 5};\nSystem.out.println(arr.length);\n```",
      options: [
        "4",
        "5",
        "Error",
        "undefined"
      ],
      correct: 1,
      explanation: "The length property of an array in Java returns the number of elements, which is 5.",
      marks: 10,
      difficulty: "easy"
    },
    {
      question: "Which access modifier in Java makes a member accessible only within the same class?",
      options: [
        "public",
        "protected",
        "private",
        "default"
      ],
      correct: 2,
      explanation: "The 'private' access modifier restricts access to the same class only.",
      marks: 12,
      difficulty: "medium"
    },
    {
      question: "What does the following Java code output?\n```java\nString s1 = \"Hello\";\nString s2 = \"Hello\";\nSystem.out.println(s1 == s2);\n```",
      options: [
        "true",
        "false",
        "Error",
        "null"
      ],
      correct: 0,
      explanation: "String literals in Java are stored in the string pool, so s1 and s2 reference the same object.",
      marks: 15,
      difficulty: "hard"
    },
    {
      question: "Which Java keyword is used to inherit from a class?",
      options: [
        "inherits",
        "extends",
        "implements",
        "super"
      ],
      correct: 1,
      explanation: "The 'extends' keyword is used for class inheritance in Java.",
      marks: 10,
      difficulty: "easy"
    },

    // C Programming Questions
    {
      question: "What is the correct syntax to declare a pointer in C?",
      options: [
        "int ptr;",
        "int *ptr;",
        "pointer int ptr;",
        "int &ptr;"
      ],
      correct: 1,
      explanation: "In C, pointers are declared using the asterisk (*) symbol before the variable name.",
      marks: 10,
      difficulty: "easy"
    },
    {
      question: "What does the following C code output?\n```c\nint x = 5;\nprintf(\"%d %d\", ++x, x++);\n```",
      options: [
        "6 5",
        "5 6",
        "6 6",
        "Undefined behavior"
      ],
      correct: 3,
      explanation: "This code has undefined behavior because x is modified multiple times between sequence points.",
      marks: 18,
      difficulty: "hard"
    },
    {
      question: "Which function is used to allocate memory dynamically in C?",
      options: [
        "alloc()",
        "malloc()",
        "memory()",
        "new()"
      ],
      correct: 1,
      explanation: "malloc() (memory allocation) is the standard function for dynamic memory allocation in C.",
      marks: 12,
      difficulty: "medium"
    },
    {
      question: "What is the size of 'int' data type in C on most modern systems?",
      options: [
        "2 bytes",
        "4 bytes",
        "8 bytes",
        "It depends on the system"
      ],
      correct: 3,
      explanation: "The size of 'int' in C is implementation-dependent, though it's commonly 4 bytes on modern systems.",
      marks: 10,
      difficulty: "medium"
    },
    {
      question: "Which header file contains the declaration of malloc() and free()?",
      options: [
        "<stdio.h>",
        "<stdlib.h>",
        "<string.h>",
        "<memory.h>"
      ],
      correct: 1,
      explanation: "The <stdlib.h> header file contains declarations for memory allocation functions like malloc() and free().",
      marks: 10,
      difficulty: "easy"
    },

    // General Programming Concepts
    {
      question: "What is the time complexity of binary search?",
      options: [
        "O(n)",
        "O(n log n)",
        "O(log n)",
        "O(1)"
      ],
      correct: 2,
      explanation: "Binary search has O(log n) time complexity as it halves the search space in each iteration.",
      marks: 15,
      difficulty: "medium"
    },
    {
      question: "Which data structure follows the Last In, First Out (LIFO) principle?",
      options: [
        "Queue",
        "Stack",
        "Array",
        "Linked List"
      ],
      correct: 1,
      explanation: "A stack follows the LIFO (Last In, First Out) principle where the last element added is the first to be removed.",
      marks: 10,
      difficulty: "easy"
    },
    {
      question: "What is recursion in programming?",
      options: [
        "A loop that runs indefinitely",
        "A function calling another function",
        "A function calling itself",
        "A conditional statement"
      ],
      correct: 2,
      explanation: "Recursion is a programming technique where a function calls itself to solve smaller instances of the same problem.",
      marks: 12,
      difficulty: "medium"
    },
    {
      question: "Which of the following is NOT a characteristic of Object-Oriented Programming?",
      options: [
        "Encapsulation",
        "Inheritance",
        "Polymorphism",
        "Compilation"
      ],
      correct: 3,
      explanation: "Compilation is a process of translating code, not a characteristic of OOP. The main characteristics are encapsulation, inheritance, polymorphism, and abstraction.",
      marks: 12,
      difficulty: "medium"
    },
    {
      question: "What does API stand for?",
      options: [
        "Application Programming Interface",
        "Advanced Programming Implementation",
        "Automated Program Instruction",
        "Application Process Integration"
      ],
      correct: 0,
      explanation: "API stands for Application Programming Interface, which defines how software components should interact.",
      marks: 8,
      difficulty: "easy"
    }
  ],
  codeChallenges: [
    {
      title: "Array Sum Calculator",
      description: "Write a program that calculates the sum of all elements in an array. The program should handle arrays of different sizes and return the total sum.",
      initialCode: "# Write a function to calculate sum of array elements\ndef array_sum(arr):\n    # Your code here\n    pass\n\n# Test the function\ntest_array = [1, 2, 3, 4, 5]\nresult = array_sum(test_array)\nprint(f\"Sum: {result}\")",
      language: "python",
      marks: 40,
      difficulty: "easy",
      timeLimit: 600, // 10 minutes
      testCases: [
        {
          input: "[1, 2, 3, 4, 5]",
          expectedOutput: "Sum: 15",
          isHidden: false
        },
        {
          input: "[10, 20, 30]",
          expectedOutput: "Sum: 60",
          isHidden: true
        },
        {
          input: "[]",
          expectedOutput: "Sum: 0",
          isHidden: true
        }
      ]
    },
    {
      title: "Palindrome Checker",
      description: "Create a function that checks if a given string is a palindrome (reads the same forwards and backwards). Ignore case and spaces.",
      initialCode: "def is_palindrome(s):\n    # Remove spaces and convert to lowercase\n    # Your code here\n    pass\n\n# Test the function\ntest_string = \"A man a plan a canal Panama\"\nresult = is_palindrome(test_string)\nprint(f\"Is palindrome: {result}\")",
      language: "python",
      marks: 50,
      difficulty: "medium",
      timeLimit: 900, // 15 minutes
      testCases: [
        {
          input: "A man a plan a canal Panama",
          expectedOutput: "Is palindrome: True",
          isHidden: false
        },
        {
          input: "race a car",
          expectedOutput: "Is palindrome: False",
          isHidden: true
        },
        {
          input: "Was it a rat I saw",
          expectedOutput: "Is palindrome: True",
          isHidden: true
        }
      ]
    },
    {
      title: "Fibonacci Sequence Generator",
      description: "Write a function that generates the first n numbers in the Fibonacci sequence. The Fibonacci sequence starts with 0, 1, and each subsequent number is the sum of the two preceding ones.",
      initialCode: "def fibonacci(n):\n    # Generate first n Fibonacci numbers\n    # Your code here\n    pass\n\n# Test the function\nn = 8\nfib_sequence = fibonacci(n)\nprint(f\"First {n} Fibonacci numbers: {fib_sequence}\")",
      language: "python",
      marks: 60,
      difficulty: "medium",
      timeLimit: 1200, // 20 minutes
      testCases: [
        {
          input: "8",
          expectedOutput: "First 8 Fibonacci numbers: [0, 1, 1, 2, 3, 5, 8, 13]",
          isHidden: false
        },
        {
          input: "5",
          expectedOutput: "First 5 Fibonacci numbers: [0, 1, 1, 2, 3]",
          isHidden: true
        },
        {
          input: "1",
          expectedOutput: "First 1 Fibonacci numbers: [0]",
          isHidden: true
        }
      ]
    },
    {
      title: "Prime Number Checker",
      description: "Create a function that determines if a given number is prime. A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.",
      initialCode: "def is_prime(num):\n    # Check if number is prime\n    # Your code here\n    pass\n\n# Test the function\ntest_numbers = [17, 18, 19, 20]\nfor num in test_numbers:\n    result = is_prime(num)\n    print(f\"{num} is prime: {result}\")",
      language: "python",
      marks: 50,
      difficulty: "medium",
      timeLimit: 900, // 15 minutes
      testCases: [
        {
          input: "17",
          expectedOutput: "17 is prime: True",
          isHidden: false
        },
        {
          input: "18",
          expectedOutput: "18 is prime: False",
          isHidden: true
        },
        {
          input: "2",
          expectedOutput: "2 is prime: True",
          isHidden: true
        }
      ]
    }
  ],
  attempts: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

async function addFinalExamToCourse() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the course
    const course = await Course.findById(COURSE_ID);
    if (!course) {
      console.error(`❌ Course with ID ${COURSE_ID} not found`);
      return;
    }

    console.log(`📚 Found course: ${course.title}`);
    console.log(`📊 Current final exam status: ${course.finalExam ? 'EXISTS' : 'NOT EXISTS'}`);

    // Add or update the final exam
    course.finalExam = finalExamData;
    
    console.log('\n🎯 Final Exam Details:');
    console.log(`   📋 Title: ${finalExamData.title}`);
    console.log(`   ⏰ Duration: ${finalExamData.duration} minutes`);
    console.log(`   🎯 Total Marks: ${finalExamData.totalMarks}`);
    console.log(`   📊 Passing Score: ${finalExamData.passingScore}%`);
    console.log(`   📝 MCQs: ${finalExamData.mcqs.length}`);
    console.log(`   💻 Code Challenges: ${finalExamData.codeChallenges.length}`);
    console.log(`   🟢 Status: ${finalExamData.isActive ? 'Active' : 'Inactive'}`);

    // Validate MCQs
    console.log('\n🔍 Validating Final Exam Questions...');
    finalExamData.mcqs.forEach((mcq, index) => {
      console.log(`Validating MCQ ${index + 1}: ${mcq.question.substring(0, 50)}...`);
      if (mcq.correct < 0 || mcq.correct >= mcq.options.length) {
        console.warn(`⚠️  MCQ ${index + 1} has invalid correct answer index: ${mcq.correct}`);
      }
    });

    finalExamData.codeChallenges.forEach((challenge, index) => {
      console.log(`Validating Code Challenge ${index + 1}: ${challenge.title}`);
    });

    // Save the updated course
    await course.save();
    console.log(`\n🎉 Successfully added final exam to course "${course.title}"`);
    
    // Display final statistics
    console.log('\n📊 Final Exam Statistics:');
    console.log(`   📚 Course: ${course.title}`);
    console.log(`   📝 Total Questions: ${finalExamData.mcqs.length + finalExamData.codeChallenges.length}`);
    console.log(`   🎯 Total Marks: ${finalExamData.totalMarks}`);
    console.log(`   ⏰ Duration: ${finalExamData.duration} minutes`);
    
    const mcqMarks = finalExamData.mcqs.reduce((sum, mcq) => sum + mcq.marks, 0);
    const codingMarks = finalExamData.codeChallenges.reduce((sum, challenge) => sum + challenge.marks, 0);
    console.log(`   📊 MCQ Marks: ${mcqMarks}`);
    console.log(`   💻 Coding Marks: ${codingMarks}`);
    console.log(`   🏁 Status: Final exam is ready for students!`);

  } catch (err) {
    console.error('❌ Error adding final exam:', err);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

// Run the script
console.log('🚀 Starting Final Exam Addition Process...\n');
addFinalExamToCourse();