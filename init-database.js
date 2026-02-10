/**
 * Database Initialization Script
 * Creates database and tables from schema, then seeds with test data
 * Usage: node init-database.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...\n');

    // Connect without database to create it
    const rootConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('✓ Connected to MySQL server\n');

    // Create database if not exists
    await rootConnection.execute('CREATE DATABASE IF NOT EXISTS db_parkir1', []);
    console.log('✓ Database db_parkir1 ready');

    // Use the database
    await rootConnection.execute('USE db_parkir1', []);
    console.log('✓ Selected database db_parkir1\n');

    // Create tables
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nama VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'petugas', 'owner') NOT NULL,
        email VARCHAR(100) UNIQUE,
        no_telp VARCHAR(15),
        aktif BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_role (role)
      )`,
      
      // Area Parkir table
      `CREATE TABLE IF NOT EXISTS area_parkir (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nama_area VARCHAR(100) NOT NULL UNIQUE,
        jenis_area ENUM('mobil', 'bus', 'motor') NOT NULL,
        lokasi TEXT,
        kapasitas INT NOT NULL,
        harga_per_jam DECIMAL(10, 2) NOT NULL,
        deskripsi TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_jenis_area (jenis_area)
      )`,
      
      // Jenis Kendaraan table
      `CREATE TABLE IF NOT EXISTS jenis_kendaraan (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nama_jenis VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Tarif Parkir table
      `CREATE TABLE IF NOT EXISTS tarif_parkir (
        id INT PRIMARY KEY AUTO_INCREMENT,
        jenis_kendaraan_id INT NOT NULL,
        area_parkir_id INT NOT NULL,
        tarif_per_jam DECIMAL(10, 2) NOT NULL,
        tarif_per_hari DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (jenis_kendaraan_id) REFERENCES jenis_kendaraan(id),
        FOREIGN KEY (area_parkir_id) REFERENCES area_parkir(id),
        UNIQUE KEY unique_tarif (jenis_kendaraan_id, area_parkir_id)
      )`,
      
      // Kendaraan table
      `CREATE TABLE IF NOT EXISTS kendaraan (
        id INT PRIMARY KEY AUTO_INCREMENT,
        plat_nomor VARCHAR(20) NOT NULL UNIQUE,
        jenis_kendaraan_id INT NOT NULL,
        pemilik_nama VARCHAR(100),
        pemilik_no_telp VARCHAR(15),
        warna VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (jenis_kendaraan_id) REFERENCES jenis_kendaraan(id),
        INDEX idx_plat (plat_nomor)
      )`,
      
      // Transaksi Parkir table
      `CREATE TABLE IF NOT EXISTS transaksi_parkir (
        id INT PRIMARY KEY AUTO_INCREMENT,
        kendaraan_id INT NOT NULL,
        area_parkir_id INT NOT NULL,
        petugas_masuk_id INT NOT NULL,
        waktu_masuk DATETIME NOT NULL,
        petugas_keluar_id INT,
        waktu_keluar DATETIME,
        durasi_jam INT,
        tarif_per_jam DECIMAL(10, 2),
        total_bayar DECIMAL(10, 2),
        status ENUM('parkir', 'selesai') DEFAULT 'parkir',
        metode_pembayaran ENUM('cash', 'qris') DEFAULT NULL,
        uang_diterima DECIMAL(10, 2),
        kembalian DECIMAL(10, 2),
        waktu_pembayaran DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (kendaraan_id) REFERENCES kendaraan(id) ON DELETE CASCADE,
        FOREIGN KEY (area_parkir_id) REFERENCES area_parkir(id),
        FOREIGN KEY (petugas_masuk_id) REFERENCES users(id),
        FOREIGN KEY (petugas_keluar_id) REFERENCES users(id),
        INDEX idx_kendaraan (kendaraan_id),
        INDEX idx_status (status),
        INDEX idx_waktu_masuk (waktu_masuk),
        INDEX idx_waktu_keluar (waktu_keluar)
      )`,
      
      // Log Aktivitas table
      `CREATE TABLE IF NOT EXISTS log_aktivitas (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        aktivitas TEXT NOT NULL,
        tabel_terkait VARCHAR(50),
        id_record INT,
        waktu_aktivitas TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        INDEX idx_user (user_id),
        INDEX idx_waktu (waktu_aktivitas)
      )`
    ];

    console.log('📋 Creating tables...');
    for (const table of tables) {
      await rootConnection.execute(table, []);
    }
    console.log('✓ All tables created\n');

    // Seed jenis kendaraan
    const jenisKendaraan = [
      'Motor',
      'Mobil',
      'Bus'
    ];
    
    console.log('📝 Seeding jenis kendaraan...');
    for (const jenis of jenisKendaraan) {
      await rootConnection.execute(
        'INSERT IGNORE INTO jenis_kendaraan (nama_jenis) VALUES (?)',
        [jenis]
      );
    }
    console.log('✓ Jenis kendaraan seeded\n');

    // Seed area parkir
    const areas = [
      ['Area A', 'mobil', 'Lantai 1', 50, 5000, 'Area parkir lantai 1 untuk mobil'],
      ['Area B', 'mobil', 'Lantai 2', 40, 5000, 'Area parkir lantai 2 untuk mobil'],
      ['Area Motor', 'motor', 'Samping Gedung', 100, 2000, 'Area khusus parkir motor'],
      ['Area Bus', 'bus', 'Halaman Belakang', 20, 10000, 'Area khusus parkir bus']
    ];

    console.log('📝 Seeding area parkir...');
    for (const area of areas) {
      await rootConnection.execute(
        'INSERT IGNORE INTO area_parkir (nama_area, jenis_area, lokasi, kapasitas, harga_per_jam, deskripsi) VALUES (?, ?, ?, ?, ?, ?)',
        area
      );
    }
    console.log('✓ Area parkir seeded\n');

    // Seed tarif parkir
    const tarifs = [
      [1, 1, 2000], [1, 2, 2000], [1, 3, 2000], [1, 4, 5000],  // Motor
      [2, 1, 5000], [2, 2, 5000], [2, 3, 5000], [2, 4, 10000], // Mobil
      [3, 1, 10000], [3, 2, 10000], [3, 3, 10000], [3, 4, 10000] // Bus
    ];

    console.log('📝 Seeding tarif parkir...');
    for (const tarif of tarifs) {
      await rootConnection.execute(
        'INSERT IGNORE INTO tarif_parkir (jenis_kendaraan_id, area_parkir_id, tarif_per_jam) VALUES (?, ?, ?)',
        tarif
      );
    }
    console.log('✓ Tarif parkir seeded\n');

    // Seed users with hashed passwords
    const bcrypt = require('bcryptjs');
    const users = [
      ['Admin Parkir', 'admin', await bcrypt.hash('admin123', 10), 'admin', 'admin@parkir.com', '081234567890', true],
      ['Petugas Parkir', 'petugas', await bcrypt.hash('petugas123', 10), 'petugas', 'petugas@parkir.com', '081234567891', true],
      ['Pemilik Parkir', 'owner', await bcrypt.hash('owner123', 10), 'owner', 'owner@parkir.com', '081234567892', true]
    ];

    console.log('📝 Seeding users...');
    for (const user of users) {
      await rootConnection.execute(
        'INSERT IGNORE INTO users (nama, username, password, role, email, no_telp, aktif) VALUES (?, ?, ?, ?, ?, ?, ?)',
        user
      );
    }
    console.log('✓ Users seeded\n');

    // Verify data
    const [userCount] = await rootConnection.execute('SELECT COUNT(*) as count FROM users', []);
    const [areaCount] = await rootConnection.execute('SELECT COUNT(*) as count FROM area_parkir', []);
    const [tarifCount] = await rootConnection.execute('SELECT COUNT(*) as count FROM tarif_parkir', []);

    console.log('✅ Database initialization completed!\n');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${userCount[0].count}`);
    console.log(`   📍 Areas: ${areaCount[0].count}`);
    console.log(`   💰 Tariffs: ${tarifCount[0].count}\n`);

    console.log('🔑 Test Login Credentials:');
    console.log('   Admin    - username: admin,    password: admin123');
    console.log('   Petugas  - username: petugas,  password: petugas123');
    console.log('   Owner    - username: owner,    password: owner123');

    await rootConnection.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    process.exit(1);
  }
}

initializeDatabase();
