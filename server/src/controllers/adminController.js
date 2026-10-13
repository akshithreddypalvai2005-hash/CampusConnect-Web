const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const ReportFlag = require('../models/ReportFlag');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const Category = require('../models/Category');
const CampusLocation = require('../models/CampusLocation');
const { reviewClaimSchema } = require('../validators/schemas');
const { logAudit } = require('../services/auditService');

const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalReports,
      totalLost,
      totalFound,
      totalRecovered,
      pendingClaims,
      approvedClaims,
      pendingModerationItems,
      pendingFlags,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Item.countDocuments(),
      Item.countDocuments({ reportType: 'lost' }),
      Item.countDocuments({ reportType: 'found' }),
      Item.countDocuments({ status: 'recovered' }),
      Claim.countDocuments({ status: 'pending' }),
      Claim.countDocuments({ status: 'approved' }),
      Item.countDocuments({ moderationStatus: 'pending' }),
      ReportFlag.countDocuments({ status: 'pending' }),
    ]);

    // Recent 10 platform activity events
    const recentActivity = await AuditLog.find()
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalReports,
        totalLost,
        totalFound,
        totalRecovered,
        pendingClaims,
        approvedClaims,
        pendingModerationItems,
        pendingFlags,
      },
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'All') query.role = role;
    if (status && status !== 'All') query.accountStatus = status;

    if (search && search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ name: reg }, { email: reg }, { studentId: reg }, { department: reg }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot suspend their own account.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.accountStatus = status;
    await user.save();

    await logAudit({
      req,
      action: status === 'suspended' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      targetType: 'User',
      targetId: user._id,
      metadata: { targetEmail: user.email, newStatus: status },
    });

    return res.status(200).json({
      success: true,
      message: `User account has been ${status === 'suspended' ? 'suspended' : 'reactivated'}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminItems = async (req, res, next) => {
  try {
    const { moderationStatus, reportType, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (moderationStatus && moderationStatus !== 'All') {
      query.moderationStatus = moderationStatus;
    }
    if (reportType && reportType !== 'All') {
      query.reportType = reportType;
    }
    if (search && search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ title: reg }, { approximateLocation: reg }, { category: reg }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Item.find(query)
        .populate('owner', 'name email studentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Item.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      items,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateItemModeration = async (req, res, next) => {
  try {
    const { moderationStatus, notes } = req.body;
    if (!['approved', 'pending', 'flagged', 'rejected'].includes(moderationStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid moderation status' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    item.moderationStatus = moderationStatus;
    await item.save();

    await logAudit({
      req,
      action: 'ITEM_MODERATED',
      targetType: 'Item',
      targetId: item._id,
      metadata: { newStatus: moderationStatus, notes: notes || '' },
    });

    if (moderationStatus === 'rejected') {
      await Notification.create({
        recipient: item.owner,
        type: 'item_moderated',
        message: `Your report for "${item.title}" was declined by campus administration. Note: ${notes || 'Violates community guidelines.'}`,
        relatedItem: item._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Item moderation updated to: ${moderationStatus}`,
      item,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminClaims = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [claims, total] = await Promise.all([
      Claim.find(query)
        .populate('item')
        .populate('claimant', 'name email studentId department yearOfStudy')
        .populate('reviewedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Claim.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      claims,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

const reviewClaim = async (req, res, next) => {
  try {
    const parseResult = reviewClaimSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review payload',
        errors: parseResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const { status, reviewNotes, confirmHandover } = parseResult.data;

    const claim = await Claim.findById(req.params.id)
      .populate('item')
      .populate('claimant');

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    if (claim.status === 'approved' && status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This claim is already approved.',
      });
    }

    claim.status = status;
    claim.reviewedBy = req.user._id;
    claim.reviewNotes = reviewNotes || '';
    claim.reviewedAt = new Date();

    if (confirmHandover) {
      claim.handoverConfirmedAt = new Date();
    }

    await claim.save();

    // If claim approved, update the item
    const item = await Item.findById(claim.item._id);
    if (item && status === 'approved') {
      item.claimedBy = claim.claimant._id;
      item.status = confirmHandover ? 'recovered' : 'claimed';
      if (confirmHandover) {
        item.recoveredAt = new Date();
      }
      await item.save();

      // Automatically reject other pending claims for this item with explanation
      await Claim.updateMany(
        {
          item: item._id,
          _id: { $ne: claim._id },
          status: { $in: ['pending', 'under_review'] },
        },
        {
          $set: {
            status: 'rejected',
            reviewedBy: req.user._id,
            reviewNotes: 'Another verified claim has been approved for this item.',
            reviewedAt: new Date(),
          },
        }
      );

      // Notify the claimant of approval
      await Notification.create({
        recipient: claim.claimant._id,
        type: 'claim_approved',
        message: `Good news! Your claim for "${item.title}" has been APPROVED by campus administration. Please coordinate with the campus office or finder for safe handover.`,
        relatedItem: item._id,
        relatedClaim: claim._id,
      });

      // Notify the finder/owner of the found item
      await Notification.create({
        recipient: item.owner,
        type: 'claim_approved',
        message: `Verification complete: Ownership claim for your found report "${item.title}" was approved for student ${claim.claimant.name} (${claim.claimant.studentId}).`,
        relatedItem: item._id,
        relatedClaim: claim._id,
      });
    } else if (status === 'rejected') {
      // Notify the claimant of rejection
      await Notification.create({
        recipient: claim.claimant._id,
        type: 'claim_rejected',
        message: `Your ownership claim for "${claim.item.title}" could not be verified. Note: ${reviewNotes || 'Insufficient or non-matching evidence provided.'}`,
        relatedItem: claim.item._id,
        relatedClaim: claim._id,
      });
    } else if (status === 'under_review') {
      await Notification.create({
        recipient: claim.claimant._id,
        type: 'claim_under_review',
        message: `Your ownership claim for "${claim.item.title}" is currently under active administrative review.`,
        relatedItem: claim.item._id,
        relatedClaim: claim._id,
      });
    }

    await logAudit({
      req,
      action: `CLAIM_${status.toUpperCase()}`,
      targetType: 'Claim',
      targetId: claim._id,
      metadata: {
        itemId: claim.item._id,
        claimantId: claim.claimant._id,
        newStatus: status,
        confirmHandover,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Claim review saved: status set to ${status}.`,
      claim,
    });
  } catch (error) {
    next(error);
  }
};

const getFlags = async (req, res, next) => {
  try {
    const flags = await ReportFlag.find()
      .populate('reporter', 'name email')
      .populate('targetItem', 'title reportType moderationStatus')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      flags,
    });
  } catch (error) {
    next(error);
  }
};

const updateFlag = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;
    const flag = await ReportFlag.findById(req.params.id);
    if (!flag) {
      return res.status(404).json({ success: false, message: 'Flag not found' });
    }

    flag.status = status;
    flag.reviewedBy = req.user._id;
    flag.resolutionNotes = resolutionNotes || '';
    await flag.save();

    await logAudit({
      req,
      action: 'FLAG_RESOLVED',
      targetType: 'ReportFlag',
      targetId: flag._id,
      metadata: { status },
    });

    return res.status(200).json({
      success: true,
      message: 'Report flag updated',
      flag,
    });
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 25, action } = req.query;
    const query = {};
    if (action && action !== 'All') query.action = action;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('actor', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      AuditLog.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      logs,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  updateUserStatus,
  getAdminItems,
  updateItemModeration,
  getAdminClaims,
  reviewClaim,
  getFlags,
  updateFlag,
  getAuditLogs,
};
