# 🚀 Deployment Guide - AssureMe Insurance Platform

This guide provides step-by-step instructions for deploying the AssureMe Insurance Platform using free services.

## 📋 Deployment Overview

We'll use these free services:
- **Database**: Supabase (Free tier: 500MB, 2 million requests/month)
- **Backend**: Render.com (Free tier: 512MB RAM, sleeps after 15 min inactivity)
- **Frontend**: Vercel (Free tier: 100GB bandwidth, unlimited static sites)
- **File Storage**: Cloudinary (Free tier: 25 credits/month)

## 🗄️ Database Setup (Supabase)

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up
3. Create a new project:
   - **Name**: `assureme-insurance`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free

### Step 2: Get Connection Details
1. Go to **Settings** → **Database**
2. Copy the connection string under "Connection string"
3. Replace `[YOUR-PASSWORD]` with your actual password
4. Save this for later use

### Step 3: Setup Database Schema
1. In your local project, update `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```
2. Run migrations:
   ```bash
   cd backend
   npx prisma db push
   npx prisma db seed
   ```

## 🖥️ Backend Deployment (Render.com)

### Step 1: Prepare Your Code
1. Push your code to GitHub (if not already done)
2. Ensure your `backend/package.json` has these scripts:
   ```json
   {
     "scripts": {
       "build": "tsc",
       "start": "node dist/server.js",
       "dev": "nodemon src/server.ts"
     }
   }
   ```

### Step 2: Deploy to Render
1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `assureme-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Environment Variables
Add these environment variables in Render dashboard:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
MFA_SERVICE_NAME=AssureMe
MFA_ISSUER=AssureMe Insurance
NODE_ENV=production
PORT=10000
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL: `https://assureme-backend.onrender.com`

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
1. Update `frontend/.env` or create `frontend/.env.production`:
   ```env
   REACT_APP_API_URL=https://assureme-backend.onrender.com/api
   ```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)

### Step 3: Environment Variables
Add in Vercel dashboard:
```env
REACT_APP_API_URL=https://assureme-backend.onrender.com/api
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Your app will be available at: `https://your-app-name.vercel.app`

## 📁 File Storage Setup (Cloudinary)

### Step 1: Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Go to Dashboard to get your credentials

### Step 2: Update Backend Environment
Add to your Render environment variables:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🔧 Post-Deployment Setup

### Step 1: Test the Application
1. Visit your Vercel URL
2. Try logging in with seeded credentials:
   - **Client**: `john.doe@email.com` / `password123`
   - **Admin**: `admin@assureme.com` / `admin123`

### Step 2: Custom Domain (Optional)
#### For Vercel (Frontend):
1. Go to your project settings
2. Add your custom domain
3. Update DNS records as instructed

#### For Render (Backend):
1. Go to your service settings
2. Add custom domain
3. Update DNS records

### Step 3: SSL Certificates
Both Vercel and Render provide automatic SSL certificates for custom domains.

## 🔄 Continuous Deployment

### Auto-Deploy Setup
1. **Vercel**: Automatically deploys on push to main branch
2. **Render**: Automatically deploys on push to main branch
3. **Database**: Migrations run automatically via build script

### Manual Deploy
If you need to manually trigger deployment:
- **Vercel**: Go to project dashboard → Deployments → Redeploy
- **Render**: Go to service dashboard → Manual Deploy

## 📊 Monitoring & Maintenance

### Free Monitoring Options
1. **Render**: Built-in logs and metrics
2. **Vercel**: Analytics and function logs
3. **Supabase**: Database metrics and logs

### Backup Strategy
1. **Database**: Supabase provides automatic backups
2. **Code**: GitHub serves as backup
3. **Environment**: Document all environment variables

## 🚨 Troubleshooting

### Common Issues

#### Backend Not Starting
1. Check Render logs for errors
2. Verify environment variables
3. Ensure DATABASE_URL is correct
4. Check if database is accessible

#### Frontend API Errors
1. Verify REACT_APP_API_URL is correct
2. Check CORS settings in backend
3. Ensure backend is deployed and running

#### Database Connection Issues
1. Check Supabase project status
2. Verify connection string format
3. Ensure IP restrictions are not blocking connections

#### File Upload Issues
1. Verify Cloudinary credentials
2. Check API limits and usage
3. Ensure proper CORS configuration

### Performance Optimization

#### Backend (Render Free Tier)
- Service sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Consider using a simple ping service to keep it awake

#### Frontend (Vercel)
- Optimize bundle size
- Use code splitting
- Implement proper caching headers

#### Database (Supabase)
- Monitor usage to stay within limits
- Optimize queries for performance
- Use database indexes appropriately

## 💰 Cost Management

### Free Tier Limits
- **Supabase**: 500MB storage, 2M requests/month
- **Render**: 512MB RAM, 750 hours/month
- **Vercel**: 100GB bandwidth, unlimited static sites
- **Cloudinary**: 25 credits/month

### Upgrade Paths
When you outgrow free tiers:
- **Supabase Pro**: $25/month
- **Render Starter**: $7/month
- **Vercel Pro**: $20/month
- **Cloudinary**: $89/month

## 🔐 Security Checklist

- [ ] Use strong JWT secrets in production
- [ ] Enable HTTPS only
- [ ] Set up proper CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up proper error handling
- [ ] Configure security headers
- [ ] Regular dependency updates

## 📝 Maintenance Tasks

### Weekly
- Check service status and logs
- Monitor usage against free tier limits
- Review error logs

### Monthly
- Update dependencies
- Review security alerts
- Backup environment configurations
- Check performance metrics

### Quarterly
- Review and rotate secrets
- Update documentation
- Plan for scaling needs
- Security audit

---

## 🆘 Support

If you encounter issues during deployment:

1. **Check the logs** first (Render, Vercel, Supabase dashboards)
2. **Verify environment variables** are set correctly
3. **Test locally** to isolate deployment issues
4. **Check service status** pages for outages
5. **Review documentation** for each service

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

**Happy Deploying! 🚀**