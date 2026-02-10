const pool = require('../config/database');

const LogAktivitasController = {
  // Get semua log aktivitas
  getAll: async (req, res) => {
    try {
      const query = `
        SELECT 
          l.id,
          l.user_id,
          l.aktivitas,
          l.tabel_terkait,
          l.id_record,
          l.waktu_aktivitas,
          u.nama,
          u.username
        FROM log_aktivitas l
        JOIN users u ON l.user_id = u.id
        ORDER BY l.waktu_aktivitas DESC
        LIMIT 1000
      `;

      const [results] = await pool.execute(query);

      res.json({
        success: true,
        data: results,
        total: results.length
      });
    } catch (err) {
      console.error('Database Error:', err);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil log aktivitas',
        error: err.message
      });
    }
  },

  // Get log by user
  getByUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const query = `
        SELECT 
          l.id,
          l.user_id,
          l.aktivitas,
          l.tabel_terkait,
          l.id_record,
          l.waktu_aktivitas,
          u.nama,
          u.username
        FROM log_aktivitas l
        JOIN users u ON l.user_id = u.id
        WHERE l.user_id = ?
        ORDER BY l.waktu_aktivitas DESC
        LIMIT 500
      `;

      const [results] = await pool.execute(query, [userId]);

      res.json({
        success: true,
        data: results,
        total: results.length
      });
    } catch (err) {
      console.error('Database Error:', err);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil log aktivitas user',
        error: err.message
      });
    }
  },

  // Get log by tabel
  getByTabel: async (req, res) => {
    try {
      const { tabel } = req.params;
      const query = `
        SELECT 
          l.id,
          l.user_id,
          l.aktivitas,
          l.tabel_terkait,
          l.id_record,
          l.waktu_aktivitas,
          u.nama,
          u.username
        FROM log_aktivitas l
        JOIN users u ON l.user_id = u.id
        WHERE l.tabel_terkait = ?
        ORDER BY l.waktu_aktivitas DESC
        LIMIT 500
      `;

      const [results] = await pool.execute(query, [tabel]);

      res.json({
        success: true,
        data: results,
        total: results.length
      });
    } catch (err) {
      console.error('Database Error:', err);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil log aktivitas',
        error: err.message
      });
    }
  },

  // Delete old logs (cleanup)
  deleteOldLogs: async (req, res) => {
    try {
      const days = req.query.days || 30;
      const query = `
        DELETE FROM log_aktivitas 
        WHERE waktu_aktivitas < DATE_SUB(NOW(), INTERVAL ? DAY)
      `;

      const [result] = await pool.execute(query, [days]);

      res.json({
        success: true,
        message: `${result.affectedRows} log berhasil dihapus`,
        deletedRows: result.affectedRows
      });
    } catch (err) {
      console.error('Database Error:', err);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus log lama',
        error: err.message
      });
    }
  }
};

module.exports = LogAktivitasController;
