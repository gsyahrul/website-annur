const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PPDB Madrasah Aliyah Annur — REST API',
      version: '1.0.0',
      description:
        'Dokumentasi API untuk sistem Penerimaan Peserta Didik Baru (PPDB) Madrasah Aliyah Annur. ' +
        'API ini menyediakan endpoint untuk registrasi calon siswa, manajemen berita, ' +
        'upload dokumen, dan dashboard admin.',
      contact: {
        name: 'Admin MA Annur',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Masukkan token JWT yang didapat dari endpoint login.',
        },
      },
      schemas: {
        // --- Reusable Error Response ---
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Terjadi kesalahan.' },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validasi gagal.' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Format email tidak valid.' },
                },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 45 },
            totalPages: { type: 'integer', example: 5 },
          },
        },

        // --- Auth ---
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'siswa@example.com' },
            password: { type: 'string', minLength: 6, example: 'rahasia123' },
            role: { type: 'string', enum: ['admin', 'calon_siswa'], default: 'calon_siswa' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'siswa@example.com' },
            password: { type: 'string', example: 'rahasia123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login berhasil.' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer', example: 1 },
                    email: { type: 'string', example: 'siswa@example.com' },
                    role: { type: 'string', example: 'calon_siswa' },
                  },
                },
              },
            },
          },
        },

        // --- Biodata Calon Siswa ---
        BiodataRequest: {
          type: 'object',
          required: ['nisn', 'nama_lengkap', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin', 'asal_sekolah'],
          properties: {
            nisn: { type: 'string', pattern: '^\\d{10}$', example: '1234567890' },
            nama_lengkap: { type: 'string', minLength: 3, example: 'Ahmad Fauzi' },
            tempat_lahir: { type: 'string', minLength: 2, example: 'Jakarta' },
            tanggal_lahir: { type: 'string', format: 'date', example: '2008-05-15' },
            jenis_kelamin: { type: 'string', enum: ['L', 'P'], example: 'L' },
            asal_sekolah: { type: 'string', minLength: 3, example: 'MTs Annur' },
          },
        },
        BiodataResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            nisn: { type: 'string', example: '1234567890' },
            nama_lengkap: { type: 'string', example: 'Ahmad Fauzi' },
            tempat_lahir: { type: 'string', example: 'Jakarta' },
            tanggal_lahir: { type: 'string', format: 'date', example: '2008-05-15' },
            jenis_kelamin: { type: 'string', example: 'L' },
            asal_sekolah: { type: 'string', example: 'MTs Annur' },
            status_pendaftaran: { type: 'string', example: 'belum_lengkap' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },

        // --- Data Orang Tua ---
        OrangTuaRequest: {
          type: 'object',
          required: ['nama_ayah', 'nama_ibu', 'no_telepon_wali', 'alamat_lengkap'],
          properties: {
            nama_ayah: { type: 'string', minLength: 3, example: 'Budi Santoso' },
            pekerjaan_ayah: { type: 'string', example: 'Wiraswasta' },
            nama_ibu: { type: 'string', minLength: 3, example: 'Siti Aminah' },
            pekerjaan_ibu: { type: 'string', example: 'Ibu Rumah Tangga' },
            no_telepon_wali: { type: 'string', pattern: '^\\d{10,15}$', example: '081234567890' },
            alamat_lengkap: { type: 'string', minLength: 10, example: 'Jl. Merdeka No. 10, Kota Jakarta' },
          },
        },

        // --- Berita ---
        BeritaResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            judul: { type: 'string', example: 'Pengumuman PPDB 2026' },
            slug: { type: 'string', example: 'pengumuman-ppdb-2026' },
            konten: { type: 'string', example: '<p>Isi berita...</p>' },
            gambar_cover: { type: 'string', example: '/uploads/gambar_cover-123456.jpg' },
            status: { type: 'string', enum: ['draft', 'published'] },
            author_email: { type: 'string', example: 'admin@example.com' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },

        // --- Dashboard ---
        DashboardStats: {
          type: 'object',
          properties: {
            total_pendaftar: { type: 'integer', example: 45 },
            status_breakdown: {
              type: 'object',
              properties: {
                belum_lengkap: { type: 'integer', example: 10 },
                menunggu_verifikasi: { type: 'integer', example: 20 },
                lulus: { type: 'integer', example: 12 },
                tidak_lulus: { type: 'integer', example: 3 },
              },
            },
            dokumen_stats: {
              type: 'object',
              properties: {
                total_dokumen: { type: 'integer', example: 120 },
                pending: { type: 'integer', example: 30 },
                valid: { type: 'integer', example: 80 },
                revisi: { type: 'integer', example: 10 },
              },
            },
            berita_stats: {
              type: 'object',
              properties: {
                total_berita: { type: 'integer', example: 8 },
                published: { type: 'integer', example: 6 },
                draft: { type: 'integer', example: 2 },
              },
            },
            pendaftar_terbaru: {
              type: 'array',
              items: { $ref: '#/components/schemas/BiodataResponse' },
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
