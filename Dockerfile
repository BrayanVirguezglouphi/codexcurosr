# Usar imagen base de Node.js 18
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo dev dependencies para el build)
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación frontend
RUN npm run build

# Eliminar dev dependencies para reducir tamaño
RUN npm prune --production

# Crear directorio para logs
RUN mkdir -p /app/logs

# Exponer puerto
EXPOSE 8080

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=8080

# Comando para iniciar la aplicación
CMD ["node", "src/server.js"] 