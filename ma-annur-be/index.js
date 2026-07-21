/**
 * index.js — Server Entry Point
 * 
 * File ini hanya bertanggung jawab untuk menjalankan server.
 * Semua konfigurasi Express ada di app.js.
 */

const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Docs available at http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown helper to prevent EADDRINUSE on Nodemon restarts
const gracefulShutdown = () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Closed out remaining connections.');
    process.exit(0);
  });
};

// Catch termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown); // Catch Ctrl+C
process.on('SIGUSR2', gracefulShutdown); // Catch nodemon restart
