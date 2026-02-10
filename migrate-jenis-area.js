const pool = require('./config/database');

/**
 * Migration Script: Add jenis_area column to area_parkir table
 */
async function migrateJenisArea() {
  try {
    console.log('🔄 Starting migration: adding jenis_area column...');

    // Check if column exists
    const [columns] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'area_parkir' AND COLUMN_NAME = 'jenis_area' AND TABLE_SCHEMA = 'db_parkir1'`
    );

    if (columns.length > 0) {
      console.log('✅ Column jenis_area already exists. Skipping...');
      return;
    }

    // Add jenis_area column
    console.log('📝 Adding jenis_area column...');
    await pool.execute(
      `ALTER TABLE area_parkir 
       ADD COLUMN jenis_area ENUM('mobil', 'bus', 'motor') DEFAULT 'mobil' AFTER nama_area`
    );
    console.log('✅ Column jenis_area added successfully');

    // Add index
    console.log('📝 Adding index on jenis_area...');
    try {
      await pool.execute(
        `ALTER TABLE area_parkir ADD INDEX idx_jenis_area (jenis_area)`
      );
      console.log('✅ Index created successfully');
    } catch (err) {
      console.log('⚠️  Index may already exist, continuing...');
    }

    // Update default values based on area name
    console.log('📝 Updating default jenis_area values...');
    
    await pool.execute(
      `UPDATE area_parkir SET jenis_area = 'mobil' 
       WHERE jenis_area = 'mobil' OR jenis_area IS NULL`
    );
    
    await pool.execute(
      `UPDATE area_parkir SET jenis_area = 'motor' 
       WHERE LOWER(nama_area) LIKE '%motor%'`
    );
    
    await pool.execute(
      `UPDATE area_parkir SET jenis_area = 'bus' 
       WHERE LOWER(nama_area) LIKE '%bus%'`
    );
    
    console.log('✅ Default values updated');

    // Show final state
    const [areas] = await pool.execute(
      `SELECT id, nama_area, jenis_area FROM area_parkir ORDER BY id`
    );
    
    console.log('\n📊 Final area_parkir data:');
    console.table(areas);

    console.log('\n✨ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrateJenisArea();
