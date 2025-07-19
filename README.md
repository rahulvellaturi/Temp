# AssureMe - Insurance Client Website

A comprehensive insurance client website with both client and admin portals, built with modern web technologies and designed for zero-cost deployment using free tiers of cloud services.

## 🏗️ Architecture

This is a full-stack web application with:

- **Frontend**: React + TypeScript + Tailwind CSS + Shadcn/UI
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT + Passport.js + MFA support
- **File Storage**: Cloudinary (Free Tier)
- **Deployment**: Vercel (Frontend) + Render.com (Backend)

## 🚀 Features

### Client Portal
- **Dashboard**: Overview of policies, claims, and payments
- **Policy Management**: View policies, submit change requests
- **Claims Center**: File claims, track status, communicate with adjusters
- **Billing & Payments**: View statements, make payments, manage payment methods
- **Document Center**: Access and download policy documents
- **Secure Messaging**: Communicate with insurance staff
- **Profile Management**: Update personal information, manage MFA

### Admin Portal
- **User Management**: Manage client accounts and staff
- **Policy Administration**: Process change requests, manage policies
- **Claims Management**: Assign adjusters, update claim status
- **Billing Operations**: Process payments, manage billing
- **Document Management**: Upload and organize documents
- **Communication Hub**: Manage client communications
- **Audit Logging**: Track all administrative actions

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Component library built on Radix UI
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Zustand** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Date-fns** - Date utilities
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Passport.js** - Authentication middleware
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Image/document storage
- **Zod** - Schema validation
- **Swagger** - API documentation
- **Nodemailer** - Email notifications
- **Speakeasy** - MFA/2FA support

## 📦 Project Structure

```
assureme-insurance-platform/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/         # Shadcn/UI components
│   │   │   ├── layout/     # Layout components
│   │   │   └── forms/      # Form components
│   │   ├── pages/          # Page components
│   │   │   ├── auth/       # Authentication pages
│   │   │   ├── client/     # Client portal pages
│   │   │   └── admin/      # Admin portal pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # Zustand stores
│   │   ├── lib/            # Utility libraries
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Helper functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── controllers/    # Business logic controllers
│   │   ├── services/       # Business services
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Database schema and migrations
│   │   ├── schema.prisma   # Prisma schema
│   │   └── seed.ts         # Database seeding
│   └── package.json
├── package.json            # Root package.json (workspace)
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database
- Cloudinary account (free tier)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd assureme-insurance-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   Backend (.env):
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database and service credentials
   ```

   Frontend (.env.local):
   ```bash
   cd frontend
   echo "VITE_API_URL=http://localhost:5000/api" > .env.local
   ```

4. **Set up the database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start the development servers**
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend dev server on http://localhost:3000

## 🔐 Default Users

After seeding the database, you can log in with these accounts:

- **Admin**: `admin@assureme.com` / `admin123`
- **Claims Adjuster**: `adjuster@assureme.com` / `adjuster123`
- **Client 1**: `john.doe@example.com` / `client123`
- **Client 2**: `jane.smith@example.com` / `client123`

## 📖 API Documentation

Once the backend is running, visit http://localhost:5000/api-docs to view the interactive Swagger API documentation.

## 🎨 Design System

The application follows a comprehensive design system with:

- **Colors**: Primary (#007BFF), Secondary (#28A745), Error (#DC3545)
- **Typography**: Montserrat (headings), Inter (body)
- **Spacing**: 4px base unit system
- **Components**: Consistent Shadcn/UI components
- **Responsive**: Mobile-first design approach

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render.com)
1. Connect your GitHub repository to Render
2. Create a PostgreSQL database service
3. Create a web service for the backend
4. Set environment variables in Render dashboard

### Database (Supabase Alternative)
For a simpler setup, you can use Supabase as a managed PostgreSQL provider:
1. Create a Supabase project
2. Use the connection string in your backend
3. Run migrations via the Supabase dashboard or CLI

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm run test

# Run backend tests
cd backend
npm run test

# Run linting
npm run lint
```

## 📝 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run install:all` - Install dependencies for all packages

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Multi-factor authentication (MFA) support
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Helmet.js security headers
- Input validation with Zod schemas
- SQL injection prevention via Prisma ORM

## 📊 Monitoring & Logging

- Request/response logging
- Error tracking and reporting
- Audit logging for admin actions
- Performance monitoring
- Health check endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please contact the development team or create an issue in the GitHub repository.

## 🚧 Roadmap

- [ ] Mobile app development (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with external insurance APIs
- [ ] Automated underwriting workflows
- [ ] Real-time notifications via WebSocket
- [ ] Advanced document OCR processing
- [ ] Multi-language support

---

**Built with ❤️ by the AssureMe Development Team**