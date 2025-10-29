# JAI Learning Portal - Backend

Backend API for the JAI Learning Portal, built with Node.js, Express, and MongoDB.

## Features

- User authentication (JWT-based)
- Progress tracking for courses and lessons
- Streak management with daily goals
- Course enrollment and management
- Leaderboards and badges
- Parent account support for monitoring children

## Prerequisites

- Node.js 14+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Local Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Update the following variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_secret_key
     ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Progress
- `GET /api/progress/user/:userId` - Get user's progress
- `GET /api/progress/course/:courseId` - Get course progress
- `POST /api/progress/start` - Start a lesson
- `POST /api/progress/complete` - Complete a lesson
- `POST /api/progress/quiz` - Submit quiz results
- `GET /api/progress/stats` - Get overall statistics

### Streaks
- `GET /api/streaks` - Get current streak
- `POST /api/streaks/update` - Update streak progress
- `PUT /api/streaks/goals` - Update daily goals
- `GET /api/streaks/leaderboard` - Get streak leaderboard
- `GET /api/streaks/stats` - Get streak statistics

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:courseId` - Get course details
- `POST /api/courses/:courseId/enroll` - Enroll in course

### Users
- `GET /api/users/leaderboard` - Get user leaderboard
- `GET /api/users/:userId` - Get user profile
- `GET /api/users/:userId/badges` - Get user badges

## Deployment to Render

### Step 1: Prepare MongoDB Database

1. **Create MongoDB Atlas Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account
   - Create a new cluster (free tier available)

2. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `myFirstDatabase` with `jai-learning-portal`

### Step 2: Deploy to Render

1. **Create Render Account:**
   - Go to [Render](https://render.com)
   - Sign up for a free account

2. **Deploy from GitHub:**
   - Push your backend code to a GitHub repository
   - In Render dashboard, click "New +"
   - Select "Web Service"
   - Connect your GitHub account
   - Select your repository

3. **Configure Service:**
   - Name: `jai-learning-portal-api`
   - Region: Choose closest to you
   - Branch: `main`
   - Root Directory: `backend` (if backend is in a subdirectory)
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Add Environment Variables:**
   In Render dashboard, go to Environment tab and add:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = Your MongoDB Atlas connection string
   - `JWT_SECRET` = Click "Generate" for a secure random value
   - `FRONTEND_URL` = Your Vercel frontend URL

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for the build and deploy to complete
   - Your API will be available at `https://your-service-name.onrender.com`

### Step 3: Update Frontend

1. **Update Frontend Environment:**
   In your Vercel dashboard or `.env.production`:
   ```
   NEXT_PUBLIC_API_URL=https://your-service-name.onrender.com/api
   ```

2. **Redeploy Frontend:**
   Push changes to trigger a new deployment on Vercel

## Testing the Deployment

1. **Health Check:**
   ```bash
   curl https://your-api.onrender.com/api/health
   ```

2. **Register a Test User:**
   ```bash
   curl -X POST https://your-api.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"test123","fullName":"Test User"}'
   ```

## Monitoring

- Check Render dashboard for logs and metrics
- Monitor MongoDB Atlas for database performance
- Set up alerts for errors or downtime

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Ensure your frontend URL is correctly set in environment variables
   - Check that CORS middleware is properly configured

2. **MongoDB Connection Issues:**
   - Verify connection string is correct
   - Check IP whitelist in MongoDB Atlas (allow all IPs for Render)
   - Ensure database user has proper permissions

3. **Authentication Errors:**
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Ensure proper header format: `Authorization: Bearer <token>`

## Support

For issues or questions, please check:
- Render documentation: https://render.com/docs
- MongoDB Atlas docs: https://docs.atlas.mongodb.com
- Express.js docs: https://expressjs.com