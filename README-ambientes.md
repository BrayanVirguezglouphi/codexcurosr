# 🚀 Gestión de Múltiples Ambientes de Base de Datos

Este proyecto soporta múltiples ambientes de base de datos de manera muy sencilla. Puedes cambiar entre **desarrollo**, **producción** y **testing** con un solo comando.

## 🎯 Uso Rápido

### Opción 1: Scripts NPM (Recomendado)
```bash
# Cambiar a desarrollo (BD local)
npm run db:dev

# Cambiar a producción (BD remota)  
npm run db:prod

# Cambiar a testing
npm run db:test

# Ver configuración actual
npm run db:show

# Probar conexión actual
npm run test-connection
```

### Opción 2: Script Rápido (Cambia + Prueba)
```bash
# Cambio rápido con prueba automática
node quick-switch.js dev    # Desarrollo
node quick-switch.js prod   # Producción  
node quick-switch.js test   # Testing
```

### Opción 3: Comando Manual
```bash
# Cambiar manualmente
node config-manager.js switch dev
node config-manager.js switch prod

# Ver opciones disponibles
node config-manager.js list
```

## ⚙️ Configuración de Producción

**IMPORTANTE**: Antes de usar producción, edita el archivo `config-manager.js` y cambia estos valores:

```javascript
production: {
  DB_HOST: 'TU_SERVIDOR_PRODUCCION.com', // 👈 Cambia esto
  DB_NAME: 'SQL_DDL_ADMCOT_PROD',        // 👈 Y esto
  DB_USER: 'usuario_prod',               // 👈 Y esto  
  DB_PASSWORD: 'contraseña_segura_prod', // 👈 Y esto
  // ... resto de configuración
}
```

## 🗄️ Ambientes Disponibles

| Ambiente | Base de Datos | Servidor | DIAN |
|----------|---------------|----------|------|
| **Development** | `SQL_DDL_ADMCOT_DEV` | localhost | Habilitación |
| **Production** | `SQL_DDL_ADMCOT_PROD` | Remoto | Producción |
| **Testing** | `SQL_DDL_ADMCOT_TEST` | localhost | Habilitación |

## 🔧 Cómo Funciona

1. **Variables de Entorno**: Cada ambiente tiene su propia configuración
2. **Archivo .env**: Se genera automáticamente según el ambiente
3. **Sequelize**: Lee las variables automáticamente
4. **Sin Código**: No necesitas cambiar código fuente

## 📝 Ejemplo de Flujo de Trabajo

```bash
# 1. Iniciar proyecto en desarrollo
npm run db:dev
npm run server

# 2. Cambiar a producción para deploy
npm run db:prod  
npm run build

# 3. Volver a desarrollo
npm run db:dev
```

## 🚨 Solución de Problemas

### Error de Conexión
```bash
# Ver configuración actual
npm run db:show

# Probar conexión específica
npm run test-connection
```

### Cambio No Funciona
```bash
# Ver ambientes disponibles
npm run db:list

# Forzar cambio
node config-manager.js switch dev
```

### Base de Datos No Existe
```bash
# Verificar configuración en config-manager.js
# Crear base de datos en el servidor remoto
# O cambiar nombre en la configuración
```

## 🎉 ¡Ya está listo!

Ahora puedes cambiar entre bases de datos con **un solo comando**. Tu código sigue igual, solo cambian las conexiones automáticamente.

**Comandos más usados:**
- `npm run db:dev` - Desarrollo diario
- `npm run db:prod` - Deploy a producción  
- `npm run test-connection` - Verificar que todo funciona 