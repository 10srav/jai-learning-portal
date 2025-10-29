const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['python', 'web', 'javascript', 'scratch', 'math', 'science', 'english']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  ageGroup: {
    min: {
      type: Number,
      default: 7
    },
    max: {
      type: Number,
      default: 18
    }
  },
  thumbnail: String,
  duration: {
    type: Number, // in hours
    default: 0
  },
  modules: [{
    moduleId: String,
    title: String,
    description: String,
    order: Number,
    lessons: [{
      lessonId: String,
      title: String,
      description: String,
      type: {
        type: String,
        enum: ['video', 'interactive', 'quiz', 'project', 'reading'],
        default: 'interactive'
      },
      duration: Number, // in minutes
      content: {
        videoUrl: String,
        readingContent: String,
        interactiveContent: Object,
        quiz: {
          questions: [{
            question: String,
            options: [String],
            correctAnswer: Number,
            explanation: String,
            points: {
              type: Number,
              default: 10
            }
          }]
        }
      },
      order: Number,
      requiredForCompletion: {
        type: Boolean,
        default: true
      }
    }]
  }],
  totalLessons: {
    type: Number,
    default: 0
  },
  totalEnrollments: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  prerequisites: [String],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Index for performance
courseSchema.index({ courseId: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ isActive: 1 });

// Update the updatedAt timestamp
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Calculate total lessons
  this.totalLessons = this.modules.reduce((total, module) => {
    return total + (module.lessons ? module.lessons.length : 0);
  }, 0);

  next();
});

// Get course statistics
courseSchema.methods.getStatistics = async function() {
  const Progress = require('./Progress');

  const progressData = await Progress.find({ courseId: this.courseId });
  const completedCount = progressData.filter(p => p.status === 'completed').length;
  const inProgressCount = progressData.filter(p => p.status === 'in_progress').length;

  return {
    totalEnrollments: progressData.length,
    completedCount,
    inProgressCount,
    completionRate: progressData.length > 0
      ? Math.round((completedCount / progressData.length) * 100)
      : 0
  };
};

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;