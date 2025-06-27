import sequelize, { testConnection } from '../config/database-vm.js';
import '../models/relationships.js';

const syncModels = async () => {
  try {
    // Probar la conexión primero
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('No se pudo establecer conexión con la base de datos VM');
      process.exit(1);
    }

    // Sincronizar modelos
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados exitosamente con la base de datos VM');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la sincronización:', error);
    process.exit(1);
  }
};

syncModels(); 