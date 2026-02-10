const pool = require('./config/database');

async function addJenisAreaColumn() {
  try {
    console.log('🔄 Menambahkan kolom jenis_area ke table area_parkir...');

    // Check apakah kolom sudah ada
    const [columns] = await pool.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'area_parkir' AND COLUMN_NAME = 'jenis_area'"
    );

    if (columns.length > 0) {
      console.log('✅ Kolom jenis_area sudah ada di table area_parkir');
      process.exit(0);
    }

    // Tambah kolom jenis_area jika belum ada
    await pool.execute(
      "ALTER TABLE area_parkir ADD COLUMN jenis_area ENUM('mobil', 'bus', 'motor') NOT NULL DEFAULT 'mobil' AFTER nama_area"
    );

    console.log('✅ Kolom jenis_area berhasil ditambahkan ke table area_parkir');

    // Tambahkan index untuk jenis_area
    await pool.execute(
      "ALTER TABLE area_parkir ADD INDEX idx_jenis_area (jenis_area)"
    );

    console.log('✅ Index idx_jenis_area berhasil dibuat');
    console.log('✅ Migration selesai!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error saat migration:', error.message);
    process.exit(1);
  }
}

addJenisAreaColumn();
