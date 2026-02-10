/**
 * Alter tarif_parkir table to make area_parkir_id optional
 * This script modifies the existing table structure
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function alterTarifTable() {
  try {
    console.log('🔄 Connecting to database to alter tarif_parkir table...\n');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'db_parkir1',
      port: process.env.DB_PORT || 3306
    });

    console.log('✓ Connected to database\n');

    // Check if tarif_parkir table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'tarif_parkir'");
    
    if (tables.length === 0) {
      console.log('⚠️  Table tarif_parkir does not exist. Please run init-database.js first.');
      await connection.end();
      return;
    }

    console.log('✓ Found tarif_parkir table\n');

    // Get current table structure
    const [columns] = await connection.query("DESCRIBE tarif_parkir");
    console.log('📋 Current table structure:');
    columns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('');

    // Alter area_parkir_id to be nullable
    try {
      await connection.query(
        "ALTER TABLE tarif_parkir MODIFY COLUMN area_parkir_id INT NULL"
      );
      console.log('✓ Modified area_parkir_id to be nullable\n');
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  area_parkir_id is already nullable\n');
      }
    }

    // Drop existing unique constraint and recreate it with only jenis_kendaraan_id
    try {
      await connection.query(
        "ALTER TABLE tarif_parkir DROP INDEX unique_tarif"
      );
      console.log('✓ Dropped old unique constraint\n');
    } catch (err) {
      if (err.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('ℹ️  Unique constraint already removed or does not exist\n');
      }
    }

    // Add new unique constraint on only jenis_kendaraan_id
    try {
      await connection.query(
        "ALTER TABLE tarif_parkir ADD UNIQUE KEY unique_tarif (jenis_kendaraan_id)"
      );
      console.log('✓ Added new unique constraint on jenis_kendaraan_id only\n');
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Unique constraint already exists\n');
      }
    }

    // Verify the changes
    const [newColumns] = await connection.query("DESCRIBE tarif_parkir");
    console.log('📋 Updated table structure:');
    newColumns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('');

    console.log('✅ Table alteration completed successfully!\n');

    await connection.end();
  } catch (err) {
    console.error('❌ Error altering table:', err.message);
    process.exit(1);
  }
}

alterTarifTable();
