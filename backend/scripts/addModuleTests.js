const mongoose = require('mongoose');
require('dotenv').config();

// Import your Course model (adjust the path as needed)
const Course = require('../models/Course');

const COURSE_ID = '690c993dcb21cbd98ce292d8';

const moduleTestsData = [
  {
    moduleIndex: 0, // First module
    moduleTest: {
      title: "Python Basics Assessment",
      description: "Test your understanding of Python fundamentals including variables, data types, and basic operations.",
      duration: 30, // minutes
      totalMarks: 100,
      passingScore: 70, // percentage
      mcqs: [
        {
          question: "What is the correct way to declare a variable in Python?",
          options: [
            "var x = 5",
            "x = 5",
            "int x = 5",
            "declare x = 5"
          ],
          correct: 1,
          explanation: "In Python, you simply assign a value to a variable name without declaring its type.",
          marks: 10
        },
        {
          question: "Which of the following is a mutable data type in Python?",
          options: [
            "String",
            "Tuple",
            "List",
            "Integer"
          ],
          correct: 2,
          explanation: "Lists are mutable, meaning their contents can be changed after creation.",
          marks: 10
        },
        {
          question: "What will be the output of: print(type(3.14))?",
          options: [
            "<class 'int'>",
            "<class 'float'>",
            "<class 'double'>",
            "<class 'decimal'>"
          ],
          correct: 1,
          explanation: "3.14 is a floating-point number, so its type is float.",
          marks: 10
        },
        {
          question: "Which operator is used for floor division in Python?",
          options: [
            "/",
            "//",
            "%",
            "**"
          ],
          correct: 1,
          explanation: "The // operator performs floor division, returning the largest integer less than or equal to the result.",
          marks: 10
        },
        {
          question: "What is the correct syntax for a multi-line comment in Python?",
          options: [
            "/* comment */",
            "// comment",
            "# comment",
            '"""comment"""'
          ],
          correct: 3,
          explanation: "Triple quotes (\"\"\" or ''') are used for multi-line comments/docstrings in Python.",
          marks: 10
        }
      ],
      codeChallenges: [
        {
          title: "Variable Assignment and Operations",
          description: "Write a Python program that demonstrates variable assignment and basic arithmetic operations.",
          problem: `Create variables for two numbers and perform the following operations:
1. Addition
2. Subtraction
3. Multiplication
4. Division
5. Print the results

Example:
num1 = 10
num2 = 3
# Perform operations and print results`,
          initialCode: `# Write your code here
num1 = 
num2 = 

# Perform operations
addition = 
subtraction = 
multiplication = 
division = 

# Print results
print("Addition:", addition)
print("Subtraction:", subtraction)
print("Multiplication:", multiplication)
print("Division:", division)`,
          testCases: [
            {
              input: "",
              expectedOutput: "Addition: 13\nSubtraction: 7\nMultiplication: 30\nDivision: 3.3333333333333335",
              description: "Basic arithmetic operations with num1=10, num2=3"
            }
          ],
          marks: 25,
          timeLimit: 300 // 5 minutes in seconds
        },
        {
          title: "String Manipulation",
          description: "Write a Python program to manipulate strings using built-in methods.",
          problem: `Given a string, perform the following operations:
1. Convert to uppercase
2. Convert to lowercase
3. Count the number of characters
4. Replace a specific character

Write a program that takes a string and demonstrates these operations.`,
          initialCode: `# Write your code here
text = "Hello World"

# Convert to uppercase
uppercase_text = 

# Convert to lowercase
lowercase_text = 

# Count characters
char_count = 

# Replace 'o' with '0'
replaced_text = 

# Print results
print("Original:", text)
print("Uppercase:", uppercase_text)
print("Lowercase:", lowercase_text)
print("Character count:", char_count)
print("Replaced:", replaced_text)`,
          testCases: [
            {
              input: "",
              expectedOutput: "Original: Hello World\nUppercase: HELLO WORLD\nLowercase: hello world\nCharacter count: 11\nReplaced: Hell0 W0rld",
              description: "String manipulation operations"
            }
          ],
          marks: 25,
          timeLimit: 300
        }
      ],
      isActive: true,
      attempts: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    moduleIndex: 1, // Second module
    moduleTest: {
      title: "Control Structures Assessment",
      description: "Test your knowledge of if statements, loops, and control flow in Python.",
      duration: 45,
      totalMarks: 150,
      passingScore: 75,
      mcqs: [
        {
          question: "What is the correct syntax for an if statement in Python?",
          options: [
            "if (x > 5) {",
            "if x > 5:",
            "if x > 5 then:",
            "if (x > 5):"
          ],
          correct: 1,
          explanation: "Python uses a colon (:) after the condition and doesn't require parentheses or braces.",
          marks: 10
        },
        {
          question: "Which loop is used when you know the number of iterations in advance?",
          options: [
            "while loop",
            "for loop",
            "do-while loop",
            "repeat loop"
          ],
          correct: 1,
          explanation: "For loops are typically used when the number of iterations is known or when iterating over a sequence.",
          marks: 10
        },
        {
          question: "What keyword is used to exit a loop prematurely?",
          options: [
            "exit",
            "stop",
            "break",
            "end"
          ],
          correct: 2,
          explanation: "The 'break' keyword is used to exit a loop before all iterations are complete.",
          marks: 10
        },
        {
          question: "What does the 'continue' statement do in a loop?",
          options: [
            "Exits the loop",
            "Skips the rest of the current iteration",
            "Restarts the loop",
            "Pauses the loop"
          ],
          correct: 1,
          explanation: "The 'continue' statement skips the remaining code in the current iteration and moves to the next iteration.",
          marks: 10
        },
        {
          question: "What will be the output of: range(1, 5)?",
          options: [
            "[1, 2, 3, 4, 5]",
            "[1, 2, 3, 4]",
            "[0, 1, 2, 3, 4]",
            "[2, 3, 4, 5]"
          ],
          correct: 1,
          explanation: "range(1, 5) generates numbers from 1 to 4 (5 is excluded).",
          marks: 10
        }
      ],
      codeChallenges: [
        {
          title: "Number Guessing Game",
          description: "Create a simple number guessing game using loops and conditionals.",
          problem: `Write a program that:
1. Sets a target number (e.g., 7)
2. Uses a loop to ask the user to guess
3. Provides feedback (too high, too low, correct)
4. Breaks when the correct number is guessed

For this exercise, simulate user input with a list of guesses: [5, 10, 7]`,
          initialCode: `# Write your code here
target = 7
guesses = [5, 10, 7]

for guess in guesses:
    # Write your logic here
    print(f"Guess: {guess}")
    
    # Add conditional logic
    
    # Break if correct
`,
          testCases: [
            {
              input: "",
              expectedOutput: "Guess: 5\nToo low!\nGuess: 10\nToo high!\nGuess: 7\nCorrect!",
              description: "Number guessing game logic"
            }
          ],
          marks: 50,
          timeLimit: 600
        },
        {
          title: "Pattern Printing",
          description: "Use nested loops to print a number pattern.",
          problem: `Write a program to print the following pattern:
1
12
123
1234
12345

Use nested loops to generate this pattern.`,
          initialCode: `# Write your code here
rows = 5

# Use nested loops to print the pattern
for i in range(1, rows + 1):
    # Inner loop logic here
    pass`,
          testCases: [
            {
              input: "",
              expectedOutput: "1\n12\n123\n1234\n12345",
              description: "Number pattern using nested loops"
            }
          ],
          marks: 50,
          timeLimit: 600
        }
      ],
      isActive: true,
      attempts: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    moduleIndex: 2, // Third module
    moduleTest: {
      title: "Functions and Data Structures Assessment",
      description: "Evaluate your understanding of functions, lists, dictionaries, and other data structures in Python.",
      duration: 60,
      totalMarks: 200,
      passingScore: 80,
      mcqs: [
        {
          question: "What keyword is used to define a function in Python?",
          options: [
            "function",
            "def",
            "func",
            "define"
          ],
          correct: 1,
          explanation: "The 'def' keyword is used to define functions in Python.",
          marks: 10
        },
        {
          question: "Which method is used to add an element to the end of a list?",
          options: [
            "add()",
            "insert()",
            "append()",
            "push()"
          ],
          correct: 2,
          explanation: "The append() method adds an element to the end of a list.",
          marks: 10
        },
        {
          question: "How do you access the value associated with a key in a dictionary?",
          options: [
            "dict[key]",
            "dict.get(key)",
            "Both A and B",
            "dict->key"
          ],
          correct: 2,
          explanation: "Both dict[key] and dict.get(key) can be used to access dictionary values, with get() being safer for missing keys.",
          marks: 10
        },
        {
          question: "What does the len() function return for a list?",
          options: [
            "The last element",
            "The first element",
            "The number of elements",
            "The sum of elements"
          ],
          correct: 2,
          explanation: "The len() function returns the number of elements in a sequence like a list.",
          marks: 10
        },
        {
          question: "Which data structure is ordered and allows duplicate elements?",
          options: [
            "Set",
            "Dictionary",
            "List",
            "Tuple"
          ],
          correct: 2,
          explanation: "Lists are ordered collections that allow duplicate elements.",
          marks: 10
        }
      ],
      codeChallenges: [
        {
          title: "Grade Calculator Function",
          description: "Create a function that calculates the average grade and determines the letter grade.",
          problem: `Write a function called calculate_grade() that:
1. Takes a list of scores as input
2. Calculates the average
3. Returns the letter grade (A: 90+, B: 80-89, C: 70-79, D: 60-69, F: <60)

Test with scores: [85, 92, 78, 96, 87]`,
          initialCode: `def calculate_grade(scores):
    # Calculate average
    average = 
    
    # Determine letter grade
    if average >= 90:
        return 'A'
    elif average >= 80:
        return 'B'
    elif average >= 70:
        return 'C'
    elif average >= 60:
        return 'D'
    else:
        return 'F'

# Test the function
scores = [85, 92, 78, 96, 87]
grade = calculate_grade(scores)
print(f"Average: {sum(scores)/len(scores):.1f}")
print(f"Grade: {grade}")`,
          testCases: [
            {
              input: "",
              expectedOutput: "Average: 87.6\nGrade: B",
              description: "Grade calculation with given scores"
            }
          ],
          marks: 75,
          timeLimit: 900
        },
        {
          title: "Student Record Management",
          description: "Create a program that manages student records using dictionaries and lists.",
          problem: `Create a program that:
1. Stores student information in a dictionary
2. Adds new students to a list
3. Finds a student by ID
4. Calculates class average

Use the following student data:
Student 1: ID=101, Name="Alice", Grade=85
Student 2: ID=102, Name="Bob", Grade=92
Student 3: ID=103, Name="Charlie", Grade=78`,
          initialCode: `# Create student records
students = []

# Add students
student1 = {"id": 101, "name": "Alice", "grade": 85}
student2 = {"id": 102, "name": "Bob", "grade": 92}
student3 = {"id": 103, "name": "Charlie", "grade": 78}

# Add to list
students.extend([student1, student2, student3])

# Function to find student by ID
def find_student(student_list, student_id):
    # Write your logic here
    pass

# Function to calculate class average
def class_average(student_list):
    # Write your logic here
    pass

# Test functions
found_student = find_student(students, 102)
if found_student:
    print(f"Found: {found_student['name']}")

avg = class_average(students)
print(f"Class average: {avg:.1f}")`,
          testCases: [
            {
              input: "",
              expectedOutput: "Found: Bob\nClass average: 85.0",
              description: "Student record management operations"
            }
          ],
          marks: 75,
          timeLimit: 1200
        }
      ],
      isActive: true,
      attempts: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
];

async function addModuleTestsToCourse() {
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
    console.log(`📊 Current modules count: ${course.modules?.length || 0}`);

    // Add module tests to existing modules
    let updatedModules = 0;
    
    for (const testData of moduleTestsData) {
      const { moduleIndex, moduleTest } = testData;
      
      if (course.modules && course.modules[moduleIndex]) {
        // Add the module test to the existing module
        course.modules[moduleIndex].moduleTest = moduleTest;
        
        // Ensure lecture has the required module field
        if (!course.modules[moduleIndex].lecture) {
          course.modules[moduleIndex].lecture = {};
        }
        if (!course.modules[moduleIndex].lecture.module) {
          course.modules[moduleIndex].lecture.module = course.modules[moduleIndex].title || `Module ${moduleIndex + 1}`;
        }
        
        updatedModules++;
        
        console.log(`✅ Added module test to module ${moduleIndex + 1}: "${course.modules[moduleIndex].title}"`);
        console.log(`   📝 MCQs: ${moduleTest.mcqs.length}`);
        console.log(`   💻 Code Challenges: ${moduleTest.codeChallenges.length}`);
        console.log(`   ⏰ Duration: ${moduleTest.duration} minutes`);
        console.log(`   🎯 Total Marks: ${moduleTest.totalMarks}`);
      } else {
        console.warn(`⚠️  Module at index ${moduleIndex} does not exist`);
      }
    }

    if (updatedModules > 0) {
      // Save the updated course
      await course.save();
      console.log(`\n🎉 Successfully added ${updatedModules} module tests to course "${course.title}"`);
      
      // Display final statistics
      console.log('\n📊 Final Course Statistics:');
      console.log(`   📚 Total Modules: ${course.modules.length}`);
      
      course.modules.forEach((module, index) => {
        if (module.moduleTest) {
          console.log(`   ✅ Module ${index + 1}: "${module.title}" - Has Test (${module.moduleTest.mcqs.length} MCQs, ${module.moduleTest.codeChallenges.length} Code Challenges)`);
        } else {
          console.log(`   ❌ Module ${index + 1}: "${module.title}" - No Test`);
        }
      });
    } else {
      console.log('❌ No modules were updated');
    }

  } catch (error) {
    console.error('❌ Error adding module tests:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

// Export the function for potential reuse
module.exports = { addModuleTestsToCourse, moduleTestsData };

// Run the script if called directly
if (require.main === module) {
  addModuleTestsToCourse();
}
