#!/usr/bin/env node
const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'yamabiko.proxy.rlwy.net',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'JOuZLCxHtRQUalgxrdLkPEsgSaXUUjsG',
      database: process.env.DB_NAME || 'db_parkir1',
      port: process.env.DB_PORT || 24302
    });

    console.log('Connected!');
    
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log('Users count:', rows[0].count);
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
