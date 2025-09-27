import { body } from 'express-validator';

const createBookValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('El título es requerido')
    .isLength({ min: 1, max: 200 })
    .withMessage('El título debe tener entre 1 y 200 caracteres'),
  
  body('summary')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('El resumen no puede exceder 2000 caracteres'),
  
  body('isbn')
    .optional()
    .trim()
    .matches(/^(?:\d{9}[\dX]|\d{13})$/)
    .withMessage('Por favor, ingrese un ISBN válido'),
  
  body('idAuthors')
    .isArray({ min: 1 })
    .withMessage('Al menos un autor es requerido')
    .custom((value) => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('Al menos un autor es requerido');
      }
      return true;
    }),
  
  body('idAuthors.*')
    .isMongoId()
    .withMessage('ID de autor inválido'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Etiquetas debe ser un array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Cada etiqueta no puede exceder 30 caracteres'),
  
  body('coverUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('La URL de la cubierta debe ser una URL válida'),
  
  body('publishedDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de publicación debe ser una fecha válida'),
  
  body('copiesAvailable')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El número de copias disponibles debe ser un número no negativo'),
  
  body('idCategories')
    .isArray({ min: 1 })
    .withMessage('Al menos una categoría es requerida')
    .custom((value) => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('Al menos una categoría es requerida');
      }
      return true;
    }),
  
  body('idCategories.*')
    .isMongoId()
    .withMessage('ID de categoría inválido')
];

const updateBookValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El título no puede estar vacío')
    .isLength({ min: 1, max: 200 })
    .withMessage('El título debe tener entre 1 y 200 caracteres'),
  
  body('summary')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('El resumen no puede exceder 2000 caracteres'),
  
  body('isbn')
    .optional()
    .trim()
    .matches(/^(?:\d{9}[\dX]|\d{13})$/)
    .withMessage('Por favor, ingrese un ISBN válido'),
  
  body('idAuthors')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Al menos un autor es requerido'),
  
  body('idAuthors.*')
    .optional()
    .isMongoId()
    .withMessage('ID de autor inválido'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Las etiquetas deben ser un array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Cada etiqueta no puede exceder 30 caracteres'),
  
  body('coverUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('La URL de la cubierta debe ser una URL válida'),
  
  body('publishedDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de publicación debe ser una fecha válida'),
  
  body('copiesAvailable')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El número de copias disponibles debe ser un número no negativo'),
  
  body('idCategories')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Al menos una categoría es requerida'),
  
  body('idCategories.*')
    .optional()
    .isMongoId()
    .withMessage('ID de categoría inválido')
];

export {
  createBookValidation,
  updateBookValidation
};
