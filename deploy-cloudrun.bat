@echo off
REM Deploy backend to Cloud Run with CORS support

echo Building and deploying to Cloud Run...

REM Build and push container
gcloud builds submit --tag gcr.io/capstone-478122/meal-prep-backend
if %ERRORLEVEL% NEQ 0 (
  echo Build failed with error code %ERRORLEVEL%
  exit /b %ERRORLEVEL%
)

echo Build successful, deploying to Cloud Run...

REM Deploy to Cloud Run
gcloud run deploy meal-prep-backend ^
  --image gcr.io/capstone-478122/meal-prep-backend ^
  --platform managed ^
  --region us-central1 ^
  --allow-unauthenticated ^
  --port 8080 ^
  --memory 2Gi ^
  --timeout 600 ^
  --set-env-vars "GOOGLE_GENAI_USE_VERTEXAI=True,GOOGLE_CLOUD_PROJECT=capstone-478122,GOOGLE_CLOUD_LOCATION=us-central1,GOOGLE_CLOUD_AGENT_ENGINE_ID=4566241003828150272,GOOGLE_CLOUD_AGENT_ENGINE_ENABLE_TELEMETRY=True,TIME_ZONE=America/New_York"

echo Deployment complete!
echo Update your frontend environment.prod.ts with the Cloud Run URL

@REM gcloud run deploy meal-prep-backend --image gcr.io/capstone-478122/meal-prep-backend --platform managed --region us-central1 --allow-unauthenticated --port 8080 --memory 2Gi --timeout 600 --set-env-vars GOOGLE_GENAI_USE_VERTEXAI=True,GOOGLE_CLOUD_PROJECT=capstone-478122,GOOGLE_CLOUD_LOCATION=us-central1,GOOGLE_CLOUD_AGENT_ENGINE_ID=4566241003828150272,GOOGLE_CLOUD_AGENT_ENGINE_ENABLE_TELEMETRY=True,TIME_ZONE=America/New_York
