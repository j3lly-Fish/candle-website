#!/bin/bash
# Deployment script for Candle E-commerce application

# Exit on error
set -e

echo "Starting deployment process..."

# Pull the latest code
echo "Pulling latest code..."
git pull origin main

# Frontend deployment
echo "Deploying frontend..."
npm ci
npm run build
pm2 restart candle-frontend || pm2 start npm --name "candle-frontend" -- start

# Backend deployment
echo "Deploying backend..."
cd server
npm ci
npm run build
pm2 restart candle-backend || pm2 start npm --name "candle-backend" -- start

echo "Deployment completed successfully!"