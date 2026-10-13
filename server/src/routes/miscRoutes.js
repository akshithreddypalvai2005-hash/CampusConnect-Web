const express = require('express');
const router = express.Router();
const {
  getCategories,
  getLocations,
  submitContactMessage,
} = require('../controllers/miscController');

router.get('/categories', getCategories);
router.get('/locations', getLocations);
router.post('/contact', submitContactMessage);

router.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CampusConnect API',
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
