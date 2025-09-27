import Category from '../models/Category.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

const getAllCategories = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  const categories = await Category.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 });

  const total = await Category.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: categories.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      categories
    }
  });
});

const getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id).populate('books');

  if (!category) {
    return next(new AppError('No se encontró ninguna categoría con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      category
    }
  });
});

const createCategory = catchAsync(async (req, res, next) => {
  const newCategory = await Category.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      category: newCategory
    }
  });
});

const updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!category) {
    return next(new AppError('No se encontró ninguna categoría con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      category
    }
  });
});

const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return next(new AppError('No se encontró ninguna categoría con ese ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};
