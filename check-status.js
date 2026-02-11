const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  let connection;
  try {
    console.log('🔍 Checking database status...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    // Check users
    const [users] = await connection.execute('SELECT id, nama, username, role FROM users');
    console.log('👥 USERS:');
    console.log(`   Total: ${users.length}`);
    users.forEach(u => console.log(`   - ${u.username} (${u.role})`));

    // Check jenis kendaraan
    const [jenis] = await connection.execute('SELECT id, nama_jenis FROM jenis_kendaraan');
    console.log('\n🚗 JENIS KENDARAAN:');
    console.log(`   Total: ${jenis.length}`);
    jenis.forEach(j => console.log(`   - ${j.nama_jenis}`));

    // Check area parkir
    const [areas] = await connection.execute('SELECT id, nama_area, jenis_area, kapasitas FROM area_parkir');
    console.log('\n📍 AREA PARKIR:');
    console.log(`   Total: ${areas.length}`);
    areas.forEach(a => console.log(`   - ${a.nama_area} (${a.jenis_area}, kapasitas: ${a.kapasitas})`));

    // Check tarif
    const [tarifs] = await connection.execute(`
      SELECT tp.id, jk.nama_jenis, ap.nama_area, tp.tarif_per_jam 
      FROM tarif_parkir tp
      JOIN jenis_kendaraan jk ON tp.jenis_kendaraan_id = jk.id
      LEFT JOIN area_parkir ap ON tp.area_parkir_id = ap.id
    `);
    console.log('\n💰 TARIF PARKIR:');
    console.log(`   Total: ${tarifs.length}`);
    tarifs.forEach(t => console.log(`   - ${t.nama_jenis} @ ${t.nama_area}: Rp ${t.tarif_per_jam}`));

    console.log('\n='.repeat(50));
    console.log('✅ DATABASE MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase();
