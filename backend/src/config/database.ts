// src/config/database.ts
import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/usuarios_db';
  try {
    await mongoose.connect(mongoUri);
    console.log('🔄 [Database]: Conexión exitosa a MongoDB');
  } catch (error) {
    console.error('❌ Error crítico al conectar a la base de datos:', error);
    process.exit(1);
  }
};
