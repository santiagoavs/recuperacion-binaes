import Client from '../models/Client.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

const getAllClients = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  const clients = await Client.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Client.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: clients.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      clients
    }
  });
});

const getClient = catchAsync(async (req, res, next) => {
  const client = await Client.findById(req.params.id)
    .populate('loans')
    .populate('reviews');

  if (!client) {
    return next(new AppError('No se encontró ningún cliente con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      client
    }
  });
});

const createClient = catchAsync(async (req, res, next) => {
  const newClient = await Client.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      client: newClient
    }
  });
});

const updateClient = catchAsync(async (req, res, next) => {
  const { password, ...updateData } = req.body;
  
  if (password) {
    return next(new AppError('La contraseña no puede ser actualizada a través de este endpoint', 400));
  }

  const client = await Client.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  if (!client) {
    return next(new AppError('No se encontró ningún cliente con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      client
    }
  });
});

const deleteClient = catchAsync(async (req, res, next) => {
  const client = await Client.findByIdAndDelete(req.params.id);

  if (!client) {
    return next(new AppError('No se encontró ningún cliente con ese ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export {
  getAllClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
};
