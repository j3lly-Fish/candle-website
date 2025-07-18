#!/bin/bash

# Script to fix dependency issues and regenerate lock files

echo "🔧 Fixing dependency issues..."

# Fix frontend dependencies
echo "📦 Fixing frontend dependencies..."
cd "$(dirname "$0")"
rm -f package-lock.json
npm install

# Fix backend dependencies
echo "📦 Fixing backend dependencies..."
cd server
rm -f package-lock.json
npm install
cd ..

echo "✅ Dependencies fixed! Lock files regenerated."
echo ""
echo "🐳 You can now build the Docker images:"
echo "   docker-compose build"
echo "   docker-compose up -d"