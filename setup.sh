#!/bin/bash

# AssureMe Insurance Platform Setup Script
# This script automates the installation and setup process

set -e  # Exit on any error

echo "🚀 AssureMe Insurance Platform Setup"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version must be 18 or higher. Current version: $(node --version)"
        exit 1
    fi
    
    print_status "Node.js version: $(node --version) ✓"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    print_status "npm version: $(npm --version) ✓"
}

# Install backend dependencies
install_backend() {
    print_step "Installing backend dependencies..."
    cd backend
    if [ -f "package-lock.json" ]; then
        rm package-lock.json
    fi
    npm install
    print_status "Backend dependencies installed ✓"
    cd ..
}

# Install frontend dependencies
install_frontend() {
    print_step "Installing frontend dependencies..."
    cd frontend
    if [ -f "package-lock.json" ]; then
        rm package-lock.json
    fi
    npm install
    print_status "Frontend dependencies installed ✓"
    cd ..
}

# Setup environment files
setup_env() {
    print_step "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        if [ -f "backend/.env.example" ]; then
            cp backend/.env.example backend/.env
            print_status "Created backend/.env from .env.example"
        else
            cat > backend/.env << EOL
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/assureme"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"

# MFA
MFA_SERVICE_NAME="AssureMe"
MFA_ISSUER="AssureMe Insurance"

# Server
PORT=5000
NODE_ENV="development"

# Email (Optional - for production)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER=""
EMAIL_PASS=""

# Cloudinary (Optional - for file uploads)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
EOL
            print_status "Created backend/.env with default values"
        fi
    else
        print_warning "Backend .env file already exists, skipping..."
    fi
    
    # Frontend environment (optional)
    if [ ! -f "frontend/.env" ]; then
        echo "REACT_APP_API_URL=http://localhost:5000/api" > frontend/.env
        print_status "Created frontend/.env"
    else
        print_warning "Frontend .env file already exists, skipping..."
    fi
}

# Setup database
setup_database() {
    print_step "Setting up database..."
    cd backend
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    # Ask user about database setup
    echo ""
    print_warning "Database Setup Required:"
    echo "1. Local PostgreSQL (requires PostgreSQL installed)"
    echo "2. Cloud Database (Supabase/Neon/ElephantSQL)"
    echo ""
    read -p "Choose option (1 or 2): " db_choice
    
    if [ "$db_choice" = "1" ]; then
        print_status "Setting up local PostgreSQL..."
        # Check if PostgreSQL is installed
        if command -v psql &> /dev/null; then
            print_status "PostgreSQL found ✓"
            echo "Please ensure PostgreSQL is running and update the DATABASE_URL in backend/.env"
            echo "Default: postgresql://postgres:password@localhost:5432/assureme"
        else
            print_warning "PostgreSQL not found. Please install PostgreSQL and update DATABASE_URL in backend/.env"
        fi
    else
        print_status "Using cloud database..."
        echo "Please:"
        echo "1. Create a database on Supabase (https://supabase.com) or similar service"
        echo "2. Update the DATABASE_URL in backend/.env with your connection string"
        echo "3. Run 'npm run db:push' after updating the DATABASE_URL"
    fi
    
    cd ..
}

# Create additional scripts
create_scripts() {
    print_step "Creating helper scripts..."
    
    # Create start script
    cat > start.sh << 'EOL'
#!/bin/bash
echo "Starting AssureMe Insurance Platform..."

# Start backend in background
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
cd ../frontend && npm start &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo "📚 API Docs: http://localhost:5000/api-docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait
EOL
    chmod +x start.sh
    print_status "Created start.sh script ✓"
    
    # Create database setup script
    cat > db-setup.sh << 'EOL'
#!/bin/bash
echo "Setting up database..."
cd backend
npx prisma db push
npx prisma db seed
echo "Database setup complete!"
EOL
    chmod +x db-setup.sh
    print_status "Created db-setup.sh script ✓"
}

# Main setup function
main() {
    echo ""
    print_step "Starting setup process..."
    
    # Pre-flight checks
    check_node
    check_npm
    
    # Install dependencies
    install_backend
    install_frontend
    
    # Setup environment
    setup_env
    
    # Setup database
    setup_database
    
    # Create helper scripts
    create_scripts
    
    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo ""
    echo "Next Steps:"
    echo "1. Update backend/.env with your database connection string"
    echo "2. Run './db-setup.sh' to initialize the database"
    echo "3. Run './start.sh' to start both servers"
    echo ""
    echo "Or run manually:"
    echo "  Backend:  cd backend && npm run dev"
    echo "  Frontend: cd frontend && npm start"
    echo ""
    echo "🌐 Frontend will be available at: http://localhost:3000"
    echo "🔧 Backend will be available at: http://localhost:5000"
    echo "📚 API Documentation: http://localhost:5000/api-docs"
    echo ""
    echo "Default login credentials (after seeding):"
    echo "  Client: john.doe@email.com / password123"
    echo "  Admin:  admin@assureme.com / admin123"
    echo ""
    print_status "Happy coding! 🚀"
}

# Run main function
main "$@"