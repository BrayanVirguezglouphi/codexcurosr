#!/bin/bash

echo "🚀 Iniciando backend con Cloudflare Tunnel..."

# Función para limpiar procesos al salir
cleanup() {
    echo "🔄 Deteniendo procesos..."
    pkill -f cloudflared
    pkill -f node
    exit 0
}

# Capturar señales de terminación
trap cleanup SIGTERM SIGINT

# ID del tunnel específico
TUNNEL_ID="a53ca783-fbc3-4ad3-bdb5-7d3ca92188ac"

echo "☁️ Configurando tunnel TCP para acceso a base de datos..."

# Crear archivo de credenciales si tenemos los datos
if [ -n "$CLOUDFLARE_CREDENTIALS" ]; then
    echo "✅ Credenciales encontradas, creando archivo..."
    
    # Escribir credenciales al archivo con el ID específico
    echo "$CLOUDFLARE_CREDENTIALS" > /root/.cloudflared/$TUNNEL_ID.json
    
    echo "🚇 Iniciando tunnel TCP directo..."
    # Usar cloudflared tunnel access tcp para crear túnel directo al puerto 8321
    cloudflared access tcp --hostname cloud-access.zuhe.social --url localhost:8321 &
    TUNNEL_PID=$!
    echo "🚇 Tunnel TCP iniciado con PID: $TUNNEL_PID"
    
    # Esperar que el tunnel se establezca
    echo "⏳ Esperando que el tunnel TCP se establezca..."
    sleep 20
    
    echo "🔍 Verificando estado del tunnel..."
    if ps -p $TUNNEL_PID > /dev/null; then
        echo "✅ Tunnel TCP funcionando correctamente"
        
        # Probar conectividad al puerto local
        echo "🔍 Probando conectividad a localhost:8321..."
        if timeout 5 nc -z localhost 8321 2>/dev/null; then
            echo "✅ Puerto 8321 disponible localmente"
        else
            echo "⚠️ Puerto 8321 no responde aún, continuando..."
        fi
    else
        echo "❌ Error: Tunnel TCP no se inició correctamente"
        echo "📋 Intentando logs del tunnel:"
        ps aux | grep cloudflared || echo "No hay procesos cloudflared"
    fi
    
else
    echo "⚠️ No hay credenciales del tunnel - funcionará solo localmente"
fi

# Iniciar el servidor backend
echo "🚀 Iniciando servidor backend..."
exec node backend-server-fixed.cjs 