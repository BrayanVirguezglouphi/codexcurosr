#!/bin/bash
echo "🚀 Deployment manual directo a Cloud Run..."

# Build y push de la imagen
gcloud builds submit --tag gcr.io/codexcurosr/pros-backend --file Dockerfile.backend .

# Deploy directo a Cloud Run
gcloud run deploy pros-backend \
  --image gcr.io/codexcurosr/pros-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="DB_HOST=35.238.111.59,DB_PORT=5432,DB_NAME=adcot_bd_contabilidad,DB_USER=adcot_user,DB_PASSWORD=adcot2024"

echo "✅ Deployment manual completado"
echo "🌐 URL: https://pros-backend-996366858087.us-central1.run.app" 