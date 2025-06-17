@echo off
echo Construyendo imagen Docker...
gcloud builds submit --tag gcr.io/pros-sistema-empresarial/pros-app .
echo.
echo Desplegando a Cloud Run...
gcloud run deploy pros-app --image gcr.io/pros-sistema-empresarial/pros-app --region us-central1 --platform managed --allow-unauthenticated
echo.
echo Desplegado completado! 