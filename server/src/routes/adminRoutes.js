const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
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
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(requireAuth, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/items', getAdminItems);
router.patch('/items/:id/moderation', updateItemModeration);
router.get('/claims', getAdminClaims);
router.patch('/claims/:id/review', reviewClaim);
router.get('/flags', getFlags);
router.patch('/flags/:id', updateFlag);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
