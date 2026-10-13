const Item = require('../models/Item');
const Claim = require('../models/Claim');
const { createItemSchema, updateItemSchema } = require('../validators/schemas');
const { logAudit } = require('../services/auditService');
const { findAndNotifyMatches, calculateSimilarity } = require('../services/matchingService');

const getItems = async (req, res, next) => {
  try {
    const {
      search,
      reportType,
      category,
      location,
      status,
      startDate,
      endDate,
      sortBy = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {
      moderationStatus: 'approved',
    };

    // Filter by reportType
    if (reportType && ['lost', 'found'].includes(reportType)) {
      query.reportType = reportType;
    }

    // Filter by Category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by Location
    if (location && location !== 'All') {
      query.approximateLocation = new RegExp(location, 'i');
    }

    // Filter by Status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Date Range
    if (startDate || endDate) {
      query.eventDate = {};
      if (startDate) query.eventDate.$gte = new Date(startDate);
      if (endDate) query.eventDate.$lte = new Date(endDate);
    }

    // Text / Keyword Search
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { approximateLocation: searchRegex },
        { category: searchRegex },
        { tags: searchRegex },
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sortBy === 'eventDate') {
      sortOptions = { eventDate: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [items, totalCount] = await Promise.all([
      Item.find(query)
        .populate('owner', 'name department yearOfStudy')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Item.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    return res.status(200).json({
      success: true,
      items,
      pagination: {
        totalCount,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'name email department yearOfStudy studentId');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Non-admins can only see approved items unless they are the owner
    const isOwner = req.user && String(req.user._id) === String(item.owner._id);
    const isAdmin = req.user && req.user.role === 'admin';

    if (item.moderationStatus !== 'approved' && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'This item report is currently pending moderation review.',
      });
    }

    // Check if the authenticated user has an active claim on this item
    let userClaim = null;
    if (req.user && item.reportType === 'found') {
      userClaim = await Claim.findOne({
        item: item._id,
        claimant: req.user._id,
      });
    }

    // If viewing own item or admin, compute potential opposite-type matches
    let potentialMatches = [];
    if (isOwner || isAdmin) {
      const oppositeType = item.reportType === 'lost' ? 'found' : 'lost';
      const candidates = await Item.find({
        reportType: oppositeType,
        status: 'open',
        moderationStatus: 'approved',
        _id: { $ne: item._id },
      }).limit(10);

      candidates.forEach((candidate) => {
        const { score, reasons } = calculateSimilarity(item, candidate);
        if (score >= 35) {
          potentialMatches.push({
            item: candidate,
            score,
            reasons,
          });
        }
      });

      potentialMatches.sort((a, b) => b.score - a.score);
    }

    // Sanitize owner details for public visitors (never show full studentId or email publicly)
    const sanitizedItem = item.toObject();
    if (!isOwner && !isAdmin) {
      if (sanitizedItem.owner) {
        delete sanitizedItem.owner.email;
        delete sanitizedItem.owner.studentId;
      }
      // For valuable items, hide sensitive identifying characteristics
      if (sanitizedItem.reportType === 'found') {
        sanitizedItem.identifyingCharacteristics = undefined;
      }
    }

    return res.status(200).json({
      success: true,
      item: sanitizedItem,
      userClaim,
      potentialMatches,
      isOwner,
    });
  } catch (error) {
    next(error);
  }
};

const createItem = async (req, res, next) => {
  try {
    const parseResult = createItemSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item data provided',
        errors: parseResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const {
      title,
      description,
      category,
      reportType,
      approximateLocation,
      eventDate,
      custodyStatus,
      identifyingCharacteristics,
      contactPreference,
    } = parseResult.data;

    // Handle uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    const item = await Item.create({
      title,
      description,
      category,
      reportType,
      approximateLocation,
      eventDate: eventDate ? new Date(eventDate) : new Date(),
      custodyStatus: reportType === 'found' ? custodyStatus || 'held_by_finder' : 'not_applicable',
      identifyingCharacteristics: identifyingCharacteristics || '',
      contactPreference: contactPreference || 'in_app',
      images,
      owner: req.user._id,
      moderationStatus: 'approved', // Auto-approved by default unless flagged
    });

    await logAudit({
      req,
      action: 'ITEM_CREATED',
      targetType: 'Item',
      targetId: item._id,
      metadata: { title: item.title, reportType: item.reportType, category: item.category },
    });

    // Run smart matching in background to alert potential owners/finders
    findAndNotifyMatches(item).catch((err) => {
      console.error('[SmartMatching] Background notification error:', err.message);
    });

    return res.status(201).json({
      success: true,
      message: `${reportType === 'lost' ? 'Lost item' : 'Found item'} report published successfully!`,
      item,
    });
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const isOwner = String(item.owner) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this item report.',
      });
    }

    const parseResult = updateItemSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid update data',
        errors: parseResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    // Apply allowed updates
    const updates = parseResult.data;
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        item[key] = updates[key];
      }
    });

    // Handle new uploaded images if provided
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        item.images.push(`/uploads/${file.filename}`);
      });
    }

    await item.save();

    await logAudit({
      req,
      action: 'ITEM_UPDATED',
      targetType: 'Item',
      targetId: item._id,
      metadata: { title: item.title, status: item.status },
    });

    return res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      item,
    });
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const isOwner = String(item.owner) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this item report.',
      });
    }

    await Item.findByIdAndDelete(req.params.id);

    await logAudit({
      req,
      action: 'ITEM_DELETED',
      targetType: 'Item',
      targetId: req.params.id,
      metadata: { title: item.title, reportType: item.reportType },
    });

    return res.status(200).json({
      success: true,
      message: 'Item report deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const markRecovered = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const isOwner = String(item.owner) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the item reporter or campus administration can mark this item as recovered.',
      });
    }

    item.status = 'recovered';
    item.recoveredAt = new Date();
    await item.save();

    await logAudit({
      req,
      action: 'ITEM_MARKED_RECOVERED',
      targetType: 'Item',
      targetId: item._id,
      metadata: { title: item.title },
    });

    return res.status(200).json({
      success: true,
      message: 'Item marked as successfully recovered! Congratulations.',
      item,
    });
  } catch (error) {
    next(error);
  }
};

const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalReports,
      totalLost,
      totalFound,
      totalRecovered,
      totalClaims,
      approvedClaims,
      categoriesData,
    ] = await Promise.all([
      Item.countDocuments({ moderationStatus: 'approved' }),
      Item.countDocuments({ reportType: 'lost', moderationStatus: 'approved' }),
      Item.countDocuments({ reportType: 'found', moderationStatus: 'approved' }),
      Item.countDocuments({ status: 'recovered' }),
      Claim.countDocuments(),
      Claim.countDocuments({ status: 'approved' }),
      Item.aggregate([
        { $match: { moderationStatus: 'approved' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const recoveryRate = totalReports > 0 ? Math.round((totalRecovered / totalReports) * 100) : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalReports,
        totalLost,
        totalFound,
        totalRecovered,
        totalClaims,
        approvedClaims,
        recoveryRate,
        categoriesBreakdown: categoriesData.map((c) => ({ category: c._id, count: c.count })),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRecentItems = async (req, res, next) => {
  try {
    const recentItems = await Item.find({ moderationStatus: 'approved' })
      .populate('owner', 'name department')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    return res.status(200).json({
      success: true,
      items: recentItems,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  markRecovered,
  getPlatformStats,
  getRecentItems,
};
