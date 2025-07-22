#!/bin/bash

# AssureMe Insurance Platform - Automated Setup Script
# This script automates the complete setup process for the AssureMe Insurance Platform
# Author: AssureMe Development Team
# Version: 1.0.0

set -e  # Exit on any error

# Colors for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_VERSION="1.0.0"
PROJECT_NAME="AssureMe Insurance Platform"
MIN_NODE_VERSION="18.0.0"
MIN_NPM_VERSION="8.0.0"

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  INFO:${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ SUCCESS:${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠️  WARNING:${NC} $1"
}

log_error() {
    echo -e "${RED}❌ ERROR:${NC} $1"
}

log_step() {
    echo -e "${PURPLE}🔄 STEP:${NC} $1"
}

log_substep() {
    echo -e "${CYAN}  └─${NC} $1"
}

# Header function
print_header() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                        AssureMe Insurance Platform                           ║"
    echo "║                           Automated Setup Script                            ║"
    echo "║                              Version $SCRIPT_VERSION                                ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    log_info "Starting automated setup for $PROJECT_NAME"
    echo ""
}

# Version comparison function
version_compare() {
    if [[ $1 == $2 ]]; then
        return 0
    fi
    local IFS=.
    local i ver1=($1) ver2=($2)
    # Fill empty fields in ver1 with zeros
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++)); do
        ver1[i]=0
    done
    for ((i=0; i<${#ver1[@]}; i++)); do
        if [[ -z ${ver2[i]} ]]; then
            # Fill empty fields in ver2 with zeros
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]})); then
            return 1
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]})); then
            return 2
        fi
    done
    return 0
}

# Step 1: Check Node.js and npm versions
check_nodejs_npm() {
    log_step "Checking Node.js and npm versions"
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed!"
        echo ""
        echo "Please install Node.js version $MIN_NODE_VERSION or higher:"
        echo "  • Visit: https://nodejs.org/"
        echo "  • Or use a package manager:"
        echo "    - macOS: brew install node"
        echo "    - Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
        echo "    - Windows: winget install OpenJS.NodeJS"
        exit 1
    fi
    
    # Get Node.js version
    NODE_VERSION=$(node --version | sed 's/v//')
    log_substep "Found Node.js version: $NODE_VERSION"
    
    # Compare Node.js version
    version_compare $NODE_VERSION $MIN_NODE_VERSION
    case $? in
        2)
            log_error "Node.js version $NODE_VERSION is too old. Minimum required: $MIN_NODE_VERSION"
            echo ""
            echo "Please update Node.js:"
            echo "  • Visit: https://nodejs.org/"
            echo "  • Or use nvm: nvm install $MIN_NODE_VERSION && nvm use $MIN_NODE_VERSION"
            exit 1
            ;;
        0|1)
            log_success "Node.js version $NODE_VERSION meets requirements (>= $MIN_NODE_VERSION)"
            ;;
    esac
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed!"
        echo "npm should come with Node.js. Please reinstall Node.js."
        exit 1
    fi
    
    # Get npm version
    NPM_VERSION=$(npm --version)
    log_substep "Found npm version: $NPM_VERSION"
    
    # Compare npm version
    version_compare $NPM_VERSION $MIN_NPM_VERSION
    case $? in
        2)
            log_warning "npm version $NPM_VERSION is older than recommended $MIN_NPM_VERSION"
            log_substep "Updating npm to latest version..."
            npm install -g npm@latest
            NPM_VERSION=$(npm --version)
            log_success "Updated npm to version: $NPM_VERSION"
            ;;
        0|1)
            log_success "npm version $NPM_VERSION meets requirements (>= $MIN_NPM_VERSION)"
            ;;
    esac
    
    echo ""
}

