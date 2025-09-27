import Book from '../models/Book.js';
import Author from '../models/Author.js';
import Category from '../models/Category.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';

const getAllBooks = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  
  if (req.query.category) {
    filter.idCategories = req.query.category;
  }
  
  if (req.query.author) {
    filter.idAuthors = req.query.author;
  }
  
  if (req.query.available === 'true') {
    filter.copiesAvailable = { $gt: 0 };
  }

  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  const books = await Book.find(filter)
    .populate('idAuthors', 'firstName lastName')
    .populate('idCategories', 'name')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Book.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: books.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      books
    }
  });
});

const getBook = catchAsync(async (req, res, next) => {
  const book = await Book.findById(req.params.id)
    .populate('idAuthors', 'firstName lastName bio')
    .populate('idCategories', 'name description')
    .populate({
      path: 'reviews',
      populate: {
        path: 'idClient',
        select: 'name'
      }
    });

  if (!book) {
    return next(new AppError('No se encontró ningún libro con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      book
    }
  });
});

const createBook = catchAsync(async (req, res, next) => {
  const { title, summary, isbn, idAuthors, tags, publishedDate, copiesAvailable, idCategories } = req.body;

  if (!idAuthors || idAuthors.length === 0) {
    return next(new AppError('Se requiere al menos un autor', 400));
  }

  if (!idCategories || idCategories.length === 0) {
    return next(new AppError('Se requiere al menos una categoría', 400));
  }

  const authorsExist = await Author.find({ _id: { $in: idAuthors } });
  if (authorsExist.length !== idAuthors.length) {
    return next(new AppError('Uno o más autores no existen', 400));
  }

  const categoriesExist = await Category.find({ _id: { $in: idCategories } });
  if (categoriesExist.length !== idCategories.length) {
    return next(new AppError('Una o más categorías no existen', 400));
  }

  const newBook = await Book.create({
    title,
    summary,
    isbn,
    idAuthors,
    tags,
    publishedDate,
    copiesAvailable,
    idCategories
  });

  await newBook.populate('idAuthors', 'firstName lastName');
  await newBook.populate('idCategories', 'name');

  res.status(201).json({
    status: 'success',
    data: {
      book: newBook
    }
  });
});

const updateBook = catchAsync(async (req, res, next) => {
  const { idAuthors, idCategories } = req.body;

  if (idAuthors && idAuthors.length > 0) {
    const authorsExist = await Author.find({ _id: { $in: idAuthors } });
    if (authorsExist.length !== idAuthors.length) {
      return next(new AppError('Uno o más autores no existen', 400));
    }
  }

  if (idCategories && idCategories.length > 0) {
    const categoriesExist = await Category.find({ _id: { $in: idCategories } });
    if (categoriesExist.length !== idCategories.length) {
      return next(new AppError('Una o más categorías no existen', 400));
    }
  }

  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('idAuthors', 'firstName lastName')
    .populate('idCategories', 'name');

  if (!book) {
    return next(new AppError('No se encontró ningún libro con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      book
    }
  });
});

const deleteBook = catchAsync(async (req, res, next) => {
  const book = await Book.findByIdAndDelete(req.params.id);

  if (!book) {
    return next(new AppError('No se encontró ningún libro con ese ID', 404));
  }

  if (book.coverUrl) {
    try {
      const publicId = book.coverUrl.split('/').pop().split('.')[0];
      await deleteImage(`binaes/books/${publicId}`);
    } catch (error) {
      console.log('Error al eliminar la imagen del libro:', error.message);
    }
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

const uploadBookCover = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No se proporcionó ningún archivo de imagen', 400));
  }

  const book = await Book.findById(req.params.id);
  if (!book) {
    return next(new AppError('No se encontró ningún libro con ese ID', 404));
  }

  if (book.coverUrl) {
    try {
      const publicId = book.coverUrl.split('/').pop().split('.')[0];
      await deleteImage(`binaes/books/${publicId}`);
    } catch (error) {
      console.log('Error al eliminar la imagen anterior:', error.message);
    }
  }

  const result = await uploadImage(req.file, 'binaes/books');

  book.coverUrl = result.secure_url;
  await book.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      imageUrl: result.secure_url
    }
  });
});

const getBooksByCategory = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const books = await Book.find({ idCategories: req.params.categoryId })
    .populate('idAuthors', 'firstName lastName')
    .populate('idCategories', 'name')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Book.countDocuments({ idCategories: req.params.categoryId });

  res.status(200).json({
    status: 'success',
    results: books.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      books
    }
  });
});

const getBooksByAuthor = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const books = await Book.find({ idAuthors: req.params.authorId })
    .populate('idAuthors', 'firstName lastName')
    .populate('idCategories', 'name')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Book.countDocuments({ idAuthors: req.params.authorId });

  res.status(200).json({
    status: 'success',
    results: books.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      books
    }
  });
});

export {
  getAllBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  uploadBookCover,
  getBooksByCategory,
  getBooksByAuthor
};
