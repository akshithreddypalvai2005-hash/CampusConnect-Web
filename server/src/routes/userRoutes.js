const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  getMyReports,
  toggleSaveItem,
  getSavedItems,
} = require('../controllers/userController');

router.get('/me', requireAuth, getProfile);
router.patch('/me', requireAuth, updateProfile);
router.get('/my-reports', requireAuth, getMyReports);
router.get('/saved-items', requireAuth, getSavedItems);
router.post('/saved-items/:itemId', requireAuth, toggleSaveItem);

module.exports = router;
