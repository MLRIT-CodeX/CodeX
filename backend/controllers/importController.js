const Course = require('../models/Course');
const mongoose = require('mongoose');

/* ================================
   ✅ VALIDATION HELPERS
================================ */

/**
 * Validate MCQ structure
 */
const validateMCQ = (mcq) => {
  const errors = [];
  
  if (!mcq.question || typeof mcq.question !== 'string') {
    errors.push('MCQ must have a valid question');
  }
  
  if (!Array.isArray(mcq.options) || mcq.options.length < 2) {
    errors.push('MCQ must have at least 2 options');
  }
  
  if (typeof mcq.correct !== 'number' || mcq.correct < 0 || mcq.correct >= (mcq.options?.length || 0)) {
    errors.push('MCQ correct index must be valid');
  }
  
  if (mcq.marks && (mcq.marks < 0.5 || mcq.marks > 100)) {
    errors.push('MCQ marks must be between 0.5 and 100');
  }
  
  if (mcq.difficulty && !['easy', 'medium', 'hard'].includes(mcq.difficulty)) {
    errors.push('MCQ difficulty must be easy, medium, or hard');
  }
  
  return errors;
};

/**
 * Validate Coding Challenge structure
 */
const validateCodingChallenge = (challenge) => {
  const errors = [];
  
  if (!challenge.title || typeof challenge.title !== 'string') {
    errors.push('Coding challenge must have a valid title');
  }
  
  if (!challenge.description || typeof challenge.description !== 'string') {
    errors.push('Coding challenge must have a valid description');
  }
  
  if (challenge.difficulty && !['easy', 'medium', 'hard'].includes(challenge.difficulty)) {
    errors.push('Coding challenge difficulty must be easy, medium, or hard');
  }
  
  if (challenge.testCases && !Array.isArray(challenge.testCases)) {
    errors.push('Test cases must be an array');
  }
  
  return errors;
};

/**
 * Validate Lecture Content structure
 */
const validateLectureContent = (lecture) => {
  const errors = [];
  
  if (!lecture.module || typeof lecture.module !== 'string') {
    errors.push('Lecture must have a valid module name');
  }
  
  if (!Array.isArray(lecture.lectures) || lecture.lectures.length === 0) {
    errors.push('Lecture must have at least one lecture topic');
  }
  
  lecture.lectures?.forEach((lec, index) => {
    if (!lec.topic) {
      errors.push(`Lecture ${index + 1} must have a topic`);
    }
  });
  
  return errors;
};

/**
 * Validate Code Snippets structure
 */
const validateCodeSnippets = (snippets) => {
  const errors = [];
  
  if (!snippets.codeExamples || !Array.isArray(snippets.codeExamples)) {
    errors.push('Snippets must have a codeExamples array');
  }
  
  snippets.codeExamples?.forEach((example, index) => {
    if (!example.title) {
      errors.push(`Code example ${index + 1} must have a title`);
    }
    if (!example.code) {
      errors.push(`Code example ${index + 1} must have code`);
    }
  });
  
  return errors;
};

/**
 * Validate Module structure
 */
const validateModule = (module) => {
  const errors = [];
  
  if (!module.title || typeof module.title !== 'string') {
    errors.push('Module must have a valid title');
  }
  
  if (typeof module.order !== 'number') {
    errors.push('Module must have a valid order number');
  }
  
  // Validate nested content
  if (module.mcqs) {
    module.mcqs.forEach((mcq, index) => {
      const mcqErrors = validateMCQ(mcq);
      if (mcqErrors.length > 0) {
        errors.push(`MCQ ${index + 1}: ${mcqErrors.join(', ')}`);
      }
    });
  }
  
  if (module.codeChallenges) {
    module.codeChallenges.forEach((challenge, index) => {
      const challengeErrors = validateCodingChallenge(challenge);
      if (challengeErrors.length > 0) {
        errors.push(`Coding Challenge ${index + 1}: ${challengeErrors.join(', ')}`);
      }
    });
  }
  
  if (module.lecture) {
    const lectureErrors = validateLectureContent(module.lecture);
    if (lectureErrors.length > 0) {
      errors.push(`Lecture: ${lectureErrors.join(', ')}`);
    }
  }
  
  if (module.snippets) {
    const snippetErrors = validateCodeSnippets(module.snippets);
    if (snippetErrors.length > 0) {
      errors.push(`Snippets: ${snippetErrors.join(', ')}`);
    }
  }
  
  return errors;
};

/**
 * Validate Course structure
 */
