// Debug environment variables
console.log('DB_URI from process.env:', process.env.DB_URI ? '***' : 'Not set');
console.log('Available environment variables:', Object.keys(process.env).join(', '));

export const config = {
  db: {
    URI: process.env.DB_URI,
  },
  server: {
    PORT: process.env.PORT || 4000,
    BACKEND_URL: process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`
  },
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || `Diambars <${process.env.EMAIL_USER}>`
  },
  JWT: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES || "30d",
  },
  cloudinary: {
    cloudinary_name: process.env.CLOUDINARY_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  }
}