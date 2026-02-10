const express = require('express');
const AuthController = require('../controllers/AuthController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * PUBLIC ROUTES (Tidak perlu login)
 */

// POST /api/auth/register
// Endpoint untuk registrasi user baru
router.post('/register', AuthController.register);

// POST /api/auth/login
// Endpoint untuk login
router.post('/login', AuthController.login);

// POST /api/auth/logout
router.post('/logout', AuthController.logout);

/**
 * PROTECTED ROUTES (Perlu login)
 */

// GET /api/auth/profile
// Ambil profil user yang sedang login
router.get('/profile', verifyToken, AuthController.getProfile);

module.exports = router;
