@echo off
echo ================================
echo Starting Backend Server...
echo ================================
echo.

cd backend
call venv\Scripts\activate.bat
python main.py

pause
