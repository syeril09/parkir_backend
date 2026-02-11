#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_parkir1',
  port: 3306
};

async function executeSqlFile(connection, filepath) {
  const sql = fs.readFileSync(filepath, 'utf8');
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

  let success = 0;
  let skipped = 0;
  let errors = [];

  for (const stmt of statements) {
    try {
      await connection.execute(stmt);
      success++;
    } catch (err) {
      if (['ER_TABLE_EXISTS_ERROR', 'ER_DUP_FIELDNAME', 'ER_DUP_KEYNAME', 'ER_DUP_ENTRY'].includes(err.code)) {
        skipped++;
      } else {
        errors.push(err.message);
      }
    }
  }

  return { success, skipped, errors };
}

async function migrate() {
  let conn;
  
  try {
    console.log('\n🚀 Starting Database Migration (Local)...\n');
    console.log('Database Config:');
    console.log(`  Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`  Database: ${dbConfig.database}\n`);
    
    console.log('Connecting to database...');
    conn = await mysql.createConnection(dbConfig);
    console.log('✅ Connected!\n');

    // Execute schema
    console.log('📝 Executing database schema...');
    const schemaPath = path.join(__dirname, 'config/database-schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaResult = await executeSqlFile(conn, schemaPath);
      console.log(`✅ Schema: ${schemaResult.success} executed, ${schemaResult.skipped} skipped`);
      if (schemaResult.errors.length > 0) {
        console.log(`   Errors: ${schemaResult.errors.slice(0, 3).join('; ')}`);
      }
    }
    console.log();

    // Execute seed data
    console.log('🌱 Seeding initial data...');
    const seedPath = path.join(__dirname, 'config/seed-data.sql');
    if (fs.existsSync(seedPath)) {
      const seedResult = await executeSqlFile(conn, seedPath);
      console.log(`✅ Seed: ${seedResult.success} executed, ${seedResult.skipped} skipped`);
    }
    console.log();

    // Verify
    console.log('🔍 Verifying migration...');
    
    try {
      const [tables] = await conn.execute(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`, 
        [dbConfig.database]
      );
      console.log(`   Tables: ${tables.map(t => t.TABLE_NAME).join(', ')}`);

      const [users] = await conn.execute('SELECT COUNT(*) as count FROM users');
      console.log(`   Users: ${users[0].count}`);

      const [areas] = await conn.execute('SELECT COUNT(*) as count FROM area_parkir');
      console.log(`   Areas: ${areas[0].count}`);

      const [jenis] = await conn.execute('SELECT COUNT(*) as count FROM jenis_kendaraan');
      console.log(`   Vehicle Types: ${jenis[0].count}`);

      const [transaksi] = await conn.execute('SELECT COUNT(*) as count FROM transaksi_parkir');
      console.log(`   Transactions: ${transaksi[0].count}`);
    } catch (err) {
      console.log(`   ⚠️  Verification error: ${err.message}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message, '\n');
    process.exit(1);
  } finally {
    if (conn) {
      try {
        await conn.end();
      } catch (e) {
        // Ignore end errors
      }
    }
  }
}

migrate();
