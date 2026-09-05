@echo off
title EduStream - 1-Click Launcher
echo ========================================================
echo        Starting EduStream Collaborative Platform
echo ========================================================
echo.

:: 1. Ensure backend .env exists
if not exist "backend\.env" (
    echo [1/5] Creating backend\.env from template...
    copy "backend\.env.example" "backend\.env" >nul
) else (
    echo [1/5] backend\.env found.
)

:: 2. Ensure frontend .env.local exists
if not exist "frontend\.env.local" (
    echo [2/5] Creating frontend\.env.local...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:8000
        echo NEXT_PUBLIC_WS_URL=ws://localhost:8000
    ) > "frontend\.env.local"
) else (
    echo [2/5] frontend\.env.local found.
)

:: 3. Setup Python backend virtual environment
echo [3/5] Setting up backend environment...
if not exist "backend\venv" (
    echo Creating Python virtual environment...
    python -m venv backend\venv
)
echo Installing / verifying backend dependencies...
backend\venv\Scripts\python.exe -m pip install -q -r backend\requirements.txt

:: 4. Setup Frontend dependencies
echo [4/5] Checking frontend dependencies...
if not exist "frontend\node_modules" (
    echo Installing frontend packages (this may take a minute on first run)...
    cd frontend && call npm.cmd install && cd ..
)

:: 5. Launch Backend and Frontend in separate windows
echo [5/5] Launching servers...
start "EduStream Backend (FastAPI)" cmd /k "cd backend && venv\Scripts\uvicorn.exe main:app --reload --port 8000"
start "EduStream Frontend (Next.js)" cmd /k "cd frontend && npm.cmd run dev"

echo.
echo ========================================================
echo  All services are launching!
echo  Backend:  http://localhost:8000/docs
echo  Frontend: http://localhost:3000/demo
echo ========================================================
echo.
echo Opening EduStream Member 1 Workspace in your default browser...
timeout /t 6 >nul
start http://localhost:3000/demo

exit
