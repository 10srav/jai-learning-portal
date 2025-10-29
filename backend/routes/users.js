const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Progress = require('../models/Progress');
const Streak = require('../models/Streak');
const { verifyToken, isAdmin, isParent } = require('../middleware/auth');

// @route   GET /api/users/leaderboard
// @desc    Get user leaderboard
// @access  Private
router.get('/leaderboard', verifyToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category || 'points'; // points, level, badges

    let sortCriteria = {};
    if (category === 'points') {
      sortCriteria = { totalPoints: -1 };
    } else if (category === 'level') {
      sortCriteria = { level: -1, totalPoints: -1 };
    } else if (category === 'badges') {
      sortCriteria = { 'badges.length': -1 };
    }

    const topUsers = await User.find({ isActive: true, role: 'student' })
      .sort(sortCriteria)
      .limit(limit)
      .select('username fullName profilePicture totalPoints level badges');

    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      totalPoints: user.totalPoints,
      level: user.level,
      badgeCount: user.badges.length
    }));

    // Get current user's rank
    const currentUser = await User.findById(req.userId);
    let userRank = null;

    if (currentUser && currentUser.role === 'student') {
      if (category === 'points') {
        userRank = await User.countDocuments({
          isActive: true,
          role: 'student',
          totalPoints: { $gt: currentUser.totalPoints }
        }) + 1;
      } else if (category === 'level') {
        userRank = await User.countDocuments({
          isActive: true,
          role: 'student',
          $or: [
            { level: { $gt: currentUser.level } },
            { level: currentUser.level, totalPoints: { $gt: currentUser.totalPoints } }
          ]
        }) + 1;
      }
    }

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

// @route   GET /api/users/:userId
// @desc    Get user profile by ID
// @access  Private
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user can access this profile
    if (req.userId !== userId && req.user.role !== 'admin' && req.user.role !== 'parent') {
      // For other users, return limited info
      const user = await User.findById(userId)
        .select('username fullName profilePicture level totalPoints badges');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.json({
        success: true,
        user,
        limited: true
      });
    }

    // Full profile for own profile, admin, or parent
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get additional stats
    const progressCount = await Progress.countDocuments({ userId });
    const completedLessons = await Progress.countDocuments({ userId, status: 'completed' });
    const streak = await Streak.findOne({ userId });

    res.json({
      success: true,
      user,
      stats: {
        totalLessons: progressCount,
        completedLessons,
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/:userId/badges
// @desc    Get user's badges
// @access  Private
router.get('/:userId/badges', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('badges username fullName');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      username: user.username,
      fullName: user.fullName,
      badges: user.badges
    });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching badges',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/users/:userId/add-badge
// @desc    Award a badge to user
// @access  Admin only
router.post('/:userId/add-badge', [verifyToken, isAdmin], async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, description, icon } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Badge name and description are required'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if badge already exists
    if (user.badges.some(badge => badge.name === name)) {
      return res.status(400).json({
        success: false,
        message: 'User already has this badge'
      });
    }

    // Add badge
    user.badges.push({
      name,
      description,
      icon: icon || '🏅'
    });

    await user.save();

    res.json({
      success: true,
      message: 'Badge awarded successfully',
      badges: user.badges
    });
  } catch (error) {
    console.error('Add badge error:', error);
    res.status(500).json({
      success: false,
      message: 'Error awarding badge',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/:userId/children
// @desc    Get parent's children
// @access  Private (Parent only)
router.get('/:userId/children', [verifyToken, isParent], async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify this is the parent's own account or admin
    if (req.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view these children'
      });
    }

    const parent = await User.findById(userId);
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    // Find children linked to this parent
    const children = await User.find({
      parentEmail: parent.email,
      role: 'student'
    }).select('-password');

    // Get progress for each child
    const childrenWithProgress = await Promise.all(
      children.map(async (child) => {
        const progress = await Progress.countDocuments({ userId: child._id });
        const completed = await Progress.countDocuments({
          userId: child._id,
          status: 'completed'
        });
        const streak = await Streak.findOne({ userId: child._id });

        return {
          ...child.toObject(),
          stats: {
            totalLessons: progress,
            completedLessons: completed,
            currentStreak: streak?.currentStreak || 0
          }
        };
      })
    );

    res.json({
      success: true,
      children: childrenWithProgress
    });
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching children',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/users/:userId/deactivate
// @desc    Deactivate user account
// @access  Private (Own account or Admin)
router.put('/:userId/deactivate', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check authorization
    if (req.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to deactivate this account'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/users/:userId/reactivate
// @desc    Reactivate user account
// @access  Admin only
router.put('/:userId/reactivate', [verifyToken, isAdmin], async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: 'Account reactivated successfully'
    });
  } catch (error) {
    console.error('Reactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;