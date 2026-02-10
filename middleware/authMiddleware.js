const jwt = require('jsonwebtoken');

/**
 * Middleware untuk verifikasi JWT token
 * Mengecek apakah user sudah login
 */
const verifyToken = (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan. Silakan login terlebih dahulu.'
      });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau kadaluarsa.'
    });
  }
};

/**
 * Middleware untuk mengecek role user
 * Contoh: requireRole('admin') hanya izinkan admin
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak terautentikasi'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Hanya ${allowedRoles.join(', ')} yang dapat mengakses.`
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole
};
