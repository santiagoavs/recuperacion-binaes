import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la categoría es requerido'],
    unique: true,
    trim: true,
    maxlength: [100, 'El nombre de la categoría no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

categorySchema.virtual('books', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'idCategories'
});

categorySchema.index({ name: 1 });
categorySchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Category', categorySchema);
