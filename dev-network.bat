@echo off
echo 🚀 Iniciando desarrollo accesible desde la red...
echo 📍 IP del servidor: 192.168.1.68

REM Instalar dependencias si es necesario
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    npm install
)

echo 🚀 Iniciando servicios...
echo    👉 Frontend: http://192.168.1.68:5173
echo    👉 Backend:  http://192.168.1.68:8081

REM Iniciar backend directamente con back.cjs
echo 🔄 Iniciando backend (back.cjs)...
start "Backend" cmd /c "node back.cjs"

REM Esperar un poco para que el backend inicie
echo ⏳ Esperando que el backend inicie...
timeout /t 5 /nobreak >nul

REM Iniciar frontend con host accesible desde la red
echo 🎨 Iniciando frontend...
echo ⚠️  Presiona Ctrl+C para detener ambos servicios
npm run dev -- --host 0.0.0.0 --port 5173

echo.
echo ✅ Aplicación accesible desde:
echo    🌐 http://192.168.1.68:5173 (desde cualquier dispositivo en la red)
echo    🔌 http://localhost:5173 (solo desde este equipo) 