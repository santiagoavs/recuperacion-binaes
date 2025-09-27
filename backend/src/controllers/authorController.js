import Author from '../models/Author.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

const getAllAuthors = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  const authors = await Author.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ lastName: 1, firstName: 1 });

  const total = await Author.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: authors.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      authors
    }
  });
});

const getAuthor = catchAsync(async (req, res, next) => {
  const author = await Author.findById(req.params.id).populate('books');

  if (!author) {
    return next(new AppError('No se encontró ningún autor con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      author
    }
  });
});

const createAuthor = catchAsync(async (req, res, next) => {
  const newAuthor = await Author.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      author: newAuthor
    }
  });
});

const updateAuthor = catchAsync(async (req, res, next) => {
  const author = await Author.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!author) {
    return next(new AppError('No se encontró ningún autor con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      author
    }
  });
});

const deleteAuthor = catchAsync(async (req, res, next) => {
  const author = await Author.findByIdAndDelete(req.params.id);

  if (!author) {
    return next(new AppError('No se encontró ningún autor con ese ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export {
  getAllAuthors,
  getAuthor,
  createAuthor,
  updateAuthor,
  deleteAuthor
};
