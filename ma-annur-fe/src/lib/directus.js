// =============================================================
// API Helper — Madrasah Aliyah Annur
// Backend: Express.js at /api/*
// =============================================================

const API_URL = import.meta.env.VITE_API_URL || '';

// --------------- Custom Error for Auth Failures ---------------

/**
 * AuthError — thrown when the server responds with 401/403.
 * Components can check `error instanceof AuthError` to trigger logout.
 */
export class AuthError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'AuthError';
        this.status = status;
    }
}

// --------------- Auth Helpers ---------------

function getToken() {
    return localStorage.getItem('auth_token');
}

function setToken(token) {
    localStorage.setItem('auth_token', token);
}

function clearToken() {
    localStorage.removeItem('auth_token');
}

function authHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// --------------- Generic Fetch ---------------

async function apiFetch(path, options = {}) {
    const { headers = {}, ...rest } = options;
    const res = await fetch(`${API_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
            ...headers,
        },
        ...rest,
    });

    // Auto-clear token on authentication failures
    if (res.status === 401 || res.status === 403) {
        clearToken();
        const err = await res.json().catch(() => ({}));
        throw new AuthError(
            err?.message || 'Sesi Anda telah berakhir. Silakan login kembali.',
            res.status
        );
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || err?.errors?.[0]?.message || `API error: ${res.status}`);
    }
    return res.json();
}

/**
 * Fetch for multipart/form-data (file uploads).
 * Does NOT set Content-Type — browser sets it with boundary.
 */
async function apiFormFetch(path, formData, method = 'POST') {
    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: authHeaders(),
        body: formData,
    });

    // Auto-clear token on authentication failures
    if (res.status === 401 || res.status === 403) {
        clearToken();
        const err = await res.json().catch(() => ({}));
        throw new AuthError(
            err?.message || 'Sesi Anda telah berakhir. Silakan login kembali.',
            res.status
        );
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `API error: ${res.status}`);
    }
    return res.json();
}

// --------------- Auth ---------------

export async function loginDirectus(email, password) {
    const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    // Backend returns { success, data: { token, user } }
    setToken(res.data.token);
    return res.data;
}

export async function logoutDirectus() {
    clearToken();
}

export async function getCurrentUser() {
    const res = await apiFetch('/api/auth/me');
    // Backend returns { success, data: { id, email, role, created_at } }
    return res.data;
}

// --------------- Assets ---------------

export function getAssetUrl(imagePath) {
    if (!imagePath) return '';
    // imagePath is like "/uploads/filename.jpg"
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
}

// --------------- Berita (News) ---------------

export async function fetchBerita() {
    const res = await apiFetch('/api/berita');
    return res.data;
}

export async function fetchBeritaBySlug(slug) {
    const res = await apiFetch(`/api/berita/${slug}`);
    return res.data;
}

export async function fetchAllBerita() {
    const res = await apiFetch('/api/berita/admin/all');
    return res.data;
}

export async function createBerita(data) {
    // Use FormData for multipart upload
    const formData = new FormData();
    formData.append('judul', data.judul);
    formData.append('konten', data.konten);
    if (data.status) formData.append('status', data.status);
    if (data.gambar_cover_file) formData.append('gambar_cover', data.gambar_cover_file);

    const res = await apiFormFetch('/api/berita', formData);
    return res.data;
}

export async function updateBerita(id, data) {
    const formData = new FormData();
    if (data.judul) formData.append('judul', data.judul);
    if (data.konten) formData.append('konten', data.konten);
    if (data.status) formData.append('status', data.status);
    if (data.gambar_cover_file) formData.append('gambar_cover', data.gambar_cover_file);

    const res = await apiFormFetch(`/api/berita/${id}`, formData, 'PUT');
    return res.data || res;
}

export async function deleteBerita(id) {
    await fetch(`${API_URL}/api/berita/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
}

// --------------- Galeri (Gallery) ---------------

export async function fetchGaleri() {
    const res = await apiFetch('/api/galeri');
    return res.data;
}

export async function fetchAllGaleri() {
    const res = await apiFetch('/api/galeri/admin/all');
    return res.data;
}

export async function createGaleri(data) {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.type) formData.append('type', data.type);
    if (data.status) formData.append('status', data.status);
    if (data.image_file) formData.append('image', data.image_file);

    const res = await apiFormFetch('/api/galeri', formData);
    return res.data;
}

