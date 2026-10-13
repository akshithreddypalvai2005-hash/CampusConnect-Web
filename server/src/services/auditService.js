const AuditLog = require('../models/AuditLog');

const logAudit = async ({ req, actorId, action, targetType, targetId, metadata = {} }) => {
  try {
    const ipAddress = req?.ip || req?.connection?.remoteAddress || '';
    const userAgent = req?.get ? req.get('User-Agent') : '';
    const actor = actorId || req?.user?._id || null;

    // Sanitize metadata - never log passwords or auth tokens
    const sanitizedMetadata = { ...metadata };
    delete sanitizedMetadata.password;
    delete sanitizedMetadata.confirmPassword;
    delete sanitizedMetadata.token;

    await AuditLog.create({
      actor,
      action,
      targetType,
      targetId: targetId ? String(targetId) : null,
      relevantMetadata: sanitizedMetadata,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err.message);
  }
};

module.exports = { logAudit };
