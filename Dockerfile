# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage — usar solo Node
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copiar la carpeta dist (frontend compilado)
COPY --from=build /app/dist ./dist

# Copiar toda la carpeta src (backend completo)
COPY src/ ./src/

EXPOSE 8080

CMD ["node", "src/server.js"]
