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

# Crear archivo de credenciales si tenemos los datos
if [ -n "$CLOUDFLARE_CREDENTIALS" ]; then
    echo "✅ Credenciales encontradas, creando archivo..."
    
    # Escribir credenciales al archivo con el ID específico
    echo "$CLOUDFLARE_CREDENTIALS" > /root/.cloudflared/$TUNNEL_ID.json
    
    echo "🚇 Iniciando tunnel con credenciales..."
    cloudflared tunnel --config /root/.cloudflared/config.yml run &
    TUNNEL_PID=$!
    echo "🚇 Tunnel iniciado con PID: $TUNNEL_PID"
    
    # Esperar que el tunnel se establezca
    echo "⏳ Esperando que el tunnel se establezca..."
    sleep 15
    
    echo "🔍 Verificando estado del tunnel..."
    if ps -p $TUNNEL_PID > /dev/null; then
        echo "✅ Tunnel funcionando correctamente"
        
        # Verificar conectividad a la base de datos a través del tunnel
        echo "🔍 Verificando conectividad a BD..."
        sleep 5
    else
        echo "❌ Error: Tunnel no se inició correctamente"
        # Mostrar logs para debug
        echo "📋 Logs del tunnel:"
        tail -20 /var/log/cloudflared.log 2>/dev/null || echo "No se encontraron logs"
    fi
    
elif [ -n "$CLOUDFLARE_TUNNEL_TOKEN" ]; then
    echo "✅ Token encontrado, iniciando tunnel..."
    cloudflared tunnel run --token $CLOUDFLARE_TUNNEL_TOKEN &
    TUNNEL_PID=$!
    echo "🚇 Tunnel iniciado con PID: $TUNNEL_PID"
    
    # Esperar que el tunnel se establezca
    echo "⏳ Esperando que el tunnel se establezca..."
    sleep 10
    
else
    echo "⚠️ No hay credenciales del tunnel - funcionará solo localmente"
fi

# Iniciar el servidor backend
echo "🚀 Iniciando servidor backend..."
exec node backend-server-fixed.cjs 