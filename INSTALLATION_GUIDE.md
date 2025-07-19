# 📋 Complete Installation & Setup Guide - AssureMe Insurance Platform

This comprehensive guide will walk you through setting up the AssureMe Insurance Platform from scratch, including all dependencies, configuration, and deployment options.

## 🎯 Project Overview

AssureMe is a full-stack insurance client management system with:
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL (Local or Cloud)
- **Authentication**: JWT + MFA/2FA support
- **File Storage**: Cloudinary (Optional)

## 📋 Prerequisites

### Required Software
- **Node.js** v18 or higher ([Download here](https://nodejs.org/))
- **npm** v8 or higher (comes with Node.js)
- **Git** ([Download here](https://git-scm.com/))
- **PostgreSQL** v13+ (for local database) OR cloud database account

### Verify Prerequisites
```bash
node --version    # Should be v18+
npm --version     # Should be v8+
git --version     # Any recent version
```

## 🚀 Quick Installation (Automated)

### Option 1: One-Command Setup (Recommended)
```bash
# Clone the repository
git clone <your-repo-url>
cd assureme-insurance

# Make setup script executable and run
chmod +x setup.sh
./setup.sh
```

The automated setup will:
- ✅ Check Node.js and npm versions
- ✅ Install all backend dependencies
- ✅ Install all frontend dependencies  
- ✅ Create environment configuration files
- ✅ Generate Prisma client
- ✅ Create helper scripts for development
- ✅ Guide you through database setup

### Option 2: Manual Installation

If you prefer manual setup or the automated script doesn't work:

#### Step 1: Clone Repository
```bash
git clone <your-repo-url>
cd assureme-insurance
```

#### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

#### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

#### Step 4: Setup Environment Files
```bash
# Backend environment
cd ../backend
cp .env.example .env
# Edit .env with your configuration

# Frontend environment (optional)
cd ../frontend
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

## 🗄️ Database Setup

### Option A: Cloud Database (Recommended - Free)

#### Using Supabase (Free Tier: 500MB, 2M requests/month)
1. **Create Account**: Go to [supabase.com](https://supabase.com)
2. **Create Project**: 
   - Name: `assureme-insurance`
   - Generate strong password
   - Choose region closest to you
   - Select Free plan
3. **Get Connection String**:
   - Go to Settings → Database
   - Copy "Connection string"
   - Replace `[YOUR-PASSWORD]` with your actual password
4. **Update Configuration**:
   ```bash
   # Edit backend/.env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

#### Using Neon (Alternative Free Option)
1. Go to [neon.tech](https://neon.tech)
2. Create account and new project
3. Copy connection string to `backend/.env`

#### Using ElephantSQL (Another Alternative)
1. Go to [elephantsql.com](https://elephantsql.com)
2. Create account and "Tiny Turtle" free plan
3. Copy connection URL to `backend/.env`

### Option B: Local PostgreSQL

#### Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

#### Setup Local Database
```bash
# Create database
sudo -u postgres createdb assureme

# Create user (optional)
sudo -u postgres psql
CREATE USER assureme_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE assureme TO assureme_user;
\q

# Update backend/.env
DATABASE_URL="postgresql://postgres:password@localhost:5432/assureme"
# OR with custom user:
# DATABASE_URL="postgresql://assureme_user:your_password@localhost:5432/assureme"
```

### Initialize Database
```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed
```

Or use the helper script:
```bash
./db-setup.sh
```

## ⚙️ Environment Configuration

### Backend Configuration (`backend/.env`)
```env
# Database (Required)
DATABASE_URL="your-database-connection-string"

# JWT Authentication (Required)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"

# MFA/2FA Configuration
MFA_SERVICE_NAME="AssureMe"
MFA_ISSUER="AssureMe Insurance"

# Server Configuration
PORT=5000
NODE_ENV="development"

# Email Configuration (Optional - for production)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Cloudinary File Storage (Optional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Frontend Configuration (`frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Generate Strong JWT Secret
```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🏃‍♂️ Running the Application

### Development Mode

#### Option 1: Using Helper Script
```bash
./start.sh
```

#### Option 2: Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Build and start backend
cd ../backend
npm run build
npm start
```

## 🌐 Accessing Your Application

Once running, access these URLs:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs
- **Database GUI**: `npx prisma studio` (from backend directory)

## 🔐 Default Login Credentials

After database seeding, use these accounts:

### Client Portal
- **Email**: `john.doe@email.com`
- **Password**: `password123`
- **Access**: Client dashboard, policies, claims, payments

### Admin Portal  
- **Email**: `admin@assureme.com`
- **Password**: `admin123`
- **Access**: User management, policy admin, claims processing

### Additional Test Accounts
- **Claims Adjuster**: `adjuster@assureme.com` / `adjuster123`
- **Client 2**: `jane.smith@email.com` / `password123`

## 🛠️ Development Commands

### Backend Commands
```bash
cd backend

# Development
npm run dev          # Start with hot reload
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server
npm run lint        # Run ESLint
npm run test        # Run tests (when implemented)

# Database
npx prisma studio   # Open database GUI
npx prisma db push  # Push schema changes to database
npx prisma db pull  # Pull schema from database
npx prisma db seed  # Seed database with sample data
npx prisma generate # Regenerate Prisma client
npx prisma db reset # Reset database (WARNING: Deletes all data)
```

### Frontend Commands
```bash
cd frontend

# Development
npm start           # Start development server
npm run build       # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App (irreversible)

# Linting and Formatting
npm run lint       # Run ESLint (if configured)
```

## 📁 Project Structure

```
assureme-insurance/
├── backend/                    # Node.js Backend
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   │   ├── auth.ts        # Authentication routes
│   │   │   ├── users.ts       # User management
│   │   │   ├── policies.ts    # Policy management
│   │   │   ├── claims.ts      # Claims processing
│   │   │   └── payments.ts    # Payment handling
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.ts        # Authentication middleware
│   │   │   ├── errorHandler.ts# Error handling
│   │   │   └── requestLogger.ts# Request logging
│   │   ├── config/           # Configuration files
│   │   │   ├── database.ts   # Database connection
│   │   │   └── passport.ts   # Passport.js config
│   │   ├── utils/            # Utility functions
│   │   │   ├── responseHelpers.ts # API response helpers
│   │   │   └── queryHelpers.ts    # Database query helpers
│   │   └── server.ts         # Main server file
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts          # Database seeding
│   ├── .env                 # Environment variables
│   └── package.json         # Dependencies and scripts
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── common/       # Common UI components
│   │   │   │   ├── BaseLayout.tsx    # Base layout component
│   │   │   │   ├── PageHeader.tsx    # Page header component
│   │   │   │   ├── Card.tsx          # Card component
│   │   │   │   ├── Button.tsx        # Button component
│   │   │   │   └── StatusBadge.tsx   # Status badge component
│   │   │   ├── layout/       # Layout components
│   │   │   │   ├── ClientLayout.tsx  # Client portal layout
│   │   │   │   └── AdminLayout.tsx   # Admin portal layout
│   │   │   └── ui/           # UI components
│   │   ├── pages/            # Page components
│   │   │   ├── auth/         # Authentication pages
│   │   │   ├── client/       # Client portal pages
│   │   │   └── admin/        # Admin portal pages
│   │   ├── hooks/            # Custom React hooks
│   │   │   └── useApi.ts     # API hooks
│   │   ├── store/            # State management (Zustand)
│   │   │   └── authStore.ts  # Authentication store
│   │   ├── lib/              # Utility libraries
│   │   │   ├── api.ts        # API client
│   │   │   └── utils.ts      # Utility functions
│   │   ├── types/            # TypeScript type definitions
│   │   │   └── index.ts      # Type definitions
│   │   └── index.tsx         # React entry point
│   ├── public/              # Static assets
│   │   └── index.html       # HTML template
│   ├── .env                 # Environment variables
│   └── package.json         # Dependencies and scripts
├── setup.sh                 # Automated setup script
├── start.sh                # Development start script
├── db-setup.sh             # Database setup script
├── README.md               # Main documentation
├── DEPLOYMENT.md           # Deployment guide
├── QUICK_START.md          # Quick start guide
└── INSTALLATION_GUIDE.md   # This file
```

## 🔧 Customization & Development

### Adding New Features

#### Backend - Adding New API Routes
1. Create route file in `backend/src/routes/`
2. Add route validation with Zod schemas
3. Use response helpers for consistent API responses
4. Add route to main server file

Example:
```typescript
// backend/src/routes/example.ts
import express from 'express';
import { z } from 'zod';
import { sendSuccess, sendError } from '../utils/responseHelpers';

const router = express.Router();

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

router.post('/', async (req, res) => {
  const data = createSchema.parse(req.body);
  // Your logic here
  return sendSuccess(res, { data }, 'Created successfully');
});

export default router;
```

#### Frontend - Adding New Components
1. Create component in appropriate `frontend/src/components/` subdirectory
2. Use existing reusable components (Button, Card, PageHeader)
3. Follow TypeScript typing conventions
4. Use Tailwind CSS for styling

Example:
```typescript
// frontend/src/components/common/ExampleComponent.tsx
import React from 'react';
import Button from './Button';
import Card from './Card';

interface ExampleProps {
  title: string;
  onAction: () => void;
}

const ExampleComponent: React.FC<ExampleProps> = ({ title, onAction }) => {
  return (
    <Card title={title}>
      <Button onClick={onAction}>
        Take Action
      </Button>
    </Card>
  );
};

export default ExampleComponent;
```

### Modifying Database Schema
1. Edit `backend/prisma/schema.prisma`
2. Run `npx prisma db push` to apply changes
3. Update seed file if needed
4. Regenerate types: `npx prisma generate`

### Styling Customization
Edit `frontend/tailwind.config.js` for:
- Colors and themes
- Typography
- Spacing
- Component styles

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. Node.js Version Issues
```bash
# Check version
node --version

# If version is too old, update Node.js
# Use nvm (Node Version Manager) for easy switching
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### 2. Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in backend/.env
PORT=5001
```

#### 3. Database Connection Issues
```bash
# Test database connection
cd backend
npx prisma db pull

# Check if PostgreSQL is running (local setup)
sudo systemctl status postgresql

# Reset database (WARNING: Deletes all data)
npx prisma db reset
```

#### 4. Prisma Client Issues
```bash
cd backend
# Regenerate Prisma client
npx prisma generate

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

#### 5. Frontend Build Issues
```bash
cd frontend
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear React build cache
rm -rf build/
npm run build
```

#### 6. Environment Variables Not Loading
- Ensure `.env` files exist in correct directories
- Restart development servers after changing environment variables
- Check for typos in variable names
- Ensure no spaces around `=` in `.env` files

#### 7. CORS Issues
If frontend can't connect to backend:
- Verify `REACT_APP_API_URL` in frontend `.env`
- Check backend CORS configuration
- Ensure backend is running on correct port

### Getting Help

1. **Check Logs**: 
   - Frontend: Browser developer console
   - Backend: Terminal where `npm run dev` is running
2. **Database Issues**: Use `npx prisma studio` to inspect database
3. **API Issues**: Check `http://localhost:5000/api-docs` for API documentation
4. **GitHub Issues**: Create an issue with error details and steps to reproduce

## 🚀 Deployment Options

### Free Deployment (Zero Cost)

#### Database: Supabase
- Free tier: 500MB storage, 2M requests/month
- Automatic backups and scaling
- Built-in authentication features

#### Backend: Render.com
- Free tier: 512MB RAM, sleeps after 15min inactivity
- Automatic deployments from GitHub
- Free SSL certificates

#### Frontend: Vercel
- Free tier: 100GB bandwidth, unlimited static sites
- Automatic deployments from GitHub
- Global CDN and edge functions

### Deployment Steps
1. **Database**: Create Supabase project, update `DATABASE_URL`
2. **Backend**: Deploy to Render.com with environment variables
3. **Frontend**: Deploy to Vercel with `REACT_APP_API_URL` pointing to Render backend
4. **Domain**: Add custom domain (optional)

Detailed deployment instructions: See [DEPLOYMENT.md](DEPLOYMENT.md)

## 📊 Monitoring & Maintenance

### Development Monitoring
- **Backend Logs**: Terminal output during development
- **Frontend Logs**: Browser developer console
- **Database**: Prisma Studio for data inspection
- **API Testing**: Use API documentation at `/api-docs`

### Production Monitoring
- **Render**: Built-in logs and metrics
- **Vercel**: Analytics and function logs  
- **Supabase**: Database metrics and query performance

### Regular Maintenance Tasks

#### Weekly
- Check application logs for errors
- Monitor database usage against free tier limits
- Test critical user flows

#### Monthly
- Update dependencies: `npm audit` and `npm update`
- Review security alerts
- Backup environment configurations
- Check performance metrics

#### Quarterly
- Rotate JWT secrets and API keys
- Review and update documentation
- Security audit and penetration testing
- Plan for scaling requirements

## 🔐 Security Best Practices

### Development Security
- ✅ Use strong, unique JWT secrets
- ✅ Never commit `.env` files to version control
- ✅ Use HTTPS in production
- ✅ Validate all input data with Zod schemas
- ✅ Implement rate limiting on API endpoints
- ✅ Use parameterized queries (Prisma handles this)
- ✅ Enable CORS only for trusted origins

### Production Security Checklist
- [ ] Change all default passwords and secrets
- [ ] Enable MFA for admin accounts
- [ ] Set up proper error handling (don't expose stack traces)
- [ ] Configure security headers (Helmet.js)
- [ ] Set up monitoring and alerting
- [ ] Regular security updates
- [ ] Backup and disaster recovery plan
- [ ] SSL/TLS certificates properly configured

## 📚 Additional Resources

### Documentation
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://prisma.io/docs/)
- [TypeScript Documentation](https://typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Tools and Services
- [Supabase](https://supabase.com/docs) - Database and backend services
- [Render](https://render.com/docs) - Backend deployment
- [Vercel](https://vercel.com/docs) - Frontend deployment
- [Cloudinary](https://cloudinary.com/documentation) - Media management

### Learning Resources
- [React Tutorial](https://react.dev/learn)
- [Node.js Tutorial](https://nodejs.dev/learn)
- [PostgreSQL Tutorial](https://postgresqltutorial.com/)
- [TypeScript Handbook](https://typescriptlang.org/docs/handbook/intro.html)

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Submit a pull request

### Code Standards
- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for code formatting
- Write meaningful commit messages
- Add JSDoc comments for complex functions
- Test your changes thoroughly

## 📞 Support

### Getting Help
- **Documentation**: Start with README.md and this installation guide
- **Quick Start**: Use QUICK_START.md for immediate setup
- **Deployment**: Follow DEPLOYMENT.md for production deployment
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub discussions for questions and ideas

### Contact Information
- **Email**: support@assureme.com
- **GitHub**: [Repository Issues](your-repo-url/issues)
- **Documentation**: [Wiki](your-repo-url/wiki)

---

## 🎉 Congratulations!

You now have a complete insurance client management system running locally. The application includes:

- ✅ **Full-stack architecture** with React frontend and Node.js backend
- ✅ **Authentication system** with JWT and MFA support
- ✅ **Database integration** with PostgreSQL and Prisma ORM
- ✅ **Client portal** for policy and claims management
- ✅ **Admin portal** for user and system administration
- ✅ **Responsive design** with Tailwind CSS
- ✅ **Type safety** with TypeScript throughout
- ✅ **Production-ready** deployment options
- ✅ **Comprehensive documentation** and setup guides

### Next Steps
1. **Explore the application** using the default login credentials
2. **Customize the UI** to match your brand requirements
3. **Add new features** using the established patterns
4. **Deploy to production** using the free deployment guide
5. **Scale and enhance** as your requirements grow

**Happy coding and welcome to AssureMe! 🚀**

---

*Last updated: $(date)*