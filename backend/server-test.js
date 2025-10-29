const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage for testing (no database required)
const users = [];
const progress = [];
const streaks = [];

// Simple auth middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  // For testing, just decode the token (in production, verify with JWT)
  try {
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'JAI Learning Portal API is running (Test Mode)',
    timestamp: new Date().toISOString(),
    mode: 'TEST - No database required'
  });
});

// Auth Routes
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, fullName } = req.body;

  // Check if user exists
  if (users.find(u => u.username === username || u.email === email)) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }

  // Create user
  const newUser = {
    _id: Date.now().toString(),
    username,
    email,
    fullName,
    totalPoints: 0,
    level: 1,
    badges: [],
    createdAt: new Date()
  };

  users.push({ ...newUser, password }); // Store password separately in real app

  // Create simple token
  const token = `test.${Buffer.from(JSON.stringify({ userId: newUser._id })).toString('base64')}.signature`;

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: newUser
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  // Find user
  const user = users.find(u =>
    (u.username === username || u.email === username) && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Create token
  const token = `test.${Buffer.from(JSON.stringify({ userId: user._id })).toString('base64')}.signature`;

  // Get user without password
  const { password: _, ...userProfile } = user;

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: userProfile,
    streak: streaks.find(s => s.userId === user._id) || {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null
    }
  });
});

app.get('/api/auth/me', verifyToken, (req, res) => {
  const user = users.find(u => u._id === req.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const { password, ...userProfile } = user;

  res.json({
    success: true,
    user: userProfile,
    streak: streaks.find(s => s.userId === req.userId) || null
  });
});

// Progress Routes
app.post('/api/progress/start', verifyToken, (req, res) => {
  const { courseId, courseName, moduleId, moduleName, lessonId, lessonName } = req.body;

  const existingProgress = progress.find(p =>
    p.userId === req.userId && p.lessonId === lessonId
  );

  if (existingProgress) {
    existingProgress.status = 'in_progress';
    existingProgress.attempts++;
  } else {
    progress.push({
      userId: req.userId,
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

  res.json({
    success: true,
    message: 'Lesson started successfully'
  });
});

app.post('/api/progress/complete', verifyToken, (req, res) => {
  const { lessonId, timeSpent, score } = req.body;

  const lessonProgress = progress.find(p =>
    p.userId === req.userId && p.lessonId === lessonId
  );

  if (!lessonProgress) {
    return res.status(404).json({
      success: false,
      message: 'Progress not found'
    });
  }

  lessonProgress.status = 'completed';
  lessonProgress.completedAt = new Date();
  lessonProgress.timeSpent = timeSpent;
  lessonProgress.score = score;

  // Update user points
  const user = users.find(u => u._id === req.userId);
  if (user) {
    const pointsEarned = score ? Math.round(score / 10) : 10;
    user.totalPoints += pointsEarned;
    user.level = Math.floor(user.totalPoints / 100) + 1;
  }

  res.json({
    success: true,
    message: 'Lesson completed successfully',
    pointsEarned: score ? Math.round(score / 10) : 10,
    totalPoints: user?.totalPoints || 0,
    level: user?.level || 1
  });
});

app.get('/api/progress/stats', verifyToken, (req, res) => {
  const userProgress = progress.filter(p => p.userId === req.userId);

  const stats = {
    totalLessons: userProgress.length,
    completedLessons: userProgress.filter(p => p.status === 'completed').length,
    inProgressLessons: userProgress.filter(p => p.status === 'in_progress').length,
    averageScore: userProgress
      .filter(p => p.score !== undefined)
      .reduce((acc, p, _, arr) => acc + (p.score / arr.length), 0) || 0
  };

  res.json({
    success: true,
    stats
  });
});

// Streak Routes
app.get('/api/streaks', verifyToken, (req, res) => {
  let streak = streaks.find(s => s.userId === req.userId);

  if (!streak) {
    streak = {
      userId: req.userId,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      todayProgress: {
        minutesCompleted: 0,
        lessonsCompleted: 0,
        goalMet: false,
        date: new Date().setHours(0, 0, 0, 0)
      },
      dailyGoal: {
        minutesPerDay: 30,
        lessonsPerDay: 1
      }
    };
    streaks.push(streak);
  }

  res.json({
    success: true,
    streak
  });
});

app.post('/api/streaks/update', verifyToken, (req, res) => {
  const { minutesCompleted, lessonsCompleted } = req.body;

  let streak = streaks.find(s => s.userId === req.userId);

  if (!streak) {
    streak = {
      userId: req.userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: new Date(),
      todayProgress: {
        minutesCompleted: 0,
        lessonsCompleted: 0,
        goalMet: false,
        date: new Date().setHours(0, 0, 0, 0)
      },
      dailyGoal: {
        minutesPerDay: 30,
        lessonsPerDay: 1
      }
    };
    streaks.push(streak);
  }

  if (minutesCompleted) {
    streak.todayProgress.minutesCompleted += minutesCompleted;
  }
  if (lessonsCompleted) {
    streak.todayProgress.lessonsCompleted += lessonsCompleted;
  }

  // Check if goal is met
  if (streak.todayProgress.minutesCompleted >= streak.dailyGoal.minutesPerDay ||
      streak.todayProgress.lessonsCompleted >= streak.dailyGoal.lessonsPerDay) {
    streak.todayProgress.goalMet = true;
    streak.currentStreak++;
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }
  }

  streak.lastActivityDate = new Date();

  res.json({
    success: true,
    message: 'Streak updated successfully',
    streak
  });
});

// Sample courses data
const sampleCourses = [
  {
    courseId: 'python-basics',
    title: 'Python Basics',
    description: 'Learn Python programming from scratch',
    category: 'python',
    difficulty: 'beginner',
    thumbnail: '/api/placeholder/400/300',
    totalLessons: 10,
    modules: []
  },
  {
    courseId: 'web-dev-intro',
    title: 'Web Development Introduction',
    description: 'Start your journey in web development',
    category: 'web',
    difficulty: 'beginner',
    thumbnail: '/api/placeholder/400/300',
    totalLessons: 15,
    modules: []
  },
  {
    courseId: 'javascript-fundamentals',
    title: 'JavaScript Fundamentals',
    description: 'Master the basics of JavaScript',
    category: 'javascript',
    difficulty: 'intermediate',
    thumbnail: '/api/placeholder/400/300',
    totalLessons: 20,
    modules: []
  }
];

// Courses Routes
app.get('/api/courses', (req, res) => {
  res.json({
    success: true,
    courses: sampleCourses,
    pagination: {
      total: sampleCourses.length,
      page: 1,
      pages: 1,
      limit: 20
    }
  });
});

app.get('/api/courses/:courseId', (req, res) => {
  const course = sampleCourses.find(c => c.courseId === req.params.courseId);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  res.json({
    success: true,
    course
  });
});

// Users Routes
app.get('/api/users/leaderboard', (req, res) => {
  const sortedUsers = [...users]
    .map(u => {
      const { password, ...profile } = u;
      return profile;
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 10);

  res.json({
    success: true,
    leaderboard: sortedUsers.map((user, index) => ({
      rank: index + 1,
      ...user
    }))
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ========================================
  🚀 JAI Learning Portal Backend (TEST MODE)
  ========================================

  Server is running on: http://localhost:${PORT}
  API Health Check: http://localhost:${PORT}/api/health

  ⚠️  TEST MODE - Using in-memory storage
  ⚠️  Data will be lost when server restarts

  For production, configure MongoDB in .env file
  ========================================
  `);
});