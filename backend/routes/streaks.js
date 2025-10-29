const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Streak = require('../models/Streak');
const { verifyToken } = require('../middleware/auth');

// @route   GET /api/streaks
// @desc    Get current user's streak
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    let streak = await Streak.findOne({ userId });

    // Create streak if it doesn't exist
    if (!streak) {
      streak = new Streak({ userId });
      await streak.save();
    }

    // Reset daily progress if it's a new day
    await streak.resetDailyProgress();

    res.json({
      success: true,
      streak
    });
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching streak',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/streaks/update
// @desc    Update streak progress
// @access  Private
router.post('/update', [
  verifyToken,
  body('minutesCompleted').optional().isInt({ min: 0 }).withMessage('Minutes must be positive'),
  body('lessonsCompleted').optional().isInt({ min: 0 }).withMessage('Lessons must be positive')
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

    const userId = req.userId;
    const { minutesCompleted, lessonsCompleted } = req.body;

    let streak = await Streak.findOne({ userId });

    if (!streak) {
      streak = new Streak({ userId });
    }

    // Reset daily progress if it's a new day
    await streak.resetDailyProgress();

    // Update today's progress
    if (minutesCompleted !== undefined) {
      streak.todayProgress.minutesCompleted += minutesCompleted;
    }
    if (lessonsCompleted !== undefined) {
      streak.todayProgress.lessonsCompleted += lessonsCompleted;
    }

    // Update streak if goal is met
    await streak.updateStreak();

    res.json({
      success: true,
      message: 'Streak updated successfully',
      streak
    });
  } catch (error) {
    console.error('Update streak error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating streak',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/streaks/goals
// @desc    Update daily goals
// @access  Private
router.put('/goals', [
  verifyToken,
  body('minutesPerDay').optional().isInt({ min: 5, max: 480 }).withMessage('Minutes must be between 5 and 480'),
  body('lessonsPerDay').optional().isInt({ min: 1, max: 20 }).withMessage('Lessons must be between 1 and 20')
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

    const userId = req.userId;
    const { minutesPerDay, lessonsPerDay } = req.body;

    let streak = await Streak.findOne({ userId });

    if (!streak) {
      streak = new Streak({ userId });
    }

    // Update daily goals
    if (minutesPerDay !== undefined) {
      streak.dailyGoal.minutesPerDay = minutesPerDay;
    }
    if (lessonsPerDay !== undefined) {
      streak.dailyGoal.lessonsPerDay = lessonsPerDay;
    }

    await streak.save();

    res.json({
      success: true,
      message: 'Daily goals updated successfully',
      streak
    });
  } catch (error) {
    console.error('Update goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating goals',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/streaks/freeze
// @desc    Use a streak freeze
// @access  Private
router.post('/freeze', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    let streak = await Streak.findOne({ userId });

    if (!streak) {
      return res.status(404).json({
        success: false,
        message: 'Streak not found'
      });
    }

    if (streak.streakFreezes.available <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No streak freezes available'
      });
    }

    // Use a streak freeze
    streak.streakFreezes.available--;
    streak.streakFreezes.used.push({
      usedOn: new Date(),
      reason: 'Manual freeze'
    });

    // Maintain the streak
    streak.lastActivityDate = new Date();

    await streak.save();

    res.json({
      success: true,
      message: 'Streak freeze used successfully',
      streak
    });
  } catch (error) {
    console.error('Use freeze error:', error);
    res.status(500).json({
      success: false,
      message: 'Error using streak freeze',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/streaks/leaderboard
// @desc    Get streak leaderboard
// @access  Private
router.get('/leaderboard', verifyToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topStreaks = await Streak.find()
      .sort({ currentStreak: -1 })
      .limit(limit)
      .populate('userId', 'username fullName profilePicture level');

    const leaderboard = topStreaks.map((streak, index) => ({
      rank: index + 1,
      user: {
        id: streak.userId._id,
        username: streak.userId.username,
        fullName: streak.userId.fullName,
        profilePicture: streak.userId.profilePicture,
        level: streak.userId.level
      },
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalDaysActive: streak.totalDaysActive
    }));

    // Get current user's rank
    const userStreak = await Streak.findOne({ userId: req.userId });
    const userRank = userStreak
      ? await Streak.countDocuments({ currentStreak: { $gt: userStreak.currentStreak } }) + 1
      : null;

    res.json({
      success: true,
      leaderboard,
      userRank
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/streaks/stats
// @desc    Get detailed streak statistics
// @access  Private
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const streak = await Streak.findOne({ userId });

    if (!streak) {
      return res.status(404).json({
        success: false,
        message: 'Streak not found'
      });
    }

    // Calculate additional statistics
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Get this month's stats
    const thisMonthStats = streak.monthlyStats.find(
      stat => stat.month === currentMonth && stat.year === currentYear
    );

    // Calculate week stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
    weekStart.setHours(0, 0, 0, 0);

    const stats = {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalDaysActive: streak.totalDaysActive,
      todayProgress: streak.todayProgress,
      dailyGoal: streak.dailyGoal,
      streakFreezes: streak.streakFreezes,
      achievements: streak.achievements,
      monthlyStats: thisMonthStats || {
        month: currentMonth,
        year: currentYear,
        daysActive: 0,
        totalMinutes: 0,
        lessonsCompleted: 0
      },
      streakStatus: streak.checkStreakContinuity() ? 'active' : 'broken'
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get streak stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching streak statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/streaks/notifications
// @desc    Update notification settings
// @access  Private
router.put('/notifications', [
  verifyToken,
  body('reminderEnabled').optional().isBoolean().withMessage('Reminder enabled must be boolean'),
  body('reminderTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format')
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

    const userId = req.userId;
    const { reminderEnabled, reminderTime } = req.body;

    let streak = await Streak.findOne({ userId });

    if (!streak) {
      streak = new Streak({ userId });
    }

    // Update notification settings
    if (reminderEnabled !== undefined) {
      streak.notifications.reminderEnabled = reminderEnabled;
    }
    if (reminderTime !== undefined) {
      streak.notifications.reminderTime = reminderTime;
    }

    await streak.save();

    res.json({
      success: true,
      message: 'Notification settings updated',
      notifications: streak.notifications
    });
  } catch (error) {
    console.error('Update notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;