const app = require('../server/src/app');
const { connectDB } = require('../server/src/config/db');

/**
 * Serverless function entrypoint for Vercel.
 * Connects to MongoDB (with connection caching across invocations)
 * and delegates request handling to the Express application.
 */
module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless Error] Database connection failed:', err.message);
    if (req.url && (req.url.startsWith('/api') || req.url.startsWith('/health'))) {
      return res.status(500).json({
        success: false,
        message: 'Database connection failed. Please ensure MONGODB_URI is properly configured in Vercel Project Settings > Environment Variables.',
        error: err.message,
      });
    }
  }

  return app(req, res);
};
