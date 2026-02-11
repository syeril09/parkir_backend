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
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mysql.createConnection(dbConfig);
      return conn;
    } catch (err) {
      console.log(`Connection attempt ${i + 1}/${retries} failed, retrying...`);
      if (i < retries - 1) {
        await sleep(2000);
      } else {
        throw err;
      }
    }
  }
}

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
      if (['ER_TABLE_EXISTS_ERROR', 'ER_DUP_FIELDNAME', 'ER_DUP_KEYNAME', 'ER_DUP_ENTRY', 'ER_WRONG_TABLE_NAME'].includes(err.code)) {
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
    console.log('Database Config:');
    console.log(`  Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`  Database: ${dbConfig.database}\n`);
    
    console.log('Connecting to database...');
    conn = await createConnection();
    console.log('✅ Connected!\n');

    // Test connection
    const [testQuery] = await conn.execute('SELECT 1');
    console.log('✅ Connection test passed!\n');

    // Execute schema
    console.log('📝 Executing database schema...');
    const schemaPath = path.join(__dirname, 'config/database-schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaResult = await executeSqlFile(conn, schemaPath);
      console.log(`✅ Schema: ${schemaResult.success} executed, ${schemaResult.skipped} skipped\n`);
    }

    // Execute seed data
    console.log('🌱 Seeding initial data...');
    const seedPath = path.join(__dirname, 'config/seed-data.sql');
    if (fs.existsSync(seedPath)) {
      const seedResult = await executeSqlFile(conn, seedPath);
      console.log(`✅ Seed: ${seedResult.success} executed, ${seedResult.skipped} skipped\n`);
    }

    // Verify
    console.log('🔍 Verifying migration...');
    
    const [tables] = await conn.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`, 
      [dbConfig.database]
    );
    console.log(`✅ Tables: ${tables.map(t => t.TABLE_NAME).join(', ')}`);

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
