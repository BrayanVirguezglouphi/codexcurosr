#!/bin/bash

# Script de despliegue para Google Cloud Platform
# Uso: ./scripts/deploy-gcp.sh [env]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones helper
print_step() {
    echo -e "${BLUE}==== $1 ====${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar argumentos
ENV=${1:-prod}
PROJECT_ID="inner-root-463214-j1"

print_step "Iniciando despliegue a Google Cloud Platform"
echo "Entorno: $ENV"
echo "Proyecto: $PROJECT_ID"

# Verificar que gcloud esté instalado
if ! command -v gcloud &> /dev/null; then
    print_error "Google Cloud CLI no está instalado"
    echo "Instalar desde: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verificar autenticación
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    print_error "No estás autenticado con Google Cloud"
    echo "Ejecuta: gcloud auth login"
    exit 1
fi

# Establecer proyecto
gcloud config set project $PROJECT_ID

print_step "1. Preparando aplicación"

# Crear build del frontend
print_step "1.1 Construyendo frontend"
npm run build
print_success "Frontend construido correctamente"

# Verificar que el server.js exista
if [ ! -f "src/server.js" ]; then
    print_error "src/server.js no encontrado"
    exit 1
fi

print_step "2. Desplegando base de datos (Cloud SQL)"

# Crear instancia Cloud SQL si no existe
if ! gcloud sql instances describe pros-database &> /dev/null; then
    print_warning "Creando instancia Cloud SQL..."
    gcloud sql instances create pros-database \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region=us-central1 \
        --storage-type=SSD \
        --storage-size=10GB \
        --authorized-networks=0.0.0.0/0
    
    print_success "Instancia Cloud SQL creada"
else
    print_success "Instancia Cloud SQL ya existe"
fi

# Obtener IP de Cloud SQL
DB_IP=$(gcloud sql instances describe pros-database --format="value(ipAddresses[0].ipAddress)")
print_success "IP de Cloud SQL: $DB_IP"

print_step "3. Construyendo y desplegando aplicación"

# Construir imagen Docker
print_step "3.1 Construyendo imagen Docker"
gcloud builds submit --tag gcr.io/$PROJECT_ID/pros-app .
print_success "Imagen Docker construida"

# Desplegar a Cloud Run
print_step "3.2 Desplegando a Cloud Run"
gcloud run deploy pros-app \
    --image gcr.io/$PROJECT_ID/pros-app \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --set-env-vars "NODE_ENV=production,DB_HOST=$DB_IP,DB_NAME=railway,DB_USER=postgres,DB_PASSWORD=$DB_PASSWORD,DB_PORT=5432,DB_SSL=true" \
    --port 8080

# Obtener URL del servicio
SERVICE_URL=$(gcloud run services describe pros-app --platform managed --region us-central1 --format 'value(status.url)')
print_success "Aplicación desplegada en: $SERVICE_URL"

print_step "4. Configurando dominio (opcional)"
print_warning "Para configurar dominio personalizado:"
echo "1. Ir a Cloud Console > Cloud Run > pros-app > Manage Custom Domains"
echo "2. Agregar tu dominio"
echo "3. Configurar DNS records"

print_step "5. Resumen del despliegue"
echo -e "${GREEN}"
echo "🎉 ¡Despliegue completado exitosamente!"
echo ""
echo "📊 Recursos creados:"
echo "   • Cloud SQL: pros-database ($DB_IP)"
echo "   • Cloud Run: pros-app ($SERVICE_URL)"
echo "   • Container Registry: gcr.io/$PROJECT_ID/pros-app"
echo ""
echo "🔧 Próximos pasos:"
echo "   1. Configurar variables de entorno secretas"
echo "   2. Migrar datos desde Railway"
echo "   3. Configurar dominio personalizado"
echo "   4. Configurar monitoreo y alertas"
echo -e "${NC}"

print_step "6. Comandos útiles"
echo "# Ver logs:"
echo "gcloud run logs tail pros-app --region us-central1"
echo ""
echo "# Actualizar variables de entorno:"
echo "gcloud run services update pros-app --region us-central1 --set-env-vars KEY=VALUE"
echo ""
echo "# Redeploy:"
echo "./scripts/deploy-gcp.sh" 