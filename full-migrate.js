#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
};

async function executeSqlFile(connection, filepath) {
  const sql = fs.readFileSync(filepath, 'utf8');
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

  let success = 0;
  let skipped = 0;

  for (const stmt of statements) {
    try {
      await connection.execute(stmt);
      success++;
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_KEYNAME' || err.code === 'ER_DUP_ENTRY') {
        skipped++;
      } else {
        throw err;
      }
    }
  }

  return { success, skipped };
}

async function migrate() {
  let conn;
  try {
    console.log('\n🚀 Starting Database Migration...\n');
    console.log('Connecting to database...');
    
    conn = await mysql.createConnection(dbConfig);
    console.log('✅ Connected!\n');

    // Execute schema
    console.log('📝 Executing database schema...');
    const schemaResult = await executeSqlFile(conn, path.join(__dirname, 'config/database-schema.sql'));
    console.log(`✅ Schema: ${schemaResult.success} executed, ${schemaResult.skipped} skipped\n`);

    // Execute seed data
    console.log('🌱 Seeding initial data...');
    const seedResult = await executeSqlFile(conn, path.join(__dirname, 'config/seed-data.sql'));
    console.log(`✅ Seed: ${seedResult.success} executed, ${seedResult.skipped} skipped\n`);

    // Verify
    console.log('🔍 Verifying migration...');
    const [tables] = await conn.execute(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`, [dbConfig.database]);
    console.log(`✅ Tables created: ${tables.length}\n`);

    const [users] = await conn.execute('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Users: ${users[0].count}`);

    const [areas] = await conn.execute('SELECT COUNT(*) as count FROM area_parkir');
    console.log(`✅ Areas: ${areas[0].count}`);

    const [jenis] = await conn.execute('SELECT COUNT(*) as count FROM jenis_kendaraan');
    console.log(`✅ Vehicle types: ${jenis[0].count}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message, '\n');
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

migrate();