# Step 2: Install all dependencies
install_dependencies() {
    log_step "Installing all project dependencies"
    
    # Install root dependencies
    log_substep "Installing root project dependencies..."
    if [ -f "package.json" ]; then
        npm install
        log_success "Root dependencies installed successfully"
    else
        log_warning "No package.json found in root directory"
    fi
    
    # Install backend dependencies
    log_substep "Installing backend dependencies..."
    if [ -d "backend" ] && [ -f "backend/package.json" ]; then
        cd backend
        npm install
        log_success "Backend dependencies installed successfully"
        cd ..
    else
        log_error "Backend directory or package.json not found!"
        exit 1
    fi
    
    # Install frontend dependencies
    log_substep "Installing frontend dependencies..."
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        cd frontend
        npm install --legacy-peer-deps
        log_success "Frontend dependencies installed successfully"
        cd ..
    else
        log_error "Frontend directory or package.json not found!"
        exit 1
    fi
    
    # Check for security vulnerabilities
    log_substep "Running security audit..."
    npm audit --audit-level high || log_warning "Security vulnerabilities found. Run 'npm audit fix' to resolve."
    
    echo ""
}

# Step 3: Create environment files
create_environment_files() {
    log_step "Creating environment files"
    
    # Create root .env file
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_substep "Created root .env file from .env.example"
        else
            log_substep "Creating root .env file with default values..."
            cat > .env << EOF
# AssureMe Insurance Platform - Root Environment Configuration
NODE_ENV=development
PROJECT_NAME=AssureMe Insurance Platform
VERSION=1.0.0

# Development Settings
DEBUG=true
LOG_LEVEL=info

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
EOF
            log_success "Created root .env file with default configuration"
        fi
    else
        log_substep "Root .env file already exists"
    fi
    
    # Create backend .env file
    if [ ! -f "backend/.env" ]; then
        if [ -f "backend/.env.example" ]; then
            cp backend/.env.example backend/.env
            log_substep "Created backend .env file from .env.example"
        else
            log_substep "Creating backend .env file with default values..."
            cat > backend/.env << EOF
# AssureMe Insurance Platform - Backend Environment Configuration

# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/assureme_db?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-$(date +%s)"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production-$(date +%s)"
JWT_REFRESH_EXPIRES_IN="7d"

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Two-Factor Authentication
MFA_APP_NAME="AssureMe Insurance"
MFA_ISSUER="AssureMe"

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Session Configuration
SESSION_SECRET="your-session-secret-change-this-in-production-$(date +%s)"
SESSION_MAX_AGE=86400000

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Development Settings
DEBUG=true
ENABLE_SWAGGER=true
EOF
            log_success "Created backend .env file with default configuration"
        fi
    else
        log_substep "Backend .env file already exists"
    fi
    
    # Create frontend .env file
    if [ ! -f "frontend/.env" ]; then
        if [ -f "frontend/.env.example" ]; then
            cp frontend/.env.example frontend/.env
            log_substep "Created frontend .env file from .env.example"
        else
            log_substep "Creating frontend .env file with default values..."
            cat > frontend/.env << EOF
# AssureMe Insurance Platform - Frontend Environment Configuration

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_API_VERSION=v1

# Application Configuration
REACT_APP_NAME="AssureMe Insurance"
REACT_APP_VERSION=1.0.0
REACT_APP_DESCRIPTION="Comprehensive Insurance Management Platform"

# Environment
REACT_APP_NODE_ENV=development

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_CHAT_SUPPORT=false
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_DARK_MODE=true

# External Services
REACT_APP_GOOGLE_ANALYTICS_ID=
REACT_APP_SENTRY_DSN=

# Development Settings
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=info

# Build Configuration
GENERATE_SOURCEMAP=true
INLINE_RUNTIME_CHUNK=false

# Performance Configuration
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
REACT_APP_BUNDLE_ANALYZER=false

# Security Configuration
REACT_APP_ENABLE_CSP=true
REACT_APP_SECURE_COOKIES=false
EOF
            log_success "Created frontend .env file with default configuration"
        fi
    else
        log_substep "Frontend .env file already exists"
    fi
    
    # Set appropriate permissions
    chmod 600 .env backend/.env frontend/.env 2>/dev/null || true
    log_substep "Set secure permissions on environment files"
    
    echo ""
}

