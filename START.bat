@echo off
echo ============================================================
echo   HE THONG PHUC HOI CHUC NANG V3 - QUICK START
echo ============================================================
echo.

echo [1/2] Starting Backend...
cd backend
start cmd /k "python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python main.py"
timeout /t 5

echo.
echo [2/2] Starting Frontend...
cd ..\frontend
start cmd /k "npm install && npm run dev"

echo.
echo ============================================================
echo   HOAN THANH!
echo ============================================================
echo   Backend: http://localhost:8000
echo   Frontend: http://localhost:3000
echo.
echo   Tai khoan:
echo   - Bac si: doctor1 / doctor123
echo   - Benh nhan: patient1 / patient123
echo ============================================================
pause
