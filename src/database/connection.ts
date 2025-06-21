import { sequelize } from '../config/dbConfig';

export const initializeDb = async () => {
  try {
    await sequelize.sync();  // Sync all models with the database
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
