// Production environment configuration
export const environment = {
  production: true,
  // Update this with your Cloud Run URL after running deploy-cloudrun.bat
  // Get the URL by running: gcloud run services describe meal-prep-backend --region us-central1 --format "value(status.url)"
  apiUrl: 'https://meal-prep-backend-268240747894.us-central1.run.app'
};
