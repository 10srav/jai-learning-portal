# 🚀 HOW TO RUN JAI LEARNING PORTAL

This project has been cleaned up and is ready to run! Follow these simple steps.

## ✅ Current Status

- **Frontend**: Running on http://localhost:3000 ✅
- **Backend**: Running on http://localhost:5000 ✅
- **Database**: Using in-memory storage for testing (no MongoDB needed)

## 📋 Quick Start (Already Running!)

The project is already running on your system:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health

You can now:
1. Open http://localhost:3000 in your browser
2. Click "Login" to access the login page
3. Register a new account or continue without login

## 🔄 How to Restart the Project

If you need to restart the project later:

### Step 1: Start the Backend (Test Mode - No Database Required)
```bash
cd backend
npm test
```

This will start the backend on http://localhost:5000

### Step 2: Start the Frontend (In a new terminal)
```bash
cd ..
npm run dev
```

This will start the frontend on http://localhost:3000

## 📁 Project Structure (Cleaned)

```
JAI LEARNING PORTAL/
├── app/                 # Next.js frontend pages
│   ├── dashboard/       # Dashboard page
│   ├── login/          # Login/Register page
│   └── layout.tsx      # Main layout with AuthProvider
├── backend/            # Express.js backend
│   ├── models/         # Database schemas
│   ├── routes/         # API endpoints
│   ├── middleware/     # Authentication
│   ├── server.js       # Production server (needs MongoDB)
│   └── server-test.js  # Test server (no database needed)
├── contexts/           # React contexts for state
├── lib/               # API integration functions
└── public/            # Static assets

```

## 🎮 Features Available

### Without Database (Current Setup)
- ✅ User registration and login
- ✅ Basic authentication
- ✅ Progress tracking (in-memory)
- ✅ Streak management
- ✅ Sample courses
- ✅ Leaderboard
- ⚠️ Data resets when server restarts

### With Database (Production)
- All above features plus:
- ✅ Persistent data storage
- ✅ Real course content
- ✅ Long-term progress tracking
- ✅ Multi-user support

## 🛠️ Commands Reference

### Frontend Commands
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
```

### Backend Commands
```bash
cd backend
npm test           # Run test server (no database)
npm run dev        # Run with MongoDB (requires setup)
npm start          # Production mode
```

## 🔧 Configuration

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend Test Mode
No configuration needed! Uses in-memory storage.

### Backend Production Mode
Create `backend/.env` file:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## 🌐 Testing the API

You can test the API directly:

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123","fullName":"Test User"}'
```

## ⚠️ Important Notes

1. **Test Mode**: Currently running in test mode with in-memory storage
2. **Data Persistence**: Data will be lost when you restart the backend
3. **Production**: For production, set up MongoDB Atlas (see DEPLOYMENT_GUIDE.md)

## 🚨 Troubleshooting

### Port Already in Use
If you see "port already in use" error:
```bash
# Kill process on port 3000 (frontend)
npx kill-port 3000

# Kill process on port 5000 (backend)
npx kill-port 5000
```

### Frontend Not Connecting to Backend
- Make sure backend is running on port 5000
- Check .env.local has correct API URL
- Check browser console for CORS errors

### Build Errors
- Make sure all dependencies are installed: `npm install`
- For backend: `cd backend && npm install`

## 📱 Access Points

- **Frontend**: http://localhost:3000
- **Login Page**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard
- **API Health**: http://localhost:5000/api/health

## 🎯 Next Steps

1. **Local Development**: Keep using test mode for development
2. **Production Setup**: Follow DEPLOYMENT_GUIDE.md for cloud deployment
3. **Add Content**: Start adding your courses and lessons

## 💡 Tips

- Use Chrome DevTools to monitor API calls
- Check terminal for server logs
- Test mode is perfect for development
- Set up MongoDB when ready for production

---

**Project is ready to use!** Open http://localhost:3000 in your browser.