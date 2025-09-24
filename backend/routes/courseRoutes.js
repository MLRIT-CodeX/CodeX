const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Course = require("../models/Course");
const SkillTest = require("../models/SkillTest");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

// Health check endpoint (no authentication required)
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Course API is running" });
});

// Update basic course information (Admin only) - Simplified version
router.patch(
  "/:id/basic",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      console.log('Received basic update request:', req.body);
      console.log('Course ID:', req.params.id);
      
      // First check if course exists
      const existingCourse = await Course.findById(req.params.id);
      if (!existingCourse) {
        console.log('Course not found with ID:', req.params.id);
        return res.status(404).json({ message: "Course not found" });
      }
      
      console.log('Found existing course:', existingCourse.title);
      
      // Create update object with only basic fields
      const updateData = {};
      if (req.body.title !== undefined && req.body.title.trim()) {
        updateData.title = req.body.title.trim();
      }
      if (req.body.description !== undefined && req.body.description.trim()) {
        updateData.description = req.body.description.trim();
      }
      if (req.body.difficulty !== undefined && ["Easy", "Medium", "Hard"].includes(req.body.difficulty)) {
        updateData.difficulty = req.body.difficulty;
      }

      console.log('Updating basic course info with data:', updateData);

      // Use findOneAndUpdate to avoid validation issues
      const course = await Course.findOneAndUpdate(
        { _id: req.params.id }, 
        { $set: updateData }, 
        { new: true, runValidators: false }
      );
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      console.log('Basic course info updated successfully:', course.title);
      res.json(course);
    } catch (err) {
      console.error('Error updating basic course info:', err);
      res.status(500).json({ message: err.message });
    }
  }
);

// Helper: Validate lessons according to new schema rules
function validateLessonStructure(topics) {
  if (!Array.isArray(topics)) return false;

  for (const topic of topics) {
    if (!Array.isArray(topic.lessons)) return false;

    for (const lesson of topic.lessons) {
      if (!lesson.content || !lesson.review) {
        return { valid: false, message: `Lesson "${lesson.title}" must have content and review.` };
      }
      if (!Array.isArray(lesson.mcqs) || lesson.mcqs.length !== 2) {
        return { valid: false, message: `Lesson "${lesson.title}" must have exactly 2 MCQs.` };
      }
      if (!Array.isArray(lesson.codeChallenges) || lesson.codeChallenges.length !== 2) {
        return { valid: false, message: `Lesson "${lesson.title}" must have exactly 2 coding challenges.` };
      }
    }
  }
  return { valid: true };
}

