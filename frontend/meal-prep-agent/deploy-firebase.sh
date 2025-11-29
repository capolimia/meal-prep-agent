#!/bin/bash

# Firebase Deployment Script for Meal Prep Agent Frontend

set -e

echo "🔨 Building Angular application..."
npm run build

echo "🚀 Deploying to Firebase Hosting..."
npx firebase-tools deploy --only hosting

echo "✅ Deployment complete!"
echo "Your app should be live at: https://capstone-478122.web.app"
