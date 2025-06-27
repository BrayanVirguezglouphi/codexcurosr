#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuraciones para diferentes entornos
const environments = {
  dev: {
    NODE_ENV: 'development',
    PORT: '8081',
    DB_HOST: 'localhost',
    DB_PORT: '8321',
    DB_NAME: 'SQL_DDL_ADMCOT',
    DB_USER: 'postgres',
    DB_PASSWORD: '00GP5673BD**$eG3Ve1101',
    DB_SSL: 'false',
    CORS_ORIGIN: 'http://localhost:5173',
    API_BASE_URL: 'http://localhost:8081'
  },
  prod: {
    NODE_ENV: 'production',
    PORT: '8081',
    DB_HOST: '100.94.234.77',
    DB_PORT: '5432',
    DB_NAME: 'prueba_coenxionsistema',
    DB_USER: 'postgres',
    DB_PASSWORD: '00GP5673BD**$eG3Ve1101',
    DB_SSL: 'false',
    CORS_ORIGIN: 'https://tu-dominio-produccion.com',
    API_BASE_URL: 'https://tu-api-produccion.com'
  },
  gcp: {
    NODE_ENV: 'production',
    PORT: '8080',
    DB_HOST: 'api2.zuhe.social',
    DB_PORT: '5432',
    DB_NAME: 'SQL_DDL_ADMCOT',
    DB_USER: 'postgres',
    DB_PASSWORD: '00GP5673BD**$$eG3Ve1101',
    DB_SSL: 'false',
    CORS_ORIGIN: '*',
    API_BASE_URL: 'https://pros-backend-996366858087.us-central1.run.app'
  },
  test: {
    NODE_ENV: 'test',
    PORT: '8082',
    DB_HOST: 'localhost',
    DB_PORT: '8321',
    DB_NAME: 'SQL_DDL_ADMCOT_TEST',
    DB_USER: 'postgres',
    DB_PASSWORD: '00GP5673BD**$eG3Ve1101',
    DB_SSL: 'false',
    CORS_ORIGIN: 'http://localhost:5173',
    API_BASE_URL: 'http://localhost:8082'
  }
};

// Configuraciones predefinidas
const dbConfigs = {
  local: {
    database: 'SQL_DDL_ADMCOT',
    username: 'postgres',
    password: '12345',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres'
  },
  local2: {
    database: 'SQL_DDL_ADMCOT',
    username: 'postgres',
    password: '12345',
    host: 'PostgreSQL_2',
    port: 5432,
    dialect: 'postgres'
  }
};

// Función para crear archivo .env
function createEnvFile(config) {
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync('.env', envContent);
}

// Función para mostrar configuración actual
function showCurrentConfig() {
  if (fs.existsSync('.env')) {
    console.log('📋 Configuración actual (.env):');
    console.log('================================');
    const envContent = fs.readFileSync('.env', 'utf-8');
    console.log(envContent);
  } else {
    console.log('❌ No existe archivo .env');
  }
}

// Función para listar entornos disponibles
function listEnvironments() {
  console.log('🌍 Entornos disponibles:');
  console.log('========================');
  Object.keys(environments).forEach(env => {
    const config = environments[env];
    console.log(`\n📂 ${env.toUpperCase()}`);
    console.log(`   DB: ${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`);
    console.log(`   Modo: ${config.NODE_ENV}`);
    console.log(`   Puerto: ${config.PORT}`);
  });
}

// Función para cambiar entorno
function switchEnvironment(envName) {
  if (!environments[envName]) {
    console.error(`❌ Entorno '${envName}' no encontrado`);
    console.log('💡 Entornos disponibles:', Object.keys(environments).join(', '));
    process.exit(1);
  }

  const config = environments[envName];
  createEnvFile(config);
  
  console.log(`✅ Cambiado al entorno: ${envName.toUpperCase()}`);
  console.log(`🔗 Base de datos: ${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`);
  console.log(`⚙️  Modo: ${config.NODE_ENV}`);
  console.log(`🌐 Puerto: ${config.PORT}`);
  console.log('');
  console.log('📝 Archivo .env actualizado correctamente');
}

// Función para cambiar la configuración
export const switchDatabase = async (configName) => {
  try {
    console.log(`🔄 Cambiando a configuración: ${configName}`);
    
    // Obtener la configuración seleccionada
    const selectedConfig = dbConfigs[configName];
    if (!selectedConfig) {
      throw new Error(`Configuración "${configName}" no encontrada`);
    }

    // Crear contenido del archivo .env
    const envContent = `
DB_HOST=${selectedConfig.host}
DB_NAME=${selectedConfig.database}
DB_USER=${selectedConfig.username}
DB_PASSWORD=${selectedConfig.password}
DB_PORT=${selectedConfig.port}
    `.trim();

    // Escribir el archivo .env
    fs.writeFileSync('.env', envContent);

    console.log('✅ Configuración actualizada exitosamente');
    console.log('🔗 Nueva configuración:');
    console.log(`   Host: ${selectedConfig.host}:${selectedConfig.port}`);
    console.log(`   Database: ${selectedConfig.database}`);
    console.log(`   User: ${selectedConfig.username}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error al cambiar la configuración:', error.message);
    return false;
  }
};

// Función para probar la conexión con la configuración actual
export const testCurrentConnection = async () => {
  try {
    const config = {
      database: process.env.DB_NAME || 'SQL_DDL_ADMCOT',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '12345',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      dialect: 'postgres'
    };

    const sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: false
      }
    );

    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar:', error.message);
    return false;
  }
};

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);
const command = args[0];
const envName = args[1];

switch (command) {
  case 'switch':
    if (!envName) {
      console.error('❌ Especifica un entorno: dev, prod, gcp, test');
      process.exit(1);
    }
    switchEnvironment(envName);
    break;
  
  case 'show':
    showCurrentConfig();
    break;
  
  case 'list':
    listEnvironments();
    break;
  
  default:
    console.log('🛠️  Gestor de Configuración de Entornos');
    console.log('=====================================');
    console.log('');
    console.log('Uso:');
    console.log('  node config-manager.js switch <entorno>  - Cambiar entorno');
    console.log('  node config-manager.js show               - Mostrar configuración actual');
    console.log('  node config-manager.js list               - Listar entornos disponibles');
    console.log('');
    console.log('Entornos disponibles: dev, prod, gcp, test');
    console.log('');
    console.log('Ejemplos:');
    console.log('  npm run env:dev    # Cambiar a desarrollo');
    console.log('  npm run env:prod   # Cambiar a producción');
    console.log('  npm run env:gcp    # Cambiar a Google Cloud');
    console.log('  npm run env:show   # Ver configuración actual');
}

// Script para cambiar a la configuración deseada
if (process.argv[2]) {
  switchDatabase(process.argv[2])
    .then(() => testCurrentConnection())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default { switchDatabase, testCurrentConnection }; 