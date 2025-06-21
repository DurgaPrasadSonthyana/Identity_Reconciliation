// src/server.ts
import 'dotenv/config';
import app from './app';
import { sequelize } from './config/dbConfig';
import { appConfig } from './config/appConfig';

(async function bootstrap() {
  try {
    // 1) Make Sequelize create or update the table to match your model:
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully');

    // 2) Then start your server:
    const port = Number(process.env.PORT) || appConfig.port;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (err) {
    console.error('❌ Failed to sync database:', err);
    process.exit(1);
  }
})();