const validateCourse = (course) => {
  const errors = [];
  
  if (!course.title || typeof course.title !== 'string') {
    errors.push('Course must have a valid title');
  }
  
  if (!course.description || typeof course.description !== 'string') {
    errors.push('Course must have a valid description');
  }
  
  if (course.difficulty && !['easy', 'medium', 'hard'].includes(course.difficulty)) {
    errors.push('Course difficulty must be easy, medium, or hard');
  }
  
  if (course.modules) {
    if (!Array.isArray(course.modules)) {
      errors.push('Modules must be an array');
    } else {
      course.modules.forEach((module, index) => {
        const moduleErrors = validateModule(module);
        if (moduleErrors.length > 0) {
          errors.push(`Module ${index + 1} (${module.title || 'Untitled'}): ${moduleErrors.join(', ')}`);
        }
      });
    }
  }
  
  return errors;
};

/* ================================
   ✅ IMPORT ENTIRE COURSE
================================ */
exports.importEntireCourse = async (req, res) => {
  try {
    const courseData = req.body;
    
    console.log('📦 Importing entire course:', courseData.title);
    
    // Validate course structure
    const validationErrors = validateCourse(courseData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Ensure modules have proper _id
    if (courseData.modules) {
      courseData.modules = courseData.modules.map(module => ({
        ...module,
        _id: module._id || new mongoose.Types.ObjectId()
      }));
    }
    
    // Create new course
    const course = new Course(courseData);
    const savedCourse = await course.save();
    
    console.log('✅ Course imported successfully:', savedCourse._id);
    
    res.status(201).json({
      success: true,
      message: 'Course imported successfully',
      course: savedCourse,
      stats: {
        modulesImported: savedCourse.modules?.length || 0,
        totalMCQs: savedCourse.modules?.reduce((sum, m) => sum + (m.mcqs?.length || 0), 0) || 0,
        totalChallenges: savedCourse.modules?.reduce((sum, m) => sum + (m.codeChallenges?.length || 0), 0) || 0
      }
    });
    
  } catch (error) {
    console.error('❌ Error importing course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import course',
      error: error.message
    });
  }
};

/* ================================
   ✅ IMPORT INDIVIDUAL MODULE
================================ */
exports.importModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const moduleData = req.body;
    
    console.log('📦 Importing module to course:', courseId);
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }
    
    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Validate module structure
    const validationErrors = validateModule(moduleData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Ensure module has _id
    if (!moduleData._id) {
      moduleData._id = new mongoose.Types.ObjectId();
    }
    
    // Add module to course
    course.modules.push(moduleData);
    await course.save();
    
    console.log('✅ Module imported successfully');
    
    res.status(201).json({
      success: true,
      message: 'Module imported successfully',
      module: moduleData,
      courseId: course._id,
      totalModules: course.modules.length
    });
    
  } catch (error) {
    console.error('❌ Error importing module:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import module',
      error: error.message
    });
  }
};

/* ================================
   ✅ IMPORT LECTURE CONTENT
================================ */
exports.importLectureContent = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const lectureData = req.body;
    
    console.log('📦 Importing lecture content to module:', moduleId);
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }
    
    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Find module
    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Validate lecture content
    const validationErrors = validateLectureContent(lectureData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Update module lecture content
    module.lecture = lectureData;
    await course.save();
    
    console.log('✅ Lecture content imported successfully');
    
    res.status(200).json({
      success: true,
      message: 'Lecture content imported successfully',
      lecture: module.lecture,
      moduleId: module._id,
      totalLectures: lectureData.lectures?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Error importing lecture content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import lecture content',
      error: error.message
    });
  }
};

/* ================================
   ✅ IMPORT CODE SNIPPETS
================================ */
exports.importCodeSnippets = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const snippetsData = req.body;
    
    console.log('📦 Importing code snippets to module:', moduleId);
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }
    
    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Find module
    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Validate snippets
    const validationErrors = validateCodeSnippets(snippetsData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Update module snippets
    module.snippets = snippetsData;
    await course.save();
    
    console.log('✅ Code snippets imported successfully');
    
    res.status(200).json({
      success: true,
      message: 'Code snippets imported successfully',
      snippets: module.snippets,
      moduleId: module._id,
      totalSnippets: snippetsData.codeExamples?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Error importing code snippets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import code snippets',
      error: error.message
    });
  }
};

