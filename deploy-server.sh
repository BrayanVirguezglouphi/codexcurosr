#!/bin/bash

# Script para desplegar en servidor con IP terminada en 68
# Uso: ./deploy-server.sh [modo]
# Modos: prod (producción), dev (desarrollo), simple (solo backend)

MODE=${1:-prod}
SERVER_IP="192.168.1.68"  # Cambiar por tu IP real

echo "🚀 Desplegando en modo: $MODE"
echo "📍 IP del servidor: $SERVER_IP"

# Detener contenedores existentes
echo "⏹️ Deteniendo contenedores existentes..."
docker-compose down 2>/dev/null
docker-compose -f docker-compose.dev.yml down 2>/dev/null

case $MODE in
  "prod")
    echo "🏭 Modo Producción - Frontend + Backend separados"
    echo "   Frontend: http://$SERVER_IP:80"
    echo "   Backend:  http://$SERVER_IP:8081"
    
    # Actualizar IP en docker-compose.yml
    sed -i.bak "s/192\.168\.1\.68/$SERVER_IP/g" docker-compose.yml
    
    # Construir y desplegar
    docker-compose build --no-cache
    docker-compose up -d
    ;;
    
  "dev")
    echo "🛠️ Modo Desarrollo - Todo en un contenedor"
    echo "   Aplicación: http://$SERVER_IP:3000"
    echo "   API:        http://$SERVER_IP:8080"
    
    docker-compose -f docker-compose.dev.yml build --no-cache
    docker-compose -f docker-compose.dev.yml up -d
    ;;
    
  "simple")
    echo "⚡ Modo Simple - Solo backend y servir frontend estático"
    echo "   Aplicación: http://$SERVER_IP:8080"
    
    # Construir frontend
    npm run build
    
    # Ejecutar solo backend que sirve también el frontend
    docker run -d \
      --name pros-app \
      -p $SERVER_IP:8080:8080 \
      -v $(pwd)/dist:/app/dist \
      -e NODE_ENV=production \
      -e SERVE_STATIC=true \
      --restart unless-stopped \
      $(docker build -q -f Dockerfile.backend .)
    ;;
    
  *)
    echo "❌ Modo no válido. Usa: prod, dev, o simple"
    exit 1
    ;;
esac

echo ""
echo "✅ Despliegue completado!"
echo "🔗 Accede desde cualquier dispositivo en la red a:"

case $MODE in
  "prod")
    echo "   👉 http://$SERVER_IP:80 (Frontend)"
    echo "   👉 http://$SERVER_IP:8081/api (Backend API)"
    ;;
  "dev")
    echo "   👉 http://$SERVER_IP:3000 (Desarrollo)"
    echo "   👉 http://$SERVER_IP:8080/api (API)"
    ;;
  "simple")
    echo "   👉 http://$SERVER_IP:8080 (Todo en uno)"
    ;;
esac

echo ""
echo "📋 Comandos útiles:"
echo "   docker ps                    # Ver contenedores activos"
echo "   docker logs [container-name] # Ver logs"
echo "   docker-compose down          # Detener todo"
echo "   ./deploy-server.sh [modo]    # Re-desplegar" 