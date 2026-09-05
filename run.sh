#!/usr/bin/env bash
set -e

echo "========================================================"
echo "       Starting EduStream Collaborative Platform"
echo "   Uniting Member 1, Member 2, and Member 3 Features"
echo "========================================================"
echo ""

# 1. Environment files
if [ ! -f "backend/.env" ]; then
    echo "[1/5] Creating backend/.env from template..."
    cp backend/.env.example backend/.env
else
    echo "[1/5] backend/.env found."
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "[2/5] Creating frontend/.env.local..."
    if [ -f "frontend/.env.example" ]; then
        cp frontend/.env.example frontend/.env.local
    else
        echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > frontend/.env.local
        echo "NEXT_PUBLIC_WS_URL=ws://localhost:8000" >> frontend/.env.local
    fi
else
    echo "[2/5] frontend/.env.local found."
fi

# 2. Python Virtual Environment
echo "[3/5] Setting up backend environment..."
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv backend/venv || python -m venv backend/venv
fi
backend/venv/bin/pip install -q -r backend/requirements.txt

# 3. Frontend Packages
echo "[4/5] Checking frontend dependencies..."
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend packages..."
    cd frontend && npm install && cd ..
fi

# 4. Launch Servers
echo "[5/5] Launching servers..."
cd backend && ./venv/bin/python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ../frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================================"
echo " All services running successfully!"
echo " Portal Home:    http://localhost:3000"
echo " All Features:   http://localhost:3000/demo"
echo " Live Room:      http://localhost:3000/rooms/room-1"
echo " Backend Docs:   http://localhost:8000/docs"
echo "========================================================"
echo ""

sleep 4

# Open browser
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000
elif command -v open > /dev/null; then
    open http://localhost:3000
fi

echo "Press Ctrl+C to stop all servers."
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
