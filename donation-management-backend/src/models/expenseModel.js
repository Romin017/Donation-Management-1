import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        'Operations',
        'Logistics',
        'Salaries',
        'Utilities',
        'Supplies',
        'Marketing',
        'Other',
      ],
      required: true,
    },

    billNo: {
      type: String,
      required: true,
      trim: true,
    },

    paidTo: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    date: {
      type: Date,
      required: true,
    },

    paymentMode: {
      type: String,
      enum: ['Cash', 'Cheque', 'Bank Transfer'],
      required: true,
    },

    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Expense', expenseSchema);