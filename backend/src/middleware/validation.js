import { validationResult } from 'express-validator';
import AppError from '../utils/appError.js';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return next(new AppError(`Validación fallida: ${errorMessages.map(e => e.message).join(', ')}`, 400));
  }
  
  next();
};

export { handleValidationErrors };
