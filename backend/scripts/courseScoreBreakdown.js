const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config();

async function getCourseScoreBreakdown() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all courses with complete data
    const courses = await Course.find({});
    
    console.log('📊 COURSE SCORE BREAKDOWN ANALYSIS\n');
    console.log('=' .repeat(80));
    
    let totalSystemScore = 0;
    
    courses.forEach((course, courseIndex) => {
      console.log(`\n🎓 COURSE ${courseIndex + 1}: "${course.title}"`);
      console.log('─'.repeat(60));
      
      // Use hardcoded scoring configuration (removed from course model)
      const scoring = {
        lessonMcqMarks: 5,
        lessonCodingMarks: 25,
        moduleTestMcqMarks: 15,
        moduleTestCodingMarks: 75,
        finalExamMcqMarks: 20,
        finalExamCodingMarks: 100
      };
      
      console.log('📋 Scoring Configuration:');
      console.log(`   • Lesson MCQ: ${scoring.lessonMcqMarks} marks each`);
      console.log(`   • Lesson Coding: ${scoring.lessonCodingMarks} marks each`);
      console.log(`   • Module Test MCQ: ${scoring.moduleTestMcqMarks} marks each`);
      console.log(`   • Module Test Coding: ${scoring.moduleTestCodingMarks} marks each`);
      console.log(`   • Final Exam MCQ: ${scoring.finalExamMcqMarks} marks each`);
      console.log(`   • Final Exam Coding: ${scoring.finalExamCodingMarks} marks each`);
      
      let courseTotal = 0;
      let lessonTotal = 0;
      let moduleTestTotal = 0;
      let finalExamTotal = 0;
      
      // Analyze Topics and Lessons
      if (course.topics && course.topics.length > 0) {
        console.log('\n📚 TOPICS & LESSONS BREAKDOWN:');
        
        course.topics.forEach((topic, topicIndex) => {
          console.log(`\n   📖 Topic ${topicIndex + 1}: "${topic.title}"`);
          
          let topicTotal = 0;
          
          // Lesson Analysis
          if (topic.lessons && topic.lessons.length > 0) {
            topic.lessons.forEach((lesson, lessonIndex) => {
              console.log(`      📝 Lesson ${lessonIndex + 1}: "${lesson.title}"`);
              
              let lessonScore = 0;
              
              // Lesson MCQs
              if (lesson.mcqs && lesson.mcqs.length > 0) {
                const mcqScore = lesson.mcqs.length * scoring.lessonMcqMarks;
                lessonScore += mcqScore;
                console.log(`         • MCQs: ${lesson.mcqs.length} × ${scoring.lessonMcqMarks} = ${mcqScore} marks`);
              }
              
              // Lesson Coding Challenges
              if (lesson.codeChallenges && lesson.codeChallenges.length > 0) {
                const codingScore = lesson.codeChallenges.length * scoring.lessonCodingMarks;
                lessonScore += codingScore;
                console.log(`         • Coding: ${lesson.codeChallenges.length} × ${scoring.lessonCodingMarks} = ${codingScore} marks`);
              }
              
              console.log(`         📊 Lesson Total: ${lessonScore} marks`);
              topicTotal += lessonScore;
              lessonTotal += lessonScore;
            });
          }
          
          // Module Test Analysis
          if (topic.moduleTest) {
            console.log(`      🧪 Module Test: "${topic.moduleTest.title || 'Module Assessment'}"`);
            
            let moduleTestScore = 0;
            
            // Module Test MCQs
            if (topic.moduleTest.mcqs && topic.moduleTest.mcqs.length > 0) {
              const mcqScore = topic.moduleTest.mcqs.length * scoring.moduleTestMcqMarks;
              moduleTestScore += mcqScore;
              console.log(`         • MCQs: ${topic.moduleTest.mcqs.length} × ${scoring.moduleTestMcqMarks} = ${mcqScore} marks`);
            }
            
            // Module Test Coding Challenges
            if (topic.moduleTest.codeChallenges && topic.moduleTest.codeChallenges.length > 0) {
              const codingScore = topic.moduleTest.codeChallenges.length * scoring.moduleTestCodingMarks;
              moduleTestScore += codingScore;
              console.log(`         • Coding: ${topic.moduleTest.codeChallenges.length} × ${scoring.moduleTestCodingMarks} = ${codingScore} marks`);
            }
            
            console.log(`         📊 Module Test Total: ${moduleTestScore} marks`);
            topicTotal += moduleTestScore;
            moduleTestTotal += moduleTestScore;
          }
          
          console.log(`   📊 Topic ${topicIndex + 1} Total: ${topicTotal} marks`);
        });
      }
      
      // Final Exam Analysis
      if (course.finalExam) {
        console.log('\n🎓 FINAL EXAM BREAKDOWN:');
        console.log(`   Title: "${course.finalExam.title || 'Final Course Assessment'}"`);
        console.log(`   Duration: ${course.finalExam.duration || 120} minutes`);
        console.log(`   Passing Score: ${course.finalExam.passingScore || 70}%`);
        
        // Final Exam MCQs
        if (course.finalExam.mcqs && course.finalExam.mcqs.length > 0) {
          const mcqScore = course.finalExam.mcqs.length * scoring.finalExamMcqMarks;
          finalExamTotal += mcqScore;
          console.log(`   • MCQs: ${course.finalExam.mcqs.length} × ${scoring.finalExamMcqMarks} = ${mcqScore} marks`);
          
          // Show individual MCQ details
          course.finalExam.mcqs.forEach((mcq, mcqIndex) => {
            console.log(`     ${mcqIndex + 1}. "${mcq.question}" (${mcq.marks || scoring.finalExamMcqMarks} marks, ${mcq.difficulty || 'medium'})`);
          });
        }
        
        // Final Exam Coding Challenges
        if (course.finalExam.codeChallenges && course.finalExam.codeChallenges.length > 0) {
          const codingScore = course.finalExam.codeChallenges.length * scoring.finalExamCodingMarks;
          finalExamTotal += codingScore;
          console.log(`   • Coding: ${course.finalExam.codeChallenges.length} × ${scoring.finalExamCodingMarks} = ${codingScore} marks`);
        }
        
        console.log(`   📊 Final Exam Total: ${finalExamTotal} marks`);
      }
      
      // Course Summary
      courseTotal = lessonTotal + moduleTestTotal + finalExamTotal;
      totalSystemScore += courseTotal;
      
      console.log('\n📊 COURSE SUMMARY:');
      console.log(`   • All Lessons Total: ${lessonTotal} marks`);
      console.log(`   • All Module Tests Total: ${moduleTestTotal} marks`);
      console.log(`   • Final Exam Total: ${finalExamTotal} marks`);
      console.log(`   🎯 COURSE GRAND TOTAL: ${courseTotal} marks`);
      
      // Score Distribution
      if (courseTotal > 0) {
        console.log('\n📈 SCORE DISTRIBUTION:');
        console.log(`   • Lessons: ${((lessonTotal / courseTotal) * 100).toFixed(1)}%`);
        console.log(`   • Module Tests: ${((moduleTestTotal / courseTotal) * 100).toFixed(1)}%`);
        console.log(`   • Final Exam: ${((finalExamTotal / courseTotal) * 100).toFixed(1)}%`);
      }
    });
    
    // System-wide Summary
    console.log('\n' + '='.repeat(80));
    console.log('🌟 SYSTEM-WIDE SUMMARY:');
    console.log(`   • Total Courses: ${courses.length}`);
    console.log(`   • Total Possible Score Across All Courses: ${totalSystemScore} marks`);
    console.log(`   • Average Score Per Course: ${courses.length > 0 ? (totalSystemScore / courses.length).toFixed(1) : 0} marks`);
    
    // Recommendations
    console.log('\n💡 SCORING INSIGHTS:');
    courses.forEach((course, index) => {
      const lessonCount = course.topics?.reduce((acc, topic) => acc + (topic.lessons?.length || 0), 0) || 0;
      const moduleTestCount = course.topics?.length || 0;
      const finalExamQuestions = (course.finalExam?.mcqs?.length || 0) + (course.finalExam?.codeChallenges?.length || 0);
      
      console.log(`   Course ${index + 1}: ${lessonCount} lessons, ${moduleTestCount} module tests, ${finalExamQuestions} final exam questions`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

getCourseScoreBreakdown();
