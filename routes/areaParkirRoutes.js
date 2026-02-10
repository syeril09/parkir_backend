const express = require('express');
const AreaParkirController = require('../controllers/AreaParkirController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET routes: Bisa diakses oleh admin dan petugas
 * POST, PUT, DELETE: Hanya admin
 */

// GET /api/area-parkir
// Ambil semua area parkir (admin dan petugas)
router.get('/', verifyToken, requireRole('admin', 'petugas'), AreaParkirController.getAll);

// GET /api/area-parkir/:id
// Ambil area parkir berdasarkan ID (admin dan petugas)
router.get('/:id', verifyToken, requireRole('admin', 'petugas'), AreaParkirController.getById);

// POST /api/area-parkir
// Tambah area parkir baru (hanya admin)
router.post('/', verifyToken, requireRole('admin'), AreaParkirController.create);

// PUT /api/area-parkir/:id
// Update area parkir (hanya admin)
router.put('/:id', verifyToken, requireRole('admin'), AreaParkirController.update);

// DELETE /api/area-parkir/:id
// Hapus area parkir (hanya admin)
router.delete('/:id', verifyToken, requireRole('admin'), AreaParkirController.delete);

module.exports = router;
