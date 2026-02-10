// Test koneksi database dan registrasi
const pool = require('./config/database');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');

    // Test koneksi
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully!');

    // Test query sederhana
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM users');
    console.log(`📊 Total users in database: ${rows[0].total}`);

    // Test insert user baru (untuk test)
    console.log('📝 Testing user registration...');
    const testUser = {
      nama: 'Test User',
      username: 'testuser123',
      password: '$2b$10$hashedpassword', // dummy hash
      role: 'petugas',
      email: 'test@example.com'
    };

    // Cek apakah username sudah ada
    const [existing] = await connection.execute('SELECT id FROM users WHERE username = ?', [testUser.username]);

    if (existing.length === 0) {
      const [result] = await connection.execute(
        'INSERT INTO users (nama, username, password, role, email) VALUES (?, ?, ?, ?, ?)',
        [testUser.nama, testUser.username, testUser.password, testUser.role, testUser.email]
      );
      console.log(`✅ Test user created with ID: ${result.insertId}`);
    } else {
      console.log('ℹ️ Test user already exists');
    }

    connection.release();
    console.log('🎉 Database test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testDatabase();