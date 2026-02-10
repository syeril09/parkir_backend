const pool = require('./config/database');

async function setupTarif() {
  try {
    console.log('🔧 Setting up tarif parkir...\n');

    // Check area parkir
    const [areas] = await pool.query('SELECT * FROM area_parkir');
    console.log('📊 Area Parkir yang tersedia:');
    areas.forEach(a => {
      console.log(`  ID ${a.id}: ${a.nama_area}`);
    });

    if (areas.length === 0) {
      console.log('\n❌ Tidak ada area parkir! Perlu insert area parkir dulu.');
      process.exit(1);
    }

    // Clear old tarif
    await pool.query('DELETE FROM tarif_parkir');
    console.log('\n✓ Cleared old tarif_parkir');

    // Insert tarif untuk setiap jenis kendaraan dan area
    // Motor: 2000/jam, Mobil: 5000/jam, Bus: 10000/jam
    const tarifData = [];
    areas.forEach(area => {
      tarifData.push([1, area.id, 2000, 10000]); // Motor: 2rb/jam, 10rb/hari
      tarifData.push([2, area.id, 5000, 25000]); // Mobil: 5rb/jam, 25rb/hari
      tarifData.push([3, area.id, 10000, 50000]); // Bus: 10rb/jam, 50rb/hari
    });

    for (const [jenisId, areaId, tarifJam, tarifHari] of tarifData) {
      await pool.query(
        'INSERT INTO tarif_parkir (jenis_kendaraan_id, area_parkir_id, tarif_per_jam, tarif_per_hari) VALUES (?, ?, ?, ?)',
        [jenisId, areaId, tarifJam, tarifHari]
      );
    }

    console.log(`✓ Inserted tarif for ${tarifData.length} combinations\n`);

    // Display result
    const [result] = await pool.query(`
      SELECT tp.id, jk.nama_jenis, ap.nama_area, tp.tarif_per_jam, tp.tarif_per_hari
      FROM tarif_parkir tp
      JOIN jenis_kendaraan jk ON tp.jenis_kendaraan_id = jk.id
      JOIN area_parkir ap ON tp.area_parkir_id = ap.id
      ORDER BY jk.id, ap.id
    `);

    console.log('✅ Tarif Parkir sekarang:');
    result.forEach(t => {
      console.log(`  ${t.nama_jenis} @ ${t.nama_area}: Rp ${t.tarif_per_jam}/jam, Rp ${t.tarif_per_hari}/hari`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

setupTarif();
