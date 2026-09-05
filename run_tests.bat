@echo off
title EduStream - Member 1 Test Suite
echo ========================================================
echo           Running Member 1 Test Suite
echo ========================================================
echo.
echo [1/2] Running Backend Pytest Suite (180 tests across all features)...
cd backend
venv\Scripts\pytest.exe tests
cd ..
echo.
echo [2/2] Running Frontend Vitest Suite (72 tests across all components)...
cd frontend
call npm.cmd test
cd ..
echo.
echo ========================================================
echo               All Test Suites Finished!
echo ========================================================
pause
