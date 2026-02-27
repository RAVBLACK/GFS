@echo off
echo ================================================
echo 🐍 Starting Python Backend for Invoice OCR
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found!
    echo.
    echo Please install Python from:
    echo https://www.python.org/downloads/
    echo.
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo ✅ Python found
echo.

REM Check if we're in the backend directory
if not exist "app.py" (
    echo ❌ Not in backend directory!
    echo.
    echo Please run this script from the backend folder:
    echo    cd backend
    echo    start_backend.bat
    pause
    exit /b 1
)

echo ✅ In correct directory
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
    echo ✅ Virtual environment created
    echo.
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if requirements are installed
echo.
echo 📦 Checking dependencies...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo.
    echo 📥 Installing dependencies...
    echo ⏳ This will take 5-10 minutes on first run...
    echo.
    pip install -r requirements.txt
    echo.
    echo ✅ Dependencies installed!
) else (
    echo ✅ Dependencies already installed
)

echo.
echo ================================================
echo 🚀 Starting Backend Server...
echo ================================================
echo.
echo Backend will run on: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ================================================
echo.

REM Start the Flask app
python app.py
