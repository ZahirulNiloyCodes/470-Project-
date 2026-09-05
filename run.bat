@echo off
setlocal enabledelayedexpansion
title EduStream - 1-Click Launcher
echo ========================================================
echo        Starting EduStream Collaborative Platform
echo ========================================================
echo.

:: 1. Detect Python
where python >nul 2>nul
if %errorlevel% equ 0 (
    set PY_EXE=python
) else (
    where py >nul 2>nul
    if %errorlevel% equ 0 (
        set PY_EXE=py
    ) else (
        echo [ERROR] Python is not installed or not added to PATH on this PC.
        echo Please download Python from https://www.python.org/downloads/
        echo Make sure to check the box "Add python.exe to PATH" during install!
        echo.
        pause
        exit /b 1
    )
)

:: 2. Detect Node.js
where npm.cmd >nul 2>nul
if %errorlevel% equ 0 (
    set NPM_CMD=npm.cmd
) else (
    where npm >nul 2>nul
    if %errorlevel% equ 0 (
        set NPM_CMD=npm
    ) else (
        echo [ERROR] Node.js is not installed on this PC.
        echo Please download Node.js from https://nodejs.org/ (LTS version)
        echo.
        pause
        exit /b 1
    )
)

:: 3. Ensure backend .env exists
if not exist "backend\.env" (
    echo [1/5] Creating backend\.env from template...
    copy "backend\.env.example" "backend\.env" >nul
) else (
    echo [1/5] backend\.env found.
)

:: 4. Ensure frontend .env.local exists
if not exist "frontend\.env.local" (
    echo [2/5] Creating frontend\.env.local...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:8000
        echo NEXT_PUBLIC_WS_URL=ws://localhost:8000
    ) > "frontend\.env.local"
) else (
    echo [2/5] frontend\.env.local found.
)

:: 5. Setup Python virtual environment
echo [3/5] Setting up backend environment...
if not exist "backend\venv" (
    echo Creating Python virtual environment...
    !PY_EXE! -m venv backend\venv
)
echo Verifying backend dependencies...
backend\venv\Scripts\python.exe -m pip install -q -r backend\requirements.txt

:: 6. Setup Frontend dependencies
echo [4/5] Checking frontend dependencies...
if not exist "frontend\node_modules" (
    echo Installing frontend packages (this takes a moment on first run)...
    cd frontend && call !NPM_CMD! install && cd ..
)

:: 7. Launch Servers (bound to 0.0.0.0 so local network devices can also access)
echo [5/5] Launching servers...
start "EduStream Backend (FastAPI)" cmd /k "cd backend && venv\Scripts\uvicorn.exe main:app --reload --host 0.0.0.0 --port 8000"
start "EduStream Frontend (Next.js)" cmd /k "cd frontend && !NPM_CMD! run dev"

echo.
echo ========================================================
echo  All services are launching!
echo  Backend Docs: http://localhost:8000/docs
echo  Frontend UI:  http://localhost:3000/demo
echo ========================================================
echo.
echo Opening EduStream Member 1 Workspace in your browser...
timeout /t 6 >nul
start http://localhost:3000/demo

exit