// Helper: Generate final exam from course content
async function generateFinalExam(course, scoringConfig) {
  try {
    console.log(`Generating final exam for course: ${course.title}`);
    
    // Collect all MCQs and coding challenges from all lessons
    const allMCQs = [];
    const allCodingChallenges = [];
    
    course.topics.forEach((topic, topicIndex) => {
      topic.lessons.forEach((lesson, lessonIndex) => {
        // Add MCQs with enhanced metadata
        if (lesson.mcqs && lesson.mcqs.length > 0) {
          lesson.mcqs.forEach((mcq, mcqIndex) => {
            allMCQs.push({
              question: mcq.question,
              options: mcq.options,
              correct: mcq.correct,
              explanation: mcq.explanation,
              marks: scoringConfig?.finalExamMcqMarks || 20,
              difficulty: course.difficulty || 'Medium',
              topicTitle: topic.title,
              lessonTitle: lesson.title,
              source: `Topic ${topicIndex + 1}, Lesson ${lessonIndex + 1}, MCQ ${mcqIndex + 1}`
            });
          });
        }
        
        // Add coding challenges with enhanced metadata
        if (lesson.codeChallenges && lesson.codeChallenges.length > 0) {
          lesson.codeChallenges.forEach((challenge, challengeIndex) => {
            allCodingChallenges.push({
              title: challenge.title,
              description: challenge.description,
              sampleInput: challenge.sampleInput,
              sampleOutput: challenge.sampleOutput,
              constraints: challenge.constraints,
              initialCode: challenge.initialCode,
              language: challenge.language || 'python',
              marks: scoringConfig?.finalExamCodingMarks || 100,
              difficulty: course.difficulty || 'Medium',
              timeLimit: 300, // 5 minutes per coding challenge
              topicTitle: topic.title,
              lessonTitle: lesson.title,
              source: `Topic ${topicIndex + 1}, Lesson ${lessonIndex + 1}, Challenge ${challengeIndex + 1}`,
              testCases: challenge.testCases || [
                {
                  input: challenge.sampleInput || "",
                  expectedOutput: challenge.sampleOutput || "",
                  isHidden: false
                }
              ]
            });
          });
        }
      });
    });
    
    // Select questions for final exam (sample selection - you can make this more sophisticated)
    const selectedMCQs = allMCQs.slice(0, Math.min(10, allMCQs.length)); // Max 10 MCQs
    const selectedCoding = allCodingChallenges.slice(0, Math.min(5, allCodingChallenges.length)); // Max 5 coding challenges
    
    // Calculate total marks
    const mcqMarks = selectedMCQs.reduce((sum, mcq) => sum + (mcq.marks || 20), 0);
    const codingMarks = selectedCoding.reduce((sum, challenge) => sum + (challenge.marks || 100), 0);
    const totalMarks = mcqMarks + codingMarks;
    
    // Create final exam SkillTest
    const finalExam = new SkillTest({
      title: `${course.title} - Final Exam`,
      description: `Comprehensive final examination covering all topics in ${course.title}. This exam tests your mastery of the complete course curriculum.`,
      duration: 120, // 2 hours
      type: 'final_exam',
      difficulty: course.difficulty || 'Medium',
      courseId: course._id,
      isFinalExam: true,
      passingScore: 70,
      totalMarks: totalMarks,
      questions: selectedMCQs,
      codingProblems: selectedCoding,
      securitySettings: {
        preventCopyPaste: true,
        preventTabSwitch: true,
        preventRightClick: true,
        fullScreenRequired: true,
        webcamMonitoring: true,
        timeLimit: 120
      },
      attempts: [],
      isActive: true,
      createdBy: null // Will be set by the calling function
    });
    
    const savedExam = await finalExam.save();
    console.log(`✅ Final exam created successfully with ID: ${savedExam._id}`);
    console.log(`📊 Exam stats: ${selectedMCQs.length} MCQs, ${selectedCoding.length} coding challenges, ${totalMarks} total marks`);
    
    return savedExam;
  } catch (error) {
    console.error('❌ Error generating final exam:', error);
    throw error;
  }
}

