# 🚀 Deployment Guide

Your expense tracker is ready for production! The backend is working, and now we need to deploy the frontend to resolve CORS issues.

## 📋 Pre-Deployment Checklist

✅ **Google Apps Script**: Working and deployed  
✅ **Frontend**: Built and tested with mock data  
✅ **Backend Integration**: Ready (CORS only affects localhost)  
✅ **Mobile-First UI**: Optimized for all devices  

## 🌐 Deploy to Vercel (Recommended)

### Step 1: Prepare Your Code
```bash
# Make sure all changes are saved
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click **"New Project"**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty (default)

### Step 3: Add Environment Variables
In Vercel dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add:
   - **Name**: `NEXT_PUBLIC_API_BASE_URL`
   - **Value**: `https://script.google.com/macros/s/AKfycbw4oeM9ahTogKJZjdlxUcgVv9R-r8tEnzO2KYhfqgGelt9IZMfjJPdaajTbmevKaGAg/exec`
   - **Environment**: All (Production, Preview, Development)

### Step 4: Deploy
1. Click **Deploy**
2. Wait for build to complete
3. Visit your live URL!

## 🌐 Alternative: Deploy to Netlify

### Step 1: Build Settings
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`

### Step 2: Environment Variables
1. Go to **Site settings** → **Environment variables**
2. Add `NEXT_PUBLIC_API_BASE_URL` with your Google Apps Script URL

### Step 3: Deploy
1. Click **Deploy site**
2. Wait for deployment
3. Test your live app!

## 🎯 Post-Deployment Testing

After deployment:

### 1. Test Login
- Username: `demo`
- Password: `demo123`
- Should work without CORS errors

### 2. Test Add Expense
- Add a test expense
- Check your Google Sheet - should appear in `expenses` tab
- AI should categorize it automatically (if Gemini API is configured)

### 3. Test All Features
- ✅ Dashboard shows real data from Google Sheets
- ✅ Expense list shows real expenses
- ✅ Reports use real data for charts
- ✅ Mobile-responsive design works

## 🔧 Troubleshooting

### Common Issues:

**1. "Invalid session" errors**
- Sessions expire after 24 hours
- Just login again

**2. "AI categorization not working"**
- Add `GEMINI_API_KEY` to Google Apps Script Properties
- Get key from [Google AI Studio](https://makersuite.google.com/app/apikey)

**3. "No data showing"**
- Check Google Apps Script logs
- Verify the Web App URL is correct
- Make sure deployment is set to "Anyone" access

**4. "Build errors"**
- Run `npm run build` locally first
- Fix any TypeScript/ESLint errors
- Push fixes and redeploy

## 📱 Mobile Testing

After deployment, test on:
- ✅ iPhone Safari
- ✅ Android Chrome
- ✅ iPad
- ✅ Desktop browsers

## 🎉 Success!

Once deployed, your expense tracker will:
- 💾 **Save expenses** to Google Sheets
- 🤖 **Auto-categorize** with AI
- 📊 **Generate reports** with real data
- 📱 **Work perfectly** on mobile devices
- ⚡ **Load fast** with optimized performance

## 🔄 Future Updates

To update your app:
1. Make changes locally
2. Push to GitHub
3. Vercel/Netlify auto-deploys
4. Changes go live automatically!

---

**Ready to deploy?** Follow the steps above and your expense tracker will be live in minutes! 🚀