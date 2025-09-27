import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
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
  loanDate: {
    type: Date,
    required: [true, 'La fecha de préstamo es requerida'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'La fecha de vencimiento es requerida']
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Las notas no pueden exceder 500 caracteres']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

loanSchema.virtual('client', {
  ref: 'Client',
  localField: 'idClient',
  foreignField: '_id',
  justOne: true
});

loanSchema.virtual('book', {
  ref: 'Book',
  localField: 'idBook',
  foreignField: '_id',
  justOne: true
});

loanSchema.virtual('isOverdue').get(function() {
  return !this.returnDate && new Date() > this.dueDate;
});

loanSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  const diffTime = Math.abs(new Date() - this.dueDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

loanSchema.pre('save', function(next) {
  if (this.isOverdue && this.status === 'active') {
    this.status = 'overdue';
  }
  if (this.returnDate && this.status !== 'returned') {
    this.status = 'returned';
  }
  next();
});

loanSchema.index({ idClient: 1 });
loanSchema.index({ idBook: 1 });
loanSchema.index({ status: 1 });
loanSchema.index({ dueDate: 1 });
loanSchema.index({ loanDate: -1 });
loanSchema.index({ returnDate: 1 });

export default mongoose.model('Loan', loanSchema);