// Create new course with topics and lessons (Admin only)
router.post(
  "/",
  authenticateToken,
  isAdmin,
  [
    body("title").notEmpty(),
    body("description").notEmpty(),
    body("difficulty").optional().isIn(["Easy", "Medium", "Hard"]),
    body("topics").isArray(),
    body("testUnlockThreshold").optional().isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const lessonCheck = validateLessonStructure(req.body.topics);
    if (!lessonCheck.valid) {
      return res.status(400).json({ message: lessonCheck.message });
    }

    try {
      // Create course with auto-generated final exam
      const courseData = { ...req.body };
      
      // Generate final exam from course content if not provided
      if (!courseData.finalExam && courseData.topics && courseData.topics.length > 0) {
        console.log('Auto-generating final exam for course:', courseData.title);
        
        // Collect all MCQs and coding challenges from lessons
        const allMCQs = [];
        const allCodingChallenges = [];
        
        courseData.topics.forEach((topic, topicIndex) => {
          if (topic.lessons && topic.lessons.length > 0) {
            topic.lessons.forEach((lesson, lessonIndex) => {
              // Collect MCQs
              if (lesson.mcqs && lesson.mcqs.length > 0) {
                lesson.mcqs.forEach((mcq, mcqIndex) => {
                  allMCQs.push({
                    question: mcq.question,
                    options: mcq.options,
                    correct: mcq.correct,
                    explanation: mcq.explanation,
                    marks: courseData.scoringConfig?.finalExamMcqMarks || 20,
                    difficulty: courseData.difficulty || 'medium'
                  });
                });
              }
              
              // Collect coding challenges
              if (lesson.codeChallenges && lesson.codeChallenges.length > 0) {
                lesson.codeChallenges.forEach((challenge, challengeIndex) => {
                  allCodingChallenges.push({
                    title: challenge.title,
                    description: challenge.description,
                    sampleInput: challenge.sampleInput,
                    sampleOutput: challenge.sampleOutput,
                    constraints: challenge.constraints,
                    initialCode: challenge.initialCode,
                    language: challenge.language || 'python',
                    marks: courseData.scoringConfig?.finalExamCodingMarks || 100,
                    difficulty: courseData.difficulty || 'medium',
                    timeLimit: challenge.timeLimit || 300,
                    testCases: challenge.testCases || [
                      {
                        input: challenge.sampleInput || "",
                        expectedOutput: challenge.sampleOutput || "",
                        isHidden: false
                      }
                    ]
                  });
                });
              }
            });
          }
        });
        
        // Select questions for final exam (you can make this more sophisticated)
        const selectedMCQs = allMCQs.slice(0, Math.min(10, allMCQs.length)); // Max 10 MCQs
        const selectedCoding = allCodingChallenges.slice(0, Math.min(5, allCodingChallenges.length)); // Max 5 coding challenges
        
        // Calculate total marks
        const mcqMarks = selectedMCQs.reduce((sum, mcq) => sum + (mcq.marks || 20), 0);
        const codingMarks = selectedCoding.reduce((sum, challenge) => sum + (challenge.marks || 100), 0);
        const totalMarks = mcqMarks + codingMarks;
        
        // Create final exam object
        courseData.finalExam = {
          title: `${courseData.title} - Final Exam`,
          description: `Comprehensive final examination covering all topics in ${courseData.title}. This exam tests your mastery of the complete course curriculum.`,
          mcqs: selectedMCQs,
          codeChallenges: selectedCoding,
          totalMarks: totalMarks > 0 ? totalMarks : 1000,
          duration: 120, // 2 hours
          passingScore: 70,
          isSecure: true,
          securitySettings: {
            preventCopyPaste: true,
            preventTabSwitch: true,
            preventRightClick: true,
            fullScreenRequired: true,
            webcamMonitoring: true,
            timeLimit: 120
          },
          isActive: true
        };
        
        console.log(`✅ Auto-generated final exam with ${selectedMCQs.length} MCQs and ${selectedCoding.length} coding challenges`);
      }
      
      const course = new Course(courseData);
      const savedCourse = await course.save();
      
      console.log(`✅ Course created successfully: ${savedCourse.title}`);
      if (savedCourse.finalExam) {
        console.log(`📊 Final exam included with ${savedCourse.finalExam.mcqs.length} MCQs and ${savedCourse.finalExam.codeChallenges.length} coding challenges`);
      }
      
      res.status(201).json(savedCourse);
    } catch (err) {
      console.error('Error creating course:', err);
      res.status(500).json({ message: err.message });
    }
  }
);

