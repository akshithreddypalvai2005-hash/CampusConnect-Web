const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Associated item is required'],
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claimant is required'],
    },
    explanation: {
      type: String,
      required: [true, 'Ownership explanation is required'],
      trim: true,
      maxlength: [1500, 'Explanation cannot exceed 1500 characters'],
    },
    privateEvidence: {
      description: {
        type: String,
        trim: true,
        default: '',
      },
      evidenceImages: [
        {
          type: String,
          trim: true,
        },
      ],
      purchaseOrReceiptDetails: {
        type: String,
        trim: true,
        default: '',
      },
      secretIdentifiers: {
        type: String,
        trim: true,
        default: '',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewNotes: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    handoverConfirmedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
claimSchema.index({ item: 1, claimant: 1 });
claimSchema.index({ claimant: 1, status: 1 });
claimSchema.index({ status: 1 });

const Claim = mongoose.model('Claim', claimSchema);
module.exports = Claim;
