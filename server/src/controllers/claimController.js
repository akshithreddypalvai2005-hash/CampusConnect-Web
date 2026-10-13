const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const { claimSchema } = require('../validators/schemas');
const { logAudit } = require('../services/auditService');

const submitClaim = async (req, res, next) => {
  try {
    const parseResult = claimSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid claim submission',
        errors: parseResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const { itemId, explanation, secretIdentifiers, purchaseOrReceiptDetails } = parseResult.data;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.reportType !== 'found') {
      return res.status(400).json({
        success: false,
        message: 'Claims can only be submitted for items reported as found.',
      });
    }

    if (item.status === 'recovered') {
      return res.status(400).json({
        success: false,
        message: 'This item has already been recovered and handed over.',
      });
    }

    // Claimant cannot claim an item they themselves reported found
    if (String(item.owner) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit an ownership claim on an item that you reported found.',
      });
    }

    // Check for existing active claim
    const existingClaim = await Claim.findOne({
      item: item._id,
      claimant: req.user._id,
      status: { $in: ['pending', 'under_review', 'approved'] },
    });

    if (existingClaim) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active claim submitted for this item.',
      });
    }

    // Handle evidence images if uploaded
    const evidenceImages = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        evidenceImages.push(`/uploads/${file.filename}`);
      });
    }

    const claim = await Claim.create({
      item: item._id,
      claimant: req.user._id,
      explanation,
      privateEvidence: {
        description: req.body.evidenceDescription || '',
        secretIdentifiers: secretIdentifiers || '',
        purchaseOrReceiptDetails: purchaseOrReceiptDetails || '',
        evidenceImages,
      },
      status: 'pending',
    });

    await logAudit({
      req,
      action: 'CLAIM_SUBMITTED',
      targetType: 'Claim',
      targetId: claim._id,
      metadata: { itemId: item._id, itemTitle: item.title },
    });

    // Notify the finder/owner of the found item
    await Notification.create({
      recipient: item.owner,
      type: 'claim_submitted',
      message: `New Ownership Claim: A fellow student has submitted an ownership claim for your found report "${item.title}". Campus administration will review the verification details.`,
      relatedItem: item._id,
      relatedClaim: claim._id,
    });

    // Notify the claimant of successful submission
    await Notification.create({
      recipient: req.user._id,
      type: 'system',
      message: `Your ownership claim for "${item.title}" was submitted successfully and is queued for verification review.`,
      relatedItem: item._id,
      relatedClaim: claim._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Claim submitted successfully. It is now awaiting administrative review.',
      claim,
    });
  } catch (error) {
    next(error);
  }
};

const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate('item', 'title category approximateLocation images status custodyStatus reportType')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      claims,
    });
  } catch (error) {
    next(error);
  }
};

const getClaimById = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('item')
      .populate('claimant', 'name email studentId department yearOfStudy')
      .populate('reviewedBy', 'name');

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    const isClaimant = String(claim.claimant._id) === String(req.user._id);
    const isItemFinder = claim.item && String(claim.item.owner) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isClaimant && !isItemFinder && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this claim.',
      });
    }

    const claimObj = claim.toObject();

    // Protect private evidence: only claimant and administrators see sensitive evidence
    if (!isClaimant && !isAdmin) {
      claimObj.privateEvidence = {
        hasEvidence: Boolean(claim.privateEvidence && claim.privateEvidence.evidenceImages?.length),
        note: 'Confidential ownership evidence is restricted to authorized campus reviewers to prevent fraud.',
      };
    }

    return res.status(200).json({
      success: true,
      claim: claimObj,
    });
  } catch (error) {
    next(error);
  }
};

const cancelClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    if (String(claim.claimant) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own claims.',
      });
    }

    if (claim.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Approved claims cannot be cancelled directly. Please contact the campus administrator.',
      });
    }

    claim.status = 'cancelled';
    await claim.save();

    await logAudit({
      req,
      action: 'CLAIM_CANCELLED',
      targetType: 'Claim',
      targetId: claim._id,
    });

    return res.status(200).json({
      success: true,
      message: 'Claim has been cancelled successfully.',
      claim,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitClaim,
  getMyClaims,
  getClaimById,
  cancelClaim,
};
