import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const getAllUsers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  const users = await User.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: users.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      users
    }
  });
});

const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No se encontró ningún usuario con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

const createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email', 'role', 'isActive', 'phoneNumber', 'address');

  const user = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new AppError('No se encontró ningún usuario con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    return next(new AppError('No se encontró ningún usuario con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Usuario desactivado exitosamente'
  });
});

const getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('Esta ruta no es para actualizaciones de contraseñas. Por favor, use /updateMyPassword.', 400));
  }

  const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'phoneNumber', 'address');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { isActive: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

const uploadUserPhoto = catchAsync(async (req, res, next) => {
  try {
    console.log('Subiendo foto...');
    console.log('Archivo:', req.file);
    
    if (!req.file) {
      console.log('No se proporcionó ningún archivo de imagen');
      return next(new AppError('No se proporcionó ningún archivo de imagen', 400));
    }

    console.log('Buscando usuario...');
    const userId = req.params.id || (req.user && req.user.id);
    console.log('ID del usuario:', userId);
    
    const user = await User.findById(userId);
    if (!user) {
      console.log('No se encontró ningún usuario con ese ID');
      return next(new AppError('No se encontró ningún usuario con ese ID', 404));
    }
    
    if (user.profileImage) {
      try {
        console.log('Eliminando foto anterior...');
        const publicId = user.profileImage.split('/').pop().split('.')[0];
        await deleteImage(`binaes/users/${publicId}`);
      } catch (error) {
        console.error('Error eliminando la imagen anterior:', error.message);
      }
    }

    console.log('Subiendo nueva foto...');
    const result = await uploadImage(req.file.buffer, 'binaes/users');
    console.log('Resultado de la subida:', result);

    user.profileImage = result;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: {
        imageUrl: result
      }
    });
  } catch (error) {
    console.error('Error en uploadUserPhoto:', error);
    next(error);
  }
});

export {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  deleteMe,
  uploadUserPhoto
};
