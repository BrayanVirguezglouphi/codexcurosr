# Etapa de build
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa final de producción
FROM node:18-alpine

WORKDIR /app

# Copia package.json (con "type": "module") y reinstala dependencias de prod
COPY package*.json ./
RUN npm install --omit=dev

# Copia build y servidor completo
COPY --from=build /app/dist ./dist
COPY src/ ./src/

EXPOSE 8080

CMD ["node", "src/server.js"]
