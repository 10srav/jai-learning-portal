const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  moduleId: {
    type: String,
    required: true
  },
  moduleName: {
    type: String,
    required: true
  },
  lessonId: {
    type: String,
    required: true
  },
  lessonName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  attempts: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  quiz: {
    attempted: {
      type: Boolean,
      default: false
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    totalQuestions: {
      type: Number,
      default: 0
    },
    correctAnswers: {
      type: Number,
      default: 0
    },
    attempts: {
      type: Number,
      default: 0
    },
    lastAttemptAt: Date
  },
  achievements: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for unique progress per user per lesson
progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
progressSchema.index({ userId: 1, courseId: 1 });
progressSchema.index({ userId: 1, status: 1 });

// Update the updatedAt timestamp
progressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate completion percentage for a module
progressSchema.statics.getModuleProgress = async function(userId, moduleId) {
  const progress = await this.find({ userId, moduleId });
  const totalLessons = progress.length;
  const completedLessons = progress.filter(p => p.status === 'completed').length;

  return {
    totalLessons,
    completedLessons,
    percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  };
};

// Calculate overall course progress
progressSchema.statics.getCourseProgress = async function(userId, courseId) {
  const progress = await this.find({ userId, courseId });
  const totalLessons = progress.length;
  const completedLessons = progress.filter(p => p.status === 'completed').length;
  const inProgressLessons = progress.filter(p => p.status === 'in_progress').length;

  const totalTimeSpent = progress.reduce((acc, p) => acc + p.timeSpent, 0);
  const averageScore = progress
    .filter(p => p.score !== null)
    .reduce((acc, p, _, arr) => acc + p.score / arr.length, 0);

  return {
    totalLessons,
    completedLessons,
    inProgressLessons,
    notStartedLessons: totalLessons - completedLessons - inProgressLessons,
    percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    totalTimeSpent,
    averageScore: Math.round(averageScore)
  };
};

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;