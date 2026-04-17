#!/bin/bash

# PokéDex Manager Setup Script
# This script initializes the project for development

set -e  # Exit on error

echo "🔥 PokéDex Manager - Setup Script"
echo "=================================="
echo ""

# Create .env files from examples if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env from template..."
    cp backend/.env.example backend/.env
    echo "✅ backend/.env created. Please update with your configuration."
else
    echo "✅ backend/.env already exists."
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend/.env from template..."
    cp frontend/.env.example frontend/.env
    echo "✅ frontend/.env created."
else
    echo "✅ frontend/.env already exists."
fi

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Run: docker-compose up --build"
echo ""
echo "Or for local development:"
echo "1. Backend: cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python main.py"
echo "2. Frontend: cd frontend && npm install && npm run dev"
echo ""
