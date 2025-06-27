import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  host: '34.135.43.247',
  port: 5432,
  database: 'SQL_DDL_ADMCOT',
  username: 'postgres',
  password: 'MiClaveSegura2024',
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Necesario si el certificado no es de confianza
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos VM establecida correctamente.');
    return true;
  } catch (error) {
    console.error('Error al conectar con la base de datos VM:', error);
    return false;
  }
};

export default sequelize; 