/* ================================
   ✅ IMPORT MCQs
================================ */
exports.importMCQs = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const { mcqs, target } = req.body; // target: 'module' or 'moduleTest'
    
    console.log(`📦 Importing ${mcqs?.length || 0} MCQs to ${target || 'module'}`);
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }
    
    // Validate MCQs array
    if (!Array.isArray(mcqs) || mcqs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'MCQs must be a non-empty array'
      });
    }
    
    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Find module
    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Validate each MCQ
    const validationErrors = [];
    mcqs.forEach((mcq, index) => {
      const errors = validateMCQ(mcq);
      if (errors.length > 0) {
        validationErrors.push(`MCQ ${index + 1}: ${errors.join(', ')}`);
      }
    });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Import MCQs to appropriate location
    if (target === 'moduleTest') {
      if (!module.moduleTest) {
        module.moduleTest = { mcqs: [], codeChallenges: [] };
      }
      module.moduleTest.mcqs.push(...mcqs);
    } else {
      if (!module.mcqs) {
        module.mcqs = [];
      }
      module.mcqs.push(...mcqs);
    }
    
    await course.save();
    
    console.log('✅ MCQs imported successfully');
    
    res.status(200).json({
      success: true,
      message: 'MCQs imported successfully',
      target,
      moduleId: module._id,
      importedCount: mcqs.length,
      totalMCQs: target === 'moduleTest' ? module.moduleTest.mcqs.length : module.mcqs.length
    });
    
  } catch (error) {
    console.error('❌ Error importing MCQs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import MCQs',
      error: error.message
    });
  }
};

/* ================================
   ✅ IMPORT CODING CHALLENGES
================================ */
exports.importCodingChallenges = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const { challenges, target } = req.body; // target: 'module' or 'moduleTest'
    
    console.log(`📦 Importing ${challenges?.length || 0} coding challenges to ${target || 'module'}`);
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }
    
    // Validate challenges array
    if (!Array.isArray(challenges) || challenges.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Challenges must be a non-empty array'
      });
    }
    
    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Find module
    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Validate each challenge
    const validationErrors = [];
    challenges.forEach((challenge, index) => {
      const errors = validateCodingChallenge(challenge);
      if (errors.length > 0) {
        validationErrors.push(`Challenge ${index + 1}: ${errors.join(', ')}`);
      }
    });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Import challenges to appropriate location
    if (target === 'moduleTest') {
      if (!module.moduleTest) {
        module.moduleTest = { mcqs: [], codeChallenges: [] };
      }
      module.moduleTest.codeChallenges.push(...challenges);
    } else {
      if (!module.codeChallenges) {
        module.codeChallenges = [];
      }
      module.codeChallenges.push(...challenges);
    }
    
    await course.save();
    
    console.log('✅ Coding challenges imported successfully');
    
    res.status(200).json({
      success: true,
      message: 'Coding challenges imported successfully',
      target,
      moduleId: module._id,
      importedCount: challenges.length,
      totalChallenges: target === 'moduleTest' ? module.moduleTest.codeChallenges.length : module.codeChallenges.length
    });
    
  } catch (error) {
    console.error('❌ Error importing coding challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import coding challenges',
      error: error.message
    });
  }
};

/* ================================
   ✅ IMPORT THEORY CONTENT
================================ */
exports.importTheoryContent = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const theoryData = req.body;
    
    console.log('📦 Importing theory content to module:', moduleId);
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }
    
    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Find module
    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Update module theory content
    module.theory = theoryData;
    await course.save();
    
    console.log('✅ Theory content imported successfully');
    
    res.status(200).json({
      success: true,
      message: 'Theory content imported successfully',
      theory: module.theory,
      moduleId: module._id
    });
    
  } catch (error) {
    console.error('❌ Error importing theory content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import theory content',
      error: error.message
    });
  }
};

/* ================================
   ✅ BULK IMPORT MODULES
================================ */
exports.bulkImportModules = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { modules } = req.body;
    
    console.log(`📦 Bulk importing ${modules?.length || 0} modules`);
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }
    
    // Validate modules array
    if (!Array.isArray(modules) || modules.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Modules must be a non-empty array'
      });
    }
    
    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Validate all modules
    const validationErrors = [];
    modules.forEach((module, index) => {
      const errors = validateModule(module);
      if (errors.length > 0) {
        validationErrors.push(`Module ${index + 1} (${module.title || 'Untitled'}): ${errors.join(', ')}`);
      }
    });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Ensure all modules have _id
    const modulesWithIds = modules.map(module => ({
      ...module,
      _id: module._id || new mongoose.Types.ObjectId()
    }));
    
    // Add all modules to course
    course.modules.push(...modulesWithIds);
    await course.save();
    
    console.log('✅ Modules bulk imported successfully');
    
    res.status(201).json({
      success: true,
      message: 'Modules bulk imported successfully',
      importedCount: modules.length,
      totalModules: course.modules.length,
      courseId: course._id
    });
    
  } catch (error) {
    console.error('❌ Error bulk importing modules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk import modules',
      error: error.message
    });
  }
};
