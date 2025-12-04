// Final Exam Marks Breakdown Analysis

console.log('📊 Final Exam Marks Breakdown Analysis\n');

// MCQ Questions (20 questions)
const mcqMarks = [
  15, // Python - List reference
  10, // Python - Data types
  12, // Python - String operations
  10, // Python - List methods
  15, // Python - Function with defaults
  10, // Java - Constants
  10, // Java - Array length
  12, // Java - Access modifiers
  15, // Java - String comparison
  10, // Java - Inheritance
  10, // C - Pointer declaration
  18, // C - Undefined behavior (harder question)
  12, // C - Memory allocation
  10, // C - Int size
  10, // C - Header files
  15, // Algorithms - Binary search
  10, // Data structures - Stack
  12, // Programming - Recursion
  12, // OOP - Characteristics
  8   // General - API definition
];

console.log('🔢 MCQ Questions Breakdown:');
mcqMarks.forEach((marks, index) => {
  console.log(`   MCQ ${index + 1}: ${marks} marks`);
});

const totalMCQMarks = mcqMarks.reduce((sum, marks) => sum + marks, 0);
console.log(`\n📝 Total MCQ Marks: ${totalMCQMarks}`);

// Coding Challenges (4 challenges)
const codingMarks = [
  40, // Array Sum Calculator (Easy)
  50, // Palindrome Checker (Medium)
  60, // Fibonacci Generator (Medium-Hard)
  50  // Prime Number Checker (Medium)
];

console.log('\n💻 Coding Challenges Breakdown:');
codingMarks.forEach((marks, index) => {
  const challenges = [
    'Array Sum Calculator', 
    'Palindrome Checker', 
    'Fibonacci Generator', 
    'Prime Number Checker'
  ];
  console.log(`   Challenge ${index + 1} - ${challenges[index]}: ${marks} marks`);
});

const totalCodingMarks = codingMarks.reduce((sum, marks) => sum + marks, 0);
console.log(`\n💻 Total Coding Marks: ${totalCodingMarks}`);

// Final Calculation
const grandTotal = totalMCQMarks + totalCodingMarks;
console.log('\n🎯 FINAL CALCULATION:');
console.log(`   📝 MCQ Marks: ${totalMCQMarks}`);
console.log(`   💻 Coding Marks: ${totalCodingMarks}`);
console.log(`   🏆 Grand Total: ${grandTotal}`);

console.log('\n📊 Why 500 Points?');
console.log('   ✅ 20 MCQ questions with varying difficulty (8-18 marks each)');
console.log('   ✅ 4 Coding challenges with progressive difficulty (40-60 marks each)');
console.log('   ✅ Designed to be comprehensive and reward both theory and practical skills');
console.log('   ✅ 500 is a round number that makes percentage calculation easy');
console.log('   ✅ Passing score of 70% = 350 points (reasonable for final exam)');