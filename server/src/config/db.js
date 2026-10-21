const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async () => {
  // Reuse existing connection across serverless invocations (critical for Vercel)
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;
  const useInMemory = process.env.USE_IN_MEMORY_DB;

  if (useInMemory === 'true') {
    return await startInMemoryServer();
  }

  if (process.env.VERCEL && !uri) {
    throw new Error('MONGODB_URI environment variable is required on Vercel. Please add your MongoDB connection string in Vercel Project Settings > Environment Variables.');
  }

  const mongoUri = uri || 'mongodb://localhost:27017/campusconnect';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (!process.env.VERCEL && (useInMemory === 'auto' || !useInMemory)) {
      console.warn(`[MongoDB] Could not connect to '${mongoUri}'. Auto-falling back to zero-setup In-Memory MongoDB for local development/viva.`);
      return await startInMemoryServer();
    }
    console.error(`[MongoDB] Connection error: ${error.message}`);
    throw error;
  }
};

const startInMemoryServer = async () => {
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServerInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'campusconnect'
      }
    });
    const memoryUri = memoryServerInstance.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[MongoDB-Memory] Started in-memory MongoDB at: ${memoryUri}`);
    return conn;
  } catch (err) {
    console.error('[MongoDB-Memory] Failed to start in-memory MongoDB:', err.message);
    throw err;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
    }
    console.log('[MongoDB] Disconnected.');
  } catch (err) {
    console.error('[MongoDB] Error during disconnection:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
