const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const LogAktivitasController = require('../controllers/LogAktivitasController');

// Get semua log aktivitas
router.get('/', verifyToken, LogAktivitasController.getAll);

// Get log by user
router.get('/user/:userId', verifyToken, LogAktivitasController.getByUser);

// Get log by tabel
router.get('/tabel/:tabel', verifyToken, LogAktivitasController.getByTabel);

// Delete old logs
router.delete('/cleanup', verifyToken, LogAktivitasController.deleteOldLogs);

module.exports = router;
