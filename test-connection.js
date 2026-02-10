#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('\n🔍 Testing Database Connection...\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      port: 3306,
      waitForConnections: true,
      connectionTimeout: 5000
    });

    console.log('✅ MySQL Server Connected!\n');
    console.log('Host: localhost:3306');
    console.log('User: root');
    
    // Test database
    try {
      const [result] = await connection.execute('SELECT DATABASE()');
      console.log('✅ Can run queries\n');
    } catch (err) {
      console.log('⚠️  Can query but no database selected\n');
    }

    // Check if db_parkir1 exists
    try {
      const [dbs] = await connection.execute(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'db_parkir1'`
      );
      
      if (dbs.length > 0) {
        console.log('✅ Database db_parkir1 EXISTS\n');
        
        // Switch and check tables
        await connection.changeUser({ database: 'db_parkir1' });
        
        const [tables] = await connection.execute(
          `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'db_parkir1'`
        );
        
        console.log(`📊 Tables Found: ${tables.length}`);
        tables.forEach(t => console.log(`   - ${t.TABLE_NAME}`));
        console.log('\n✅ Database is ready!\n');
      } else {
        console.log('❌ Database db_parkir1 NOT FOUND');
        console.log('   Run: node init-database.js\n');
      }
    } catch (err) {
      console.log('❌ Error checking database:', err.message, '\n');
    }

    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ CONNECTION FAILED\n');
    console.error('Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MySQL Server is running');
    console.log('   Windows: Services.msc → Find "MySQL" → Start');
    console.log('2. Check .env file credentials');
    console.log('3. Default creds: root / (empty password)\n');
    process.exit(1);
  }
}

testConnection();
