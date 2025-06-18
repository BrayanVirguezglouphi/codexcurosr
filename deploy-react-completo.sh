#!/bin/bash

echo "🚀 DEPLOY REACT COMPLETO - SISTEMA EMPRESARIAL"
echo "=============================================="

# Verificar si estamos en Cloud Shell
if [ ! -z "$GOOGLE_CLOUD_PROJECT" ]; then
    echo "✅ Detectado Google Cloud Shell"
    PROJECT_ID="inner-root-463214-j1"
else
    echo "❌ Este script debe ejecutarse desde Google Cloud Shell"
    exit 1
fi

# Configurar proyecto
echo "📋 Configurando proyecto GCP..."
gcloud config set project $PROJECT_ID

# Verificar archivos necesarios
echo "🔍 Verificando archivos..."
if [ ! -f "package.json" ]; then
    echo "❌ No se encuentra package.json"
    exit 1
fi

if [ ! -f "app.js" ]; then
    echo "❌ No se encuentra app.js"
    exit 1
fi

# Crear .env si no existe
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env..."
    cat > .env << EOF
NODE_ENV=production
PORT=8080
DB_HOST=34.42.197.64
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=LZAfBQzBxEJvBkHMzCMXbCKFZpxEqLqC
DB_NAME=railway
EOF
fi

# Verificar/crear package.json si es necesario
echo "📦 Verificando dependencias..."
if ! grep -q '"express"' package.json; then
    echo "➕ Agregando Express a dependencias..."
    npm install express --save
fi

# Hacer build de React
echo "🏗️ Construyendo aplicación React..."
npm run build

# Verificar que el build se creó
if [ ! -d "dist" ]; then
    echo "❌ Error: No se creó la carpeta dist"
    exit 1
fi

echo "✅ Build de React completado"

# Crear Dockerfile optimizado
echo "🐳 Creando Dockerfile..."
cat > Dockerfile << 'EOF'
# Imagen base de Node.js
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar código fuente y build
COPY . .

# Exponer puerto
EXPOSE 8080

# Comando para ejecutar
CMD ["node", "app.js"]
EOF

# Deploy directo
echo "🚀 Desplegando en Cloud Run..."
gcloud run deploy pros-app \
    --source . \
    --region=us-central1 \
    --platform=managed \
    --allow-unauthenticated \
    --port=8080 \
    --memory=1Gi \
    --cpu=1 \
    --timeout=300 \
    --max-instances=10

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ¡DEPLOY EXITOSO!"
    echo "================================"
    echo "🌐 Tu aplicación React completa está disponible en:"
    gcloud run services describe pros-app --region=us-central1 --format="value(status.url)"
    echo ""
    echo "🔗 APIs disponibles:"
    echo "  - GET /health"
    echo "  - GET /api/test"
    echo "  - GET /api/facturas"
    echo "  - GET /api/transacciones"
    echo ""
    echo "💡 Todas las rutas de React funcionarán correctamente"
else
    echo "❌ Error en el deploy"
    exit 1
fi 