const mongoose = require('mongoose');
const Course = require('../models/Course');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mlrit-code-hub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const pythonCourseData = {
  title: "Complete Python Programming Course",
  description: "Learn Python from basics to advanced concepts with hands-on projects and real-world applications.",
  instructor: "Python Expert",
  difficulty: "beginner",
  duration: "8-10 weeks",
  topics: [
    {
      title: "Introduction to Python",
      description: "Learn the fundamentals of Python programming language, its features, and how to set up your development environment.",
      order: 1,
      lessons: [
        {
          title: "What is Python?",
          type: "lesson",
          content: `
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
          review: `
            Python is an excellent choice for beginners due to its readable syntax and extensive libraries.
            It's used in many industries and has a strong job market presence.
          `,
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
          order: 1,
          duration: "15-20 min"
        },
        {
          title: "Installing Python and Setting Up Environment",
          type: "lesson",
          content: `
            # Installing Python and Setting Up Environment
            
            ## Installation Steps
            1. Visit python.org
            2. Download the latest Python version (3.9 or higher recommended)
            3. Run the installer and check "Add Python to PATH"
            4. Verify installation by running: python --version
            
            ## Development Environment Options
            
            ### 1. IDLE (Built-in)
            - Comes with Python installation
            - Simple interface for beginners
            - Good for learning basics
            
            ### 2. Visual Studio Code
            - Free, powerful editor
            - Excellent Python extension
            - Great for projects
            
            ### 3. PyCharm
            - Professional IDE
            - Advanced debugging features
            - Great for large projects
            
            ### 4. Jupyter Notebook
            - Interactive development
            - Perfect for data science
            - Great for experimentation
            
            ## Your First Program
            
            Create a file called hello.py and add:
            
            ```python
            # This is your first Python program
            print("Hello, World!")
            
            # Output: Hello, World!
            ```
            
            Run it with: python hello.py
          `,
          review: `
            Setting up a proper development environment is crucial for productive Python programming.
            Choose the tool that best fits your needs and experience level.
          `,
          mcqs: [
            {
              question: "What command is used to check if Python is installed correctly?",
              options: ["python --check", "python --version", "python --install", "python --test"],
              correct: 1,
              explanation: "The command 'python --version' displays the installed Python version.",
              marks: 5
            }
          ],
          codeChallenges: [
            {
              title: "Environment Test",
              description: "Write a program that prints your Python version and a welcome message.",
              initialCode: "import sys\n\n# Write your code here\n",
              sampleInput: "",
              sampleOutput: "Python version: 3.9.x\nWelcome to Python programming!",
              constraints: "Use sys.version and print statements",
              language: "python",
              marks: 15
            }
          ],
          order: 2,
          duration: "20-25 min"
        }
      ],
      moduleTest: {
        mcqs: [
          {
            question: "Python is primarily known for which characteristic?",
            options: ["Speed of execution", "Readability and simplicity", "Memory efficiency", "Complex syntax"],
            correct: 1,
            explanation: "Python is primarily known for its readable and simple syntax that makes it easy to learn and use.",
            marks: 10
          },
          {
            question: "Which file extension is used for Python files?",
            options: [".python", ".py", ".pt", ".pyt"],
            correct: 1,
            explanation: "Python files use the .py extension.",
            marks: 10
          },
          {
            question: "What type of language is Python?",
            options: ["Compiled", "Interpreted", "Assembly", "Machine"],
            correct: 1,
            explanation: "Python is an interpreted language, meaning code is executed line by line at runtime.",
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
        totalMarks: 55
      }
    },
    {
      title: "Python Syntax and Data Types",
      description: "Master Python's syntax rules, variables, and built-in data types including strings, numbers, lists, and dictionaries.",
      order: 2,
      lessons: [
        {
          title: "Variables and Basic Data Types",
          type: "lesson",
          content: `
            # Variables and Basic Data Types
            
            ## Variables in Python
            
            Variables are containers for storing data values. Python has no command for declaring a variable.
            A variable is created the moment you first assign a value to it.
            
            ```python
            # Creating variables
            name = "Python"
            age = 30
            height = 5.9
            is_programming_language = True
            ```
            
            ## Basic Data Types
            
            ### 1. Numbers
            - **int**: Integer numbers (1, 42, -10)
            - **float**: Decimal numbers (3.14, -0.5, 2.0)
            
            ```python
            # Integer
            count = 42
            temperature = -5
            
            # Float
            pi = 3.14159
            price = 29.99
            ```
            
            ### 2. Strings
            Text data enclosed in quotes (single or double)
            
            ```python
            # String examples
            name = "Alice"
            message = 'Hello, World!'
            multiline = """This is a
            multiline string"""
            ```
            
            ### 3. Boolean
            True or False values
            
            ```python
            is_student = True
            is_graduated = False
            ```
            
            ## Variable Naming Rules
            
            1. Must start with a letter or underscore
            2. Can contain letters, numbers, and underscores
            3. Case-sensitive (age and Age are different)
            4. Cannot use Python keywords
            
            ```python
            # Valid variable names
            user_name = "John"
            age2 = 25
            _private = "secret"
            
            # Invalid variable names
            # 2age = 25        # Starts with number
            # user-name = "John"  # Contains hyphen
            # class = "Python"    # Python keyword
            ```
            
            ## Type Checking
            
            Use the type() function to check variable types:
            
            ```python
            name = "Python"
            age = 30
            
            print(type(name))   # <class 'str'>
            print(type(age))    # <class 'int'>
            ```
          `,
          review: `
            Understanding variables and data types is fundamental to Python programming.
            Practice creating different types of variables and checking their types.
          `,
          mcqs: [
            {
              question: "Which of the following is a valid variable name in Python?",
              options: ["2name", "user-name", "user_name", "class"],
              correct: 2,
              explanation: "user_name is valid. Variable names cannot start with numbers, contain hyphens, or use Python keywords.",
              marks: 5
            },
            {
              question: "What data type is the value 3.14 in Python?",
              options: ["int", "float", "str", "bool"],
              correct: 1,
              explanation: "3.14 is a floating-point number, so its data type is float.",
              marks: 5
            }
          ],
          codeChallenges: [
            {
              title: "Variable Practice",
              description: "Create variables of different data types and print their values and types.",
              initialCode: "# Create variables of different types\n\n",
              sampleInput: "",
              sampleOutput: "Name: Alice, Type: <class 'str'>\nAge: 25, Type: <class 'int'>\nHeight: 5.6, Type: <class 'float'>\nIs Student: True, Type: <class 'bool'>",
              constraints: "Create variables for name (string), age (integer), height (float), and student status (boolean)",
              language: "python",
              marks: 15
            }
          ],
          order: 1,
          duration: "25-30 min"
        }
      ],
      moduleTest: {
        mcqs: [
          {
            question: "What happens when you assign a new value to an existing variable in Python?",
            options: ["Error occurs", "Old value is preserved", "New value replaces old value", "Both values are stored"],
            correct: 2,
            explanation: "In Python, assigning a new value to a variable replaces the old value.",
            marks: 10
          }
        ],
        codeChallenges: [
          {
            title: "Data Types Assessment",
            description: "Create a program that demonstrates understanding of Python data types and variables.",
            initialCode: "# Data Types Assessment\n\n",
            sampleInput: "",
            sampleOutput: "Student Info:\nName: John Doe\nAge: 20\nGPA: 3.85\nIs Enrolled: True",
            constraints: "Use appropriate data types for each piece of information",
            language: "python",
            marks: 20
          }
        ],
        totalMarks: 30
      }
    },
    {
      title: "Control Structures and Functions",
      description: "Learn about conditional statements, loops, and how to create and use functions in Python.",
      order: 3,
      lessons: [
        {
          title: "Conditional Statements",
          type: "lesson",
          content: `
            # Conditional Statements
            
            Conditional statements allow you to execute different code blocks based on certain conditions.
            
            ## if Statement
            
            ```python
            age = 18
            
            if age >= 18:
                print("You are an adult")
            ```
            
            ## if-else Statement
            
            ```python
            temperature = 25
            
            if temperature > 30:
                print("It's hot outside")
            else:
                print("It's not too hot")
            ```
            
            ## if-elif-else Statement
            
            ```python
            score = 85
            
            if score >= 90:
                print("Grade: A")
            elif score >= 80:
                print("Grade: B")
            elif score >= 70:
                print("Grade: C")
            else:
                print("Grade: F")
            ```
            
            ## Comparison Operators
            
            - == (equal to)
            - != (not equal to)
            - < (less than)
            - > (greater than)
            - <= (less than or equal to)
            - >= (greater than or equal to)
            
            ## Logical Operators
            
            - and: Both conditions must be true
            - or: At least one condition must be true
            - not: Reverses the condition
            
            ```python
            age = 25
            has_license = True
            
            if age >= 18 and has_license:
                print("Can drive")
            elif age >= 18 or has_license:
                print("Check requirements")
            else:
                print("Cannot drive")
            ```
          `,
          review: `
            Conditional statements are essential for making decisions in your programs.
            Practice using different comparison and logical operators.
          `,
          mcqs: [
            {
              question: "What will be the output of: if 5 > 3 and 2 < 1:",
              options: ["True", "False", "The condition will execute", "The condition will not execute"],
              correct: 3,
              explanation: "Since 2 < 1 is False, the entire condition (5 > 3 and 2 < 1) is False, so the condition will not execute.",
              marks: 5
            }
          ],
          codeChallenges: [
            {
              title: "Grade Calculator",
              description: "Write a program that takes a score and prints the corresponding grade.",
              initialCode: "# Grade Calculator\nscore = int(input(\"Enter score: \"))\n\n# Write your if-elif-else logic here\n",
              sampleInput: "85",
              sampleOutput: "Grade: B",
              constraints: "A: 90+, B: 80-89, C: 70-79, D: 60-69, F: below 60",
              language: "python",
              marks: 20
            }
          ],
          order: 1,
          duration: "30-35 min"
        }
      ],
      moduleTest: {
        mcqs: [
          {
            question: "Which operator is used to check if two values are equal in Python?",
            options: ["=", "==", "!=", "==="],
            correct: 1,
            explanation: "The == operator is used for equality comparison, while = is used for assignment.",
            marks: 10
          }
        ],
        codeChallenges: [
          {
            title: "Control Structures Assessment",
            description: "Create a program that uses conditional statements to categorize a person's life stage based on age.",
            initialCode: "# Life Stage Categorizer\nage = int(input(\"Enter age: \"))\n\n",
            sampleInput: "25",
            sampleOutput: "Adult",
            constraints: "Child: 0-12, Teen: 13-19, Adult: 20-64, Senior: 65+",
            language: "python",
            marks: 25
          }
        ],
        totalMarks: 35
      }
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
    
    console.log('Course ID:', (await Course.findOne({ title: pythonCourseData.title }))._id);
    
  } catch (error) {
    console.error('Error seeding Python course:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeding function
seedPythonCourse();
