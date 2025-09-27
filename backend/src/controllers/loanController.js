import Loan from '../models/Loan.js';
import Book from '../models/Book.js';
import Client from '../models/Client.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

const getAllLoans = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  if (req.query.client) {
    filter.idClient = req.query.client;
  }
  
  if (req.query.book) {
    filter.idBook = req.query.book;
  }

  const loans = await Loan.find(filter)
    .populate('idClient', 'name email')
    .populate('idBook', 'title isbn')
    .skip(skip)
    .limit(limit)
    .sort({ loanDate: -1 });

  const total = await Loan.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: loans.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      loans
    }
  });
});

const getLoan = catchAsync(async (req, res, next) => {
  const loan = await Loan.findById(req.params.id)
    .populate('idClient', 'name email')
    .populate('idBook', 'title isbn copiesAvailable');

  if (!loan) {
    return next(new AppError('No se encontró ningún préstamo con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      loan
    }
  });
});

const createLoan = catchAsync(async (req, res, next) => {

  const { idClient, idBook, dueDate, notes } = req.body;

  console.log('Creando préstamo con los datos:', {
    idClient,
    idBook,
    dueDate,
    notes
  });

  if (!idClient) {
    return next(new AppError('El ID del cliente es requerido', 400));
  }

  const client = await Client.findById(idClient);
  if (!client) {
    return next(new AppError('No se encontró ningún cliente con ese ID', 404));
  }

  const book = await Book.findById(idBook);
  if (!book) {
    return next(new AppError('No se encontró ningún libro con ese ID', 404));
  }

  if (book.copiesAvailable <= 0) {
    return next(new AppError('No hay copias disponibles para este libro', 400));
  }

  const existingActiveLoan = await Loan.findOne({
    idClient,
    idBook,
    status: { $in: ['active', 'overdue'] }
  });

  if (existingActiveLoan) {
    return next(new AppError('El cliente ya tiene un préstamo activo para este libro', 400));
  }

  const newLoan = await Loan.create({
    idClient,
    idBook,
    dueDate,
    notes
  });

  book.copiesAvailable -= 1;
  await book.save();

  await newLoan.populate('idClient', 'name email');
  await newLoan.populate('idBook', 'title isbn');

  res.status(201).json({
    status: 'success',
    data: {
      loan: newLoan
    }
  });
});

const updateLoan = catchAsync(async (req, res, next) => {
  const loan = await Loan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('idClient', 'name email')
    .populate('idBook', 'title isbn');

  if (!loan) {
    return next(new AppError('No se encontró ningún préstamo con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      loan
    }
  });
});

const returnBook = catchAsync(async (req, res, next) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    return next(new AppError('No se encontró ningún préstamo con ese ID', 404));
  }

  if (loan.status === 'returned') {
    return next(new AppError('El libro ya ha sido devuelto', 400));
  }

  loan.returnDate = new Date();
  loan.status = 'returned';
  await loan.save();

  const book = await Book.findById(loan.idBook);
  book.copiesAvailable += 1;
  await book.save();

  await loan.populate('idClient', 'name email');
  await loan.populate('idBook', 'title isbn');

  res.status(200).json({
    status: 'success',
    data: {
      loan
    }
  });
});

const getOverdueLoans = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const overdueLoans = await Loan.find({
    dueDate: { $lt: new Date() },
    returnDate: { $exists: false },
    status: { $ne: 'returned' }
  })
    .populate('idClient', 'name email')
    .populate('idBook', 'title isbn')
    .skip(skip)
    .limit(limit)
    .sort({ dueDate: 1 });

  const total = await Loan.countDocuments({
    dueDate: { $lt: new Date() },
    returnDate: { $exists: false },
    status: { $ne: 'returned' }
  });

  res.status(200).json({
    status: 'success',
    results: overdueLoans.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      loans: overdueLoans
    }
  });
});

const getClientLoans = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const loans = await Loan.find({ idClient: req.params.clientId })
    .populate('idBook', 'title isbn coverUrl')
    .skip(skip)
    .limit(limit)
    .sort({ loanDate: -1 });

  const total = await Loan.countDocuments({ idClient: req.params.clientId });

  res.status(200).json({
    status: 'success',
    results: loans.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      loans
    }
  });
});

export {
  getAllLoans,
  getLoan,
  createLoan,
  updateLoan,
  returnBook,
  getOverdueLoans,
  getClientLoans
};