export async function deleteGaleri(id) {
    await fetch(`${API_URL}/api/galeri/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
}

// --------------- PPDB / Siswa ---------------

export async function fetchPPDBRegistrations() {
    const res = await apiFetch('/api/siswa/all?limit=100');
    return res.data;
}

export async function registerUser(email, password) {
    const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, role: 'calon_siswa' }),
    });
    return res.data;
}

export async function createBiodata(data) {
    const res = await apiFetch('/api/siswa/biodata', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return res.data;
}

export async function getBiodata() {
    const res = await apiFetch('/api/siswa/biodata');
    return res.data;
}

export async function updateBiodata(data) {
    const res = await apiFetch('/api/siswa/biodata', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return res.data || res;
}

// --------------- Data Orang Tua ---------------

export async function createOrangTua(data) {
    const res = await apiFetch('/api/siswa/orang-tua', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return res.data;
}

export async function getOrangTua() {
    const res = await apiFetch('/api/siswa/orang-tua');
    return res.data;
}

export async function updateOrangTua(data) {
    const res = await apiFetch('/api/siswa/orang-tua', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return res.data || res;
}

// --------------- Upload Dokumen ---------------

export async function uploadDokumen(file, jenisDokumen) {
    const formData = new FormData();
    formData.append('dokumen', file);
    formData.append('jenis_dokumen', jenisDokumen);

    const res = await apiFormFetch('/api/siswa/upload-dokumen', formData);
    return res.data;
}

export async function getDokumen() {
    const res = await apiFetch('/api/siswa/dokumen');
    return res.data;
}

// --------------- Admin: Validasi Dokumen ---------------

export async function validasiDokumen(id, statusValidasi) {
    const res = await apiFetch(`/api/siswa/validasi-dokumen/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status_validasi: statusValidasi }),
    });
    return res.data || res;
}

export async function getDokumenBySiswaId(siswaId) {
    const res = await apiFetch(`/api/siswa/dokumen/${siswaId}`);
    return res.data;
}

// --------------- Admin: Verifikasi & Status ---------------

export async function verifyRegistration(id, data) {
    const res = await apiFetch(`/api/siswa/verify/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return res.data || res;
}

export async function updatePPDBStatus(id, status_pendaftaran) {
    const res = await apiFetch(`/api/siswa/status/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status_pendaftaran }),
    });
    return res.data || res;
}

export async function updateHasilSeleksi(id, hasil_seleksi) {
    const res = await apiFetch(`/api/siswa/hasil-seleksi/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ hasil_seleksi }),
    });
    return res.data || res;
}

export async function cekStatusPPDB(nisn) {
    const res = await fetch(`${API_URL}/api/siswa/cek-status/${encodeURIComponent(nisn)}`, {
        headers: { 'Content-Type': 'application/json' },
    });
    if (res.status === 404) {
        return null; // Not found
    }
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Terjadi kesalahan server');
    }
    return (await res.json()).data;
}

// --------------- Buku (Books / Ruang Baca) ---------------

export async function fetchBuku(category) {
    let url = '/api/buku';
    if (category) {
        url += `?category=${category}`;
    }
    const res = await apiFetch(url);
    return res.data;
}

export async function fetchAllBuku() {
    const res = await apiFetch('/api/buku/admin/all');
    return res.data;
}

export async function createBuku(data) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('author', data.author);
    formData.append('category', data.category);
    if (data.badge) formData.append('badge', data.badge);
    if (data.color) formData.append('color', data.color);
    if (data.file) formData.append('file', data.file);
    const res = await apiFormFetch('/api/buku', formData);
    return res.data;
}

export async function updateBuku(id, data) {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.author) formData.append('author', data.author);
    if (data.category) formData.append('category', data.category);
    if (data.badge !== undefined) formData.append('badge', data.badge);
    if (data.color) formData.append('color', data.color);
    if (data.file) formData.append('file', data.file);
    const res = await apiFormFetch(`/api/buku/${id}`, formData, 'PUT');
    return res.data || res;
}

export async function deleteBuku(id) {
    await fetch(`${API_URL}/api/buku/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
}

// --------------- File Upload ---------------

export async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/api/files`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
    });
    if (!res.ok) throw new Error('Upload gagal');
    return (await res.json()).data;
}

// --------------- Dashboard Stats ---------------

export async function fetchDashboardStats() {
    const res = await apiFetch('/api/dashboard/stats');
    return res.data;
}

export { API_URL as DIRECTUS_URL, getToken, clearToken };
