const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    reportType: {
      type: String,
      required: [true, 'Report type is required'],
      enum: ['lost', 'found'],
    },
    approximateLocation: {
      type: String,
      required: [true, 'Campus location is required'],
      trim: true,
    },
    eventDate: {
      type: Date,
      required: [true, 'Date of event is required'],
      default: Date.now,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['open', 'claimed', 'recovered', 'closed'],
      default: 'open',
    },
    custodyStatus: {
      type: String,
      enum: ['held_by_finder', 'campus_office', 'not_applicable'],
      default: 'held_by_finder',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    moderationStatus: {
      type: String,
      enum: ['approved', 'pending', 'flagged', 'rejected'],
      default: 'approved',
    },
    identifyingCharacteristics: {
      type: String,
      trim: true,
      default: '',
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    contactPreference: {
      type: String,
      enum: ['in_app', 'office_handover', 'email'],
      default: 'in_app',
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    recoveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for search
itemSchema.index({
  title: 'text',
  description: 'text',
  approximateLocation: 'text',
  category: 'text',
});

// Single-field and compound indexes for fast filtering & sorting
itemSchema.index({ reportType: 1, status: 1, moderationStatus: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ owner: 1 });
itemSchema.index({ createdAt: -1 });

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
