@echo off
echo ====================================
echo Rehab System V3 - Setup for Windows
echo ====================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed!
    echo Please install Python 3.8+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Setting up Backend...
cd backend

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install fastapi uvicorn[standard] websockets opencv-python mediapipe numpy pyjwt

echo.
echo [2/4] Setting up Frontend...
cd ..\frontend

echo Installing Node.js dependencies...
call npm install

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo To start the application:
echo 1. Run "start-backend.bat" in one terminal
echo 2. Run "start-frontend.bat" in another terminal
echo 3. Open http://localhost:3000 in your browser
echo.
echo Default accounts:
echo   Doctor:  doctor1 / doctor123
echo   Patient: patient1 / patient123
echo.
pause
