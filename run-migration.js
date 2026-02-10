const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_parkir1'
  });

  try {
    console.log('🔄 Running migration: add-payment-fields.sql');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'config/add-payment-fields.sql'),
      'utf8'
    );

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        console.log('📝 Executing:', statement.substring(0, 80) + '...');
        await connection.execute(statement);
        console.log('✅ Success');
      } catch (err) {
        // Ignore "column already exists" errors
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log('ℹ️  Column already exists (skipping)');
        } else {
          throw err;
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