# Step 4: Generate Prisma client
generate_prisma_client() {
    log_step "Generating Prisma client"
    
    if [ -f "backend/prisma/schema.prisma" ]; then
        cd backend
        
        log_substep "Generating Prisma client..."
        npx prisma generate
        log_success "Prisma client generated successfully"
        
        log_substep "Checking database connection..."
        if npx prisma db pull --preview-feature 2>/dev/null; then
            log_success "Database connection successful"
        else
            log_warning "Could not connect to database. This is normal for initial setup."
            log_info "Make sure to configure your database connection in backend/.env"
            log_info "Then run: cd backend && npx prisma db push"
        fi
        
        cd ..
    else
        log_error "Prisma schema file not found at backend/prisma/schema.prisma"
        exit 1
    fi
    
    echo ""
}

# Step 5: Create helper scripts
create_helper_scripts() {
    log_step "Creating helper scripts"
    
    # Create scripts directory
    mkdir -p scripts
    
    # Create development script
    log_substep "Creating development helper script..."
    cat > scripts/dev.sh << 'EOF'
#!/bin/bash

# AssureMe Insurance Platform - Development Helper Script
# This script starts both frontend and backend in development mode

echo "🚀 Starting AssureMe Insurance Platform in development mode..."
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "❌ Dependencies not found. Please run ./setup.sh first."
    exit 1
fi

# Start both frontend and backend
npm run dev
EOF
    chmod +x scripts/dev.sh
    log_success "Created development helper script: scripts/dev.sh"
    
    # Create build script
    log_substep "Creating build helper script..."
    cat > scripts/build.sh << 'EOF'
#!/bin/bash

# AssureMe Insurance Platform - Build Helper Script
# This script builds both frontend and backend for production

echo "🏗️  Building AssureMe Insurance Platform for production..."
echo ""

# Build backend
echo "📦 Building backend..."
cd backend
npm run build
cd ..

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

echo ""
echo "✅ Build completed successfully!"
echo "📁 Backend build: backend/dist"
echo "📁 Frontend build: frontend/build"
EOF
    chmod +x scripts/build.sh
    log_success "Created build helper script: scripts/build.sh"
    
    # Create test script
    log_substep "Creating test helper script..."
    cat > scripts/test.sh << 'EOF'
#!/bin/bash

# AssureMe Insurance Platform - Test Helper Script
# This script runs all tests for the project

echo "🧪 Running AssureMe Insurance Platform tests..."
echo ""

# Test backend
echo "🔍 Testing backend..."
cd backend
npm test
BACKEND_EXIT_CODE=$?
cd ..

# Test frontend
echo "🔍 Testing frontend..."
cd frontend
npm test -- --watchAll=false --verbose
FRONTEND_EXIT_CODE=$?
cd ..

# Report results
echo ""
if [ $BACKEND_EXIT_CODE -eq 0 ] && [ $FRONTEND_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed!"
    exit 0
else
    echo "❌ Some tests failed!"
    exit 1
fi
EOF
    chmod +x scripts/test.sh
    log_success "Created test helper script: scripts/test.sh"
    
    # Create database script
    log_substep "Creating database helper script..."
    cat > scripts/db.sh << 'EOF'
#!/bin/bash

# AssureMe Insurance Platform - Database Helper Script
# This script provides database management utilities

case "$1" in
    "reset")
        echo "🗃️  Resetting database..."
        cd backend
        npx prisma db push --force-reset
        echo "✅ Database reset completed!"
        ;;
    "migrate")
        echo "🗃️  Running database migrations..."
        cd backend
        npx prisma db push
        echo "✅ Database migrations completed!"
        ;;
    "seed")
        echo "🌱 Seeding database..."
        cd backend
        npx prisma db seed
        echo "✅ Database seeding completed!"
        ;;
    "studio")
        echo "🎨 Opening Prisma Studio..."
        cd backend
        npx prisma studio
        ;;
    "generate")
        echo "⚙️  Generating Prisma client..."
        cd backend
        npx prisma generate
        echo "✅ Prisma client generated!"
        ;;
    *)
        echo "AssureMe Database Helper Script"
        echo ""
        echo "Usage: ./scripts/db.sh [command]"
        echo ""
        echo "Commands:"
        echo "  reset     - Reset database (WARNING: destroys all data)"
        echo "  migrate   - Run database migrations"
        echo "  seed      - Seed database with sample data"
        echo "  studio    - Open Prisma Studio"
        echo "  generate  - Generate Prisma client"
        echo ""
        ;;
