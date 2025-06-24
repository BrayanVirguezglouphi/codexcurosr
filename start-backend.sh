#!/bin/bash

echo "🚀 Iniciando backend..."

# Función para limpiar procesos al salir
cleanup() {
    echo "🔄 Deteniendo procesos..."
    pkill -f node
    exit 0
}

# Capturar señales de terminación
trap cleanup SIGTERM SIGINT

echo "☁️ Entorno Cloud Run - el backend manejará la configuración automáticamente"
echo "📝 Variables de entorno disponibles:"
echo "   NODE_ENV: $NODE_ENV"
echo "   DB_PASSWORD: ${DB_PASSWORD:0:10}..." # Solo mostrar primeros 10 caracteres
echo "   K_SERVICE: $K_SERVICE" # Indicador de Cloud Run

# Iniciar el servidor backend directamente
echo "🚀 Iniciando servidor backend..."
exec node backend-server-fixed.cjs 