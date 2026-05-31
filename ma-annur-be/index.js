/**
 * index.js — Server Entry Point
 * 
 * File ini hanya bertanggung jawab untuk menjalankan server.
 * Semua konfigurasi Express ada di app.js.
 */

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Docs available at http://localhost:${PORT}/api-docs`);
});
