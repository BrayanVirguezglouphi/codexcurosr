import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

/**
 * 🚀 GESTOR DE CONFIGURACIÓN MULTI-AMBIENTE
 * 
 * Permite cambiar fácilmente entre:
 * - Desarrollo (BD local)
 * - Producción (BD remota)
 * 
 * Uso:
 * - npm run dev (usa .env.development)
 * - npm run prod (usa .env.production)
 * - node config-manager.js switch dev
 * - node config-manager.js switch prod
 */

// Configuraciones predefinidas
const configs = {
  development: {
    NODE_ENV: 'development',
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_NAME: 'SQL_DDL_ADMCOT',
    DB_USER: 'postgres',
    DB_PASSWORD: '12345',
    DB_SSL: 'false',
    DIAN_AMBIENTE: 'HABILITACION',
    DIAN_URL_ENVIO: 'https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc',
    DIAN_URL_CONSULTA: 'https://catalogo-vpfe-hab.dian.gov.co/Document/FindDocument',
    API_PORT: '3000',
    LOG_LEVEL: 'debug'
  },
  
  production: {
    NODE_ENV: 'production',
    DB_HOST: '100.94.234.77',
    DB_PORT: '5432',
    DB_NAME: 'SQL_DDL_ADMCOT',
    DB_USER: 'postgres',
    DB_PASSWORD: '00GP5673BD**$eG3Ve1101',
    DB_SSL: 'false',
    DIAN_AMBIENTE: 'PRODUCCION',
    DIAN_URL_ENVIO: 'https://vpfe.dian.gov.co/WcfDianCustomerServices.svc',
    DIAN_URL_CONSULTA: 'https://catalogo-vpfe.dian.gov.co/Document/FindDocument',
    API_PORT: '3000',
    LOG_LEVEL: 'info'
  },

  // Ejemplo de un tercer ambiente (testing)
  testing: {
    NODE_ENV: 'testing',
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_NAME: 'SQL_DDL_ADMCOT_TEST',
    DB_USER: 'postgres',
    DB_PASSWORD: '12345',
    DB_SSL: 'false',
    DIAN_AMBIENTE: 'HABILITACION',
    DIAN_URL_ENVIO: 'https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc',
    DIAN_URL_CONSULTA: 'https://catalogo-vpfe-hab.dian.gov.co/Document/FindDocument',
    API_PORT: '3001',
    LOG_LEVEL: 'warn'
  },

  web: {
    NODE_ENV: 'production',
    DB_HOST: 'nozomi.proxy.rlwy.net',
    DB_PORT: '36062',
    DB_NAME: 'railway',
    DB_USER: 'postgres',
    DB_PASSWORD: 'NbAgEaAyMkpekkPXOeMPTHDEbKIcNwpw',
    DB_SSL: 'true',
    DIAN_AMBIENTE: 'PRODUCCION',
    DIAN_URL_ENVIO: 'https://vpfe.dian.gov.co/WcfDianCustomerServices.svc',
    DIAN_URL_CONSULTA: 'https://catalogo-vpfe.dian.gov.co/Document/FindDocument',
    API_PORT: '3000',
    LOG_LEVEL: 'info',
    VERCEL_URL: 'https://tu-app.vercel.app',
    CORS_ORIGIN: 'https://tu-app.vercel.app'
  }
};

/**
 * Crea un archivo .env con la configuración especificada
 */
function createEnvFile(environment) {
  const config = configs[environment];
  
  if (!config) {
    console.error(`❌ Ambiente '${environment}' no existe.`);
    console.log(`✅ Ambientes disponibles: ${Object.keys(configs).join(', ')}`);
    return false;
  }

  let envContent = `# Configuración generada automáticamente para: ${environment.toUpperCase()}\n`;
  envContent += `# Generado el: ${new Date().toLocaleString()}\n\n`;

  for (const [key, value] of Object.entries(config)) {
    envContent += `${key}=${value}\n`;
  }

  fs.writeFileSync('.env', envContent);
  console.log(`✅ Archivo .env actualizado para ambiente: ${environment}`);
  return true;
}

/**
 * Muestra la configuración actual
 */
function showCurrentConfig() {
  dotenv.config();
  
  console.log('📋 CONFIGURACIÓN ACTUAL:');
  console.log('='.repeat(40));
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'No definido'}`);
  console.log(`🌐 Host BD: ${process.env.DB_HOST || 'No definido'}`);
  console.log(`🗄️  Base de Datos: ${process.env.DB_NAME || 'No definido'}`);
  console.log(`👤 Usuario: ${process.env.DB_USER || 'No definido'}`);
  console.log(`🔐 Contraseña: ${'*'.repeat((process.env.DB_PASSWORD || '').length)}`);
  console.log(`🏛️  DIAN: ${process.env.DIAN_AMBIENTE || 'No definido'}`);
  console.log('');
}

/**
 * Lista todos los ambientes disponibles
 */
function listEnvironments() {
  console.log('🚀 AMBIENTES DISPONIBLES:');
  console.log('='.repeat(40));
  
  Object.entries(configs).forEach(([env, config]) => {
    console.log(`\n📁 ${env.toUpperCase()}`);
    console.log(`   🌐 Host: ${config.DB_HOST}`);
    console.log(`   🗄️  BD: ${config.DB_NAME}`);
    console.log(`   🏛️  DIAN: ${config.DIAN_AMBIENTE}`);
  });
  console.log('');
}

/**
 * Función principal de línea de comandos
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const environment = args[1];

  switch (command) {
    case 'switch':
      if (!environment) {
        console.error('❌ Especifica el ambiente: dev, prod, testing, web');
        return;
      }
      
      const envMap = {
        'dev': 'development',
        'development': 'development',
        'prod': 'production',
        'production': 'production',
        'test': 'testing',
        'testing': 'testing',
        'web': 'web'
      };
      
      const targetEnv = envMap[environment.toLowerCase()];
      if (createEnvFile(targetEnv)) {
        showCurrentConfig();
      }
      break;
      
    case 'show':
    case 'current':
      showCurrentConfig();
      break;
      
    case 'list':
    case 'environments':
      listEnvironments();
      break;
      
    default:
      console.log('🔧 GESTOR DE CONFIGURACIÓN MULTI-AMBIENTE');
      console.log('');
      console.log('Comandos disponibles:');
      console.log('  node config-manager.js switch dev     # Cambiar a desarrollo');
      console.log('  node config-manager.js switch prod    # Cambiar a producción');
      console.log('  node config-manager.js switch test    # Cambiar a testing');
      console.log('  node config-manager.js switch web     # Cambiar a producción web');
      console.log('  node config-manager.js show           # Ver configuración actual');
      console.log('  node config-manager.js list           # Listar ambientes');
      console.log('');
      console.log('También puedes usar los scripts de package.json:');
      console.log('  npm run dev                           # Modo desarrollo');
      console.log('  npm run prod                          # Modo producción');
      console.log('  npm run web                           # Modo producción web');
  }
}

// Ejecutar siempre (simplificado para Windows)
main(); 