esac
EOF
    chmod +x scripts/db.sh
    log_success "Created database helper script: scripts/db.sh"
    
    # Create deployment script
    log_substep "Creating deployment helper script..."
    cat > scripts/deploy.sh << 'EOF'
#!/bin/bash

# AssureMe Insurance Platform - Deployment Helper Script
# This script prepares the application for deployment

echo "🚀 Preparing AssureMe Insurance Platform for deployment..."
echo ""

# Run tests
echo "🧪 Running tests..."
./scripts/test.sh
if [ $? -ne 0 ]; then
    echo "❌ Tests failed! Deployment aborted."
    exit 1
fi

# Build application
echo "🏗️  Building application..."
./scripts/build.sh
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Deployment aborted."
    exit 1
fi

# Check environment files
echo "🔍 Checking environment configuration..."
if [ ! -f "backend/.env" ] || [ ! -f "frontend/.env" ]; then
    echo "❌ Environment files missing! Please configure .env files."
    exit 1
fi

echo ""
echo "✅ Application ready for deployment!"
echo ""
echo "Next steps:"
echo "  1. Configure production environment variables"
echo "  2. Set up production database"
echo "  3. Deploy backend to your server"
echo "  4. Deploy frontend to your hosting service"
echo ""
EOF
    chmod +x scripts/deploy.sh
    log_success "Created deployment helper script: scripts/deploy.sh"
    
    # Create maintenance script
    log_substep "Creating maintenance helper script..."
    cat > scripts/maintenance.sh << 'EOF'
#!/bin/bash

# AssureMe Insurance Platform - Maintenance Helper Script
# This script provides maintenance utilities

case "$1" in
    "update")
        echo "🔄 Updating dependencies..."
        npm update
        cd backend && npm update && cd ..
        cd frontend && npm update && cd ..
        echo "✅ Dependencies updated!"
        ;;
    "audit")
        echo "🔍 Running security audit..."
        npm audit
        cd backend && npm audit && cd ..
        cd frontend && npm audit && cd ..
        ;;
    "clean")
        echo "🧹 Cleaning project..."
        rm -rf node_modules backend/node_modules frontend/node_modules
        rm -rf backend/dist frontend/build
        echo "✅ Project cleaned!"
        ;;
    "logs")
        echo "📋 Showing recent logs..."
        if [ -f "backend/logs/app.log" ]; then
            tail -n 50 backend/logs/app.log
        else
            echo "No log files found."
        fi
        ;;
    *)
        echo "AssureMe Maintenance Helper Script"
        echo ""
        echo "Usage: ./scripts/maintenance.sh [command]"
        echo ""
        echo "Commands:"
        echo "  update  - Update all dependencies"
        echo "  audit   - Run security audit"
        echo "  clean   - Clean node_modules and build files"
        echo "  logs    - Show recent application logs"
        echo ""
        ;;
esac
EOF
    chmod +x scripts/maintenance.sh
    log_success "Created maintenance helper script: scripts/maintenance.sh"
    
    echo ""
}

