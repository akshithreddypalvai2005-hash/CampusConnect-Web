const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  markRecovered,
  getPlatformStats,
  getRecentItems,
} = require('../controllers/itemController');
const { flagItem } = require('../controllers/miscController');

// Public routes with optional auth (for detecting saved items/ownership)
router.get('/', optionalAuth, getItems);
router.get('/stats', getPlatformStats);
router.get('/recent', getRecentItems);
router.get('/:id', optionalAuth, getItemById);

// Protected routes
router.post('/', requireAuth, upload.array('images', 4), createItem);
router.patch('/:id', requireAuth, upload.array('images', 4), updateItem);
router.delete('/:id', requireAuth, deleteItem);
router.patch('/:id/recovered', requireAuth, markRecovered);
router.post('/:id/flag', requireAuth, flagItem);

module.exports = router;
