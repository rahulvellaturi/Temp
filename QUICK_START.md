# ⚡ Quick Start Guide - AssureMe Insurance Platform

Get up and running in 5 minutes!

## 🚀 One-Command Setup

```bash
# Clone and setup everything automatically
git clone <your-repo-url>
cd assureme-insurance
chmod +x setup.sh
./setup.sh
```

The setup script will:
- ✅ Check Node.js and npm versions
- ✅ Install all dependencies
- ✅ Create environment files
- ✅ Generate Prisma client
- ✅ Create helper scripts

## 🗄️ Database Quick Setup

### Option 1: Use Supabase (Recommended - Free Cloud Database)
1. Go to [supabase.com](https://supabase.com) → Create new project
2. Copy your connection string from Settings → Database
3. Update `backend/.env`:
   ```env
   DATABASE_URL="your-supabase-connection-string"
   ```
4. Run database setup:
   ```bash
   ./db-setup.sh
   ```

### Option 2: Local PostgreSQL
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb assureme

# Update backend/.env with local connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/assureme"

# Setup database
./db-setup.sh
```

## 🏃‍♂️ Start Development

```bash
# Start both frontend and backend
./start.sh
```

Or start manually:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm start
```

## 🌐 Access Your App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs

## 🔐 Test Login

Use these seeded accounts:

**Client Portal:**
- Email: `john.doe@email.com`
- Password: `password123`

**Admin Portal:**
- Email: `admin@assureme.com`
- Password: `admin123`

## 📱 What You'll See

### Client Portal (`/client`)
- Dashboard with policy overview
- Policy management
- Claims filing and tracking
- Payment history
- Document management
- Profile settings

### Admin Portal (`/admin`)
- User management
- Policy administration
- Claims processing
- System analytics

## 🛠️ Development Commands

```bash
# Backend
cd backend
npm run dev          # Start with hot reload
npm run build        # Build TypeScript
npm run lint         # Run linting

# Frontend
cd frontend
npm start           # Start dev server
npm run build       # Build for production
npm test           # Run tests

# Database
cd backend
npx prisma studio   # Database GUI
npx prisma db push  # Push schema changes
npx prisma db seed  # Reseed database
```

## 🔧 Customization

### Environment Variables
Edit `backend/.env`:
```env
# Required
DATABASE_URL="your-database-url"
JWT_SECRET="your-secret-key"

# Optional
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Database Schema
Edit `backend/prisma/schema.prisma` and run:
```bash
cd backend
npx prisma db push
```

### Frontend Configuration
Edit `frontend/src/lib/api.ts` for API settings
Edit `frontend/tailwind.config.js` for styling

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in backend/.env
PORT=5001
```

### Database Connection Error
```bash
# Test connection
cd backend
npx prisma db pull

# Reset database
npx prisma db reset
```

### Frontend Build Issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Prisma Issues
```bash
cd backend
npx prisma generate
npx prisma db push
```

## 📚 Next Steps

1. **Customize the UI**: Edit components in `frontend/src/components/`
2. **Add Features**: Create new routes and API endpoints
3. **Deploy**: Follow [DEPLOYMENT.md](DEPLOYMENT.md) for free hosting
4. **Security**: Update JWT secrets and add rate limiting
5. **Testing**: Add unit and integration tests

## 🎯 Project Structure

```
assureme-insurance/
├── backend/                 # Node.js API server
│   ├── src/routes/         # API endpoints
│   ├── prisma/schema.prisma # Database schema
│   └── .env                # Environment variables
├── frontend/               # React application
│   ├── src/components/     # UI components
│   ├── src/pages/         # Page components
│   └── src/store/         # State management
├── setup.sh               # Automated setup script
├── start.sh              # Development start script
└── db-setup.sh           # Database setup script
```

## 🤝 Need Help?

- 📖 Full documentation in [README.md](README.md)
- 🚀 Deployment guide in [DEPLOYMENT.md](DEPLOYMENT.md)
- 🐛 Issues? Check browser console and backend logs
- 💬 Questions? Create an issue on GitHub

---

**Happy coding! 🎉**