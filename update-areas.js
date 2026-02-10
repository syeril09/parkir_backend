const pool = require('./config/database');

async function updateAreas() {
  try {
    console.log('🔄 Updating area parkir configuration...\n');

    // Update Area A menjadi Area Bus
    await pool.query(
      'UPDATE area_parkir SET nama_area = ?, harga_per_jam = ? WHERE id = 1',
      ['Area Bus', 10000]
    );
    console.log('✓ Area 1 updated to Area Bus (10000/jam)');

    // Update Area B menjadi Area Mobil
    await pool.query(
      'UPDATE area_parkir SET nama_area = ?, harga_per_jam = ? WHERE id = 2',
      ['Area Mobil', 5000]
    );
    console.log('✓ Area 2 updated to Area Mobil (5000/jam)');

    // Update Area Motor
    await pool.query(
      'UPDATE area_parkir SET nama_area = ?, harga_per_jam = ? WHERE id = 3',
      ['Area Motor', 2000]
    );
    console.log('✓ Area 3 updated to Area Motor (2000/jam)');

    // Clear and setup tarif_parkir
    await pool.query('DELETE FROM tarif_parkir');
    
    // Area Bus (id=1): Bus only
    await pool.query(
      'INSERT INTO tarif_parkir (jenis_kendaraan_id, area_parkir_id, tarif_per_jam, tarif_per_hari) VALUES (?, ?, ?, ?)',
      [3, 1, 10000, 50000]
    );
    console.log('✓ Area Bus tariff: Bus 10000/jam');

    // Area Mobil (id=2): Mobil only
    await pool.query(
      'INSERT INTO tarif_parkir (jenis_kendaraan_id, area_parkir_id, tarif_per_jam, tarif_per_hari) VALUES (?, ?, ?, ?)',
      [2, 2, 5000, 25000]
    );
    console.log('✓ Area Mobil tariff: Mobil 5000/jam');

    // Area Motor (id=3): Motor only
    await pool.query(
      'INSERT INTO tarif_parkir (jenis_kendaraan_id, area_parkir_id, tarif_per_jam, tarif_per_hari) VALUES (?, ?, ?, ?)',
      [1, 3, 2000, 10000]
    );
    console.log('✓ Area Motor tariff: Motor 2000/jam');

    console.log('\n✅ Konfigurasi area parkir berhasil diupdate!');
    console.log('\n📊 Konfigurasi Final:');
    console.log('   Area Bus (ID 1)   - Bus only: 10000/jam');
    console.log('   Area Mobil (ID 2) - Mobil only: 5000/jam');
    console.log('   Area Motor (ID 3) - Motor only: 2000/jam\n');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

updateAreas();
