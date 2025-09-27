import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título del libro es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [2000, 'El resumen no puede exceder 2000 caracteres']
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    match: [/^(?:\d{9}[\dX]|\d{13})$/, 'Por favor ingresa un ISBN válido']
  },
  idAuthors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: [true, 'Al menos un autor es requerido']
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'La etiqueta no puede exceder 30 caracteres']
  }],
  coverUrl: {
    type: String,
    trim: true
  },
  publishedDate: {
    type: Date
  },
  copiesAvailable: {
    type: Number,
    default: 1,
    min: [0, 'Las copias disponibles no pueden ser negativas']
  },
  idCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Al menos una categoría es requerida']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

bookSchema.virtual('authors', {
  ref: 'Author',
  localField: 'idAuthors',
  foreignField: '_id'
});

bookSchema.virtual('categories', {
  ref: 'Category',
  localField: 'idCategories',
  foreignField: '_id'
});

bookSchema.virtual('loans', {
  ref: 'Loan',
  localField: '_id',
  foreignField: 'idBook'
});

bookSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'idBook'
});

bookSchema.virtual('isAvailable').get(function() {
  return this.copiesAvailable > 0;
});

bookSchema.pre('validate', function(next) {
  if (this.idAuthors && this.idAuthors.length === 0) {
    this.invalidate('idAuthors', 'Al menos un autor es requerido');
  }
  if (this.idCategories && this.idCategories.length === 0) {
    this.invalidate('idCategories', 'Al menos una categoría es requerida');
  }
  next();
});

bookSchema.index({ title: 'text', summary: 'text' });
bookSchema.index({ idCategories: 1 });
bookSchema.index({ idAuthors: 1 });
bookSchema.index({ isbn: 1 });
bookSchema.index({ tags: 1 });
bookSchema.index({ publishedDate: -1 });
bookSchema.index({ createdAt: -1 });
bookSchema.index({ copiesAvailable: 1 });

export default mongoose.model('Book', bookSchema);
