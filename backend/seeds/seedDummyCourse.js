require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

(async function run() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('❌ MONGO_URI not set in .env');
    }

    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // 🧹 Remove existing demo course if any
    await Course.deleteMany({ title: 'MLRIT CodeHub Demo Course' });

    /* =======================================
       🧩 Create Dummy Course
    ======================================= */
    const demoCourse = new Course({
      title: 'MLRIT CodeHub Demo Course',
      description:
        'A sample course used for testing course module pages in MLRIT CodeHub.',
      difficulty: 'medium',
      modules: [
        /* ========== MODULE 1: Python Basics ========== */
        {
          title: 'Python Basics',
          description:
            'Introduction to Python programming and syntax fundamentals.',
          order: 1,
          theory: {
            textContent: `
# Python Basics

Welcome to the Python module!  
Learn **variables**, *data types*, and how to print values.

## Example
\`\`\`python
name = "Alice"
print("Hello", name)
\`\`\`
            `,
          },
          snippets: {
            codeExamples: [
              {
                title: 'Hello World',
                description: 'Prints a simple message.',
                code: `print("Hello, World!")`,
                language: 'python',
              },
              {
                title: 'Variables Example',
                description: 'How to declare and print variables.',
                code: `x = 10\ny = 20\nprint(x + y)`,
                language: 'python',
              },
            ],
          },
          lecture: {
            module: 'Python Basics',
            lectures: [
              {
                topic: 'Introduction to Python',
                content: {
                  definition: [
                    'Python is an interpreted, high-level programming language.',
                  ],
                  syntax: 'print("Hello, Python!")',
                  examples: [
                    {
                      title: 'Printing Example',
                      description: 'A basic example using the print() function.',
                      code: `print("Welcome to Python!")`,
                      explanation: ['The print() function displays output.'],
                    },
                  ],
                  keyTakeaways: [
                    'Python is beginner-friendly.',
                    'It uses indentation instead of braces.',
                  ],
                },
              },
            ],
          },
          mcqs: [
            {
              question: 'Which function displays output in Python?',
              options: ['echo()', 'output()', 'print()', 'display()'],
              correct: 2,
              explanation: 'Python uses print() to show output.',
              marks: 1,
              difficulty: 'easy',
            },
            {
              question: 'Which symbol starts a comment in Python?',
              options: ['#', '//', '/* */', '<!-- -->'],
              correct: 0,
              explanation: 'Python comments begin with #.',
              marks: 1,
              difficulty: 'easy',
            },
          ],
          codeChallenges: [
            {
              title: 'Sum of Two Numbers',
              description: 'Write a function that returns the sum of two numbers.',
              sampleInput: 'add_numbers(5, 3)',
              sampleOutput: '8',
              initialCode: `def add_numbers(a, b):\n    # Write your code here\n    pass`,
              testCases: [
                { input: 'add_numbers(2, 3)', expectedOutput: '5' },
                { input: 'add_numbers(10, 5)', expectedOutput: '15' },
              ],
              difficulty: 'easy',
              marks: 10,
              timeLimit: 60,
            },
          ],
          estimatedDuration: '2 hours',
        },

        /* ========== MODULE 2: Java Fundamentals ========== */
        {
          title: 'Java Fundamentals',
          description:
            'Learn Java syntax, data types, and object-oriented concepts.',
          order: 2,
          theory: {
            textContent: `
# Java Fundamentals

Learn the basics of **Java**, including syntax, data types, and object-oriented programming (OOP).

## Example
\`\`\`java
class Hello {
  public static void main(String[] args) {
    System.out.println("Hello, Java!");
  }
}
\`\`\`
            `,
          },
          snippets: {
            codeExamples: [
              {
                title: 'Hello Java',
                description: 'A simple Java program that prints text.',
                code: `public class Hello {\n  public static void main(String[] args) {\n    System.out.println("Hello, Java!");\n  }\n}`,
                language: 'java',
              },
            ],
          },
          lecture: {
            module: 'Java Fundamentals',
            lectures: [
              {
                topic: 'Intro to Java',
                content: {
                  definition: [
                    'Java is an object-oriented, platform-independent language.',
                  ],
                  syntax: 'System.out.println("Hello, Java!");',
                  examples: [
                    {
                      title: 'Output Example',
                      description: 'Java output example using System.out.println.',
                      code: `System.out.println("Welcome to Java!");`,
                      explanation: [
                        'The println() method prints output followed by a newline.',
                      ],
                    },
                  ],
                },
              },
            ],
          },
          mcqs: [
            {
              question: 'Which method is the entry point of a Java program?',
              options: ['start()', 'main()', 'run()', 'init()'],
              correct: 1,
              explanation: 'Every Java program begins with the main() method.',
              marks: 1,
              difficulty: 'medium',
            },
          ],
          codeChallenges: [
            {
              title: 'Find Maximum of Two Numbers',
              description: 'Write a function to find the maximum of two numbers in Java.',
              sampleInput: 'max(10, 20)',
              sampleOutput: '20',
              initialCode: `public static int max(int a, int b) {\n    // Write code here\n    return 0;\n}`,
              testCases: [
                { input: 'max(2,3)', expectedOutput: '3' },
                { input: 'max(5,1)', expectedOutput: '5' },
              ],
              difficulty: 'medium',
              marks: 10,
              timeLimit: 60,
            },
          ],
          estimatedDuration: '3 hours',
        },

        /* ========== MODULE 3: C Programming Basics ========== */
        {
          title: 'C Programming Basics',
          description:
            'Learn about variables, input/output, and loops in C programming.',
          order: 3,
          theory: {
            textContent: `
# C Programming Basics

Learn **variables**, *loops*, and *functions* in C.

## Example
\`\`\`c
#include <stdio.h>
int main() {
  printf("Hello, C!");
  return 0;
}
\`\`\`
            `,
          },
          snippets: {
            codeExamples: [
              {
                title: 'Hello in C',
                description: 'Displays output using printf.',
                code: `#include <stdio.h>\nint main() {\n  printf("Hello, C!");\n  return 0;\n}`,
                language: 'c',
              },
            ],
          },
          lecture: {
            module: 'C Programming Basics',
            lectures: [
              {
                topic: 'Introduction to C',
                content: {
                  definition: [
                    'C is a general-purpose programming language.',
                  ],
                  syntax: 'printf("Hello, C!");',
                  examples: [
                    {
                      title: 'Output Example',
                      description: 'Basic program in C.',
                      code: `#include <stdio.h>\nint main() {\n  printf("Hello, World!");\n  return 0;\n}`,
                      explanation: ['printf() outputs text to the screen.'],
                    },
                  ],
                },
              },
            ],
          },
          mcqs: [
            {
              question: 'Which header file is required for printf() in C?',
              options: ['stdlib.h', 'stdio.h', 'string.h', 'math.h'],
              correct: 1,
              explanation: 'printf() is declared in stdio.h.',
              marks: 1,
              difficulty: 'easy',
            },
          ],
          codeChallenges: [
            {
              title: 'Sum of Array Elements',
              description: 'Write a C program to sum all elements in an array.',
              sampleInput: 'arr = [1,2,3,4,5]',
              sampleOutput: '15',
              initialCode: `#include <stdio.h>\nint main() {\n  int arr[] = {1,2,3,4,5};\n  int sum = 0;\n  // Write code to calculate sum\n  return 0;\n}`,
              testCases: [
                { input: '[1,2,3,4,5]', expectedOutput: '15' },
                { input: '[10,20,30]', expectedOutput: '60' },
              ],
              difficulty: 'medium',
              marks: 15,
              timeLimit: 120,
            },
          ],
          estimatedDuration: '2 hours',
        },
      ],
    });

    /* ✅ Normalize difficulty values (safe for enum validation) */
    demoCourse.difficulty = demoCourse.difficulty.toLowerCase();

    demoCourse.modules.forEach((mod) => {
      if (mod.difficulty) mod.difficulty = mod.difficulty.toLowerCase();
      if (mod.mcqs)
        mod.mcqs = mod.mcqs.map((q) => ({
          ...q,
          difficulty: q.difficulty?.toLowerCase() || 'medium',
        }));
      if (mod.codeChallenges)
        mod.codeChallenges = mod.codeChallenges.map((ch) => ({
          ...ch,
          difficulty: ch.difficulty?.toLowerCase() || 'medium',
        }));
    });

    /* ✅ Save course */
    const savedCourse = await demoCourse.save();

    console.log('🎉 Dummy Course Created Successfully!');
    console.log('📘 Course ID:', savedCourse._id.toString());
    savedCourse.modules.forEach((m, i) =>
      console.log(`📦 Module ${i + 1} ID: ${m._id.toString()} (${m.title})`)
    );

    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed successfully.');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
})();
