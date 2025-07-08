@echo off
REM Script para desplegar en servidor con IP terminada en 68
REM Uso: deploy-server.bat [modo]
REM Modos: prod (producción), dev (desarrollo), simple (solo backend)

set MODE=%1
if "%MODE%"=="" set MODE=prod
set SERVER_IP=192.168.1.68

echo 🚀 Desplegando en modo: %MODE%
echo 📍 IP del servidor: %SERVER_IP%

REM Detener contenedores existentes
echo ⏹️ Deteniendo contenedores existentes...
docker-compose down >nul 2>&1
docker-compose -f docker-compose.dev.yml down >nul 2>&1

if "%MODE%"=="prod" (
    echo 🏭 Modo Producción - Frontend + Backend separados
    echo    Frontend: http://%SERVER_IP%:80
    echo    Backend:  http://%SERVER_IP%:8081
    
    REM Construir y desplegar
    docker-compose build --no-cache
    docker-compose up -d
    
) else if "%MODE%"=="dev" (
    echo 🛠️ Modo Desarrollo - Todo en un contenedor
    echo    Aplicación: http://%SERVER_IP%:3000
    echo    API:        http://%SERVER_IP%:8080
    
    docker-compose -f docker-compose.dev.yml build --no-cache
    docker-compose -f docker-compose.dev.yml up -d
    
) else if "%MODE%"=="simple" (
    echo ⚡ Modo Simple - Solo backend y servir frontend estático
    echo    Aplicación: http://%SERVER_IP%:8080
    
    REM Construir frontend
    npm run build
    
    REM Ejecutar solo backend
    docker build -t pros-app -f Dockerfile.backend .
    docker run -d --name pros-app -p %SERVER_IP%:8080:8080 -e NODE_ENV=production --restart unless-stopped pros-app
    
) else (
    echo ❌ Modo no válido. Usa: prod, dev, o simple
    exit /b 1
)

echo.
echo ✅ Despliegue completado!
echo 🔗 Accede desde cualquier dispositivo en la red a:

if "%MODE%"=="prod" (
    echo    👉 http://%SERVER_IP%:80 ^(Frontend^)
    echo    👉 http://%SERVER_IP%:8081/api ^(Backend API^)
) else if "%MODE%"=="dev" (
    echo    👉 http://%SERVER_IP%:3000 ^(Desarrollo^)
    echo    👉 http://%SERVER_IP%:8080/api ^(API^)
) else if "%MODE%"=="simple" (
    echo    👉 http://%SERVER_IP%:8080 ^(Todo en uno^)
)

echo.
echo 📋 Comandos útiles:
echo    docker ps                         # Ver contenedores activos
echo    docker logs [container-name]      # Ver logs
echo    docker-compose down               # Detener todo
echo    deploy-server.bat [modo]          # Re-desplegar 