# Final setup verification
verify_setup() {
    log_step "Verifying setup completion"
    
    # Check if all required files exist
    local required_files=(
        "package.json"
        "backend/package.json"
        "frontend/package.json"
        ".env"
        "backend/.env"
        "frontend/.env"
        "backend/prisma/schema.prisma"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            log_substep "✅ $file exists"
        else
            log_substep "❌ $file missing"
        fi
    done
    
    # Check if helper scripts exist
    local helper_scripts=(
        "scripts/dev.sh"
        "scripts/build.sh"
        "scripts/test.sh"
        "scripts/db.sh"
        "scripts/deploy.sh"
        "scripts/maintenance.sh"
    )
    
    for script in "${helper_scripts[@]}"; do
        if [ -f "$script" ] && [ -x "$script" ]; then
            log_substep "✅ $script created and executable"
        else
            log_substep "❌ $script missing or not executable"
        fi
    done
    
    echo ""
}

# Display next steps
show_next_steps() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                              Setup Complete!                                ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    log_success "AssureMe Insurance Platform setup completed successfully!"
    echo ""
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo ""
    echo "1. 🗃️  Configure your database:"
    echo "   • Update DATABASE_URL in backend/.env"
    echo "   • Run: ./scripts/db.sh migrate"
    echo "   • Run: ./scripts/db.sh seed (optional)"
    echo ""
    echo "2. 📧 Configure email settings:"
    echo "   • Update SMTP settings in backend/.env"
    echo "   • For Gmail: Enable 2FA and create an App Password"
    echo ""
    echo "3. 🔐 Update security settings:"
    echo "   • Change JWT_SECRET in backend/.env"
    echo "   • Update SESSION_SECRET in backend/.env"
    echo ""
    echo "4. 🚀 Start development:"
    echo "   • Run: ./scripts/dev.sh"
    echo "   • Frontend: http://localhost:3000"
    echo "   • Backend: http://localhost:5000"
    echo ""
    echo -e "${CYAN}🛠️  Available Helper Scripts:${NC}"
    echo "   • ./scripts/dev.sh       - Start development servers"
    echo "   • ./scripts/build.sh     - Build for production"
    echo "   • ./scripts/test.sh      - Run all tests"
    echo "   • ./scripts/db.sh        - Database management"
    echo "   • ./scripts/deploy.sh    - Prepare for deployment"
    echo "   • ./scripts/maintenance.sh - Maintenance utilities"
    echo ""
    echo -e "${PURPLE}📚 Documentation:${NC}"
    echo "   • Read ULTIMATE_PROJECT_GUIDE.md for detailed instructions"
    echo "   • Check individual README files in backend/ and frontend/"
    echo ""
    echo -e "${GREEN}🎉 Happy coding with AssureMe Insurance Platform!${NC}"
    echo ""
}

# Error handling
handle_error() {
    log_error "Setup failed at step: $1"
    echo ""
    echo "Please check the error messages above and try again."
    echo "If you need help, please check the troubleshooting section in ULTIMATE_PROJECT_GUIDE.md"
    exit 1
}

# Main execution
main() {
    # Set up error handling
    trap 'handle_error "Unknown step"' ERR
    
    # Print header
    print_header
    
    # Execute setup steps
    trap 'handle_error "Node.js and npm version check"' ERR
    check_nodejs_npm
    
    trap 'handle_error "Dependencies installation"' ERR
    install_dependencies
    
    trap 'handle_error "Environment files creation"' ERR
    create_environment_files
    
    trap 'handle_error "Prisma client generation"' ERR
    generate_prisma_client
    
    trap 'handle_error "Helper scripts creation"' ERR
    create_helper_scripts
    
    trap 'handle_error "Setup verification"' ERR
    verify_setup
    
    # Show completion message
    show_next_steps
}

# Run main function
main "$@"