const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrate() {
  let connection;
  try {
    console.log('🔄 Menghubungkan ke database...');
    
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('✅ Terhubung ke database!\n');

    // Read and execute schema
    console.log('📝 Membaca file schema...');
    const schemaPath = path.join(__dirname, 'config/database-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Split statements by semicolon
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📊 Total ${statements.length} statements ditemukan\n`);

    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        console.log(`[${i + 1}/${statements.length}] Executing: ${stmt.substring(0, 60)}...`);
        await connection.execute(stmt);
        successCount++;
        console.log('✅ Success\n');
      } catch (err) {
        // Ignore "table already exists" errors
        if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_KEYNAME') {
          console.log(`⏭️  Already exists (skipped)\n`);
          skipCount++;
        } else {
          console.error(`❌ Error: ${err.message}\n`);
          throw err;
        }
      }
    }

    // Read and execute seed data
    console.log('\n📋 Membaca file seed data...');
    const seedPath = path.join(__dirname, 'config/seed-data.sql');
    
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      const seedStatements = seedSql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      console.log(`📊 Total ${seedStatements.length} seed statements ditemukan\n`);

      for (let i = 0; i < seedStatements.length; i++) {
        const stmt = seedStatements[i];
        try {
          console.log(`[SEED ${i + 1}/${seedStatements.length}] Executing: ${stmt.substring(0, 60)}...`);
          await connection.execute(stmt);
          console.log('✅ Success\n');
        } catch (err) {
          if (err.code === 'ER_DUP_ENTRY' || err.code === 'ER_DUP_KEYNAME') {
            console.log(`⏭️  Already exists (skipped)\n`);
            skipCount++;
          } else {
            console.log(`⚠️  Warning: ${err.message}\n`);
            // Continue with next statements
          }
        }
      }
    }

    console.log('='.repeat(50));
    console.log('✅ MIGRASI DATABASE BERHASIL!');
    console.log(`   - Executed: ${successCount}`);
    console.log(`   - Skipped: ${skipCount}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ MIGRASI GAGAL:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrate();
