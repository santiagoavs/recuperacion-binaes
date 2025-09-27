# BINAES - Backend

Backend de recuperación construido para la Biblioteca Nacional BINAES.

## Características

- **Autenticación y autorización**
  - Autenticación basada en JWT
  - Control de acceso basado en roles (Admin/Librarian/Client)
  - Recuperación de contraseñas por correo
  - Hasheo seguro de contraseñas con bcrypt

- **Gestión de la biblioteca**
  - Operaciones CRUD completas para libros, autores, categorías
  - Búsqueda y filtrado de libros
  - Reseñas y calificaciones de libros
  - Sistema de préstamos

- **Gestión de medios**
  - Integración con Cloudinary para subida de imágenes
  - Optimización automática de imágenes
  - Almacenamiento seguro y entrega por CDN

- **Seguridad**
  - Limitación de peticiones
  - Protección CORS
  - Protección de headers con Helmet

- **Experiencia de desarrollo**
  - Documentación API completa con Swagger
  - Manejo centralizado de errores
  - Validación de peticiones con Joi
  - Configuración basada en entorno

## Instalación y configuración

### Requisitos
- Node.js (v14 o superior)
- MongoDB (Atlas o instancia local)
- Cuenta de Cloudinary (para almacenamiento de medios)
- Servicio de correo SMTP (para recuperación de contraseñas)

### Instrucciones de instalación y configuración

1. **Clonar el repositorio**
   git clone https://github.com/yourusername/recuperacion-binaes.git
   cd recuperacion-binaes/backend

2. **Instalar dependencias**
   npm install

3. **Configuración del entorno**
   - Copie la configuración de env adjuntada en el correo

4. **Iniciar el servidor de desarrollo**
   node index.js

5. **Acceder a la documentación de la API**
   - Swagger UI: `http://localhost:4000/api-docs`
   - API Base URL: `http://localhost:4000/api`

## Documentación de la API

### Autenticación

| Endpoint | Método | Descripción | Autenticación |
|----------|--------|-------------|----------------|
| `/api/auth/register` | POST | Registrar un nuevo usuario | Público |
| `/api/auth/login` | POST | Iniciar sesión | Público |
| `/api/auth/logout` | POST | Cerrar sesión | Bearer Token |
| `/api/auth/forgot-password` | POST | Solicitar restablecimiento de contraseña | Público |
| `/api/auth/reset-password` | POST | Restablecer contraseña | Público |

### Usuarios

| Endpoint | Método | Descripción | Autenticación |
|----------|--------|-------------|----------------|
| `/api/users` | GET | Obtener todos los usuarios | Admin |
| `/api/users/:id` | GET | Obtener usuario por ID | Admin/Dueño |
| `/api/users/:id` | PUT | Actualizar usuario | Admin/Dueño |
| `/api/users/:id` | DELETE | Eliminar usuario | Admin |
| `/api/users/:id/upload-photo` | PATCH | Subir foto de perfil | Dueño |

### Libros

| Endpoint | Método | Descripción | Autenticación |
|----------|--------|-------------|----------------|
| `/api/books` | GET | Obtener todos los libros | Público |
| `/api/books/:id` | GET | Obtener libro por ID | Público |
| `/api/books` | POST | Crear nuevo libro | Admin |
| `/api/books/:id` | PUT | Actualizar libro | Admin |
| `/api/books/:id` | DELETE | Eliminar libro | Admin |
| `/api/books/:id/upload-cover` | PATCH | Subir portada del libro | Admin |

### Préstamos

| Endpoint | Método | Descripción | Autenticación |
|----------|--------|-------------|----------------|
| `/api/loans` | GET | Obtener todos los préstamos | Admin |
| `/api/loans/my-loans` | GET | Obtener préstamos del usuario | Autenticado |
| `/api/loans` | POST | Crear nuevo préstamo | Admin |
| `/api/loans/:id/return` | PATCH | Devolver un libro | Admin |

### Reseñas

| Endpoint | Método | Descripción | Autenticación |
|----------|--------|-------------|----------------|
| `/api/reviews` | GET | Obtener todas las reseñas | Público |
| `/api/books/:bookId/reviews` | GET | Obtener reseñas de un libro | Público |
| `/api/reviews` | POST | Crear nueva reseña | Autenticado |
| `/api/reviews/:id` | PUT | Actualizar reseña | Dueño |
| `/api/reviews/:id` | DELETE | Eliminar reseña | Dueño/Admin |

