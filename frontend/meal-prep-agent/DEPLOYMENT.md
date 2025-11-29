# Firebase Hosting Deployment Guide

## Prerequisites

1. **Firebase CLI**: The deployment script uses `npx firebase-tools`, so no global installation needed
2. **Firebase Authentication**: You need to be logged in to Firebase

## First-Time Setup

### 1. Login to Firebase

```bash
npx firebase-tools login
```

This will open a browser window for you to authenticate with your Google account.

### 2. Verify Project Configuration

The project is already configured to use `capstone-478122`. You can verify with:

```bash
npx firebase-tools projects:list
```

### 3. Enable Firebase Hosting

If not already enabled, go to the [Firebase Console](https://console.firebase.google.com/project/capstone-478122/hosting) and enable Hosting for your project.

## Deploying

### Windows

```bash
cd frontend/meal-prep-agent
deploy-firebase.bat
```

### Linux/Mac

```bash
cd frontend/meal-prep-agent
chmod +x deploy-firebase.sh
./deploy-firebase.sh
```

### Manual Deployment

```bash
cd frontend/meal-prep-agent

# Build the app
npm run build

# Deploy to Firebase
npx firebase-tools deploy --only hosting
```

## After Deployment

Your app will be available at:
- **Primary URL**: https://capstone-478122.web.app
- **Alternative URL**: https://capstone-478122.firebaseapp.com

## Custom Domain (Optional)

To use a custom domain:

1. Go to [Firebase Console > Hosting](https://console.firebase.google.com/project/capstone-478122/hosting)
2. Click "Add custom domain"
3. Follow the DNS configuration steps

## Troubleshooting

### Build Errors

If the build fails, check:
- Node modules are installed: `npm install`
- No TypeScript errors: `npm run build`

### Authentication Issues

If you get authentication errors:
```bash
npx firebase-tools logout
npx firebase-tools login
```

### Wrong Project

To change the Firebase project:
```bash
npx firebase-tools use <project-id>
```

## Configuration Files

- **firebase.json**: Firebase Hosting configuration
- **.firebaserc**: Project aliases
- **deploy-firebase.bat/sh**: Automated deployment scripts

## Environment Variables

Make sure your production environment file (`src/environments/environment.prod.ts`) has the correct API endpoint for your backend.
