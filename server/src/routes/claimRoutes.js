const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const {
  submitClaim,
  getMyClaims,
  getClaimById,
  cancelClaim,
} = require('../controllers/claimController');

router.post('/', requireAuth, upload.array('evidenceImages', 3), submitClaim);
router.get('/my', requireAuth, getMyClaims);
router.get('/:id', requireAuth, getClaimById);
router.patch('/:id/cancel', requireAuth, cancelClaim);

module.exports = router;
