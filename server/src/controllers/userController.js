const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const { logAudit } = require('../services/auditService');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Aggregate user specific statistics
    const [
      totalLostReports,
      totalFoundReports,
      recoveredCount,
      pendingClaims,
      approvedClaims,
    ] = await Promise.all([
      Item.countDocuments({ owner: user._id, reportType: 'lost' }),
      Item.countDocuments({ owner: user._id, reportType: 'found' }),
      Item.countDocuments({ owner: user._id, status: 'recovered' }),
      Claim.countDocuments({ claimant: user._id, status: { $in: ['pending', 'under_review'] } }),
      Claim.countDocuments({ claimant: user._id, status: 'approved' }),
    ]);

    return res.status(200).json({
      success: true,
      user: user.toJSON(),
      stats: {
        totalReports: totalLostReports + totalFoundReports,
        totalLostReports,
        totalFoundReports,
        recoveredCount,
        pendingClaims,
        approvedClaims,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department, yearOfStudy } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (department) user.department = department.trim();
    if (yearOfStudy) user.yearOfStudy = yearOfStudy;

    await user.save();

    await logAudit({
      req,
      action: 'USER_PROFILE_UPDATED',
      targetType: 'User',
      targetId: user._id,
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

const getMyReports = async (req, res, next) => {
  try {
    const { reportType } = req.query;
    const filter = { owner: req.user._id };
    if (reportType && ['lost', 'found'].includes(reportType)) {
      filter.reportType = reportType;
    }

    const items = await Item.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    next(error);
  }
};

const toggleSaveItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const user = await User.findById(req.user._id);

    const isSaved = user.savedItems.includes(itemId);
    if (isSaved) {
      user.savedItems = user.savedItems.filter((id) => String(id) !== String(itemId));
    } else {
      user.savedItems.push(itemId);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      saved: !isSaved,
      message: !isSaved ? 'Item bookmarked' : 'Item removed from bookmarks',
    });
  } catch (error) {
    next(error);
  }
};

const getSavedItems = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedItems',
      populate: { path: 'owner', select: 'name' },
    });

    return res.status(200).json({
      success: true,
      items: user.savedItems || [],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getMyReports,
  toggleSaveItem,
  getSavedItems,
};
