@echo off
REM PokéDex Manager Setup Script for Windows
REM This script initializes the project for development

echo 🔥 PokéDex Manager - Setup Script
echo ==================================
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
