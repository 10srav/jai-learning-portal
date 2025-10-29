const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date,
    default: null
  },
  streakStartDate: {
    type: Date,
    default: null
  },
  totalDaysActive: {
    type: Number,
    default: 0
  },
  dailyGoal: {
    minutesPerDay: {
      type: Number,
      default: 30 // Default 30 minutes per day
    },
    lessonsPerDay: {
      type: Number,
      default: 1 // Default 1 lesson per day
    }
  },
  todayProgress: {
    minutesCompleted: {
      type: Number,
      default: 0
    },
    lessonsCompleted: {
      type: Number,
      default: 0
    },
    goalMet: {
      type: Boolean,
      default: false
    },
    date: {
      type: Date,
      default: () => new Date().setHours(0, 0, 0, 0)
    }
  },
  weeklyStats: [{
    weekStart: Date,
    weekEnd: Date,
    daysActive: Number,
    totalMinutes: Number,
    lessonsCompleted: Number,
    streakMaintained: Boolean
  }],
  monthlyStats: [{
    month: Number,
    year: Number,
    daysActive: Number,
    totalMinutes: Number,
    lessonsCompleted: Number,
    longestStreakInMonth: Number
  }],
  achievements: {
    firstWeekStreak: {
      type: Boolean,
      default: false,
      earnedAt: Date
    },
    firstMonthStreak: {
      type: Boolean,
      default: false,
      earnedAt: Date
    },
    hundredDayStreak: {
      type: Boolean,
      default: false,
      earnedAt: Date
    },
    yearStreak: {
      type: Boolean,
      default: false,
      earnedAt: Date
    }
  },
  streakFreezes: {
    available: {
      type: Number,
      default: 3 // Start with 3 streak freezes
    },
    used: [{
      usedOn: Date,
      reason: String
    }]
  },
  notifications: {
    reminderEnabled: {
      type: Boolean,
      default: true
    },
    reminderTime: {
      type: String,
      default: '18:00' // Default 6 PM
    },
    lastReminderSent: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for performance (userId already indexed by unique: true)
streakSchema.index({ lastActivityDate: 1 });

// Update the updatedAt timestamp
streakSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if streak should be maintained
streakSchema.methods.checkStreakContinuity = function() {
  if (!this.lastActivityDate) return true;

  const today = new Date().setHours(0, 0, 0, 0);
  const lastActivity = new Date(this.lastActivityDate).setHours(0, 0, 0, 0);
  const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

  // If last activity was yesterday, streak continues
  if (daysDiff === 1) return true;

  // If last activity was today, streak continues
  if (daysDiff === 0) return true;

  // If more than 1 day has passed, check for freeze
  if (daysDiff > 1 && this.streakFreezes.available > 0) {
    // Auto-use a freeze
    this.streakFreezes.available--;
    this.streakFreezes.used.push({
      usedOn: new Date(),
      reason: 'Auto-used to maintain streak'
    });
    return true;
  }

  // Streak is broken
  return false;
};

// Update streak based on activity
streakSchema.methods.updateStreak = async function() {
  const today = new Date().setHours(0, 0, 0, 0);
  const lastActivity = this.lastActivityDate ? new Date(this.lastActivityDate).setHours(0, 0, 0, 0) : null;

  // Check if today's goal is met
  const goalMet = this.todayProgress.minutesCompleted >= this.dailyGoal.minutesPerDay ||
                  this.todayProgress.lessonsCompleted >= this.dailyGoal.lessonsPerDay;

  if (!goalMet) return this;

  // If first activity or same day activity
  if (!lastActivity || lastActivity === today) {
    if (!lastActivity) {
      this.currentStreak = 1;
      this.streakStartDate = new Date();
    }
    this.lastActivityDate = new Date();
    this.todayProgress.goalMet = true;
  }
  // If activity is from yesterday (streak continues)
  else if (Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24)) === 1) {
    this.currentStreak++;
    this.lastActivityDate = new Date();
    this.todayProgress.goalMet = true;
  }
  // If streak is broken but can be saved with freeze
  else if (this.checkStreakContinuity()) {
    this.lastActivityDate = new Date();
    this.todayProgress.goalMet = true;
  }
  // Streak is broken
  else {
    this.currentStreak = 1;
    this.streakStartDate = new Date();
    this.lastActivityDate = new Date();
    this.todayProgress.goalMet = true;
  }

  // Update longest streak
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }

  // Check for achievements
  if (this.currentStreak >= 7 && !this.achievements.firstWeekStreak) {
    this.achievements.firstWeekStreak = true;
    this.achievements.firstWeekStreakEarnedAt = new Date();
  }
  if (this.currentStreak >= 30 && !this.achievements.firstMonthStreak) {
    this.achievements.firstMonthStreak = true;
    this.achievements.firstMonthStreakEarnedAt = new Date();
  }
  if (this.currentStreak >= 100 && !this.achievements.hundredDayStreak) {
    this.achievements.hundredDayStreak = true;
    this.achievements.hundredDayStreakEarnedAt = new Date();
  }
  if (this.currentStreak >= 365 && !this.achievements.yearStreak) {
    this.achievements.yearStreak = true;
    this.achievements.yearStreakEarnedAt = new Date();
  }

  this.totalDaysActive++;

  return this.save();
};

// Reset today's progress (call at midnight)
streakSchema.methods.resetDailyProgress = function() {
  const today = new Date().setHours(0, 0, 0, 0);
  const progressDate = new Date(this.todayProgress.date).setHours(0, 0, 0, 0);

  if (today !== progressDate) {
    this.todayProgress = {
      minutesCompleted: 0,
      lessonsCompleted: 0,
      goalMet: false,
      date: new Date().setHours(0, 0, 0, 0)
    };
    return this.save();
  }
  return this;
};

const Streak = mongoose.model('Streak', streakSchema);

module.exports = Streak;