@echo off
cd /d "%~dp0"

echo ===================================================
echo  CAD Academy - Zoom Class Link Manager
echo ===================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js was not found on this computer.
    echo Please install it from https://nodejs.org ^(LTS version^) and run this file again.
    pause
    exit /b 1
)

if not exist ".env" (
    echo No .env file found - copying .env.example to .env
    copy ".env.example" ".env" >nul
    echo.
    echo IMPORTANT: Open the new .env file and fill in your Firebase project keys
    echo before using the app. See README.md for step-by-step instructions.
    echo.
    pause
)

if not exist "node_modules" (
    echo Installing dependencies, this may take a minute...
    call npm install
    if errorlevel 1 (
        echo.
        echo npm install failed. Check your internet connection and try again.
        pause
        exit /b 1
    )
)

echo.
echo Starting the app... your browser will open automatically.
echo Press Ctrl+C in this window to stop the server.
echo.

start "" http://localhost:5173
call npm run dev
pause
