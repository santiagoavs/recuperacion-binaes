import Review from '../models/Review.js';
import Book from '../models/Book.js';
import Client from '../models/Client.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

const getAllReviews = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  
  if (req.query.book) {
    filter.idBook = req.query.book;
  }
  
  if (req.query.client) {
    filter.idClient = req.query.client;
  }
  
  if (req.query.rating) {
    filter.rating = parseInt(req.query.rating);
  }

  const reviews = await Review.find(filter)
    .populate('idClient', 'name')
    .populate('idBook', 'title')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Review.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      reviews
    }
  });
});

const getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate('idClient', 'name')
    .populate('idBook', 'title');

  if (!review) {
    return next(new AppError('No se encontró ninguna reseña con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

const createReview = catchAsync(async (req, res, next) => {
  const { idClient, idBook, rating, comment } = req.body;

  const client = await Client.findById(idClient);
  if (!client) {
    return next(new AppError('No se encontró el cliente especificado', 404));
  }

  const book = await Book.findById(idBook);
  if (!book) {
    return next(new AppError('No se encontró ningún libro con ese ID', 404));
  }

  const existingReview = await Review.findOne({ idClient, idBook });
  if (existingReview) {
    return next(new AppError('Este cliente ya calificó este libro', 400));
  }

  const newReview = await Review.create({
    idClient,
    idBook,
    rating,
    comment
  });

  await newReview.populate('idClient', 'name');
  await newReview.populate('idBook', 'title');

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});

const updateReview = catchAsync(async (req, res, next) => {
  const { rating, comment } = req.body;
  
  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    { rating, comment },
    {
      new: true,
      runValidators: true
    }
  )
  .populate('idClient', 'name')
  .populate('idBook', 'title');
  
  if (!updatedReview) {
    return next(new AppError('No se encontró ninguna reseña con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review: updatedReview
    }
  });
});

const deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  
  if (!review) {
    return next(new AppError('No se encontró ninguna reseña con ese ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

const getBookReviews = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ idBook: req.params.bookId })
    .populate('idClient', 'name')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Review.countDocuments({ idBook: req.params.bookId });

  const stats = await Review.aggregate([
    { $match: { idBook: req.params.bookId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  const ratingCounts = {};
  for (let i = 1; i <= 5; i++) {
    ratingCounts[i] = 0;
  }

  if (stats.length > 0) {
    stats[0].ratingDistribution.forEach(rating => {
      ratingCounts[rating]++;
    });
  }

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    stats: stats.length > 0 ? {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
      ratingDistribution: ratingCounts
    } : {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: ratingCounts
    },
    data: {
      reviews
    }
  });
});

const getClientReviews = catchAsync(async (req, res, next) => {
  const { clientId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const client = await Client.findById(clientId);
  if (!client) {
    return next(new AppError('No se encontró el cliente especificado', 404));
  }

  const reviews = await Review.find({ idClient: clientId })
    .populate({
      path: 'idBook',
      select: 'title coverUrl author',
      populate: {
        path: 'author',
        select: 'name'
      }
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Review.countDocuments({ idClient: clientId });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      reviews
    }
  });
});

export {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getBookReviews,
  getClientReviews
};
