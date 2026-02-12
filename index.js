const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ALWAYS log ini, bahkan di production
console.log('✅ dotenv loaded');
console.log(`📌 NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`📌 PORT: ${process.env.PORT || 5000}`);

// Import routes - with error handling
let authRoutes, userRoutes, kendaraanRoutes, areaParkirRoutes, tarifParkirRoutes, transaksiParkirRoutes, logAktivitasRoutes;

try {
  console.log('📍 Loading authRoutes...');
  authRoutes = require('./routes/authRoutes');
  console.log('✅ authRoutes loaded');
  
  console.log('📍 Loading userRoutes...');
  userRoutes = require('./routes/userRoutes');
  console.log('✅ userRoutes loaded');
  
  console.log('📍 Loading kendaraanRoutes...');
  kendaraanRoutes = require('./routes/kendaraanRoutes');
  console.log('✅ kendaraanRoutes loaded');
  
  console.log('📍 Loading areaParkirRoutes...');
  areaParkirRoutes = require('./routes/areaParkirRoutes');
  console.log('✅ areaParkirRoutes loaded');
  
  console.log('📍 Loading tarifParkirRoutes...');
  tarifParkirRoutes = require('./routes/tarifParkirRoutes');
  console.log('✅ tarifParkirRoutes loaded');
  
  console.log('📍 Loading transaksiParkirRoutes...');
  transaksiParkirRoutes = require('./routes/transaksiParkirRoutes');
  console.log('✅ transaksiParkirRoutes loaded');
  
  console.log('📍 Loading logAktivitasRoutes...');
  logAktivitasRoutes = require('./routes/logAktivitasRoutes');
  console.log('✅ logAktivitasRoutes loaded');
  
} catch (err) {
  console.error('❌ ERROR loading routes:', err.message);
  console.error(err.stack);
  process.exit(1);
}

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const logActivity = require('./middleware/logActivity');
const { prisma } = require('./config/database');

console.log('✅ All modules loaded');

// Inisialisasi Express
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// CORS configuration - allow both local and production domains
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://parkir-frontend.railway.app',
  'https://parkir-frontend-production.up.railway.app',
  process.env.FRONTEND_URL // for Railway/production
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Activity logging middleware
app.use(logActivity);

// Add global error handlers for visibility
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err && err.stack ? err.stack : err);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err && err.stack ? err.stack : err);
  // optional: process.exit(1);
});

// ============================================
// ROUTES
// ============================================

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Aplikasi Parkir Backend - API v1.0',
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    const db = require('./config/database');
    const isReady = typeof db.isReady === 'function' ? db.isReady() : false;
    if (isReady) {
      return res.json({ success: true, message: 'Server dan database terhubung' });
    }
    // DB not ready yet, but server is running - return 503 Service Unavailable
    res.status(503).json({ success: false, message: 'Server berjalan tetapi database masih connecting, coba lagi dalam beberapa detik' });
  } catch (e) {
    // Server running, return ok - health check main goal is server responding
    res.json({ success: true, message: 'Server berjalan (database check in progress)' });
  }
});


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/kendaraan', kendaraanRoutes);
app.use('/api/area-parkir', areaParkirRoutes);
app.use('/api/tarif-parkir', tarifParkirRoutes);
app.use('/api/transaksi', transaksiParkirRoutes);
app.use('/api/log-aktivitas', logAktivitasRoutes);

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`
  });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use(errorHandler);

// ============================================
// START SERVER (BEFORE waiting for DB)
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   ✅ SERVER RUNNING                           ║
║   Port: ${PORT}                                  ║
║   Environment: ${process.env.NODE_ENV || 'development'}         ║
║   Database: connecting...                     ║
╚═══════════════════════════════════════════════╝
  `);
});

require('./config/database');
