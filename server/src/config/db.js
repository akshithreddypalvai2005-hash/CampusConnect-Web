const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect';
  const useInMemory = process.env.USE_IN_MEMORY_DB;

  if (useInMemory === 'true') {
    return await startInMemoryServer();
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick fail if local daemon is not running
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (useInMemory === 'auto' || !useInMemory) {
      console.warn(`[MongoDB] Could not connect to '${uri}'. Auto-falling back to zero-setup In-Memory MongoDB for local development/viva.`);
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
