import { body } from 'express-validator';

const signUpValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Su nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('Su nombre debe tener entre 2 y 50 caracteres'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Su apellido es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('Su apellido debe tener entre 2 y 50 caracteres'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Por favor, proporcione un correo electrónico válido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una letra mayúscula y un número')
];

const clientSignUpValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Su nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('Su nombre debe tener entre 2 y 100 caracteres'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Por favor, proporcione un correo electrónico válido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una letra mayúscula y un número')
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Por favor, proporcione un correo electrónico válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

const forgotPasswordValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Por favor, proporcione un correo electrónico válido')
    .normalizeEmail()
];

const resetPasswordValidation = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una letra mayúscula y un número')
];

const updatePasswordValidation = [
  body('passwordCurrent')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una letra mayúscula y un número')
];

export {
  signUpValidation,
  clientSignUpValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updatePasswordValidation
};
