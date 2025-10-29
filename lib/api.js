// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function for API requests
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` })
    }
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

// Authentication API
export const authAPI = {
  async register(userData) {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  async login(credentials) {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      if (response.streak) {
        localStorage.setItem('streak', JSON.stringify(response.streak));
      }
    }

    return response;
  },

  async getMe() {
    return await apiRequest('/auth/me');
  },

  async updateProfile(updates) {
    return await apiRequest('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async changePassword(passwords) {
    return await apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwords)
    });
  },

  async refreshToken() {
    return await apiRequest('/auth/refresh-token', {
      method: 'POST'
    });
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('streak');
  }
};

// Progress API
export const progressAPI = {
  async getUserProgress(userId) {
    return await apiRequest(`/progress/user/${userId}`);
  },

  async getCourseProgress(courseId) {
    return await apiRequest(`/progress/course/${courseId}`);
  },

  async getModuleProgress(moduleId) {
    return await apiRequest(`/progress/module/${moduleId}`);
  },

  async startLesson(lessonData) {
    return await apiRequest('/progress/start', {
      method: 'POST',
      body: JSON.stringify(lessonData)
    });
  },

  async completeLesson(completionData) {
    return await apiRequest('/progress/complete', {
      method: 'POST',
      body: JSON.stringify(completionData)
    });
  },

  async submitQuiz(quizData) {
    return await apiRequest('/progress/quiz', {
      method: 'POST',
      body: JSON.stringify(quizData)
    });
  },

  async updateTime(timeData) {
    return await apiRequest('/progress/update-time', {
      method: 'PUT',
      body: JSON.stringify(timeData)
    });
  },

  async getStats() {
    return await apiRequest('/progress/stats');
  }
};

// Streak API
export const streakAPI = {
  async getStreak() {
    return await apiRequest('/streaks');
  },

  async updateStreak(updates) {
    return await apiRequest('/streaks/update', {
      method: 'POST',
      body: JSON.stringify(updates)
    });
  },

  async updateGoals(goals) {
    return await apiRequest('/streaks/goals', {
      method: 'PUT',
      body: JSON.stringify(goals)
    });
  },

  async useFreeze() {
    return await apiRequest('/streaks/freeze', {
      method: 'POST'
    });
  },

  async getLeaderboard(limit = 10) {
    return await apiRequest(`/streaks/leaderboard?limit=${limit}`);
  },

  async getStats() {
    return await apiRequest('/streaks/stats');
  },

  async updateNotifications(settings) {
    return await apiRequest('/streaks/notifications', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }
};

// Courses API
export const coursesAPI = {
  async getCourses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/courses${queryString ? `?${queryString}` : ''}`);
  },

  async getFeaturedCourses() {
    return await apiRequest('/courses/featured');
  },

  async getCourse(courseId) {
    return await apiRequest(`/courses/${courseId}`);
  },

  async enrollInCourse(courseId) {
    return await apiRequest(`/courses/${courseId}/enroll`, {
      method: 'POST'
    });
  },

  async createCourse(courseData) {
    return await apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  },

  async updateCourse(courseId, updates) {
    return await apiRequest(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async addModule(courseId, moduleData) {
    return await apiRequest(`/courses/${courseId}/modules`, {
      method: 'POST',
      body: JSON.stringify(moduleData)
    });
  },

  async addLesson(courseId, moduleId, lessonData) {
    return await apiRequest(`/courses/${courseId}/modules/${moduleId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(lessonData)
    });
  },

  async deactivateCourse(courseId) {
    return await apiRequest(`/courses/${courseId}`, {
      method: 'DELETE'
    });
  }
};

// Users API
export const usersAPI = {
  async getLeaderboard(category = 'points', limit = 10) {
    return await apiRequest(`/users/leaderboard?category=${category}&limit=${limit}`);
  },

  async getUserProfile(userId) {
    return await apiRequest(`/users/${userId}`);
  },

  async getUserBadges(userId) {
    return await apiRequest(`/users/${userId}/badges`);
  },

  async addBadge(userId, badgeData) {
    return await apiRequest(`/users/${userId}/add-badge`, {
      method: 'POST',
      body: JSON.stringify(badgeData)
    });
  },

  async getChildren(userId) {
    return await apiRequest(`/users/${userId}/children`);
  },

  async deactivateAccount(userId) {
    return await apiRequest(`/users/${userId}/deactivate`, {
      method: 'PUT'
    });
  },

  async reactivateAccount(userId) {
    return await apiRequest(`/users/${userId}/reactivate`, {
      method: 'PUT'
    });
  }
};

// Helper function to check if user is authenticated
export function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}

// Helper function to get current user
export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Helper function to get current streak
export function getCurrentStreak() {
  const streakStr = localStorage.getItem('streak');
  return streakStr ? JSON.parse(streakStr) : null;
}

export default {
  authAPI,
  progressAPI,
  streakAPI,
  coursesAPI,
  usersAPI,
  isAuthenticated,
  getCurrentUser,
  getCurrentStreak
};