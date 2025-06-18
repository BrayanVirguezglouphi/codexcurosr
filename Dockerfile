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

# Etapa de producción con Nginx
FROM nginx:1.25.3-alpine

# Copiar configuración de nginx
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Copiar archivos build
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer puerto 8080
EXPOSE 8080

# Variables de entorno
ENV PORT=8080

# Comando para iniciar nginx en puerto 8080
CMD ["sh", "-c", "sed -i 's/listen 80;/listen 8080;/' /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
