#!/usr/bin/env node

console.log('🔧 Testing Backend Startup...\n');

try {
  console.log('1️⃣  Loading dotenv...');
  require('dotenv').config({ path: './.env' });
  console.log('✅ .env loaded\n');

  console.log('2️⃣  Loading Express...');
  const express = require('express');
  console.log('✅ Express loaded\n');

  console.log('3️⃣  Loading CORS...');
  const cors = require('cors');
  console.log('✅ CORS loaded\n');

  console.log('4️⃣  Loading routes...');
  const authRoutes = require('./routes/authRoutes');
  console.log('✅ Routes loaded\n');

  console.log('5️⃣  Creating app...');
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  app.get('/', (req, res) => {
    res.json({ message: 'OK' });
  });

  console.log('✅ App created\n');

  console.log('6️⃣  Starting server on port 5000...');
  const server = app.listen(5000, () => {
    console.log('✅ Server started on http://localhost:5000\n');
    console.log('✅ BACKEND IS READY\n');
    
    setTimeout(() => {
      console.log('Keeping server running...');
    }, 1000);
  });

  server.on('error', (err) => {
    console.error('❌ Server error:', err.message);
    process.exit(1);
  });

} catch (err) {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  process.exit(1);
}

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
