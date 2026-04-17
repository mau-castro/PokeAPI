@echo off
REM PokéDex Manager Setup Script for Windows
REM This script initializes the project for development

echo 🔥 PokéDex Manager - Setup Script
echo ==================================
echo.

set "MISSING_REQUIREMENTS="

echo 🔎 Validating required tools...

where python >nul 2>&1
if %errorlevel%==0 (
    for /f "tokens=*" %%i in ('python --version 2^>^&1') do echo ✅ Python detected: %%i
) else (
    echo ❌ Python is not installed or not available in PATH.
    set "MISSING_REQUIREMENTS=%MISSING_REQUIREMENTS% Python"
)

where node >nul 2>&1
if %errorlevel%==0 (
    for /f "tokens=*" %%i in ('node --version 2^>^&1') do echo ✅ Node.js detected: %%i
) else (
    echo ❌ Node.js is not installed or not available in PATH.
    set "MISSING_REQUIREMENTS=%MISSING_REQUIREMENTS% Node.js"
)

where mysql >nul 2>&1
if %errorlevel%==0 (
    for /f "tokens=*" %%i in ('mysql --version 2^>^&1') do echo ✅ MySQL detected: %%i
) else (
    echo ❌ MySQL is not installed or not available in PATH.
    set "MISSING_REQUIREMENTS=%MISSING_REQUIREMENTS% MySQL"
)

if not "%MISSING_REQUIREMENTS%"=="" (
    echo.
    echo ⚠️ Missing requirements:%MISSING_REQUIREMENTS%
    echo Please install the missing tools before running the project.
    echo.
    set /p CONTINUE_SETUP=Do you want to continue setup anyway? (Y/N): 
    if /I not "%CONTINUE_SETUP%"=="Y" (
        echo Setup canceled. Install the missing requirements and run setup again.
        exit /b 1
    )
) else (
    echo ✅ All required tools are installed: Python, Node.js, and MySQL.
)

echo.

REM Create .env files from examples if they don't exist
if not exist "backend\.env" (
    echo 📝 Creating backend\.env from template...
    copy backend\.env.example backend\.env
    echo ✅ backend\.env created. Please update with your configuration.
) else (
    echo ✅ backend\.env already exists.
)

if not exist "frontend\.env" (
    echo 📝 Creating frontend\.env from template...
    copy frontend\.env.example frontend\.env
    echo ✅ frontend\.env created.
) else (
    echo ✅ frontend\.env already exists.
)

echo.
echo ==================================
echo ✅ Setup Complete!
echo.
echo Next steps:
echo 1. Update backend\.env with your database credentials
echo 2. Run: docker-compose up --build
echo.
echo Or for local development:
echo 1. Backend: cd backend ^&^& python -m venv venv ^&^& venv\Scripts\activate ^&^& pip install -r requirements.txt ^&^& python main.py
echo 2. Frontend: cd frontend ^&^& npm install ^&^& npm run dev
echo.
