/**
 * app.js — Express Application Setup
 * 
 * File ini mengkonfigurasi Express app beserta semua middleware dan routes.
 * Dipisahkan dari index.js (server) agar bisa digunakan oleh:
 * 1. index.js → untuk menjalankan server production/development
 * 2. Jest/Supertest → untuk testing tanpa perlu start server
 * 
 * Kenapa dipisah?
 * Supertest membutuhkan instance Express app (bukan running server).
 * Jika app.listen() ada di file yang sama, setiap test akan start server
 * baru dan terjadi konflik port.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const authRoutes = require('./routes/authRoutes');
const siswaRoutes = require('./routes/siswaRoutes');
const beritaRoutes = require('./routes/beritaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const galeriRoutes = require('./routes/galeriRoutes');
const bukuRoutes = require('./routes/bukuRoutes');
const upload = require('./middlewares/upload');

const app = express();

// ============================================================
// SECURITY MIDDLEWARES
// ============================================================

/**
 * Helmet — mengamankan HTTP headers.
 */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

/**
 * CORS — Cross-Origin Resource Sharing.
 */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * Rate Limiting — hanya aktif di production dan development.
 * Dinonaktifkan saat testing agar tidak mengganggu test suite.
 */
if (process.env.NODE_ENV !== 'test') {
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Terlalu banyak request. Silakan coba lagi dalam 15 menit.',
    },
  });

  app.use(globalLimiter);
}

// ============================================================
// LOGGING
// ============================================================

/**
 * Morgan — HTTP Request Logger.
 * 
 * Morgan mencatat setiap request yang masuk ke server.
 * Format 'dev' menampilkan: method, url, status, response time.
 * 
 * Contoh output:
 *   POST /api/auth/login 200 45.123 ms
 *   GET  /api/berita 200 12.456 ms
 *   POST /api/siswa/biodata 422 3.789 ms
 * 
 * Warna status code:
 *   🟢 Hijau = 2xx (sukses)
 *   🔵 Cyan  = 3xx (redirect)
 *   🟡 Kuning = 4xx (client error)
 *   🔴 Merah = 5xx (server error)
 * 
 * Dinonaktifkan saat testing agar output test tetap bersih.
 */
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ============================================================
// BODY PARSERS
// ============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================
// SWAGGER API DOCUMENTATION
// ============================================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'PPDB MA Annur — API Docs',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ============================================================
// API ROUTES
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/siswa', siswaRoutes);
app.use('/api/berita', beritaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/galeri', galeriRoutes);
app.use('/api/buku', bukuRoutes);

// Generic file upload endpoint (used by frontend for images)
app.post('/api/files', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'File wajib diunggah.' });
  }
  const filePath = `/uploads/${req.file.filename}`;
  res.status(201).json({
    success: true,
    data: { id: req.file.filename, filename_download: req.file.originalname, file_path: filePath },
  });
});

// ============================================================
// HEALTH CHECK & ERROR HANDLERS
// ============================================================

app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'PPDB Madrasah Aliyah Annur API is running',
    version: '1.0.0',
    docs: '/api-docs',
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

module.exports = app;
