require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

// Course ID for MLRIT CodeHub Demo Course
const COURSE_ID = '690c993dcb21cbd98ce292d8';

// Comprehensive theory content data for testing
const theoryContentData = [
  {
    moduleIndex: 0, // First module
    theoryContent: {
      textContent: `# Introduction to Programming Fundamentals

## What is Programming?

Programming is the process of **creating instructions** for computers to execute. It involves writing code using programming languages to solve problems and create software applications.

### Key Concepts

Programming fundamentals include:

- **Variables**: Storage locations for data
- **Data Types**: Different kinds of data (numbers, text, booleans)
- **Control Structures**: If statements, loops, functions
- **Algorithms**: Step-by-step problem-solving procedures

## Getting Started

### Setting Up Your Environment

\`\`\`python
# Your first Python program
print("Hello, World!")
name = "Student"
print(f"Welcome, {name}!")
\`\`\`

### Best Practices

1. **Write Clear Code**: Use descriptive variable names
2. **Comment Your Code**: Explain complex logic
3. **Test Regularly**: Verify your code works correctly
4. **Version Control**: Track changes using Git

## Data Types in Programming

Programming languages support various data types:

- **Integers**: Whole numbers like 42, -17, 0
- **Floats**: Decimal numbers like 3.14, -2.5
- **Strings**: Text data like "Hello World"
- **Booleans**: True/False values

### Example Code

\`\`\`python
# Variables and data types
age = 25                    # Integer
height = 5.9               # Float  
name = "Alice"             # String
is_student = True          # Boolean

print(f"{name} is {age} years old")
if is_student:
    print("Currently enrolled in courses")
\`\`\`

## Control Structures

### Conditional Statements

Use *if-else* statements to make decisions:

\`\`\`python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"

print(f"Your grade is: {grade}")
\`\`\`

### Loops

**For loops** iterate over sequences:

\`\`\`python
# Print numbers 1 to 5
for i in range(1, 6):
    print(f"Number: {i}")

# Iterate through a list
fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(f"I like {fruit}")
\`\`\`

**While loops** continue until a condition is false:

\`\`\`python
count = 0
while count < 3:
    print(f"Count is: {count}")
    count += 1
\`\`\`

## Functions

Functions are reusable blocks of code:

\`\`\`python
def calculate_area(length, width):
    """Calculate the area of a rectangle"""
    area = length * width
    return area

# Using the function
rectangle_area = calculate_area(10, 5)
print(f"Area: {rectangle_area} square units")
\`\`\`

## Summary

Programming fundamentals provide the foundation for all software development. Master these concepts:

- Understanding data types and variables
- Writing conditional logic
- Creating loops for repetitive tasks  
- Building functions for code reuse
- Following coding best practices

**Practice regularly** to strengthen your programming skills!`,
      
      files: {
        pdf: {
          name: "Programming_Fundamentals_Guide.pdf",
          url: "https://example.com/pdfs/programming-fundamentals.pdf"
        },
        ppt: {
          name: "Programming_Basics_Presentation.pptx",
          url: "https://example.com/presentations/programming-basics.pptx",
          totalSlides: 12,
          slides: [
            {
              title: "Welcome to Programming",
              content: `<div class="slide-content">
                <h2>Course Overview</h2>
                <ul>
                  <li>Learn fundamental programming concepts</li>
                  <li>Practice with real code examples</li>
                  <li>Build problem-solving skills</li>
                  <li>Prepare for advanced topics</li>
                </ul>
                <div class="highlight-box">
                  <p><strong>Goal:</strong> Master the building blocks of programming</p>
                </div>
              </div>`,
              slideNumber: 1
            },
            {
              title: "What is Programming?",
              content: `<div class="slide-content">
                <p>Programming is the art and science of creating instructions for computers.</p>
                <h3>Key Components:</h3>
                <ul>
                  <li><strong>Syntax:</strong> The grammar of programming languages</li>
                  <li><strong>Logic:</strong> The reasoning behind code structure</li>
                  <li><strong>Problem Solving:</strong> Breaking down complex tasks</li>
                </ul>
                <div class="code-example">
                  <pre>print("Hello, Programming World!")</pre>
                </div>
              </div>`,
              slideNumber: 2
            },
            {
              title: "Variables and Data Types",
              content: `<div class="slide-content">
                <h3>Variables store data for later use</h3>
                <table class="data-types-table">
                  <tr><th>Type</th><th>Example</th><th>Use Case</th></tr>
                  <tr><td>Integer</td><td>42</td><td>Counting, calculations</td></tr>
                  <tr><td>Float</td><td>3.14</td><td>Precise measurements</td></tr>
                  <tr><td>String</td><td>"Hello"</td><td>Text and messages</td></tr>
                  <tr><td>Boolean</td><td>True</td><td>Yes/no decisions</td></tr>
                </table>
              </div>`,
              slideNumber: 3
            },
            {
              title: "Control Structures - Conditionals",
              content: `<div class="slide-content">
                <h3>Making Decisions in Code</h3>
                <div class="code-block">
                  <pre>
if temperature > 30:
    print("It's hot outside!")
elif temperature > 20:
    print("Nice weather")
else:
    print("A bit chilly")
                  </pre>
                </div>
                <p>Conditional statements allow programs to respond differently based on data.</p>
              </div>`,
              slideNumber: 4
            },
            {
              title: "Loops - Repetition Made Easy",
              content: `<div class="slide-content">
                <h3>Two Main Types of Loops</h3>
                <div class="two-column">
                  <div class="column">
                    <h4>For Loop</h4>
                    <pre>
for i in range(5):
    print(f"Step {i}")
                    </pre>
                    <p>Use when you know how many iterations</p>
                  </div>
                  <div class="column">
                    <h4>While Loop</h4>
                    <pre>
count = 0
while count < 5:
    print(f"Count: {count}")
    count += 1
                    </pre>
                    <p>Use when condition-dependent</p>
                  </div>
                </div>
              </div>`,
              slideNumber: 5
            },
            {
              title: "Functions - Code Reusability",
              content: `<div class="slide-content">
                <h3>Creating Reusable Code Blocks</h3>
                <div class="code-example">
                  <pre>
def greet_user(name, age):
    message = f"Hello {name}, you are {age} years old"
    return message

# Using the function
greeting = greet_user("Alice", 25)
print(greeting)
                  </pre>
                </div>
                <p><strong>Benefits:</strong> Code reuse, easier testing, better organization</p>
              </div>`,
              slideNumber: 6
            }
          ]
        },
        doc: {
          name: "Programming_Study_Guide.docx", 
          url: "https://example.com/documents/programming-study-guide.docx"
        }
      }
    }
  },
  {
    moduleIndex: 1, // Second module
    theoryContent: {
      textContent: `# Data Structures and Algorithms

## Introduction to Data Structures

Data structures are ways of **organizing and storing data** so that it can be accessed and modified efficiently. They are fundamental to writing efficient programs.

### Why Data Structures Matter

- **Performance**: Right data structure = faster programs
- **Memory Management**: Efficient storage and retrieval
- **Problem Solving**: Different structures suit different problems
- **Scalability**: Handle growing amounts of data

## Common Data Structures

### Arrays and Lists

**Arrays** store multiple elements of the same type:

\`\`\`python
# Python lists (dynamic arrays)
numbers = [1, 2, 3, 4, 5]
fruits = ["apple", "banana", "orange"]

# Accessing elements
print(numbers[0])    # Output: 1
print(fruits[-1])    # Output: orange (last element)

# Adding elements
numbers.append(6)
fruits.insert(1, "grape")

print(numbers)       # [1, 2, 3, 4, 5, 6]
print(fruits)        # ['apple', 'grape', 'banana', 'orange']
\`\`\`

### Dictionaries and Hash Maps

**Dictionaries** store key-value pairs:

\`\`\`python
# Creating a dictionary
student = {
    "name": "John Doe",
    "age": 20,
    "major": "Computer Science",
    "gpa": 3.8
}

# Accessing values
print(student["name"])        # John Doe
print(student.get("age"))     # 20

# Adding/updating
student["graduation_year"] = 2025
student["gpa"] = 3.9

# Iterating through dictionary
for key, value in student.items():
    print(f"{key}: {value}")
\`\`\`

### Sets

**Sets** store unique elements:

\`\`\`python
# Creating sets
colors = {"red", "green", "blue"}
numbers = {1, 2, 3, 2, 1}  # Duplicates automatically removed

print(numbers)  # {1, 2, 3}

# Set operations
set1 = {1, 2, 3, 4}
set2 = {3, 4, 5, 6}

union = set1 | set2          # {1, 2, 3, 4, 5, 6}
intersection = set1 & set2   # {3, 4}
difference = set1 - set2     # {1, 2}

print(f"Union: {union}")
print(f"Intersection: {intersection}")
\`\`\`

## Introduction to Algorithms

**Algorithms** are step-by-step procedures for solving problems. They transform input data into desired output.

### Algorithm Analysis

We measure algorithms by:

1. **Time Complexity**: How execution time grows with input size
2. **Space Complexity**: How memory usage grows with input size

### Big O Notation

Common time complexities:

- **O(1)**: Constant time - same speed regardless of input size
- **O(log n)**: Logarithmic time - very efficient for large datasets  
- **O(n)**: Linear time - proportional to input size
- **O(n²)**: Quadratic time - slower for large datasets

## Searching Algorithms

### Linear Search

Check each element one by one:

\`\`\`python
def linear_search(arr, target):
    """Find target in array using linear search"""
    for i in range(len(arr)):
        if arr[i] == target:
            return i  # Return index where found
    return -1  # Not found

# Example usage
numbers = [64, 34, 25, 12, 22, 11, 90]
result = linear_search(numbers, 22)

if result != -1:
    print(f"Element found at index {result}")
else:
    print("Element not found")
\`\`\`

### Binary Search

Efficiently search **sorted** arrays:

\`\`\`python
def binary_search(arr, target):
    """Find target in sorted array using binary search"""
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

# Example usage
sorted_numbers = [11, 12, 22, 25, 34, 64, 90]
result = binary_search(sorted_numbers, 25)
print(f"Element found at index {result}")  # Output: 3
\`\`\`

## Sorting Algorithms

### Bubble Sort

Simple but inefficient for large datasets:

\`\`\`python
def bubble_sort(arr):
    """Sort array using bubble sort algorithm"""
    n = len(arr)
    
    for i in range(n):
        # Track if any swaps occurred
        swapped = False
        
        for j in range(0, n - i - 1):
            # Swap if elements are in wrong order
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        
        # If no swaps occurred, array is sorted
        if not swapped:
            break
    
    return arr

# Example usage
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = bubble_sort(numbers.copy())
print(f"Sorted array: {sorted_numbers}")
\`\`\`

### Quick Sort

Efficient divide-and-conquer algorithm:

\`\`\`python
def quick_sort(arr):
    """Sort array using quick sort algorithm"""
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)

# Example usage
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = quick_sort(numbers)
print(f"Quick sorted: {sorted_numbers}")
\`\`\`

## Practical Applications

### Real-World Examples

1. **Social Media**: Hash tables for user profiles, graphs for connections
2. **GPS Navigation**: Graphs for maps, shortest path algorithms
3. **Search Engines**: Tries for autocomplete, hash tables for indexing
4. **Database Systems**: B-trees for indexing, hash tables for caching

### Choosing the Right Structure

| Use Case | Best Data Structure | Reason |
|----------|-------------------|---------|
| Fast lookup by key | Dictionary/Hash Map | O(1) average access time |
| Ordered data | Array/List | Sequential access, sorting |
| Unique elements | Set | Automatic duplicate removal |
| Hierarchical data | Tree | Natural parent-child relationships |

## Summary

Understanding data structures and algorithms is crucial for:

- **Writing efficient code** that scales with data growth
- **Solving complex problems** by choosing appropriate tools
- **Optimizing performance** in real-world applications
- **Technical interviews** and advanced programming concepts

**Practice implementing** these structures and algorithms to build strong programming foundations!`,
      
      files: {
        pdf: {
          name: "Data_Structures_Algorithms_Reference.pdf",
          url: "https://example.com/pdfs/data-structures-algorithms.pdf"
        },
        ppt: {
          name: "DSA_Comprehensive_Slides.pptx", 
          url: "https://example.com/presentations/dsa-slides.pptx",
          totalSlides: 15,
          slides: [
            {
              title: "Data Structures Overview",
              content: `<div class="slide-content">
                <h2>What are Data Structures?</h2>
                <p>Organized ways to store and access data efficiently</p>
                <div class="structure-grid">
                  <div class="structure-item">
                    <h3>Arrays</h3>
                    <p>Sequential storage</p>
                  </div>
                  <div class="structure-item">
                    <h3>Dictionaries</h3>
                    <p>Key-value pairs</p>
                  </div>
                  <div class="structure-item">
                    <h3>Sets</h3>
                    <p>Unique elements</p>
                  </div>
                </div>
              </div>`,
              slideNumber: 1
            },
            {
              title: "Arrays and Lists",
              content: `<div class="slide-content">
                <h3>The Foundation of Data Storage</h3>
                <div class="visual-array">
                  [0] [1] [2] [3] [4]<br>
                  &nbsp;5&nbsp;&nbsp; 10 &nbsp; 15 &nbsp; 20 &nbsp; 25
                </div>
                <h4>Key Operations:</h4>
                <ul>
                  <li><strong>Access:</strong> O(1) - Direct index access</li>
                  <li><strong>Insert:</strong> O(n) - May need to shift elements</li>
                  <li><strong>Delete:</strong> O(n) - May need to shift elements</li>
                  <li><strong>Search:</strong> O(n) - Check each element</li>
                </ul>
              </div>`,
              slideNumber: 2
            },
            {
              title: "Hash Tables/Dictionaries",
              content: `<div class="slide-content">
                <h3>Fast Key-Value Storage</h3>
                <div class="hash-visualization">
                  <div class="key-value-pair">
                    "name" → "Alice"<br>
                    "age" → 25<br>
                    "city" → "New York"
                  </div>
                </div>
                <h4>Advantages:</h4>
                <ul>
                  <li>O(1) average lookup time</li>
                  <li>Dynamic sizing</li>
                  <li>Flexible key types</li>
                </ul>
                <div class="code-snippet">
                  <pre>student = {"name": "Alice", "grade": "A+"}</pre>
                </div>
              </div>`,
              slideNumber: 3
            },
            {
              title: "Algorithm Complexity",
              content: `<div class="slide-content">
                <h3>Big O Notation</h3>
                <div class="complexity-chart">
                  <table>
                    <tr><th>Notation</th><th>Name</th><th>Example</th></tr>
                    <tr><td>O(1)</td><td>Constant</td><td>Array access</td></tr>
                    <tr><td>O(log n)</td><td>Logarithmic</td><td>Binary search</td></tr>
                    <tr><td>O(n)</td><td>Linear</td><td>Linear search</td></tr>
                    <tr><td>O(n²)</td><td>Quadratic</td><td>Bubble sort</td></tr>
                  </table>
                </div>
                <p><strong>Goal:</strong> Choose algorithms with better time complexity</p>
              </div>`,
              slideNumber: 4
            },
            {
              title: "Searching Algorithms Comparison",
              content: `<div class="slide-content">
                <div class="algorithm-comparison">
                  <div class="algorithm">
                    <h4>Linear Search</h4>
                    <ul>
                      <li>Works on unsorted data</li>
                      <li>Time: O(n)</li>
                      <li>Space: O(1)</li>
                      <li>Simple to implement</li>
                    </ul>
                  </div>
                  <div class="algorithm">
                    <h4>Binary Search</h4>
                    <ul>
                      <li>Requires sorted data</li>
                      <li>Time: O(log n)</li>
                      <li>Space: O(1)</li>
                      <li>Much faster for large datasets</li>
                    </ul>
                  </div>
                </div>
              </div>`,
              slideNumber: 5
            },
            {
              title: "Practical Applications",
              content: `<div class="slide-content">
                <h3>Real-World Usage</h3>
                <div class="applications-grid">
                  <div class="app-example">
                    <h4>🌐 Web Search</h4>
                    <p>Hash tables for indexing, tries for autocomplete</p>
                  </div>
                  <div class="app-example">
                    <h4>📱 Social Media</h4>
                    <p>Graphs for connections, queues for feeds</p>
                  </div>
                  <div class="app-example">
                    <h4>🗺️ GPS Navigation</h4>
                    <p>Graphs for roads, shortest path algorithms</p>
                  </div>
                  <div class="app-example">
                    <h4>💾 Database Systems</h4>
                    <p>B-trees for indexing, hash tables for caching</p>
                  </div>
                </div>
              </div>`,
              slideNumber: 6
            }
          ]
        },
        doc: {
          name: "DSA_Complete_Reference.docx",
          url: "https://example.com/documents/dsa-reference.docx"
        }
      }
    }
  },
  {
    moduleIndex: 2, // Third module
    theoryContent: {
      textContent: `# Object-Oriented Programming (OOP)

## Introduction to OOP

**Object-Oriented Programming (OOP)** is a programming paradigm that organizes code around *objects* and *classes* rather than functions and procedures. It's a powerful way to structure complex programs.

### Why Use OOP?

- **Modularity**: Break complex problems into manageable pieces
- **Reusability**: Write code once, use it multiple times  
- **Maintainability**: Easier to update and debug organized code
- **Real-world modeling**: Represents real-world entities naturally

## Core OOP Concepts

### 1. Classes and Objects

**Classes** are blueprints that define the structure and behavior of objects.
**Objects** are instances created from classes.

\`\`\`python
# Defining a class
class Student:
    def __init__(self, name, age, major):
        self.name = name        # Instance attribute
        self.age = age          # Instance attribute  
        self.major = major      # Instance attribute
        self.courses = []       # Instance attribute
    
    def enroll_course(self, course_name):
        """Method to enroll in a course"""
        self.courses.append(course_name)
        print(f"{self.name} enrolled in {course_name}")
    
    def get_info(self):
        """Method to get student information"""
        return f"Student: {self.name}, Age: {self.age}, Major: {self.major}"

# Creating objects (instances)
alice = Student("Alice Johnson", 20, "Computer Science")
bob = Student("Bob Smith", 19, "Mathematics")

# Using methods
alice.enroll_course("Data Structures")
alice.enroll_course("Algorithms")

print(alice.get_info())
print(f"Alice's courses: {alice.courses}")
\`\`\`

### 2. Encapsulation

**Encapsulation** bundles data and methods that operate on that data within a single unit, and restricts access to some components.

\`\`\`python
class BankAccount:
    def __init__(self, account_number, initial_balance=0):
        self.account_number = account_number
        self.__balance = initial_balance  # Private attribute (encapsulated)
        self.__transaction_history = []   # Private attribute
    
    def deposit(self, amount):
        """Public method to deposit money"""
        if amount > 0:
            self.__balance += amount
            self.__transaction_history.append(f"Deposit: +{amount}")
            print(f"Deposited {amount}. New balance: {self.__balance}")
        else:
            print("Deposit amount must be positive")
    
    def withdraw(self, amount):
        """Public method to withdraw money"""
        if 0 < amount <= self.__balance:
            self.__balance -= amount
            self.__transaction_history.append(f"Withdrawal: -{amount}")
            print(f"Withdrew {amount}. New balance: {self.__balance}")
        else:
            print("Invalid withdrawal amount")
    
    def get_balance(self):
        """Public method to check balance"""
        return self.__balance
    
    def get_transaction_history(self):
        """Public method to view transaction history"""
        return self.__transaction_history.copy()

# Usage example
account = BankAccount("ACC123", 1000)
account.deposit(500)
account.withdraw(200)

print(f"Current balance: {account.get_balance()}")
print("Transaction history:", account.get_transaction_history())

# Direct access to private attributes is not recommended
# print(account.__balance)  # This would cause an AttributeError
\`\`\`

### 3. Inheritance

**Inheritance** allows a class to inherit attributes and methods from another class, promoting code reuse.

\`\`\`python
# Base class (Parent class)
class Vehicle:
    def __init__(self, make, model, year):
        self.make = make
        self.model = model
        self.year = year
        self.is_running = False
    
    def start_engine(self):
        """Start the vehicle engine"""
        self.is_running = True
        print(f"{self.year} {self.make} {self.model} engine started")
    
    def stop_engine(self):
        """Stop the vehicle engine"""
        self.is_running = False
        print(f"{self.year} {self.make} {self.model} engine stopped")
    
    def get_info(self):
        """Get basic vehicle information"""
        return f"{self.year} {self.make} {self.model}"

# Derived class (Child class)
class Car(Vehicle):
    def __init__(self, make, model, year, num_doors):
        super().__init__(make, model, year)  # Call parent constructor
        self.num_doors = num_doors
    
    def honk(self):
        """Car-specific method"""
        print(f"{self.get_info()} goes beep beep!")

# Another derived class
class Motorcycle(Vehicle):
    def __init__(self, make, model, year, engine_cc):
        super().__init__(make, model, year)
        self.engine_cc = engine_cc
    
    def wheelie(self):
        """Motorcycle-specific method"""
        if self.is_running:
            print(f"{self.get_info()} performs a wheelie!")
        else:
            print("Start the engine first!")

# Creating instances
car = Car("Toyota", "Camry", 2023, 4)
motorcycle = Motorcycle("Yamaha", "R1", 2022, 998)

# Using inherited methods
car.start_engine()
car.honk()

motorcycle.start_engine()  
motorcycle.wheelie()

# Using parent class methods
print(car.get_info())
print(motorcycle.get_info())
\`\`\`

### 4. Polymorphism

**Polymorphism** allows objects of different types to be treated as instances of the same type through a common interface.

\`\`\`python
# Base class
class Animal:
    def __init__(self, name):
        self.name = name
    
    def make_sound(self):
        """This method will be overridden by child classes"""
        pass
    
    def introduce(self):
        """Common method for all animals"""
        print(f"Hi, I'm {self.name}")

# Derived classes
class Dog(Animal):
    def make_sound(self):
        return "Woof! Woof!"

class Cat(Animal):
    def make_sound(self):
        return "Meow!"

class Cow(Animal):
    def make_sound(self):
        return "Moo!"

class Duck(Animal):
    def make_sound(self):
        return "Quack!"

# Polymorphism in action
def animal_concert(animals):
    """Function that works with any animal objects"""
    print("🎵 Welcome to the Animal Concert! 🎵")
    for animal in animals:
        animal.introduce()
        print(f"{animal.name} says: {animal.make_sound()}")
        print()

# Create different animal objects
animals = [
    Dog("Buddy"),
    Cat("Whiskers"), 
    Cow("Bessie"),
    Duck("Daffy")
]

# All animals can be treated uniformly
animal_concert(animals)

# Another polymorphism example
def feed_animal(animal):
    """Works with any animal object"""
    print(f"Feeding {animal.name}...")
    print(f"{animal.name} responds: {animal.make_sound()}")

# Same function works with different animal types
feed_animal(Dog("Max"))
feed_animal(Cat("Luna"))
\`\`\`

## Advanced OOP Concepts

### Class vs Instance Attributes

\`\`\`python
class University:
    # Class attribute (shared by all instances)
    total_students = 0
    university_name = "MLRIT"
    
    def __init__(self, student_name, student_id):
        # Instance attributes (unique to each instance)
        self.student_name = student_name
        self.student_id = student_id
        
        # Increment class attribute when new student is added
        University.total_students += 1
    
    @classmethod
    def get_total_students(cls):
        """Class method to access class attribute"""
        return cls.total_students
    
    @staticmethod
    def validate_student_id(student_id):
        """Static method - doesn't need class or instance"""
        return len(student_id) == 6 and student_id.isdigit()
    
    def get_student_info(self):
        """Instance method"""
        return f"Student: {self.student_name} (ID: {self.student_id})"

# Creating instances
student1 = University("Alice", "123456")
student2 = University("Bob", "654321")  
student3 = University("Charlie", "789012")

print(f"Total students: {University.get_total_students()}")  # 3
print(f"University: {University.university_name}")

# Static method usage
print(f"Is '123456' valid? {University.validate_student_id('123456')}")  # True
print(f"Is '12345' valid? {University.validate_student_id('12345')}")    # False
\`\`\`

### Method Overriding

\`\`\`python
class Shape:
    def __init__(self, name):
        self.name = name
    
    def area(self):
        """Base implementation"""
        return 0
    
    def perimeter(self):
        """Base implementation"""  
        return 0
    
    def describe(self):
        """Common method that uses overridden methods"""
        print(f"{self.name}:")
        print(f"  Area: {self.area()}")
        print(f"  Perimeter: {self.perimeter()}")

class Rectangle(Shape):
    def __init__(self, width, height):
        super().__init__("Rectangle")
        self.width = width
        self.height = height
    
    def area(self):
        """Override parent method"""
        return self.width * self.height
    
    def perimeter(self):
        """Override parent method"""
        return 2 * (self.width + self.height)

class Circle(Shape):
    def __init__(self, radius):
        super().__init__("Circle")
        self.radius = radius
        self.pi = 3.14159
    
    def area(self):
        """Override parent method"""
        return self.pi * self.radius ** 2
    
    def perimeter(self):
        """Override parent method"""
        return 2 * self.pi * self.radius

# Usage
shapes = [
    Rectangle(5, 3),
    Circle(4),
    Rectangle(10, 2)
]

for shape in shapes:
    shape.describe()
    print()
\`\`\`

## Real-World OOP Example

### Library Management System

\`\`\`python
from datetime import datetime, timedelta

class Book:
    def __init__(self, isbn, title, author, genre):
        self.isbn = isbn
        self.title = title
        self.author = author
        self.genre = genre
        self.is_available = True
        self.borrowed_by = None
        self.due_date = None
    
    def __str__(self):
        return f"'{self.title}' by {self.author}"

class Member:
    def __init__(self, member_id, name, email):
        self.member_id = member_id
        self.name = name
        self.email = email
        self.borrowed_books = []
        self.join_date = datetime.now()
    
    def can_borrow(self):
        """Check if member can borrow more books"""
        return len(self.borrowed_books) < 3

class Library:
    def __init__(self, name):
        self.name = name
        self.books = {}      # ISBN -> Book object
        self.members = {}    # ID -> Member object
        self.loan_period = 14  # days
    
    def add_book(self, book):
        """Add a book to the library"""
        self.books[book.isbn] = book
        print(f"Added book: {book}")
    
    def register_member(self, member):
        """Register a new member"""
        self.members[member.member_id] = member
        print(f"Registered member: {member.name}")
    
    def borrow_book(self, member_id, isbn):
        """Process book borrowing"""
        if member_id not in self.members:
            print("Member not found")
            return False
        
        if isbn not in self.books:
            print("Book not found")
            return False
        
        member = self.members[member_id]
        book = self.books[isbn]
        
        if not member.can_borrow():
            print(f"{member.name} has reached borrowing limit")
            return False
        
        if not book.is_available:
            print(f"'{book.title}' is currently borrowed")
            return False
        
        # Process borrowing
        book.is_available = False
        book.borrowed_by = member_id
        book.due_date = datetime.now() + timedelta(days=self.loan_period)
        member.borrowed_books.append(isbn)
        
        print(f"{member.name} borrowed '{book.title}' (Due: {book.due_date.strftime('%Y-%m-%d')})")
        return True
    
    def return_book(self, member_id, isbn):
        """Process book return"""
        if isbn not in self.books or member_id not in self.members:
            print("Invalid book or member ID")
            return False
        
        book = self.books[isbn]
        member = self.members[member_id]
        
        if book.borrowed_by != member_id:
            print("This book was not borrowed by this member")
            return False
        
        # Process return
        book.is_available = True
        book.borrowed_by = None
        book.due_date = None
        member.borrowed_books.remove(isbn)
        
        print(f"{member.name} returned '{book.title}'")
        return True

# Usage example
library = Library("MLRIT Central Library")

# Add books
library.add_book(Book("978-1234567890", "Python Programming", "John Smith", "Programming"))
library.add_book(Book("978-0987654321", "Data Structures", "Jane Doe", "Computer Science"))

# Register members
library.register_member(Member("M001", "Alice Johnson", "alice@email.com"))
library.register_member(Member("M002", "Bob Wilson", "bob@email.com"))

# Borrow and return books
library.borrow_book("M001", "978-1234567890")
library.borrow_book("M002", "978-0987654321")
library.return_book("M001", "978-1234567890")
\`\`\`

## Summary

Object-Oriented Programming provides powerful tools for organizing code:

### Key Benefits:
- **Encapsulation**: Bundle data and methods together
- **Inheritance**: Reuse code through parent-child relationships  
- **Polymorphism**: Treat different objects uniformly
- **Abstraction**: Hide complex implementation details

### When to Use OOP:
- Complex applications with multiple interacting components
- Code that needs to model real-world entities
- Projects requiring high maintainability and extensibility
- Team development where code organization is crucial

**Practice creating classes** and implementing the four pillars of OOP to build robust, maintainable applications!`,
      
      files: {
        pdf: {
          name: "OOP_Complete_Guide.pdf", 
          url: "https://example.com/pdfs/oop-complete-guide.pdf"
        },
        ppt: {
          name: "Object_Oriented_Programming.pptx",
          url: "https://example.com/presentations/oop-slides.pptx", 
          totalSlides: 18,
          slides: [
            {
              title: "Welcome to Object-Oriented Programming",
              content: `<div class="slide-content">
                <h2>Course Overview</h2>
                <div class="oop-intro">
                  <p>Learn to organize code using objects and classes</p>
                  <div class="pillars-grid">
                    <div class="pillar">🏗️ Encapsulation</div>
                    <div class="pillar">🧬 Inheritance</div>
                    <div class="pillar">🎭 Polymorphism</div>
                    <div class="pillar">🎨 Abstraction</div>
                  </div>
                </div>
                <div class="goals-box">
                  <h3>Learning Goals:</h3>
                  <ul>
                    <li>Understand OOP principles</li>
                    <li>Design effective class hierarchies</li>
                    <li>Build maintainable applications</li>
                  </ul>
                </div>
              </div>`,
              slideNumber: 1
            },
            {
              title: "Classes and Objects",
              content: `<div class="slide-content">
                <h3>The Foundation of OOP</h3>
                <div class="class-object-visual">
                  <div class="class-definition">
                    <h4>Class (Blueprint)</h4>
                    <div class="blueprint">
                      <strong>Student Class</strong><br>
                      Attributes: name, age, major<br>
                      Methods: enroll(), graduate()
                    </div>
                  </div>
                  <div class="arrow">→</div>
                  <div class="objects">
                    <h4>Objects (Instances)</h4>
                    <div class="object">Alice (CS, 20)</div>
                    <div class="object">Bob (Math, 19)</div>
                    <div class="object">Carol (Physics, 21)</div>
                  </div>
                </div>
                <div class="code-example">
                  <pre>alice = Student("Alice", 20, "Computer Science")</pre>
                </div>
              </div>`,
              slideNumber: 2
            },
            {
              title: "Encapsulation - Data Protection",
              content: `<div class="slide-content">
                <h3>Bundling Data and Methods</h3>
                <div class="encapsulation-demo">
                  <div class="public-interface">
                    <h4>Public Interface</h4>
                    <ul>
                      <li>deposit(amount)</li>
                      <li>withdraw(amount)</li>
                      <li>get_balance()</li>
                    </ul>
                  </div>
                  <div class="private-data">
                    <h4>Private Data</h4>
                    <ul>
                      <li>__balance (hidden)</li>
                      <li>__transactions (hidden)</li>
                    </ul>
                  </div>
                </div>
                <p><strong>Benefit:</strong> Controlled access prevents data corruption</p>
              </div>`,
              slideNumber: 3
            },
            {
              title: "Inheritance Hierarchy",
              content: `<div class="slide-content">
                <h3>Code Reuse Through Inheritance</h3>
                <div class="inheritance-tree">
                  <div class="parent-class">
                    <strong>Vehicle</strong><br>
                    make, model, year<br>
                    start(), stop()
                  </div>
                  <div class="inheritance-lines">
                    <div class="line"></div>
                    <div class="line"></div>
                  </div>
                  <div class="child-classes">
                    <div class="child">
                      <strong>Car</strong><br>
                      num_doors<br>
                      honk()
                    </div>
                    <div class="child">
                      <strong>Motorcycle</strong><br>
                      engine_cc<br>
                      wheelie()
                    </div>
                  </div>
                </div>
                <p><em>Child classes inherit parent attributes and methods</em></p>
              </div>`,
              slideNumber: 4
            },
            {
              title: "Polymorphism in Action",
              content: `<div class="slide-content">
                <h3>Same Interface, Different Behavior</h3>
                <div class="polymorphism-example">
                  <div class="function-call">
                    <code>animal.make_sound()</code>
                  </div>
                  <div class="different-responses">
                    <div class="animal-response">🐕 Dog → "Woof!"</div>
                    <div class="animal-response">🐱 Cat → "Meow!"</div>
                    <div class="animal-response">🐄 Cow → "Moo!"</div>
                    <div class="animal-response">🦆 Duck → "Quack!"</div>
                  </div>
                </div>
                <div class="benefit-box">
                  <strong>Advantage:</strong> Write code that works with any animal type
                </div>
              </div>`,
              slideNumber: 5
            },
            {
              title: "Real-World Application: Library System",
              content: `<div class="slide-content">
                <h3>Applying OOP Principles</h3>
                <div class="system-overview">
                  <div class="class-diagram">
                    <div class="entity">
                      <strong>Book</strong><br>
                      title, author, isbn<br>
                      is_available()
                    </div>
                    <div class="entity">
                      <strong>Member</strong><br>
                      name, id, email<br>
                      can_borrow()
                    </div>
                    <div class="entity">
                      <strong>Library</strong><br>
                      books[], members[]<br>
                      borrow_book(), return_book()
                    </div>
                  </div>
                </div>
                <p><strong>Benefits:</strong> Modular design, easy to maintain and extend</p>
              </div>`,
              slideNumber: 6
            }
          ]
        },
        doc: {
          name: "OOP_Principles_Handbook.docx",
          url: "https://example.com/documents/oop-handbook.docx"
        }
      }
    }
  }
];

