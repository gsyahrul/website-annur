/**
 * config/logger.js — Winston Logger Configuration
 * 
 * Winston adalah library logging yang jauh lebih powerful dari console.log:
 * 
 * 1. LOG LEVELS — Prioritas pesan (error > warn > info > debug)
 * 2. TRANSPORTS — Kemana log disimpan (console, file, dll)
 * 3. FORMAT — Bagaimana log ditampilkan (timestamp, warna, JSON)
 * 
 * Keuntungan dibanding console.log:
 * - Log tersimpan di file (bisa dilihat nanti)
 * - Error dan info dipisah ke file berbeda
 * - Ada timestamp otomatis
 * - Bisa dikonfigurasi per environment
 */

const { createLogger, format, transports } = require('winston');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');

const logger = createLogger({
  // Level minimum yang dicatat
  // 'info' = catat info, warn, dan error (abaikan debug)
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',

  // Format log
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),

  // Metadata default di setiap log
  defaultMeta: { service: 'ppdb-annur-api' },

  // Kemana log dikirim
  transports: [
    // ═══════════════════════════════════════════
    // Transport 1: File error.log (hanya level error)
    // ═══════════════════════════════════════════
    // Semua error tersimpan di sini untuk debugging
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,  // Maks 5MB per file
      maxFiles: 5,                // Simpan 5 file rotasi
    }),

    // ═══════════════════════════════════════════
    // Transport 2: File combined.log (semua level)
    // ═══════════════════════════════════════════
    // Log lengkap: info + warn + error
    new transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

// ═══════════════════════════════════════════
// Transport 3: Console (hanya di development)
// ═══════════════════════════════════════════
// Tampilkan log berwarna di terminal saat development
if (process.env.NODE_ENV !== 'test') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.printf(({ timestamp, level, message, service, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} [${level}]: ${message}${metaStr}`;
      })
    ),
  }));
}

module.exports = logger;
