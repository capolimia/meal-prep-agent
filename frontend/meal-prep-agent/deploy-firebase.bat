@echo off
REM Firebase Deployment Script for Meal Prep Agent Frontend (Windows)

echo Building Angular application...
call npm run build

if %errorlevel% neq 0 (
    echo Build failed!
    exit /b %errorlevel%
)

echo Deploying to Firebase Hosting...
call npx firebase-tools deploy --only hosting

if %errorlevel% neq 0 (
    echo Deployment failed!
    exit /b %errorlevel%
)

echo Deployment complete!
echo Your app should be live at: https://capstone-478122.web.app
