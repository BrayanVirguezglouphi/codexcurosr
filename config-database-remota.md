# 🌐 Configuración de Base de Datos Remota

## 📋 Paso a Paso para Conectar a Servidor Remoto

### 1. Crear archivo `.env` en la raíz del proyecto

Crea un archivo llamado `.env` en `C:\pros\.env` con el siguiente contenido:

```env
# CONFIGURACIÓN DE BASE DE DATOS REMOTA
DB_HOST=192.168.1.100
DB_PORT=5432
DB_NAME=SQL_DDL_ADMCOT
DB_USER=postgres
DB_PASSWORD=tu_password_aqui

# Si el servidor requiere SSL
# DB_SSL=true

# CONFIGURACIÓN DE LA APLICACIÓN
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### 2. Reemplazar los siguientes valores:

- **DB_HOST**: IP o dominio de tu servidor (ej: `192.168.1.100`)
- **DB_PORT**: Puerto PostgreSQL (generalmente `5432`)
- **DB_USER**: Usuario de PostgreSQL
- **DB_PASSWORD**: Contraseña de PostgreSQL
- **DB_NAME**: Nombre de la base de datos

### 3. Verificar que el servidor PostgreSQL permita conexiones remotas

El servidor debe estar configurado para aceptar conexiones externas:

#### En el servidor PostgreSQL:

**Archivo `postgresql.conf`:**
```
listen_addresses = '*'
port = 5432
```

**Archivo `pg_hba.conf`:**
```
# Permitir conexiones desde tu IP
host    all             all             192.168.1.0/24         md5
# O para permitir todas las IPs (menos seguro)
host    all             all             0.0.0.0/0              md5
```

### 4. Probar conectividad

Una vez configurado el `.env`, ejecuta:

```bash
npm run server
```

### 5. Comandos de prueba manual

```bash
# Probar ping al servidor
ping IP_DEL_SERVIDOR

# Probar conexión PostgreSQL (si tienes psql instalado)
psql -h IP_DEL_SERVIDOR -p 5432 -U postgres -d SQL_DDL_ADMCOT
```

## 🔧 Troubleshooting

### Error: "Connection refused"
- Verificar que PostgreSQL esté corriendo en el servidor
- Verificar que el puerto 5432 esté abierto
- Verificar firewall del servidor

### Error: "Authentication failed"
- Verificar usuario y contraseña
- Verificar configuración `pg_hba.conf`

### Error: "Database does not exist"
- Crear la base de datos en el servidor remoto
- Verificar el nombre exacto de la base de datos

### Error: "SSL required"
- Agregar `DB_SSL=true` en el archivo `.env`

## 📞 Información que Necesitas

Para completar la configuración, necesito que me proporciones:

1. **IP del servidor**: _______________
2. **Puerto PostgreSQL**: _______________
3. **Usuario de BD**: _______________
4. **Contraseña de BD**: _______________
5. **Nombre de BD**: _______________
6. **¿Usa SSL?**: _______________

Una vez que tengas esta información, actualiza el archivo `.env` y reinicia la aplicación. 