// List all courses
router.get("/", authenticateToken, async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

// Get course details
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    console.log(`Fetching course with ID: ${req.params.id}`);
    const course = await Course.findById(req.params.id);
    if (!course) {
      console.log(`Course not found: ${req.params.id}`);
      return res.status(404).json({ message: "Course not found" });
    }
    console.log(`Course found: ${course.title}`);
    res.json(course);
  } catch (err) {
    console.error(`Error fetching course ${req.params.id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

// Get course about content
router.get("/:id/about", authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    
    // Generate comprehensive about content based on course data
    const aboutContent = {
      title: `About ${course.title}`,
      content: `
        <h2>Course Overview</h2>
        <p>${course.description}</p>
        
        <h3>What You'll Learn</h3>
        <p>This comprehensive course will take you from beginner to advanced level through interactive lessons, coding challenges, and real-world projects.</p>
        
        <h3>Course Structure</h3>
        <p>This course is structured into <strong>${course.topics?.length || 0} comprehensive modules</strong>, each designed to build upon the previous knowledge and provide hands-on experience.</p>
        
        <h3>Difficulty Level</h3>
        <p>This course is designed for <strong>${course.difficulty === 'easy' || course.difficulty === 'Easy' ? 'Beginner' : 
          course.difficulty === 'medium' || course.difficulty === 'Medium' ? 'Intermediate' : 'Advanced'}</strong> level learners. Whether you're just starting out or looking to enhance your existing skills, this course provides the perfect learning path.</p>
        
        <h3>Learning Objectives</h3>
        <ul>
          <li>Master fundamental concepts and principles</li>
          <li>Build practical coding projects</li>
          <li>Learn industry best practices</li>
          <li>Prepare for technical interviews</li>
          <li>Develop problem-solving skills</li>
          <li>Gain hands-on experience with real-world scenarios</li>
        </ul>
        
        <h3>Prerequisites</h3>
        <p>No prior experience is required for this course. It's designed to be accessible to beginners while providing valuable insights for intermediate learners.</p>
        
        <h3>Course Features</h3>
        <ul>
          <li><strong>Interactive Lessons:</strong> Engaging content with practical examples</li>
          <li><strong>Coding Challenges:</strong> Hands-on practice with real problems</li>
          <li><strong>Knowledge Assessments:</strong> Test your understanding with quizzes</li>
          <li><strong>Final Exam:</strong> Comprehensive evaluation of your learning</li>
          <li><strong>Certificate:</strong> Earn a certificate upon completion</li>
        </ul>
        
        <h3>Learning Outcomes</h3>
        <p>By the end of this course, you will have:</p>
        <ul>
          <li>A solid understanding of ${course.title.toLowerCase()} fundamentals</li>
          <li>Practical experience with real-world applications</li>
          <li>Confidence to tackle complex problems</li>
          <li>Portfolio of projects to showcase your skills</li>
          <li>Industry-recognized certification</li>
        </ul>
        
        <h3>Support and Resources</h3>
        <p>Throughout your learning journey, you'll have access to:</p>
        <ul>
          <li>Comprehensive course materials</li>
          <li>Interactive coding environment</li>
          <li>Progress tracking and analytics</li>
          <li>Community support and discussions</li>
        </ul>
        
        <blockquote>
          <p>"The best way to learn is by doing. This course provides you with the perfect balance of theory and practice to master ${course.title.toLowerCase()}."</p>
        </blockquote>
        
        <h3>Ready to Start?</h3>
        <p>Enroll now and begin your journey to mastering ${course.title.toLowerCase()}. With our structured approach and hands-on learning methodology, you'll be well-equipped to succeed in your learning goals.</p>
      `
    };
    
    res.json(aboutContent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update course (Admin only)
router.put(
  "/:id",
  authenticateToken,
  isAdmin,
  [
    body("title").optional().notEmpty(),
    body("description").optional().notEmpty(),
    body("difficulty").optional().isIn(["Easy", "Medium", "Hard"]),
    body("topics").optional().isArray(),
    body("testUnlockThreshold").optional().isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (req.body.topics) {
      const lessonCheck = validateLessonStructure(req.body.topics);
      if (!lessonCheck.valid) {
        return res.status(400).json({ message: lessonCheck.message });
      }
    }

    try {
      const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!course) return res.status(404).json({ message: "Course not found" });
      res.json(course);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Delete course (Admin only)
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll user in a course
router.post("/:id/enroll", authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // If already enrolled, respond idempotently with success
    if ((course.enrolledUsers || []).some(u => u.toString() === userId.toString())) {
      return res.json({ 
        message: "User already enrolled in this course", 
        course: {
          id: course._id,
          title: course.title,
          enrolledCount: course.enrolledCount
        }
      });
    }

    // Atomically add user and increment enrolledCount
    const updated = await Course.findByIdAndUpdate(
      courseId,
      { 
        $addToSet: { enrolledUsers: userId },
        $inc: { enrolledCount: 1 }
      },
      { new: true }
    );

    res.json({ 
      message: "Successfully enrolled in course", 
      course: {
        id: updated._id,
        title: updated.title,
        enrolledCount: updated.enrolledCount
      }
    });
  } catch (err) {
    console.error('Error enrolling in course:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   DELETE /api/courses/:id/unenroll
// @desc    Unenroll user from a course
router.delete("/:id/unenroll", authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is enrolled
    const isEnrolled = (course.enrolledUsers || []).some(u => u.toString() === userId.toString());
    if (!isEnrolled) {
      return res.status(400).json({ message: "User not enrolled in this course" });
    }

    // Atomically remove user and decrement enrolledCount
    const updated = await Course.findByIdAndUpdate(
      courseId,
      {
        $pull: { enrolledUsers: userId },
        $inc: { enrolledCount: -1 }
      },
      { new: true }
    );

    res.json({ 
      message: "Successfully unenrolled from course",
      course: {
        id: updated._id,
        title: updated.title,
        enrolledCount: Math.max(0, updated.enrolledCount)
      }
    });
  } catch (err) {
    console.error('Error unenrolling from course:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   GET /api/courses/:id/topics
// @desc    Get course topics with lessons (Updated for unified schema)
router.get("/:id/topics", authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Return topics with unified lesson structure
    const topics = course.topics.map(topic => ({
      id: topic._id,
      title: topic.title,
      description: topic.description,
      order: topic.order,
      lessons: topic.lessons.map(lesson => ({
        id: lesson._id,
        title: lesson.title,
        type: lesson.type,
        duration: lesson.duration,
        order: lesson.order,
        hasContent: !!lesson.content,
        hasReview: !!lesson.review,
        mcqCount: lesson.mcqs?.length || 0,
        codeChallengeCount: lesson.codeChallenges?.length || 0
      })),
      moduleTest: topic.moduleTest ? {
        totalMarks: topic.moduleTest.totalMarks,
        questionCount: (topic.moduleTest.mcqs?.length || 0) + (topic.moduleTest.codeChallenges?.length || 0)
      } : null
    }));

    res.json({ topics });
  } catch (err) {
    console.error('Error fetching course topics:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   GET /api/courses/:id/topics/:topicId/lessons/:lessonId
// @desc    Get specific lesson content (Updated for unified schema)
router.get("/:id/topics/:topicId/lessons/:lessonId", authenticateToken, async (req, res) => {
  try {
    const { id: courseId, topicId, lessonId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const topic = course.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const lesson = topic.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Return lesson with unified structure: theory, MCQs, coding challenges, review
    const lessonData = {
      id: lesson._id,
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration,
      order: lesson.order,
      content: lesson.content || '', // Theory content
      mcqs: lesson.mcqs || [], // Exactly 2 MCQs
      codeChallenges: lesson.codeChallenges || [], // Exactly 2 coding challenges
      review: lesson.review || '', // Review content
      topicTitle: topic.title,
      courseTitle: course.title
    };

    res.json({ lesson: lessonData });
  } catch (err) {
    console.error('Error fetching lesson:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   GET /api/courses/:id/topics/:topicId/test
// @desc    Get module test for a topic
router.get("/:id/topics/:topicId/test", authenticateToken, async (req, res) => {
  try {
    const { id: courseId, topicId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const topic = course.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    if (!topic.moduleTest) {
      return res.status(404).json({ message: "No test available for this topic" });
    }

    // Return test without correct answers (for security)
    const testData = {
      topicTitle: topic.title,
      totalMarks: topic.moduleTest.totalMarks,
      mcqs: topic.moduleTest.mcqs?.map(mcq => ({
        question: mcq.question,
        options: mcq.options,
        // Don't send correct answer
      })) || [],
      codeChallenges: topic.moduleTest.codeChallenges?.map(challenge => ({
        title: challenge.title,
        description: challenge.description,
        sampleInput: challenge.sampleInput,
        sampleOutput: challenge.sampleOutput,
        constraints: challenge.constraints,
        initialCode: challenge.initialCode,
        language: challenge.language
        // Don't send test cases
      })) || []
    };

    res.json(testData);
  } catch (err) {
    console.error('Error fetching module test:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   GET /api/courses/user/:userId
// @desc    Get courses enrolled by a specific user
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if requesting user can access this data (admin or own data)
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const courses = await Course.find({ 
      enrolledUsers: userId,
      isActive: true 
    }).select('title description difficulty enrolledCount createdAt');

    res.json({ courses });
  } catch (err) {
    console.error('Error fetching user courses:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   POST /api/courses/populate-final-exams
// @desc    Populate final exams for courses that don't have them (Admin only)
router.post("/populate-final-exams", authenticateToken, isAdmin, async (req, res) => {
  try {
    console.log('Starting final exam population process...');
    
    // Get all active courses
    const allCourses = await Course.find({ isActive: true });
    console.log(`Found ${allCourses.length} active courses`);
    
    const results = {
      total: allCourses.length,
      processed: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      details: []
    };
    
    for (const course of allCourses) {
      try {
        results.processed++;
        
        const courseDetail = {
          id: course._id,
          title: course.title,
          status: '',
          message: ''
        };
        
        // Check if course already has a populated final exam
        const hasValidFinalExam = course.finalExam && 
          course.finalExam.mcqs && 
          course.finalExam.codeChallenges && 
          (course.finalExam.mcqs.length > 0 || course.finalExam.codeChallenges.length > 0);
        
        if (hasValidFinalExam) {
          courseDetail.status = 'skipped';
          courseDetail.message = `Already has final exam (${course.finalExam.mcqs.length} MCQs, ${course.finalExam.codeChallenges.length} coding challenges)`;
          results.skipped++;
        } else {
          // Collect content from lessons
          const allMCQs = [];
          const allCodingChallenges = [];
          
          course.topics.forEach((topic) => {
            if (topic.lessons && topic.lessons.length > 0) {
              topic.lessons.forEach((lesson) => {
                // Collect MCQs
                if (lesson.mcqs && lesson.mcqs.length > 0) {
                  lesson.mcqs.forEach((mcq) => {
                    allMCQs.push({
                      question: mcq.question,
                      options: mcq.options,
                      correct: mcq.correct,
                      explanation: mcq.explanation,
                      marks: course.scoringConfig?.finalExamMcqMarks || 20,
                      difficulty: course.difficulty || 'medium'
                    });
                  });
                }
                
                // Collect coding challenges
                if (lesson.codeChallenges && lesson.codeChallenges.length > 0) {
                  lesson.codeChallenges.forEach((challenge) => {
                    allCodingChallenges.push({
                      title: challenge.title,
                      description: challenge.description,
                      sampleInput: challenge.sampleInput,
                      sampleOutput: challenge.sampleOutput,
                      constraints: challenge.constraints,
                      initialCode: challenge.initialCode,
                      language: challenge.language || 'python',
                      marks: course.scoringConfig?.finalExamCodingMarks || 100,
                      difficulty: course.difficulty || 'medium',
                      timeLimit: challenge.timeLimit || 300,
                      testCases: challenge.testCases || [
                        {
                          input: challenge.sampleInput || "",
                          expectedOutput: challenge.sampleOutput || "",
                          isHidden: false
                        }
                      ]
                    });
                  });
                }
              });
            }
          });
          
          if (allMCQs.length === 0 && allCodingChallenges.length === 0) {
            courseDetail.status = 'skipped';
            courseDetail.message = 'No MCQs or coding challenges found in lessons';
            results.skipped++;
          } else {
            // Select questions for final exam
            const selectedMCQs = allMCQs.slice(0, Math.min(10, allMCQs.length));
            const selectedCoding = allCodingChallenges.slice(0, Math.min(5, allCodingChallenges.length));
            
            // Calculate total marks
            const mcqMarks = selectedMCQs.reduce((sum, mcq) => sum + (mcq.marks || 20), 0);
            const codingMarks = selectedCoding.reduce((sum, challenge) => sum + (challenge.marks || 100), 0);
            const totalMarks = mcqMarks + codingMarks;
            
            // Create final exam object
            const finalExamData = {
              title: `${course.title} - Final Exam`,
              description: `Comprehensive final examination covering all topics in ${course.title}. This exam tests your mastery of the complete course curriculum.`,
              mcqs: selectedMCQs,
              codeChallenges: selectedCoding,
              totalMarks: totalMarks > 0 ? totalMarks : 1000,
              duration: 120, // 2 hours
              passingScore: 70,
              isSecure: true,
              securitySettings: {
                preventCopyPaste: true,
                preventTabSwitch: true,
                preventRightClick: true,
                fullScreenRequired: true,
                webcamMonitoring: true,
                timeLimit: 120
              },
              isActive: true
            };
            
            // Update the course
            await Course.findByIdAndUpdate(
              course._id,
              { finalExam: finalExamData },
              { new: true }
            );
            
            courseDetail.status = 'updated';
            courseDetail.message = `Created final exam with ${selectedMCQs.length} MCQs and ${selectedCoding.length} coding challenges (${totalMarks} marks)`;
            results.updated++;
          }
        }
        
        results.details.push(courseDetail);
        
      } catch (error) {
        console.error(`Error processing course ${course.title}:`, error);
        results.errors++;
        results.details.push({
          id: course._id,
          title: course.title,
          status: 'error',
          message: error.message
        });
      }
    }
    
    console.log('Final exam population completed:', results);
    res.json({
      success: true,
      message: 'Final exam population completed',
      results
    });
    
  } catch (error) {
    console.error('Error in populate final exams:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to populate final exams',
      error: error.message 
    });
  }
});

module.exports = router;
