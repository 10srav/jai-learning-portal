# JAI Learning Portal - Complete Deployment Guide

This guide will help you deploy the full-stack JAI Learning Portal with:
- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render
- **Database**: MongoDB Atlas (free tier)

## 🚀 Quick Overview

1. Set up MongoDB Atlas database
2. Deploy backend to Render
3. Deploy frontend to Vercel
4. Connect everything together

---

## Step 1: MongoDB Atlas Setup (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free"
3. Sign up with Google or create an account
4. Choose the **FREE** Shared Cluster option

### 1.2 Create a Cluster
1. Choose a cloud provider (AWS recommended)
2. Select a region closest to you
3. Cluster Name: `jai-learning-cluster`
4. Click "Create Cluster" (takes 3-5 minutes)

### 1.3 Set up Database Access
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Username: `jailearning`
4. Password: Create a strong password (save this!)
5. User Privileges: "Read and write to any database"
6. Click "Add User"

### 1.4 Set up Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for Render)
4. Click "Confirm"

### 1.5 Get Connection String
1. Go back to "Clusters"
2. Click "Connect" button
3. Choose "Connect your application"
4. Copy the connection string
5. It looks like: `mongodb+srv://jailearning:<password>@cluster0.xxxxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
6. Replace `<password>` with your actual password
7. Replace `myFirstDatabase` with `jai-learning-portal`

**Save this connection string! You'll need it for Render.**

---

## Step 2: Deploy Backend to Render

### 2.1 Prepare Your Code
1. Create a GitHub account if you don't have one
2. Create a new repository called `jai-learning-portal`
3. Upload the backend folder to GitHub

### 2.2 Create Render Account
1. Go to [Render](https://render.com)
2. Sign up with GitHub
3. Verify your email

### 2.3 Deploy Backend
1. In Render Dashboard, click "New +"
2. Select "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `jai-learning-api`
   - **Region**: Select closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 2.4 Add Environment Variables
Click "Environment" tab and add:

| Key | Value |
|-----|-------|
| NODE_ENV | production |
| MONGODB_URI | (Your MongoDB connection string from Step 1.5) |
| JWT_SECRET | (Click "Generate" for a random secret) |
| PORT | 5000 |
| FRONTEND_URL | https://jai-learning-portal.vercel.app |

### 2.5 Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Once deployed, you'll get a URL like: `https://jai-learning-api.onrender.com`
4. Test it by visiting: `https://jai-learning-api.onrender.com/api/health`

**Save your backend URL!**

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend
1. Push your complete project to GitHub (if not already done)

### 3.2 Create Vercel Account
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Verify your email

### 3.3 Deploy Frontend
1. Click "New Project"
2. Import your GitHub repository
3. Configure:
   - **Project Name**: `jai-learning-portal`
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `.` (leave as is)

### 3.4 Add Environment Variables
Add the following environment variable:

| Key | Value |
|-----|-------|
| NEXT_PUBLIC_API_URL | https://jai-learning-api.onrender.com/api |

(Replace with your actual Render backend URL from Step 2.5)

### 3.5 Deploy
1. Click "Deploy"
2. Wait for deployment (3-5 minutes)
3. You'll get a URL like: `https://jai-learning-portal.vercel.app`

---

## Step 4: Final Configuration

### 4.1 Update Backend CORS
1. Go to Render dashboard
2. Go to your backend service
3. Update the `FRONTEND_URL` environment variable to your actual Vercel URL

### 4.2 Test Everything
1. Visit your frontend URL
2. Try to register a new account
3. Login with the account
4. Test creating courses and tracking progress

---

## 🎉 You're Done!

Your JAI Learning Portal is now live with:
- **Frontend**: `https://jai-learning-portal.vercel.app`
- **Backend API**: `https://jai-learning-api.onrender.com`
- **Database**: MongoDB Atlas

---

## 📝 Important Notes

### Free Tier Limitations:
- **Render**: Backend may sleep after 15 minutes of inactivity (first request will be slow)
- **MongoDB Atlas**: 512MB storage limit
- **Vercel**: Unlimited for personal projects

### To Keep Backend Always Active:
- Upgrade to Render paid plan ($7/month)
- OR use a service like UptimeRobot to ping your API every 10 minutes

---

## 🔧 Troubleshooting

### Backend not connecting to MongoDB:
- Check MongoDB Atlas Network Access (should allow 0.0.0.0/0)
- Verify connection string is correct
- Check username/password

### CORS errors:
- Ensure FRONTEND_URL in Render matches your Vercel URL exactly
- Check backend CORS configuration

### Frontend not connecting to backend:
- Verify NEXT_PUBLIC_API_URL is set correctly in Vercel
- Make sure backend is running (check Render logs)

---

## 📱 Local Development

To run locally for development:

### Backend:
```bash
cd backend
npm install
npm run dev
```

### Frontend:
```bash
cd ..
npm install
npm run dev
```

Make sure `.env.local` has:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🆘 Need Help?

1. Check Render logs: Dashboard → Service → Logs
2. Check Vercel logs: Dashboard → Project → Functions
3. MongoDB Atlas: Clusters → Browse Collections

---

## 🚀 Next Steps

1. Customize the portal with your content
2. Add more courses and lessons
3. Invite friends to test
4. Monitor usage in dashboards

Good luck with your learning portal! 🎓