const mysql = require('mysql2/promise');

async function checkDatabase() {
  let connection;
  try {
    console.log('🔍 Checking database status...\n');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'db_parkir1',
      port: 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('✅ Connected to database\n');

    // Check users
    const [users] = await connection.execute('SELECT id, nama, username, role FROM users');
    console.log('👥 USERS:');
    console.log(`   Total: ${users.length}`);
    if (users.length > 0) {
      users.forEach(u => console.log(`   - ${u.username} (${u.role})`));
    } else {
      console.log('   ❌ No users found');
    }

    // Check jenis kendaraan
    const [jenis] = await connection.execute('SELECT id, nama_jenis FROM jenis_kendaraan');
    console.log('\n🚗 JENIS KENDARAAN:');
    console.log(`   Total: ${jenis.length}`);
    if (jenis.length > 0) {
      jenis.forEach(j => console.log(`   - ${j.nama_jenis}`));
    }

    // Check area parkir
    const [areas] = await connection.execute('SELECT id, nama_area, jenis_area, kapasitas FROM area_parkir');
    console.log('\n📍 AREA PARKIR:');
    console.log(`   Total: ${areas.length}`);
    if (areas.length > 0) {
      areas.forEach(a => console.log(`   - ${a.nama_area} (${a.jenis_area}, kapasitas: ${a.kapasitas})`));
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ DATABASE STATUS: READY FOR USE');
    console.log('='.repeat(50));

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase();
