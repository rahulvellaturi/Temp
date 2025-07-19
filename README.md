# AssureMe Insurance Client Portal

A comprehensive insurance client management system with client and admin portals, built with React and Node.js.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **PostgreSQL** (v13 or higher) or use free cloud database
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd assureme-insurance
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Database Setup

#### Option 1: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database named `assureme`
3. Update `.env` file with your database URL

#### Option 2: Free Cloud Database (Recommended)
Use one of these free services:
- **Supabase** (Recommended): https://supabase.com
- **Neon**: https://neon.tech
- **ElephantSQL**: https://elephantsql.com

### Environment Configuration

1. **Backend Environment**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Update `.env` with your values:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/assureme"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_EXPIRES_IN="24h"
   
   # MFA
   MFA_SERVICE_NAME="AssureMe"
   MFA_ISSUER="AssureMe Insurance"
   
   # Email (Optional - for production)
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"
   
   # Cloudinary (Optional - for file uploads)
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   
   # Server
   PORT=5000
   NODE_ENV="development"
   ```

2. **Frontend Environment** (Optional)
   ```bash
   cd frontend
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

### Database Migration & Seeding

1. **Generate Prisma Client**
   ```bash
   cd backend
   npx prisma generate
   ```

2. **Run Database Migrations**
   ```bash
   npx prisma db push
   ```

3. **Seed Database with Sample Data**
   ```bash
   npx prisma db seed
   ```

### Running the Application

#### Development Mode

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on http://localhost:5000

2. **Start Frontend (New Terminal)**
   ```bash
   cd frontend
   npm start
   ```
   Frontend will run on http://localhost:3000

#### Production Build

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start Backend**
   ```bash
   cd backend
   npm start
   ```

## 🔐 Default Login Credentials

After seeding, you can login with:

**Client Account:**
- Email: `john.doe@email.com`
- Password: `password123`

**Admin Account:**
- Email: `admin@assureme.com`
- Password: `admin123`

## 📋 Available Scripts

### Backend Scripts
```bash
npm run dev          # Start development server with hot reload
npm start           # Start production server
npm run build       # Build TypeScript
npm run lint        # Run ESLint
npm run test        # Run tests
```

### Frontend Scripts
```bash
npm start           # Start development server
npm run build       # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App (irreversible)
```

## 🌐 Deployment

### Free Deployment Options

#### Backend Deployment
1. **Render.com** (Recommended)
   - Connect your GitHub repo
   - Set build command: `npm install && npm run build`
   - Set start command: `npm start`
   - Add environment variables

2. **Railway.app**
   - Connect GitHub repo
   - Railway auto-detects Node.js
   - Add environment variables

3. **Supabase Edge Functions** (Advanced)
   - For serverless deployment

#### Frontend Deployment
1. **Vercel** (Recommended)
   - Connect GitHub repo
   - Auto-deploys on push
   - Set build command: `npm run build`

2. **Netlify**
   - Drag and drop `build` folder
   - Or connect GitHub repo

#### Database
1. **Supabase** (Recommended)
   - Free PostgreSQL database
   - Built-in auth and real-time features

2. **Neon**
   - Serverless PostgreSQL
   - Generous free tier

## 🛠 Technology Stack

### Frontend
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Zustand** - State Management
- **React Hook Form** - Form Handling
- **Zod** - Validation
- **Axios** - HTTP Client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web Framework
- **TypeScript** - Type Safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Passport.js** - Auth Middleware
- **Bcrypt** - Password Hashing
- **Speakeasy** - MFA/2FA

## 📁 Project Structure

```
assureme-insurance/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── config/          # Configuration files
│   │   ├── utils/           # Utility functions
│   │   └── server.ts        # Main server file
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Database seeding
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── store/           # State management
│   │   ├── lib/             # Utilities
│   │   └── types/           # TypeScript types
│   ├── public/
│   └── package.json
└── README.md
```

## 🔧 Key Features

### Client Portal
- **Dashboard** - Overview of policies and claims
- **Policy Management** - View and request changes
- **Claims** - File and track claims
- **Payments** - View bills and payment history
- **Documents** - Upload and manage documents
- **Profile** - Update personal information
- **MFA/2FA** - Enhanced security

### Admin Portal
- **User Management** - Manage client accounts
- **Policy Administration** - Create and manage policies
- **Claims Processing** - Review and process claims
- **Analytics** - Business insights and reports

### Security Features
- **JWT Authentication**
- **Multi-Factor Authentication (MFA)**
- **Role-Based Access Control (RBAC)**
- **Password Hashing**
- **Input Validation**
- **Rate Limiting**
- **CORS Protection**

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check if PostgreSQL is running
   sudo service postgresql status
   
   # Or check your cloud database connection
   npx prisma db pull
   ```

2. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill -9
   
   # Or change PORT in .env file
   ```

3. **Prisma Client Issues**
   ```bash
   # Regenerate Prisma client
   npx prisma generate
   
   # Reset database (warning: deletes data)
   npx prisma db reset
   ```

4. **Frontend Build Issues**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Getting Help

- Check the [Issues](your-repo-url/issues) page
- Review API documentation at `http://localhost:5000/api-docs`
- Check browser console for frontend errors
- Check backend logs for server errors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Email: support@assureme.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues](your-repo-url/issues)

---

**Built with ❤️ for modern insurance management**