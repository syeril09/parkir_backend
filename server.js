#!/usr/bin/env node

require('dotenv').config();

const express = require('express');
const cors = require('cors');

console.log('\n📋 Initializing Backend Server...\n');

const app = express();

// Middlewares
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
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

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server dan database terhubung',
    database: process.env.DB_NAME,
    host: process.env.DB_HOST
  });
});

// Mock API routes (untuk testing)
app.get('/api/auth/check', (req, res) => {
  res.json({ success: true, message: 'Auth endpoint working' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ success: true, message: 'Login endpoint working', token: 'mock-token' });
});

app.get('/api/users', (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/api/area-parkir', (req, res) => {
  res.json({ success: true, data: [] });
});

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

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   APLIKASI PARKIR - BACKEND SERVER            ║
║   Server berjalan di http://localhost:${PORT}   ║
║   Environment: ${process.env.NODE_ENV || 'development'}${' '.repeat(18 - `${process.env.NODE_ENV || 'development'}`.length)}║
║   Database: ${process.env.DB_NAME}@${process.env.DB_HOST}${' '.repeat(23 - `${process.env.DB_NAME}@${process.env.DB_HOST}`.length)}║
╚═══════════════════════════════════════════════╝
  `);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} sudah digunakan`);
  } else {
    console.error('❌ Server Error:', err.message);
  }
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n\n📢 Server shutdown gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
