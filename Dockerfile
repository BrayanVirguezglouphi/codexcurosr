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

# Crear configuración de supervisor
RUN echo '[supervisord]' > /etc/supervisor/conf.d/supervisord.conf && \
    echo 'nodaemon=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '[program:nginx]' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'command=nginx -g "daemon off;"' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '[program:node]' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'command=node src/server.js' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'directory=/app' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisor/conf.d/supervisord.conf

# Exponer puerto 8080 (Cloud Run requirement)
EXPOSE 8080

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=8080
ENV BACKEND_PORT=3000

# Comando para iniciar supervisor (con ajuste de puerto para Cloud Run)
CMD ["sh", "-c", "sed -i 's/listen 80;/listen 8080;/' /etc/nginx/nginx.conf && sed -i 's/localhost:8080/localhost:3000/' /etc/nginx/nginx.conf && sed -i 's/command=node src\\/server.js/command=BACKEND_PORT=3000 node src\\/server.js/' /etc/supervisor/conf.d/supervisord.conf && /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf"] 