const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { verifyToken, isAdmin, optionalAuth } = require('../middleware/auth');

// @route   GET /api/courses
// @desc    Get all active courses
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, difficulty, search, limit = 20, page = 1 } = req.query;

    // Build query
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const courses = await Course.find(query)
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Course.countDocuments(query);

    // If user is logged in, get their progress
    let userProgress = {};
    if (req.userId) {
      const progress = await Progress.find({ userId: req.userId });
      progress.forEach(p => {
        if (!userProgress[p.courseId]) {
          userProgress[p.courseId] = {
            totalLessons: 0,
            completedLessons: 0,
            inProgress: false
          };
        }
        userProgress[p.courseId].totalLessons++;
        if (p.status === 'completed') {
          userProgress[p.courseId].completedLessons++;
        }
        if (p.status === 'in_progress') {
          userProgress[p.courseId].inProgress = true;
        }
      });
    }

    // Add progress info to courses
    const coursesWithProgress = courses.map(course => ({
      ...course.toObject(),
      userProgress: userProgress[course.courseId] || null
    }));

    res.json({
      success: true,
      courses: coursesWithProgress,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/courses/featured
// @desc    Get featured courses
// @access  Public
router.get('/featured', optionalAuth, async (req, res) => {
  try {
    const courses = await Course.find({
      isActive: true,
      isFeatured: true
    })
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      courses
    });
  } catch (error) {
    console.error('Get featured courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured courses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/courses/:courseId
// @desc    Get course details
// @access  Public
router.get('/:courseId', optionalAuth, async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({ courseId });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get course statistics
    const stats = await course.getStatistics();

    // Get user's progress if logged in
    let userProgress = null;
    if (req.userId) {
      userProgress = await Progress.getCourseProgress(req.userId, courseId);
    }

    res.json({
      success: true,
      course,
      stats,
      userProgress
    });
  } catch (error) {
    console.error('Get course details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/courses
// @desc    Create a new course
// @access  Admin only
router.post('/', [
  verifyToken,
  isAdmin,
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').isIn(['python', 'web', 'javascript', 'scratch', 'math', 'science', 'english']).withMessage('Invalid category'),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const courseData = req.body;

    // Check if course already exists
    const existingCourse = await Course.findOne({ courseId: courseData.courseId });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course with this ID already exists'
      });
    }

    // Create new course
    const course = new Course({
      ...courseData,
      createdBy: req.userId
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/courses/:courseId
// @desc    Update course
// @access  Admin only
router.put('/:courseId', [verifyToken, isAdmin], async (req, res) => {
  try {
    const { courseId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates._id;
    delete updates.courseId;
    delete updates.createdBy;
    delete updates.createdAt;

    const course = await Course.findOneAndUpdate(
      { courseId },
      updates,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/courses/:courseId/modules
// @desc    Add module to course
// @access  Admin only
router.post('/:courseId/modules', [
  verifyToken,
  isAdmin,
  body('moduleId').notEmpty().withMessage('Module ID is required'),
  body('title').notEmpty().withMessage('Module title is required'),
  body('description').notEmpty().withMessage('Module description is required'),
  body('order').isInt({ min: 0 }).withMessage('Order must be a positive number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { courseId } = req.params;
    const moduleData = req.body;

    const course = await Course.findOne({ courseId });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if module already exists
    if (course.modules.some(m => m.moduleId === moduleData.moduleId)) {
      return res.status(400).json({
        success: false,
        message: 'Module with this ID already exists in the course'
      });
    }

    // Add module
    course.modules.push({
      ...moduleData,
      lessons: []
    });

    await course.save();

    res.json({
      success: true,
      message: 'Module added successfully',
      course
    });
  } catch (error) {
    console.error('Add module error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding module',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/courses/:courseId/modules/:moduleId/lessons
// @desc    Add lesson to module
// @access  Admin only
router.post('/:courseId/modules/:moduleId/lessons', [
  verifyToken,
  isAdmin,
  body('lessonId').notEmpty().withMessage('Lesson ID is required'),
  body('title').notEmpty().withMessage('Lesson title is required'),
  body('type').isIn(['video', 'interactive', 'quiz', 'project', 'reading']).withMessage('Invalid lesson type')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { courseId, moduleId } = req.params;
    const lessonData = req.body;

    const course = await Course.findOne({ courseId });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Find module
    const module = course.modules.find(m => m.moduleId === moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Check if lesson already exists
    if (module.lessons.some(l => l.lessonId === lessonData.lessonId)) {
      return res.status(400).json({
        success: false,
        message: 'Lesson with this ID already exists in the module'
      });
    }

    // Add lesson
    module.lessons.push(lessonData);

    await course.save();

    res.json({
      success: true,
      message: 'Lesson added successfully',
      course
    });
  } catch (error) {
    console.error('Add lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding lesson',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/courses/:courseId
// @desc    Deactivate course (soft delete)
// @access  Admin only
router.delete('/:courseId', [verifyToken, isAdmin], async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({ courseId });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.isActive = false;
    await course.save();

    res.json({
      success: true,
      message: 'Course deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/courses/:courseId/enroll
// @desc    Enroll in a course
// @access  Private
router.post('/:courseId/enroll', verifyToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    const course = await Course.findOne({ courseId, isActive: true });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or inactive'
      });
    }

    // Check if already enrolled
    const existingProgress = await Progress.findOne({ userId, courseId });

    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Create initial progress records for all lessons
    const progressRecords = [];
    course.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        progressRecords.push({
          userId,
          courseId: course.courseId,
          courseName: course.title,
          moduleId: module.moduleId,
          moduleName: module.title,
          lessonId: lesson.lessonId,
          lessonName: lesson.title,
          status: 'not_started'
        });
      });
    });

    if (progressRecords.length > 0) {
      await Progress.insertMany(progressRecords);
    }

    // Update enrollment count
    course.totalEnrollments += 1;
    await course.save();

    res.json({
      success: true,
      message: 'Successfully enrolled in course',
      lessonsCreated: progressRecords.length
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enrolling in course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;