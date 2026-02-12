# 🚀 Vercel Deployment Guide for ObeCure

## Prerequisites

1. GitHub account
2. Vercel account (free at vercel.com)
3. MongoDB Atlas account (free tier available)

## Step 1: Prepare MongoDB

### Option A: MongoDB Atlas (Recommended for Vercel)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a new cluster (free M0 tier)
4. **Database Access:**
   - Create database user with password
   - Note: username and password
5. **Network Access:**
   - Add `0.0.0.0/0` to allow access from anywhere
6. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Example: `mongodb+srv://user:pass@cluster.mongodb.net/obecure_db`

### Option B: Railway.app MongoDB (Alternative)

1. Go to [railway.app](https://railway.app)
2. Create new project → Add MongoDB
3. Copy the MongoDB connection URL from variables

## Step 2: Push to GitHub

1. **From Emergent:**
   - Use "Save to GitHub" button in chat
   - Choose your repository
   - Push all changes

2. **From Local:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/obecure.git
   git push -u origin main
   ```

## Step 3: Deploy to Vercel

### 3.1 Import Project

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **Framework Preset:** Vite
5. **Root Directory:** `frontend`
6. Click "Deploy" (it will fail - that's OK, we need to add environment variables)

### 3.2 Configure Environment Variables

Go to your project → Settings → Environment Variables

**Add these variables:**

```
# Backend URL (replace with your actual Vercel URL after first deploy)
VITE_BACKEND_URL=https://your-app.vercel.app
REACT_APP_BACKEND_URL=https://your-app.vercel.app

# Gemini API Key (get from Google AI Studio)
VITE_API_KEY=your-gemini-api-key-here
VITE_GEMINI_API_KEY=your-gemini-api-key-here

# MongoDB Connection (from MongoDB Atlas)
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/obecure_db?retryWrites=true&w=majority
DB_NAME=obecure_db

# Secret Key (generate a random string)
SECRET_KEY=your-random-secret-key-min-32-chars
```

### 3.3 Generate Secret Key

Use this command to generate a secure secret key:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Or use online: https://randomkeygen.com/

### 3.4 Get Gemini API Key

1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Create new API key
4. Copy and add to Vercel environment variables

### 3.5 Redeploy

1. Go to Deployments tab
2. Click "..." on latest deployment → "Redeploy"
3. Wait for deployment to complete

## Step 4: Update Backend URL

After successful deployment:

1. Copy your Vercel app URL (e.g., `https://your-app.vercel.app`)
2. Go to Settings → Environment Variables
3. Update `VITE_BACKEND_URL` and `REACT_APP_BACKEND_URL` with your actual URL
4. Redeploy again

## Step 5: Configure Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update environment variables with new domain

## Step 6: Test Your App

1. Visit your Vercel URL
2. Try signing up
3. Test all features:
   - ✅ Authentication
   - ✅ Diet planning
   - ✅ Daily logging
   - ✅ Reports
   - ✅ Subscription flow

## Troubleshooting

### "Network Error" or API not connecting

**Problem:** Frontend can't reach backend

**Solution:**
1. Check `VITE_BACKEND_URL` includes your Vercel URL
2. Make sure MongoDB URL is correct
3. Redeploy after changing environment variables

### "Database connection error"

**Problem:** Can't connect to MongoDB

**Solution:**
1. Check `MONGO_URL` format
2. Verify MongoDB Atlas network access (0.0.0.0/0)
3. Check username/password in connection string
4. Ensure database user has read/write permissions

### Build fails

**Problem:** Vercel build errors

**Solution:**
```bash
# Test build locally first
cd frontend
yarn build

# Check for TypeScript errors
yarn tsc --noEmit
```

### Environment variables not working

**Problem:** App doesn't see environment variables

**Solution:**
1. Ensure variable names start with `VITE_` for frontend
2. Redeploy after adding/changing variables
3. Check variables are in "Production" environment

## Performance Optimization

### Enable Caching

In Vercel project settings:
1. Go to Settings → Caching
2. Enable "Cache-Control Headers"

### Add Analytics

1. Go to Analytics tab
2. Enable Web Analytics
3. Monitor your app performance

## Monitoring

### Check Logs

1. Go to Deployments
2. Click on latest deployment
3. View "Function Logs" for backend errors
4. View "Build Logs" for build issues

### Set Up Alerts

1. Go to Settings → Notifications
2. Add email for deployment notifications
3. Configure error alerts

## Updating Your App

### Push Updates

```bash
git add .
git commit -m "Update feature"
git push
```

Vercel will automatically deploy!

### Rollback

1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

## Cost Estimation

### Free Tier Limits
- **Vercel:** 100GB bandwidth/month, unlimited projects
- **MongoDB Atlas:** 512MB storage, shared CPU
- **Total:** $0/month for small apps

### When to Upgrade
- More than 100GB bandwidth → Vercel Pro ($20/month)
- More than 512MB data → MongoDB M10 ($0.08/hour)

## Security Checklist

- ✅ MongoDB connection string in environment variables
- ✅ SECRET_KEY is random and secure (32+ characters)
- ✅ CORS properly configured
- ✅ No API keys in code
- ✅ `.env` files in `.gitignore`
- ✅ MongoDB network access configured

## Next Steps

1. ✅ Set up custom domain
2. ✅ Enable SSL (automatic with Vercel)
3. ✅ Add monitoring/analytics
4. ✅ Configure backups for MongoDB
5. ✅ Set up CI/CD workflows

## Support

Need help deploying?
- **WhatsApp:** +91 6355137969
- **Email:** support@xzecure.co.in

---

**Happy Deploying! 🚀**
