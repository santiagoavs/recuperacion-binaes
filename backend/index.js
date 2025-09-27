import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '.env');
console.log('Cargando variables de entorno desde:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error al cargar el archivo .env:', result.error);
  process.exit(1);
}

console.log('\n=== Variables de entorno cargadas ===');
console.log('DB_URI:', process.env.DB_URI ? '***' : 'No se estableció');
console.log('PORT:', process.env.PORT || '4000 (valor por defecto)');
console.log('CLOUDINARY_NAME:', process.env.CLOUDINARY_NAME ? '***' : 'No se estableció');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '***' : 'No se estableció');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '***' : 'No se estableció');

import app from "./app.js";
import connectDB from "./database.js";
import { config } from "./src/config.js";

async function main() {
    try {
        await connectDB();
        
        app.listen(config.server.PORT, () => {
            console.log(`Servidor corriendo en puerto ${config.server.PORT}`);
        });
    } catch (error) {
        console.error('Error al iniciar la aplicación:', error);
        process.exit(1);
    }
}

main();