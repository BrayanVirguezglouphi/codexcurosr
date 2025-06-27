import localSequelize from './database.js';
import vmSequelize from './database-vm.js';

let currentEnvironment = 'local';
let currentSequelize = localSequelize;

export const switchEnvironment = (environment) => {
  if (environment === 'vm') {
    currentEnvironment = 'vm';
    currentSequelize = vmSequelize;
    console.log('Cambiado al entorno de VM');
  } else {
    currentEnvironment = 'local';
    currentSequelize = localSequelize;
    console.log('Cambiado al entorno local');
  }
};

export const getCurrentSequelize = () => currentSequelize;
export const getCurrentEnvironment = () => currentEnvironment; 