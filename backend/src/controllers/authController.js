import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Client from '../models/Client.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { createSendToken } from '../utils/jwt.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../utils/email.js';

const signUp = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;

  if (role === 'admin') {
    return next(new AppError('No se pueden crear usuarios administradores a través de este endpoint', 400));
  }

  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Ya existe un usuario con este correo electrónico', 400));
  }

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: 'client'
  });

  try {
    await sendWelcomeEmail(email, firstName);
  } catch (error) {
    console.log('No se pudo enviar el correo de bienvenida:', error.message);
  }

  createSendToken(newUser, 201, res);
});

const signUpClient = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Verificar si el cliente ya existe
  const existingClient = await Client.findOne({ email });
  if (existingClient) {
    return next(new AppError('Ya existe un cliente con este correo electrónico', 400));
  }

  const newClient = await Client.create({
    name,
    email,
    password
  });

  try {
    await sendWelcomeEmail(email, name);
  } catch (error) {
    console.log('No se pudo enviar el correo de bienvenida:', error.message);
  }

  res.status(201).json({
    status: 'success',
    message: 'Cliente registrado exitosamente',
    data: {
      client: {
        id: newClient._id,
        name: newClient.name,
        email: newClient.email
      }
    }
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Por favor proporciona un email y contraseña', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Email o contraseña incorrectos', 401));
  }

  if (user.isLocked) {
    return next(new AppError('Cuenta temporalmente bloqueada debido a demasiados intentos fallidos de inicio de sesión. Por favor, intenta de nuevo más tarde.', 423));
  }

  const correct = await user.comparePassword(password);

  if (!correct) {
    await user.incLoginAttempts();
    return next(new AppError('Email o contraseña incorrectos', 401));
  }

  await user.resetLoginAttempts();
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res);
});

const loginClient = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Por favor proporciona un email y contraseña', 400));
  }

  const client = await Client.findOne({ email }).select('+password');

  if (!client || !(await client.comparePassword(password))) {
    return next(new AppError('Email o contraseña incorrectos', 401));
  }

  const token = jwt.sign({ id: client._id, type: 'client' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      client: {
        id: client._id,
        name: client.name,
        email: client.email
      }
    }
  });
});

const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Por favor proporciona tu dirección de correo electrónico', 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('No hay un usuario con esa dirección de correo electrónico', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user.email, resetToken, user.firstName);

    res.status(200).json({
      status: 'success',
      message: 'Se ha enviado un correo electrónico con un enlace para restablecer tu contraseña'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Hubo un error al enviar el correo electrónico. Inténtalo de nuevo más tarde.', 500));
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('El token es inválido o ha expirado', 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.comparePassword(req.body.passwordCurrent))) {
    return next(new AppError('Tu contraseña actual es incorrecta.', 401));
  }

  user.password = req.body.password;
  await user.save();

  createSendToken(user, 200, res);
});

export {
  signUp,
  signUpClient,
  login,
  loginClient,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword
};
