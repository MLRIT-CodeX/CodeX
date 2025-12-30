const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const importController = require('../controllers/importController');

/* ================================
   ✅ IMPORT ROUTES - ALL ADMIN ONLY
================================ */

/**
 * @route   POST /api/import/course
 * @desc    Import an entire course with all modules and content
 * @access  Admin only
 * @body    Complete course object with modules, MCQs, challenges, etc.
 */
router.post(
  '/course',
  authenticateToken,
  isAdmin,
  importController.importEntireCourse
);

/**
 * @route   POST /api/import/course/:courseId/module
 * @desc    Import a single module to an existing course
 * @access  Admin only
 * @body    Module object with title, description, content, etc.
 */
router.post(
  '/course/:courseId/module',
  authenticateToken,
  isAdmin,
  importController.importModule
);

/**
 * @route   POST /api/import/course/:courseId/modules/bulk
 * @desc    Import multiple modules at once to an existing course
 * @access  Admin only
 * @body    { modules: [module1, module2, ...] }
 */
router.post(
  '/course/:courseId/modules/bulk',
  authenticateToken,
  isAdmin,
  importController.bulkImportModules
);

/**
 * @route   POST /api/import/course/:courseId/module/:moduleId/lecture
 * @desc    Import lecture content to a specific module
 * @access  Admin only
 * @body    Lecture object with module name, lectures array, etc.
 */
router.post(
  '/course/:courseId/module/:moduleId/lecture',
  authenticateToken,
  isAdmin,
  importController.importLectureContent
);

/**
 * @route   POST /api/import/course/:courseId/module/:moduleId/snippets
 * @desc    Import code snippets to a specific module
 * @access  Admin only
 * @body    Snippets object with codeExamples array
 */
router.post(
  '/course/:courseId/module/:moduleId/snippets',
  authenticateToken,
  isAdmin,
  importController.importCodeSnippets
);

/**
 * @route   POST /api/import/course/:courseId/module/:moduleId/theory
 * @desc    Import theory content to a specific module
 * @access  Admin only
 * @body    Theory object with textContent, files (pdf, ppt, doc)
 */
router.post(
  '/course/:courseId/module/:moduleId/theory',
  authenticateToken,
  isAdmin,
  importController.importTheoryContent
);

/**
 * @route   POST /api/import/course/:courseId/module/:moduleId/mcqs
 * @desc    Import MCQs to a specific module or module test
 * @access  Admin only
 * @body    { mcqs: [...], target: 'module' | 'moduleTest' }
 */
router.post(
  '/course/:courseId/module/:moduleId/mcqs',
  authenticateToken,
  isAdmin,
  importController.importMCQs
);

/**
 * @route   POST /api/import/course/:courseId/module/:moduleId/challenges
 * @desc    Import coding challenges to a specific module or module test
 * @access  Admin only
 * @body    { challenges: [...], target: 'module' | 'moduleTest' }
 */
router.post(
  '/course/:courseId/module/:moduleId/challenges',
  authenticateToken,
  isAdmin,
  importController.importCodingChallenges
);

module.exports = router;