async function seedTheoryContent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the demo course
    const course = await Course.findById(COURSE_ID);
    if (!course) {
      console.error(`❌ Course with ID ${COURSE_ID} not found`);
      return;
    }

    console.log(`\n📚 Found course: ${course.title}`);
    console.log(`📊 Current modules count: ${course.modules?.length || 0}`);

    // Add theory content to each module
    let updatedModules = 0;

    for (const contentData of theoryContentData) {
      const { moduleIndex, theoryContent } = contentData;
      
      if (course.modules && course.modules[moduleIndex]) {
        // Add comprehensive theory content to the module
        course.modules[moduleIndex].theory = theoryContent;
        
        updatedModules++;
        
        console.log(`\n✅ Added theory content to module ${moduleIndex + 1}: "${course.modules[moduleIndex].title}"`);
        console.log(`   📝 Text content: ${theoryContent.textContent.length} characters`);
        console.log(`   📄 PDF: ${theoryContent.files?.pdf?.name || 'None'}`);
        console.log(`   📊 PPT slides: ${theoryContent.files?.ppt?.totalSlides || 0}`);
        console.log(`   📋 DOC: ${theoryContent.files?.doc?.name || 'None'}`);
        
      } else {
        console.warn(`⚠️  Module at index ${moduleIndex} does not exist`);
      }
    }

    if (updatedModules > 0) {
      // Save the updated course
      await course.save();
      console.log(`\n🎉 Successfully updated ${updatedModules} modules with comprehensive theory content!`);
      console.log(`\n📋 Summary of added content:`);
      console.log(`   - Rich text content with code examples and explanations`);
      console.log(`   - PDF reference materials for each module`);
      console.log(`   - Interactive PowerPoint presentations with multiple slides`);
      console.log(`   - DOC study guides for comprehensive learning`);
      console.log(`\n🔗 Test the theory pages at:`);
      theoryContentData.forEach((_, index) => {
        const moduleId = course.modules[index]._id;
        console.log(`   Module ${index + 1}: http://localhost:3000/courses/${COURSE_ID}/module/${moduleId}/theory`);
      });
    } else {
      console.log('❌ No modules were updated');
    }

  } catch (error) {
    console.error('❌ Error seeding theory content:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
  }
}

// Export for potential reuse
module.exports = { seedTheoryContent, theoryContentData };

// Run the script if called directly
if (require.main === module) {
  seedTheoryContent();
}