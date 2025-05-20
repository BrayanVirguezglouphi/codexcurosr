import sequelize from '../config/database.js';
import Transaccion from '../models/Transaccion.js';

async function syncModels() {
  try {
    // Sincronizar todos los modelos
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados correctamente');
  } catch (error) {
    console.error('Error al sincronizar los modelos:', error);
  } finally {
    // Cerrar la conexión
    await sequelize.close();
  }
}

syncModels(); 