# 🚀 Despliegue en Servidor (IP terminada en 68)

Esta guía te ayudará a desplegar la aplicación PROS en el servidor para que sea accesible desde toda la red.

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Servidor con IP 192.168.1.68 (modificar en los archivos si es diferente)
- Puertos 80, 443, 8080, 8081, 3000 disponibles

## 🎯 Opciones de Despliegue

### Opción 1: **Producción Completa** (Recomendada)
```bash
# Windows
deploy-server.bat prod

# Linux/Mac
./deploy-server.sh prod
```

**Características:**
- ✅ Frontend optimizado con Nginx
- ✅ Backend separado para APIs
- ✅ Proxy automático entre servicios
- ✅ Configuración de seguridad
- ✅ Compresión gzip
- ✅ Cache de archivos estáticos

**URLs de acceso:**
- Frontend: `http://192.168.1.68:80`
- Backend API: `http://192.168.1.68:8081/api`

---

### Opción 2: **Desarrollo** (Para pruebas)
```bash
# Windows
deploy-server.bat dev

# Linux/Mac
./deploy-server.sh dev
```

**Características:**
- ✅ Recarga automática de cambios
- ✅ Un solo contenedor
- ✅ Ideal para desarrollo colaborativo
- ✅ Acceso directo a ambos servicios

**URLs de acceso:**
- Aplicación: `http://192.168.1.68:3000`
- Backend API: `http://192.168.1.68:8080/api`

---

### Opción 3: **Simple** (Mínimo)
```bash
# Windows
deploy-server.bat simple

# Linux/Mac
./deploy-server.sh simple
```

**Características:**
- ✅ Todo en una sola URL
- ✅ Backend sirve también el frontend
- ✅ Configuración mínima
- ✅ Menos recursos

**URLs de acceso:**
- Todo en uno: `http://192.168.1.68:8080`

## 🔧 Configuración Personalizada

### Cambiar IP del Servidor

1. **En docker-compose.yml:**
```yaml
environment:
  - REACT_APP_API_URL=http://TU_IP_AQUI:8081
  - CORS_ORIGIN=http://TU_IP_AQUI:80,http://localhost:5173
```

2. **En nginx.conf:**
```nginx
server_name localhost TU_IP_AQUI;
```

3. **En scripts de despliegue:**
```bash
SERVER_IP="TU_IP_AQUI"
```

### Variables de Entorno

Crea un archivo `.env` con:
```bash
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tu_bd
DB_USER=usuario
DB_PASSWORD=contraseña

# Configuración del servidor
SERVER_IP=192.168.1.68
NODE_ENV=production
```

## 🛠️ Comandos Útiles

### Gestión de Contenedores
```bash
# Ver contenedores activos
docker ps

# Ver logs
docker logs pros_frontend_1
docker logs pros_backend_1

# Entrar a un contenedor
docker exec -it pros_frontend_1 sh

# Detener todo
docker-compose down

# Limpiar todo (cuidado!)
docker system prune -a
```

### Diagnóstico de Red
```bash
# Verificar conectividad
curl http://192.168.1.68:80
curl http://192.168.1.68:8081/api/health

# Verificar puertos abiertos
netstat -tlnp | grep :80
netstat -tlnp | grep :8081
```

## 🔍 Solución de Problemas

### Frontend no carga
1. Verificar que nginx está corriendo: `docker logs pros_frontend_1`
2. Comprobar archivos build: `docker exec -it pros_frontend_1 ls /usr/share/nginx/html`
3. Revisar configuración nginx: `docker exec -it pros_frontend_1 cat /etc/nginx/nginx.conf`

### Backend no responde
1. Ver logs del backend: `docker logs pros_backend_1`
2. Verificar variables de entorno: `docker exec -it pros_backend_1 env`
3. Comprobar conexión BD: `docker exec -it pros_backend_1 npm run test-db`

### Problemas de Red
1. Verificar firewall del servidor
2. Comprobar que Docker bind a todas las interfaces (0.0.0.0)
3. Probar acceso local primero: `curl localhost:80`

### CORS Errors
1. Verificar CORS_ORIGIN en docker-compose.yml
2. Asegurar que frontend y backend usan misma IP
3. Comprobar configuración en `src/config/api.js`

## 🚀 Despliegue Paso a Paso

1. **Clonar/Actualizar código:**
```bash
git pull origin main
```

2. **Configurar IP** (si es diferente de 192.168.1.68):
   - Editar `docker-compose.yml`
   - Editar `nginx/nginx.conf`
   - Editar `deploy-server.bat` o `deploy-server.sh`

3. **Ejecutar despliegue:**
```bash
deploy-server.bat prod
```

4. **Verificar:**
   - Abrir `http://192.168.1.68:80` en el navegador
   - Comprobar que se cargan datos del backend

5. **Acceso desde otros dispositivos:**
   - Asegurar que están en la misma red
   - Usar la IP del servidor: `192.168.1.68`

## 📱 Acceso Móvil

La aplicación es responsive y funciona en móviles. Para acceder:

1. Conectar el móvil a la misma WiFi
2. Abrir navegador móvil
3. Ir a: `http://192.168.1.68`

## 🔐 Seguridad

### Headers de Seguridad Incluidos:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### Para Producción Real:
- Usar HTTPS con certificados SSL
- Configurar firewall apropiado
- Usar proxy reverso (nginx/apache)
- Variables de entorno seguras

## 📞 Soporte

Si hay problemas:
1. Revisar logs: `docker logs [container-name]`
2. Verificar conectividad de red
3. Comprobar configuración de firewall
4. Ejecutar diagnósticos de Docker 