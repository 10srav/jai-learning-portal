const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const Progress = require('../models/Progress');
const Streak = require('../models/Streak');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// @route   GET /api/progress/user/:userId
// @desc    Get all progress for a user
// @access  Private
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user can access this data
    if (req.userId !== userId && req.user.role !== 'admin' && req.user.role !== 'parent') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this progress'
      });
    }

    const progress = await Progress.find({ userId }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/progress/course/:courseId
// @desc    Get user's progress for a specific course
// @access  Private
router.get('/course/:courseId', verifyToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    const progress = await Progress.find({ userId, courseId });
    const courseStats = await Progress.getCourseProgress(userId, courseId);

    res.json({
      success: true,
      progress,
      stats: courseStats
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/progress/module/:moduleId
// @desc    Get user's progress for a specific module
// @access  Private
router.get('/module/:moduleId', verifyToken, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.userId;

    const progress = await Progress.find({ userId, moduleId });
    const moduleStats = await Progress.getModuleProgress(userId, moduleId);

    res.json({
      success: true,
      progress,
      stats: moduleStats
    });
  } catch (error) {
    console.error('Get module progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching module progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/progress/start
// @desc    Start a lesson
// @access  Private
router.post('/start', [
  verifyToken,
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('courseName').notEmpty().withMessage('Course name is required'),
  body('moduleId').notEmpty().withMessage('Module ID is required'),
  body('moduleName').notEmpty().withMessage('Module name is required'),
  body('lessonId').notEmpty().withMessage('Lesson ID is required'),
  body('lessonName').notEmpty().withMessage('Lesson name is required')
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

    const { courseId, courseName, moduleId, moduleName, lessonId, lessonName } = req.body;
    const userId = req.userId;

    // Check if progress already exists
    let progress = await Progress.findOne({ userId, lessonId });

    if (progress) {
      // Update existing progress
      if (progress.status === 'not_started') {
        progress.status = 'in_progress';
        progress.startedAt = new Date();
      }
      progress.attempts += 1;
    } else {
      // Create new progress
      progress = new Progress({
        userId,
        courseId,
        courseName,
        moduleId,
        moduleName,
        lessonId,
        lessonName,
        status: 'in_progress',
        startedAt: new Date(),
        attempts: 1
      });
    }

    await progress.save();

    res.json({
      success: true,
      message: 'Lesson started successfully',
      progress
    });
  } catch (error) {
    console.error('Start lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting lesson',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/progress/complete
// @desc    Complete a lesson
// @access  Private
router.post('/complete', [
  verifyToken,
  body('lessonId').notEmpty().withMessage('Lesson ID is required'),
  body('timeSpent').isInt({ min: 0 }).withMessage('Time spent must be a positive number'),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100')
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

    const { lessonId, timeSpent, score, notes } = req.body;
    const userId = req.userId;

    // Find progress
    const progress = await Progress.findOne({ userId, lessonId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found. Please start the lesson first.'
      });
    }

    // Update progress
    progress.status = 'completed';
    progress.completedAt = new Date();
    progress.timeSpent += timeSpent;
    if (score !== undefined) {
      progress.score = score;
    }
    if (notes !== undefined) {
      progress.notes = notes;
    }

    await progress.save();

    // Update user points
    const user = await User.findById(userId);
    const pointsEarned = score ? Math.round(score / 10) : 10;
    user.totalPoints += pointsEarned;

    // Check for level up (every 100 points)
    const newLevel = Math.floor(user.totalPoints / 100) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }

    await user.save();

    // Update streak
    const streak = await Streak.findOne({ userId });
    if (streak) {
      streak.todayProgress.lessonsCompleted += 1;
      streak.todayProgress.minutesCompleted += Math.round(timeSpent / 60);
      await streak.updateStreak();
    }

    res.json({
      success: true,
      message: 'Lesson completed successfully',
      progress,
      pointsEarned,
      totalPoints: user.totalPoints,
      level: user.level,
      streak: streak || null
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing lesson',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/progress/quiz
// @desc    Submit quiz results
// @access  Private
router.post('/quiz', [
  verifyToken,
  body('lessonId').notEmpty().withMessage('Lesson ID is required'),
  body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('totalQuestions').isInt({ min: 1 }).withMessage('Total questions must be at least 1'),
  body('correctAnswers').isInt({ min: 0 }).withMessage('Correct answers must be non-negative')
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

    const { lessonId, score, totalQuestions, correctAnswers } = req.body;
    const userId = req.userId;

    // Find or create progress
    let progress = await Progress.findOne({ userId, lessonId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found. Please start the lesson first.'
      });
    }

    // Update quiz data
    progress.quiz = {
      attempted: true,
      score,
      totalQuestions,
      correctAnswers,
      attempts: (progress.quiz?.attempts || 0) + 1,
      lastAttemptAt: new Date()
    };

    // Update overall score if better
    if (!progress.score || score > progress.score) {
      progress.score = score;
    }

    await progress.save();

    // Award points
    const user = await User.findById(userId);
    const pointsEarned = Math.round(score / 5); // 20 points max for perfect quiz
    user.totalPoints += pointsEarned;

    // Check for badges
    if (score === 100 && !user.badges.some(b => b.name === 'Quiz Master')) {
      user.badges.push({
        name: 'Quiz Master',
        description: 'Achieved 100% on a quiz',
        icon: '🎯'
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      progress,
      pointsEarned,
      totalPoints: user.totalPoints
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/progress/update-time
// @desc    Update time spent on a lesson
// @access  Private
router.put('/update-time', [
  verifyToken,
  body('lessonId').notEmpty().withMessage('Lesson ID is required'),
  body('additionalTime').isInt({ min: 0 }).withMessage('Additional time must be positive')
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

    const { lessonId, additionalTime } = req.body;
    const userId = req.userId;

    const progress = await Progress.findOne({ userId, lessonId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    progress.timeSpent += additionalTime;
    await progress.save();

    // Update daily streak time
    const streak = await Streak.findOne({ userId });
    if (streak) {
      streak.todayProgress.minutesCompleted += Math.round(additionalTime / 60);
      await streak.save();
    }

    res.json({
      success: true,
      message: 'Time updated successfully',
      progress
    });
  } catch (error) {
    console.error('Update time error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating time',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/progress/stats
// @desc    Get overall progress statistics
// @access  Private
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const allProgress = await Progress.find({ userId });

    const stats = {
      totalLessons: allProgress.length,
      completedLessons: allProgress.filter(p => p.status === 'completed').length,
      inProgressLessons: allProgress.filter(p => p.status === 'in_progress').length,
      totalTimeSpent: allProgress.reduce((acc, p) => acc + p.timeSpent, 0),
      averageScore: allProgress
        .filter(p => p.score !== null)
        .reduce((acc, p, _, arr) => acc + p.score / arr.length, 0) || 0,
      totalQuizzesTaken: allProgress.filter(p => p.quiz?.attempted).length,
      averageQuizScore: allProgress
        .filter(p => p.quiz?.score !== undefined)
        .reduce((acc, p, _, arr) => acc + p.quiz.score / arr.length, 0) || 0,
      courseProgress: {}
    };

    // Group by course
    const courseGroups = {};
    allProgress.forEach(p => {
      if (!courseGroups[p.courseId]) {
        courseGroups[p.courseId] = {
          courseName: p.courseName,
          lessons: []
        };
      }
      courseGroups[p.courseId].lessons.push(p);
    });

    // Calculate progress per course
    for (const courseId in courseGroups) {
      const courseLessons = courseGroups[courseId].lessons;
      stats.courseProgress[courseId] = {
        name: courseGroups[courseId].courseName,
        total: courseLessons.length,
        completed: courseLessons.filter(l => l.status === 'completed').length,
        percentage: Math.round(
          (courseLessons.filter(l => l.status === 'completed').length / courseLessons.length) * 100
        )
      };
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;