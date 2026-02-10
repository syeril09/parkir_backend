const express = require('express');
const KendaraanController = require('../controllers/KendaraanController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Semua route kendaraan memerlukan:
 * 1. Token JWT (verifyToken)
 * 2. Role admin (requireRole('admin')) - kecuali GET list untuk petugas
 */

// GET /api/kendaraan
// Ambil semua kendaraan (admin dan petugas - read-only)
router.get('/', verifyToken, (req, res, next) => {
  // Izinkan admin dan petugas
  if (req.user.role === 'admin' || req.user.role === 'petugas') {
    next();
  } else {
    return res.status(403).json({ error: 'Forbidden' });
  }
}, KendaraanController.getAll);

// GET /api/kendaraan/plat/:platNomor
// Cari kendaraan berdasarkan plat nomor (hanya admin)
router.get('/plat/:platNomor', verifyToken, requireRole('admin'), KendaraanController.getByPlatNomor);

// GET /api/kendaraan/:id
// Ambil kendaraan berdasarkan ID (hanya admin)
router.get('/:id', verifyToken, requireRole('admin'), KendaraanController.getById);

// POST /api/kendaraan
// Tambah kendaraan baru (hanya admin)
router.post('/', verifyToken, requireRole('admin'), KendaraanController.create);

// PUT /api/kendaraan/:id
// Update kendaraan (hanya admin)
router.put('/:id', verifyToken, requireRole('admin'), KendaraanController.update);

// DELETE /api/kendaraan/:id
// Hapus kendaraan (hanya admin)
router.delete('/:id', verifyToken, requireRole('admin'), KendaraanController.delete);

module.exports = router;
