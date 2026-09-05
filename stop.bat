@echo off
title Stop EduStream
echo Stopping EduStream servers...
taskkill /F /IM uvicorn.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
echo.
echo All EduStream servers stopped.
timeout /t 2 >nul
exit
