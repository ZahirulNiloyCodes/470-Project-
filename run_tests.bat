@echo off
title EduStream - Member 1 Test Suite
echo ========================================================
echo           Running Member 1 Test Suite
echo ========================================================
echo.
echo [1/2] Running Backend Pytest Suite (38 tests)...
cd backend
venv\Scripts\pytest.exe tests/member_1
cd ..
echo.
echo [2/2] Running Frontend Vitest Suite (11 tests)...
cd frontend
call npx.cmd vitest run tests/member_1
cd ..
echo.
echo ========================================================
echo               All Test Suites Finished!
echo ========================================================
pause
