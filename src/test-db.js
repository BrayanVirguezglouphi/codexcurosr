import { testConnection } from './config/database.js';
import User from './models/User.js';

const testDatabase = async () => {
  try {
    // Probar la conexión
    const isConnected = await testConnection();
    
    if (isConnected) {
      // Sincronizar los modelos con la base de datos
      await User.sync({ alter: true });
      console.log('Modelos sincronizados correctamente');
      
      // Crear un usuario de prueba
      const testUser = await User.create({
        name: 'Usuario de Prueba',
        email: 'test@example.com',
        password: 'password123'
      });
      
      console.log('Usuario de prueba creado:', testUser.toJSON());
    }
  } catch (error) {
    console.error('Error durante la prueba:', error);
  }
};

testDatabase(); 