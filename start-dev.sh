#!/bin/bash

# AssureMe Development Start Script
# This script starts both frontend and backend development servers

echo "🚀 Starting AssureMe Development Environment..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ required. Current version: $(node --version)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"
echo -e "${GREEN}✅ npm $(npm --version) detected${NC}"

# Check if ports are available
if port_in_use 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is in use. Frontend may not start properly.${NC}"
    echo -e "${YELLOW}   You can kill the process with: lsof -ti:3000 | xargs kill -9${NC}"
fi

if port_in_use 5000; then
    echo -e "${YELLOW}⚠️  Port 5000 is in use. Backend may not start properly.${NC}"
    echo -e "${YELLOW}   You can kill the process with: lsof -ti:5000 | xargs kill -9${NC}"
fi

# Check if directories exist
if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Frontend directory not found. Are you in the project root?${NC}"
    exit 1
fi

if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Backend directory not found. Are you in the project root?${NC}"
    exit 1
fi

# Check if node_modules exist and install if needed
echo -e "${BLUE}Checking dependencies...${NC}"

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    cd backend
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install backend dependencies${NC}"
        exit 1
    fi
    cd ..
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Backend dependencies found${NC}"
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    cd frontend
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
        exit 1
    fi
    cd ..
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Frontend dependencies found${NC}"
fi

# Check environment files
echo -e "${BLUE}Checking environment configuration...${NC}"

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Backend .env file not found. Creating from example...${NC}"
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo -e "${YELLOW}📝 Please edit backend/.env with your configuration${NC}"
    else
        echo -e "${RED}❌ No .env.example found in backend directory${NC}"
    fi
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠️  Frontend .env file not found. Creating default...${NC}"
    echo "REACT_APP_API_URL=http://localhost:5000/api" > frontend/.env
    echo -e "${GREEN}✅ Frontend .env created${NC}"
fi

# Function to cleanup background processes
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down development servers...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo -e "\n${GREEN}🎉 Starting development servers...${NC}"
echo -e "${BLUE}Backend will be available at: http://localhost:5000${NC}"
echo -e "${BLUE}Frontend will be available at: http://localhost:3000${NC}"
echo -e "${BLUE}API Documentation: http://localhost:5000/api-docs${NC}"
echo -e "\n${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo "================================================"

# Start backend server
echo -e "${BLUE}🔧 Starting backend server...${NC}"
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo -e "${BLUE}🎨 Starting frontend server...${NC}"
cd frontend
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 5

# Check if servers are running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Backend server started (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Backend server failed to start${NC}"
    echo -e "${RED}Check backend.log for errors${NC}"
    exit 1
fi

if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend server started (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}❌ Frontend server failed to start${NC}"
    echo -e "${RED}Check frontend.log for errors${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "\n${GREEN}🚀 Development environment is ready!${NC}"
echo -e "${GREEN}📱 Open http://localhost:3000 in your browser${NC}"
echo -e "${GREEN}📚 API docs at http://localhost:5000/api-docs${NC}"

# Demo credentials reminder
echo -e "\n${BLUE}📋 Demo Login Credentials:${NC}"
echo -e "${BLUE}Client: john.doe@email.com / password123${NC}"
echo -e "${BLUE}Admin:  admin@assureme.com / admin123${NC}"

echo -e "\n${YELLOW}💡 Useful commands while running:${NC}"
echo -e "${YELLOW}   - View backend logs: tail -f backend.log${NC}"
echo -e "${YELLOW}   - View frontend logs: tail -f frontend.log${NC}"
echo -e "${YELLOW}   - Database GUI: cd backend && npx prisma studio${NC}"

# Keep the script running and monitor processes
while true; do
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "\n${RED}❌ Backend server stopped unexpectedly${NC}"
        echo -e "${RED}Check backend.log for errors${NC}"
        cleanup
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "\n${RED}❌ Frontend server stopped unexpectedly${NC}"
        echo -e "${RED}Check frontend.log for errors${NC}"
        cleanup
    fi
    
    sleep 5
done