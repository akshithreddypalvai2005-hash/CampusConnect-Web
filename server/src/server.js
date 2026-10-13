const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

let server;

async function startServer() {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 CampusConnect Backend Server running on port ${PORT}`);
      console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Fatal error starting CampusConnect server:', err);
    process.exit(1);
  }
}

// Graceful termination handling
const shutdown = async () => {
  console.log('\nGracefully terminating CampusConnect server...');
  if (server) {
    server.close(async () => {
      await disconnectDB();
      console.log('Server and database closed. Bye!');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer();
