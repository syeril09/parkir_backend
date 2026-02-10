const pool = require('../config/database');

/**
 * MIGRATION: Add jenis_area column to area_parkir table
 * Run: node migrations/add-jenis-area-column.js
 */

async function migrateAddJenisArea() {
  try {
    console.log('Starting migration: Add jenis_area column to area_parkir...');

    // Check if column already exists
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'area_parkir' AND COLUMN_NAME = 'jenis_area'
    `);

    if (columns.length > 0) {
      console.log('✓ Column jenis_area already exists. Skipping migration.');
      process.exit(0);
    }

    // Add column if it doesn't exist
    console.log('Adding column jenis_area to area_parkir table...');
    await pool.execute(`
      ALTER TABLE area_parkir 
      ADD COLUMN jenis_area ENUM('mobil', 'bus', 'motor') NOT NULL DEFAULT 'mobil'
    `);

    console.log('✓ Column jenis_area added successfully');

    // Add index for better query performance
    console.log('Adding index on jenis_area...');
    await pool.execute(`
      ALTER TABLE area_parkir 
      ADD INDEX idx_jenis_area (jenis_area)
    `);

    console.log('✓ Index added successfully');

    console.log('✓ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateAddJenisArea();
