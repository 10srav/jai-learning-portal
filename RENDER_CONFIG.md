# 🚀 Render Deployment Configuration

## Your Render URL
```
https://jai-learning-portal.onrender.com
```

## Environment Variables for Render Dashboard

Copy and paste these EXACTLY into your Render environment variables:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://pollisettisravankumar:SraavRohit%4045@cluster0.sjotz.mongodb.net/jai-learning-portal?retryWrites=true&w=majority&appName=Cluster0` |
| `JWT_SECRET` | `d704145188f9b2d2705fc34a00c3c48caf6a33c1af7e94a1539274d4fd1fb80b` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `FRONTEND_URL` | `https://jai-learning-portal.vercel.app` |

## How to Add These to Render

1. Go to your Render Dashboard: https://dashboard.render.com
2. Click on your service (jai-learning-portal)
3. Click on **"Environment"** in the left sidebar
4. Click **"Add Environment Variable"**
5. Add each variable from the table above
6. Click **"Save Changes"**
7. Your service will automatically redeploy

## Render Service Settings

Make sure these are set correctly:

- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Root Directory**: `backend` (if backend is in a subdirectory)
- **Auto-Deploy**: Yes (from main branch)

## Testing Your Deployed Backend

Once deployed, test these endpoints:

1. **Health Check**:
   ```
   https://jai-learning-portal.onrender.com/api/health
   ```
   Should return: `{"status":"OK","message":"JAI Learning Portal API is running"}`

2. **Test Registration** (using curl or Postman):
   ```bash
   curl -X POST https://jai-learning-portal.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"test123","fullName":"Test User"}'
   ```

## Update Your Frontend

In your Vercel deployment, update the environment variable:

```
NEXT_PUBLIC_API_URL = https://jai-learning-portal.onrender.com/api
```

## Important Notes

1. **MongoDB Network Access**: Must have `0.0.0.0/0` for Render to connect
2. **Free Tier**: Service may sleep after 15 minutes of inactivity
3. **First Request**: May take 30-50 seconds if service is sleeping
4. **Logs**: Check Render dashboard for any errors

## Troubleshooting

### If Backend Doesn't Start:
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure MongoDB Network Access allows 0.0.0.0/0

### If MongoDB Connection Fails:
- Double-check the password encoding (%40 for @)
- Verify Network Access in MongoDB Atlas
- Check if database user has proper permissions

### If CORS Errors:
- Update FRONTEND_URL to match your Vercel deployment
- Check that frontend is using correct API URL

## Current Status Checklist

- [x] Backend code ready
- [x] MongoDB Atlas configured
- [x] Render URL created
- [ ] MongoDB Network Access (ADD 0.0.0.0/0)
- [ ] Environment variables added to Render
- [ ] Backend deployed and running
- [ ] Frontend connected to backend

## 🎯 Next Steps

1. **Fix MongoDB Network Access** (allow 0.0.0.0/0)
2. **Add environment variables** to Render dashboard
3. **Wait for deployment** (5-10 minutes)
4. **Test the health endpoint**
5. **Update frontend** with backend URL

Your backend is ready for production deployment!