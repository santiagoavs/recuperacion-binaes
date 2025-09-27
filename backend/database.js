import mongoose from "mongoose";
import { config } from "./src/config.js";

const connectDB = async () => {
  try {
    const uri = process.env.DB_URI || config.db.URI;
    
    console.log('Intentando conectar a MongoDB con URI:', 
      uri ? uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') : 'No hay URI');
    
    if (!uri) {
      console.error('Error: No se encontró la URI de la base de datos');
      console.error('Variables de entorno cargadas:', Object.keys(process.env));
      throw new Error('La URI de la base de datos no está configurada');
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    };

    await mongoose.connect(uri, options);
    console.log('Conexión a MongoDB establecida correctamente');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};

const connection = mongoose.connection;

connection.on("connected", () => {
  console.log("MongoDB conectada exitosamente");
});

connection.on("disconnected", () => {
  console.log("MongoDB desconectada");
});

connection.on("error", (error) => {
  console.error("Error en la conexión a MongoDB:", error.message);
});

process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada por terminación de la aplicación');
    process.exit(0);
  } catch (error) {
    console.error('Error al cerrar la conexión a MongoDB:', error.message);
    process.exit(1);
  }
});

export default connectDB;