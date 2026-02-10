const express = require('express');
const TarifParkirController = require('../controllers/TarifParkirController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * TARIF PARKIR ROUTES
 * Routes untuk mengelola tarif parkir (hanya admin)
 */

// GET /api/tarif-parkir - Ambil semua tarif
router.get('/', TarifParkirController.getAll);

// POST /api/tarif-parkir - Tambah tarif baru (hanya admin)
router.post('/', verifyToken, requireRole('admin'), TarifParkirController.create);

// GET /api/tarif-parkir/vehicle/:vehicleTypeId - Ambil tarif untuk jenis kendaraan
router.get('/vehicle/:vehicleTypeId', TarifParkirController.getByVehicleType);

// GET /api/tarif-parkir/area/:areaId - Ambil tarif untuk area
router.get('/area/:areaId', TarifParkirController.getByArea);

// GET /api/tarif-parkir/:id - Ambil tarif berdasarkan ID
router.get('/:id', TarifParkirController.getById);

// PUT /api/tarif-parkir/:id - Update tarif (hanya admin)
router.put('/:id', verifyToken, requireRole('admin'), TarifParkirController.update);

// DELETE /api/tarif-parkir/:id - Hapus tarif (hanya admin)
router.delete('/:id', verifyToken, requireRole('admin'), TarifParkirController.delete);

module.exports = router;
