#!/usr/bin/env node

require('dotenv').config();

console.log('\n📋 Environment Variables:');
console.log(`   PORT: ${process.env.PORT || 5000}`);
console.log(`   DB_HOST: ${process.env.DB_HOST}`);
console.log(`   DB_USER: ${process.env.DB_USER}`);
console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' : 'empty'}`);
console.log(`   DB_NAME: ${process.env.DB_NAME}`);
console.log(`   DB_PORT: ${process.env.DB_PORT}\n`);

const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const kendaraanRoutes = require('./routes/kendaraanRoutes');
const areaParkirRoutes = require('./routes/areaParkirRoutes');
const tarifParkirRoutes = require('./routes/tarifParkirRoutes');
const transaksiParkirRoutes = require('./routes/transaksiParkirRoutes');
const logAktivitasRoutes = require('./routes/logAktivitasRoutes');

// Initialize app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Aplikasi Parkir Backend - API v1.0',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/kendaraan', kendaraanRoutes);
app.use('/api/area-parkir', areaParkirRoutes);
app.use('/api/tarif-parkir', tarifParkirRoutes);
app.use('/api/transaksi', transaksiParkirRoutes);
app.use('/api/log-aktivitas', logAktivitasRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   APLIKASI PARKIR - BACKEND SERVER            ║
║   Server berjalan di http://localhost:${PORT}  ║
║   Environment: ${process.env.NODE_ENV}${' '.repeat(19 - `${process.env.NODE_ENV}`.length)}║
╚═══════════════════════════════════════════════╝
  `);
});
