const mongoose = require('mongoose');

const reportFlagSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ['inappropriate_content', 'spam_or_fake', 'duplicate_post', 'privacy_violation', 'other'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

reportFlagSchema.index({ targetItem: 1, reporter: 1 });
reportFlagSchema.index({ status: 1 });

const ReportFlag = mongoose.model('ReportFlag', reportFlagSchema);
module.exports = ReportFlag;
