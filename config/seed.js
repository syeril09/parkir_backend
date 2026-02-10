/**
 * Script untuk generate hashed password dan insert test data ke database
 * Usage: node config/seed.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function seedData() {
  try {
    const connection = await pool.getConnection();

    // Hash password untuk test data
    const adminPassword = await bcrypt.hash('admin123', 10);
    const petugasPassword = await bcrypt.hash('petugas123', 10);
    const ownerPassword = await bcrypt.hash('owner123', 10);

    console.log('🔐 Password yang sudah di-hash:');
    console.log('Admin:', adminPassword);
    console.log('Petugas:', petugasPassword);
    console.log('Owner:', ownerPassword);

    // Cek apakah data sudah ada
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n📊 Total users di database: ${users[0].count}`);

    if (users[0].count === 0) {
      console.log('\n📝 Inserting test users...');
      
      // Insert users
      await connection.query(
        'INSERT INTO users (nama, username, password, role, email, no_telp, aktif) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Admin User', 'admin', adminPassword, 'admin', 'admin@parkir.com', '081234567890', 1]
      );
      
      await connection.query(
        'INSERT INTO users (nama, username, password, role, email, no_telp, aktif) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Petugas Parkir', 'petugas', petugasPassword, 'petugas', 'petugas@parkir.com', '081234567891', 1]
      );
      
      await connection.query(
        'INSERT INTO users (nama, username, password, role, email, no_telp, aktif) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Owner Area', 'owner', ownerPassword, 'owner', 'owner@parkir.com', '081234567892', 1]
      );

      console.log('✅ Users inserted successfully!');
    }

    // Check and insert area parkir
    const [areas] = await connection.query('SELECT COUNT(*) as count FROM area_parkir');
    if (areas[0].count === 0) {
      console.log('\n📝 Inserting test area parkir...');
      
      await connection.query(
        'INSERT INTO area_parkir (nama_area, lokasi, kapasitas, harga_per_jam, deskripsi) VALUES (?, ?, ?, ?, ?)',
        ['Area A', 'Jalan Merdeka No. 1', 50, 5000, 'Area parkir utama dekat pusat kota']
      );
      
      await connection.query(
        'INSERT INTO area_parkir (nama_area, lokasi, kapasitas, harga_per_jam, deskripsi) VALUES (?, ?, ?, ?, ?)',
        ['Area B', 'Jalan Sudirman No. 5', 75, 6000, 'Area parkir dengan fasilitas lengkap']
      );
      
      await connection.query(
        'INSERT INTO area_parkir (nama_area, lokasi, kapasitas, harga_per_jam, deskripsi) VALUES (?, ?, ?, ?, ?)',
        ['Area C', 'Jalan Gatot Subroto', 100, 4000, 'Area parkir outdoor luas']
      );

      console.log('✅ Area parkir inserted successfully!');
    }

    // Check and insert jenis kendaraan
    const [kendaraan] = await connection.query('SELECT COUNT(*) as count FROM jenis_kendaraan');
    if (kendaraan[0].count === 0) {
      console.log('\n📝 Inserting jenis kendaraan...');
      
      await connection.query('INSERT INTO jenis_kendaraan (nama_jenis) VALUES (?)', ['Motor']);
      await connection.query('INSERT INTO jenis_kendaraan (nama_jenis) VALUES (?)', ['Mobil']);
      await connection.query('INSERT INTO jenis_kendaraan (nama_jenis) VALUES (?)', ['Truk']);

      console.log('✅ Jenis kendaraan inserted successfully!');
    }

    console.log('\n🎉 Database seed completed!');
    console.log('\n🔑 Test Credentials:');
    console.log('Admin - username: admin, password: admin123');
    console.log('Petugas - username: petugas, password: petugas123');
    console.log('Owner - username: owner, password: owner123');

    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedData();
