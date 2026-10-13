const Category = require('../models/Category');
const CampusLocation = require('../models/CampusLocation');
const ContactMessage = require('../models/ContactMessage');
const ReportFlag = require('../models/ReportFlag');
const Item = require('../models/Item');
const { contactSchema, reportFlagSchema } = require('../validators/schemas');
const { logAudit } = require('../services/auditService');

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

const getLocations = async (req, res, next) => {
  try {
    const locations = await CampusLocation.find({ isActive: true }).sort({ name: 1 });
    return res.status(200).json({
      success: true,
      locations,
    });
  } catch (error) {
    next(error);
  }
};

const submitContactMessage = async (req, res, next) => {
  try {
    const parseResult = contactSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const { name, email, subject, message } = parseResult.data;

    const contactEntry = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    await logAudit({
      req,
      action: 'CONTACT_FORM_SUBMITTED',
      targetType: 'System',
      targetId: contactEntry._id,
      metadata: { email, subject },
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! The campus lost & found desk has received your message and will respond shortly.',
    });
  } catch (error) {
    next(error);
  }
};

const flagItem = async (req, res, next) => {
  try {
    const parseResult = reportFlagSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid flag data',
        errors: parseResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const { itemId, reason, description } = parseResult.data;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const flag = await ReportFlag.create({
      reporter: req.user._id,
      targetItem: item._id,
      reason,
      description: description || '',
      status: 'pending',
    });

    await logAudit({
      req,
      action: 'ITEM_FLAGGED_BY_USER',
      targetType: 'ReportFlag',
      targetId: flag._id,
      metadata: { itemId: item._id, reason },
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted to campus moderation team for review.',
      flag,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getLocations,
  submitContactMessage,
  flagItem,
};
