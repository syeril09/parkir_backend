// Test script untuk check status database columns
const mysql = require('mysql2/promise');

async function checkDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_parkir1'
  });

  try {
    console.log('\n📋 Checking transaksi_parkir table columns...\n');
    
    const [rows] = await connection.execute('DESCRIBE transaksi_parkir');
    
    console.log('Table columns:');
    rows.forEach(row => {
      console.log(`  - ${row.Field}: ${row.Type}`);
    });
    
    // Check for payment columns specifically
    const paymentCols = ['metode_pembayaran', 'uang_diterima', 'kembalian', 'waktu_pembayaran'];
    console.log('\n✓ Payment columns check:');
    paymentCols.forEach(col => {
      const found = rows.some(r => r.Field === col);
      console.log(`  ${found ? '✅' : '❌'} ${col}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

checkDatabase();
