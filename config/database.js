const mysql = require('mysql2/promise');
require('dotenv').config();

// Buat pool connection ke database (only valid mysql2 options)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export state flags
let dbTested = false;
let dbReady = false;

// Try to connect with retry logic
// Reduce noisy logs in production to avoid platform rate limits.
const testConnectionWithRetry = async (retries = 5, delayMs = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await pool.getConnection();
      conn.release();
      dbReady = true;
      dbTested = true;
      if (process.env.NODE_ENV !== 'production') {
        console.log(`✓ Database terhubung (attempt ${attempt}/${retries})`);
      }
      return true;
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`⚠️  Database connect attempt ${attempt} failed: ${err.message}`);
      }
      if (attempt < retries) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`   Menunggu ${delayMs}ms before retry...`);
        }
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        dbReady = false;
        dbTested = true;
        if (process.env.NODE_ENV !== 'production') {
          console.error('✗ Gagal terhubung ke database setelah beberapa percobaan.');
          console.error('  - Periksa MySQL server sedang berjalan');
          console.error('  - Periksa kredensial di backend/.env');
          console.error('  - Jalankan SQL schema: mysql -u root < backend/config/database-schema.sql');
        }
        return false;
      }
    }
  }
};

// Jalankan test async (tidak mem-blok startup)
testConnectionWithRetry().catch((e) => {
  console.error('Unexpected error during DB test:', e.message);
  dbReady = false;
  dbTested = true;
});

module.exports = pool;
module.exports.isReady = () => dbReady;
module.exports.isTested = () => dbTested;
