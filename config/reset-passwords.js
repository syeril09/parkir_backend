/**
 * Script untuk update/reset password test users
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

async function resetPasswords() {
  try {
    const connection = await pool.getConnection();

    // Generate hashes
    const adminHash = await bcrypt.hash('admin123', 10);
    const petugasHash = await bcrypt.hash('petugas123', 10);
    const ownerHash = await bcrypt.hash('owner123', 10);

    console.log('🔐 Password Hashes:');
    console.log('admin123:', adminHash);
    console.log('petugas123:', petugasHash);
    console.log('owner123:', ownerHash);

    // Update passwords
    await connection.query(
      'UPDATE users SET password = ? WHERE username = ?',
      [adminHash, 'admin']
    );
    console.log('\n✅ Admin password updated');

    await connection.query(
      'UPDATE users SET password = ? WHERE username = ?',
      [petugasHash, 'petugas']
    );
    console.log('✅ Petugas password updated');

    await connection.query(
      'UPDATE users SET password = ? WHERE username = ?',
      [ownerHash, 'owner']
    );
    console.log('✅ Owner password updated');

    // Verify
    const [users] = await connection.query('SELECT username, password FROM users');
    console.log('\n📋 Updated users in database:');
    users.forEach(u => {
      console.log(`- ${u.username}: ${u.password.substring(0, 20)}...`);
    });

    connection.release();
    console.log('\n🎉 Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPasswords();
