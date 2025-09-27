import mongoose from "mongoose";

const authorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  lastName: {
    type: String,
    required: [true, 'El apellido es requerido'],
    trim: true,
    maxlength: [50, 'El apellido no puede exceder 50 caracteres']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'La biografía no puede exceder 1000 caracteres']
  },
  birthDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

authorSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

authorSchema.virtual('books', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'idAuthors'
});

authorSchema.index({ firstName: 1, lastName: 1 });
authorSchema.index({ firstName: 'text', lastName: 'text', bio: 'text' });

export default mongoose.model('Author', authorSchema);
