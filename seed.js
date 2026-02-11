const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedDatabase() {
  let connection;
  try {
    console.log('🌱 Memulai seeding data...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    console.log('✅ Terhubung ke database!\n');

    // Seed users
    console.log('📝 Inserting users...');
    const usersInsert = `
      INSERT IGNORE INTO users (nama, username, password, role, email, no_telp, aktif) VALUES
      ('Admin User', 'admin', '$2b$10$YIjlrJRp8qJUXN.XyZ8Dq.3lJ5r.0C8H.5vZ8qJUXN.XyZ8Dq', 'admin', 'admin@parkir.com', '081234567890', true),
      ('Petugas Parkir', 'petugas', '$2b$10$YIjlrJRp8qJUXN.XyZ8Dq.3lJ5r.0C8H.5vZ8qJUXN.XyZ8Dq', 'petugas', 'petugas@parkir.com', '081234567891', true),
      ('Owner Area', 'owner', '$2b$10$YIjlrJRp8qJUXN.XyZ8Dq.3lJ5r.0C8H.5vZ8qJUXN.XyZ8Dq', 'owner', 'owner@parkir.com', '081234567892', true)
    `;
    await connection.execute(usersInsert);
    console.log('✅ Users inserted\n');

    // Seed jenis kendaraan
    console.log('📝 Inserting jenis kendaraan...');
    const jenisInsert = `
      INSERT IGNORE INTO jenis_kendaraan (nama_jenis) VALUES
      ('Motor'),
      ('Mobil'),
      ('Truk')
    `;
    await connection.execute(jenisInsert);
    console.log('✅ Jenis kendaraan inserted\n');

    // Seed area parkir
    console.log('📝 Inserting area parkir...');
    const areaInsert = `
      INSERT IGNORE INTO area_parkir (nama_area, jenis_area, lokasi, kapasitas, harga_per_jam, deskripsi) VALUES
      ('Area A - Motor', 'motor', 'Jalan Merdeka No. 1', 50, 5000, 'Area parkir motor utama'),
      ('Area B - Mobil', 'mobil', 'Jalan Sudirman No. 5', 75, 6000, 'Area parkir mobil dengan fasilitas lengkap'),
      ('Area C - Bus', 'bus', 'Jalan Gatot Subroto', 100, 4000, 'Area parkir bus outdoor luas')
    `;
    await connection.execute(areaInsert);
    console.log('✅ Area parkir inserted\n');

    // Seed tarif parkir
    console.log('📝 Inserting tarif parkir...');
    const tarifInsert = `
      INSERT IGNORE INTO tarif_parkir (jenis_kendaraan_id, area_parkir_id, tarif_per_jam, tarif_per_hari) VALUES
      (1, 1, 5000, 30000),
      (2, 2, 6000, 40000),
      (3, 3, 4000, 25000)
    `;
    await connection.execute(tarifInsert);
    console.log('✅ Tarif parkir inserted\n');

    console.log('='.repeat(50));
    console.log('✅ SEEDING DATABASE BERHASIL!');
    console.log('='.repeat(50));
    console.log('\n📋 Data yang tersedia:');
    console.log('   Users: admin, petugas, owner');
    console.log('   Jenis Kendaraan: Motor, Mobil, Truk');
    console.log('   Area Parkir: 3 area');
    console.log('   Tarif Parkir: sudah dikonfigurasi');

  } catch (error) {
    console.error('❌ SEEDING GAGAL:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();
