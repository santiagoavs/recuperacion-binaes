import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

const configureCloudinary = () => {
  if (isConfigured) return;
  
  const cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  };

  if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
    throw new Error('Faltan variables de configuración de Cloudinary en el archivo .env');
  }

  console.log('Inicializando Cloudinary con la configuración:', {
    ...cloudinaryConfig,
    api_secret: '***'
  });

  cloudinary.config(cloudinaryConfig);
  isConfigured = true;
};

const uploadImage = async (buffer, folder = 'binaes') => {
  configureCloudinary();
  console.log(`Subiendo imagen a la carpeta: ${folder}`);
  
  if (!buffer) {
    throw new Error('No se proporcionó ningún archivo de imagen');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: folder,
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          console.error('Error al subir a Cloudinary:', error);
          reject(new Error(`Error al subir a Cloudinary: ${error.message}`));
        } else if (!result || !result.secure_url) {
          console.error('Respuesta inválida de Cloudinary:', result);
          reject(new Error('Respuesta inválida de Cloudinary'));
        } else {
          console.log('Subida exitosa:', result.secure_url);
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.on('error', (error) => {
      console.error('Error en el stream de subida:', error);
      reject(new Error(`Error en el stream de subida: ${error.message}`));
    });

    uploadStream.end(buffer);
  });
};

const deleteImage = async (publicId) => {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

export { uploadImage, deleteImage };
