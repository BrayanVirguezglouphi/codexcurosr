# ⚙️ Configuración de Servidor de Producción

## 🎯 ¿Qué necesitas hacer?

Solo necesitas **editar 4 líneas** en el archivo `config-manager.js` para que apunte a tu servidor de producción.

## 📝 Pasos para Configurar

### 1. Abrir el archivo `config-manager.js`

### 2. Buscar la sección `production` (línea ~35)

### 3. Cambiar estos 4 valores:

```javascript
production: {
  NODE_ENV: 'production',
  DB_HOST: 'TU_IP_SERVIDOR_PRODUCCION',    // 👈 Cambiar por IP real (ej: 192.168.1.100)
  DB_PORT: '5432',                         // 👈 Cambiar si usas puerto diferente
  DB_NAME: 'SQL_DDL_ADMCOT',               // 👈 Cambiar por nombre real de BD
  DB_USER: 'tu_usuario_produccion',        // 👈 Cambiar por usuario real
  DB_PASSWORD: 'tu_contraseña_produccion', // 👈 Cambiar por contraseña real
  DB_SSL: 'true',                          // Mantener true para producción
  // ... resto igual
}
```

## 🔧 ✅ Configuración Actual (Ya configurado)

Tu servidor de producción ya está configurado:
- **IP**: `100.94.234.77` ✅
- **Puerto**: `5432` ✅
- **Base de Datos**: `prueba_coenxionsistema` ✅
- **Usuario**: `postgres` ✅
- **Contraseña**: `00GP5673BD**$eG3Ve1101` ✅

Configuración actual en producción:

```javascript
production: {
  NODE_ENV: 'production',
  DB_HOST: '100.94.234.77',         // ✅ Configurado
  DB_PORT: '5432',                  // ✅ Configurado
  DB_NAME: 'prueba_coenxionsistema', // ✅ Configurado  
  DB_USER: 'postgres',              // ✅ Configurado
  DB_PASSWORD: '00GP5673BD**$eG3Ve1101', // ✅ Configurado
  DB_SSL: 'false',                  // ✅ Sin SSL (según servidor)
  // ... resto configurado
}
```

## 🚀 Uso Después de Configurar

Una vez configurado, puedes cambiar entre bases de datos súper fácil:

```bash
# Desarrollo (BD local)
npm run db:dev

# Producción (BD remota) 
npm run db:prod

# Ver configuración actual
npm run db:show

# Probar conexión
npm run test-connection
```

## 🎉 ¡Eso es todo!

- **Sin código**: Tu aplicación funcionará igual
- **Sin cambios**: Los modelos Sequelize siguen iguales  
- **Automático**: Solo cambias una vez, usas siempre

Con esto puedes trabajar en desarrollo local y deployar a producción con **un solo comando**. 