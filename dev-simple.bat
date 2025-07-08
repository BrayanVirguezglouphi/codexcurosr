@echo off
echo 🚀 Iniciando desarrollo simple en Docker...

REM Detener contenedor si existe
docker stop pros-dev 2>nul
docker rm pros-dev 2>nul

echo 📦 Iniciando contenedor de desarrollo...
docker run -d ^
  --name pros-dev ^
  -p 192.168.1.68:3000:3000 ^
  -p 192.168.1.68:8080:8080 ^
  -v "%cd%":/app ^
  -w /app ^
  -e NODE_ENV=development ^
  node:20 ^
  bash -c "npm install && npm run dev -- --host 0.0.0.0 --port 3000 & npm run server & wait"

echo ✅ Contenedor iniciado!
echo 🔗 Accede a la aplicación desde:
echo    👉 Frontend: http://192.168.1.68:3000
echo    👉 Backend:  http://192.168.1.68:8080
echo.
echo 📋 Para ver logs:    docker logs -f pros-dev
echo 📋 Para detener:    docker stop pros-dev 