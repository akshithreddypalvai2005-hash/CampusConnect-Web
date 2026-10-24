const Category = require('../models/Category');
const CampusLocation = require('../models/CampusLocation');
const ContactMessage = require('../models/ContactMessage');
const ReportFlag = require('../models/ReportFlag');
const Item = require('../models/Item');
const { contactSchema, reportFlagSchema } = require('../validators/schemas');
const { logAudit } = require('../services/auditService');

const DEFAULT_CATEGORIES = [
  { name: 'Electronics', description: 'Laptops, phones, headphones, chargers, power banks, calculators', icon: 'Laptop' },
  { name: 'ID & Cards', description: 'College ID cards, library cards, ATM/debit cards, driver licenses', icon: 'CreditCard' },
  { name: 'Books & Stationery', description: 'Textbooks, notebooks, records, pouches, pens, assignment sheets', icon: 'BookOpen' },
  { name: 'Bags & Wallets', description: 'Backpacks, handbags, wallets, coin pouches', icon: 'Briefcase' },
  { name: 'Keys', description: 'Bike keys, car keys, room/hostel keys, locker keychains', icon: 'Key' },
  { name: 'Personal Accessories', description: 'Watches, eyeglasses/spectacles, jewellery, rings, caps, belts', icon: 'Watch' },
  { name: 'Bottles & Flasks', description: 'Water bottles, thermos flasks, sippers, lunch boxes', icon: 'Coffee' },
  { name: 'Documents & Certificates', description: 'Hall tickets, files, certificates, project reports, ID proof', icon: 'FileText' },
  { name: 'Clothing & Footwear', description: 'Jackets, hoodies, lab coats/aprons, shoes, scarves', icon: 'Shirt' },
  { name: 'Sports Gear', description: 'Badminton rackets, sports balls, jerseys, gym equipment', icon: 'Activity' },
  { name: 'Others', description: 'Umbrellas, miscellaneous items, etc.', icon: 'HelpCircle' },
];

const DEFAULT_LOCATIONS = [
  { name: 'Main Campus Gate / Security Desk', zone: 'Transit Zone' },
  { name: 'Central Library - Reading Room', zone: 'Academic Zone' },
  { name: 'Central Library - 2nd Floor Stacks', zone: 'Academic Zone' },
  { name: 'Main Cafeteria & Food Court', zone: 'Student Activity Zone' },
  { name: 'Computer Science Labs (Block B)', zone: 'Academic Zone' },
  { name: 'ECE & EEE Labs (Block A)', zone: 'Academic Zone' },
  { name: 'Mechanical Workshop Hall', zone: 'Engineering Block' },
  { name: 'Auditorium Complex & Seminar Halls', zone: 'Cultural Zone' },
  { name: 'Sports Complex & Gymnasium', zone: 'Sports Zone' },
  { name: 'Admin Building - Ground Floor', zone: 'Administrative Zone' },
  { name: 'Campus Bus Stop & Parking', zone: 'Transit Zone' },
  { name: 'Hostel Blocks & Lawn', zone: 'Residential Zone' },
];

const getCategories = async (req, res, next) => {
  try {
    let categories = await Category.find({ isActive: true }).sort({ name: 1 });
    if (!categories || categories.length === 0) {
      try {
        categories = await Category.insertMany(DEFAULT_CATEGORIES);
      } catch (insertErr) {
        categories = DEFAULT_CATEGORIES.map((c, idx) => ({ ...c, _id: `default_cat_${idx}` }));
      }
    }
    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      categories: DEFAULT_CATEGORIES.map((c, idx) => ({ ...c, _id: `fallback_cat_${idx}` })),
    });
  }
};

const getLocations = async (req, res, next) => {
  try {
    let locations = await CampusLocation.find({ isActive: true }).sort({ name: 1 });
    if (!locations || locations.length === 0) {
      try {
        locations = await CampusLocation.insertMany(DEFAULT_LOCATIONS);
      } catch (insertErr) {
        locations = DEFAULT_LOCATIONS.map((l, idx) => ({ ...l, _id: `default_loc_${idx}` }));
      }
    }
    return res.status(200).json({
      success: true,
      locations,
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      locations: DEFAULT_LOCATIONS.map((l, idx) => ({ ...l, _id: `fallback_loc_${idx}` })),
    });
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
