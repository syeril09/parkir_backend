const pool = require('./config/database');

async function fixJenisKendaraan() {
  try {
    console.log('🔧 Starting to fix jenis_kendaraan order...\n');

    await pool.query('SET FOREIGN_KEY_CHECKS=0');
    console.log('✓ Disabled foreign key checks');

    await pool.query('TRUNCATE TABLE transaksi_parkir');
    console.log('✓ Cleared transaksi_parkir');

    await pool.query('TRUNCATE TABLE kendaraan');
    console.log('✓ Cleared kendaraan');

    await pool.query('TRUNCATE TABLE jenis_kendaraan');
    console.log('✓ Cleared jenis_kendaraan');

    await pool.query('INSERT INTO jenis_kendaraan (id, nama_jenis) VALUES (1, "Motor"), (2, "Mobil"), (3, "Bus")');
    console.log('✓ Inserted jenis_kendaraan in correct order\n');

    const [result] = await pool.query('SELECT * FROM jenis_kendaraan ORDER BY id');
    console.log('📊 Current jenis_kendaraan:');
    result.forEach(j => {
      console.log(`  ID ${j.id}: ${j.nama_jenis}`);
    });

    await pool.query('SET FOREIGN_KEY_CHECKS=1');
    console.log('\n✅ Fix completed! Motor=1, Mobil=2, Bus=3');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixJenisKendaraan();
