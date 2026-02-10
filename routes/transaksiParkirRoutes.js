const express = require('express');
const TransaksiParkirController = require('../controllers/TransaksiParkirController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Transaksi parkir routes
 * GET: Admin, Petugas, Owner bisa lihat
 * POST (masuk/keluar): Hanya Petugas
 */

// GET /api/transaksi/laporan/range
// Ambil laporan transaksi berdasarkan rentang tanggal (owner dan admin)
// HARUS BEFORE :id route!
router.get('/laporan/range', verifyToken, requireRole('admin', 'owner'), TransaksiParkirController.getLaporanByRange);

// GET /api/transaksi/laporan/area
// Ambil laporan transaksi grouped by area (owner dan admin)
// HARUS BEFORE :id route!
router.get('/laporan/area', verifyToken, requireRole('admin', 'owner'), TransaksiParkirController.getLaporanByArea);

// POST /api/transaksi/masuk
// Kendaraan masuk area parkir (hanya petugas)
router.post('/masuk', verifyToken, requireRole('petugas'), TransaksiParkirController.masuk);

// POST /api/transaksi/keluar
// Kendaraan keluar dari area parkir (hanya petugas)
router.post('/keluar', verifyToken, requireRole('petugas'), TransaksiParkirController.keluar);

// GET /api/transaksi
// Ambil semua transaksi parkir (admin, petugas, owner)
router.get('/', verifyToken, requireRole('admin', 'petugas', 'owner'), TransaksiParkirController.getAll);

// GET /api/transaksi/:id
// Ambil transaksi berdasarkan ID (admin, petugas, owner)
router.get('/:id', verifyToken, requireRole('admin', 'petugas', 'owner'), TransaksiParkirController.getById);

// PUT /api/transaksi/:id
// Update transaksi (pembayaran) - hanya petugas
router.put('/:id', verifyToken, requireRole('petugas'), TransaksiParkirController.update);

module.exports = router;
