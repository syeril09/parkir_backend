/**
 * Middleware untuk logging aktivitas user
 */
const pool = require('../config/database');

const logActivity = async (req, res, next) => {
  // Middleware ini akan dijalankan setelah request selesai
  // Catat aktivitas user untuk audit trail
  
  res.on('finish', async () => {
    try {
      // Hanya log untuk method yang mengubah data
      if (['POST', 'PUT', 'DELETE'].includes(req.method) && req.user) {
        const { userId } = req.user;
        const aktivitas = `${req.method} ${req.originalUrl}`;
        
        const query = 'INSERT INTO log_aktivitas (user_id, aktivitas) VALUES (?, ?)';
        await pool.execute(query, [userId, aktivitas]);
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  });

  next();
};

module.exports = logActivity;
