# Usar imagen base de Node.js 18
FROM node:18-alpine as build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo dev dependencies para el build)
RUN npm install

# Copiar código fuente
COPY . .

# Construir la aplicación frontend
RUN npm run build

# Etapa de producción con Node.js y Nginx
FROM node:18-alpine

# Instalar nginx y supervisor
RUN apk add --no-cache nginx supervisor

# Crear directorios necesarios
RUN mkdir -p /var/log/supervisor /run/nginx

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json para producción
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar código fuente del backend
COPY src/ ./src/

# Copiar archivos build del frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Crear configuración de supervisor con logs detallados
RUN echo '[supervisord]' > /etc/supervisor/conf.d/supervisord.conf && \
    echo 'nodaemon=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'loglevel=debug' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '[program:nginx]' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'command=nginx -g "daemon off;"' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stdout_logfile=/dev/stdout' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stdout_logfile_maxbytes=0' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stderr_logfile=/dev/stderr' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stderr_logfile_maxbytes=0' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '[program:node]' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'command=node src/server.js' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'directory=/app' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'environment=BACKEND_PORT=3000,NODE_ENV=production' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stdout_logfile=/dev/stdout' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stdout_logfile_maxbytes=0' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stderr_logfile=/dev/stderr' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stderr_logfile_maxbytes=0' >> /etc/supervisor/conf.d/supervisord.conf

# Exponer puerto 8080 (Cloud Run requirement)
EXPOSE 8080

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=8080
ENV BACKEND_PORT=3000

# Agregar script de diagnóstico
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "🚀 Iniciando contenedor..."' >> /app/start.sh && \
    echo 'echo "📝 Variables de entorno:"' >> /app/start.sh && \
    echo 'env | grep -E "(PORT|NODE_ENV|BACKEND_PORT)"' >> /app/start.sh && \
    echo 'echo "📁 Contenido de /app:"' >> /app/start.sh && \
    echo 'ls -la /app/' >> /app/start.sh && \
    echo 'echo "📁 Contenido de /app/src:"' >> /app/start.sh && \
    echo 'ls -la /app/src/' >> /app/start.sh && \
    echo 'echo "🔧 Configuración de supervisor:"' >> /app/start.sh && \
    echo 'cat /etc/supervisor/conf.d/supervisord.conf' >> /app/start.sh && \
    echo 'echo "🚀 Iniciando supervisor..."' >> /app/start.sh && \
    echo '/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf' >> /app/start.sh && \
    chmod +x /app/start.sh

# Comando para iniciar con diagnóstico
CMD ["/app/start.sh"] 