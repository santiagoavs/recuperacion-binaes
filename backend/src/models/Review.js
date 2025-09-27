import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  idClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'El cliente es requerido']
  },
  idBook: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'El libro es requerido']
  },
  rating: {
    type: Number,
    required: [true, 'La calificación es requerida'],
    min: [1, 'La calificación debe ser al menos 1'],
    max: [5, 'La calificación no puede exceder 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'El comentario no puede exceder 1000 caracteres']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

reviewSchema.virtual('client', {
  ref: 'Client',
  localField: 'idClient',
  foreignField: '_id',
  justOne: true
});

reviewSchema.virtual('book', {
  ref: 'Book',
  localField: 'idBook',
  foreignField: '_id',
  justOne: true
});

reviewSchema.index({ idClient: 1, idBook: 1 }, { unique: true });
reviewSchema.index({ idBook: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
