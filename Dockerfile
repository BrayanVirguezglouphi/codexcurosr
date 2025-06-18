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

# Copiar solo la carpeta `dist` y `server.js`
COPY --from=build /app/dist ./dist
COPY src/server.js ./src/server.js

EXPOSE 8080

CMD ["node", "src/server.js"]
