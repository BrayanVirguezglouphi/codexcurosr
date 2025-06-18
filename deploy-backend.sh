#!/bin/bash

echo "🚀 Desplegando Backend API en Cloud Run..."

# Variables
PROJECT_ID="your-project-id"  # Cambia esto por tu project ID
REGION="us-central1"
SERVICE_NAME="pros-backend"

# Build de la imagen
echo "📦 Construyendo imagen Docker..."
docker build -f Dockerfile.backend -t gcr.io/$PROJECT_ID/$SERVICE_NAME .

# Push de la imagen
echo "📤 Subiendo imagen a GCR..."
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy a Cloud Run
echo "🌐 Desplegando en Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "NODE_ENV=production,PORT=8080,DB_HOST=35.238.111.59,DB_PORT=5432,DB_NAME=SQL_DDL_ADMCOT,DB_USER=postgres,DB_PASSWORD=123456789"

echo "✅ Backend desplegado!"
echo "🔗 URL del backend:"
gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)' 