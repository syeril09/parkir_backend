const express = require('express');
const UserController = require('../controllers/UserController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Semua route user memerlukan:
 * 1. Token JWT (verifyToken)
 * 2. Role admin (requireRole('admin'))
 */

// GET /api/users
// Ambil semua user (hanya admin)
router.get('/', verifyToken, requireRole('admin'), UserController.getAll);

// GET /api/users/role/:role
// Ambil user berdasarkan role (hanya admin)
router.get('/role/:role', verifyToken, requireRole('admin'), UserController.getByRole);

// GET /api/users/:id
// Ambil user berdasarkan ID (hanya admin)
router.get('/:id', verifyToken, requireRole('admin'), UserController.getById);

// POST /api/users
// Tambah user baru (hanya admin)
router.post('/', verifyToken, requireRole('admin'), UserController.create);

// PUT /api/users/:id
// Update user (hanya admin)
router.put('/:id', verifyToken, requireRole('admin'), UserController.update);

// PUT /api/users/:id/password
// Update password user (hanya admin)
router.put('/:id/password', verifyToken, requireRole('admin'), UserController.updatePassword);

// DELETE /api/users/:id
// Hapus user (hanya admin)
router.delete('/:id', verifyToken, requireRole('admin'), UserController.delete);

module.exports = router;
