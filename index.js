const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('\n📋 Loading environment variables...');
console.log(`   PORT: ${process.env.PORT || 5000}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   Database connecting...\n`);

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const kendaraanRoutes = require('./routes/kendaraanRoutes');
const areaParkirRoutes = require('./routes/areaParkirRoutes');
const tarifParkirRoutes = require('./routes/tarifParkirRoutes');
const transaksiParkirRoutes = require('./routes/transaksiParkirRoutes');
const logAktivitasRoutes = require('./routes/logAktivitasRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const logActivity = require('./middleware/logActivity');

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

// Start server immediately
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   APLIKASI PARKIR - BACKEND SERVER            ║
║   ✅ Server running on port ${PORT}            ║
║   Environment: ${process.env.NODE_ENV || 'development'}         ║
║   Database connecting in background...        ║
╚═══════════════════════════════════════════════╝
  `);
});

// Test database connection in background (non-blocking)
// This ensures Railway health check can pass even if DB is slow
require('./config/database');
