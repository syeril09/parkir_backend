const express = require('express');
const cors = require('cors');
require('dotenv').config();

if (process.env.NODE_ENV !== 'production') {
  console.log('\n📋 Loading environment variables...');
  console.log(`   PORT: ${process.env.PORT || 5000}`);
  console.log(`   DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   DB_NAME: ${process.env.DB_NAME || 'db_parkir1'}\n`);
}

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

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Sesuaikan dengan URL frontend
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
  // perform lightweight DB check
  try {
    const db = require('./config/database');
    // If isReady flag is available use it, otherwise try a simple query
    const isReady = typeof db.isReady === 'function' ? db.isReady() : false;
    if (isReady) {
      return res.json({ success: true, message: 'Server dan database terhubung' });
    }
    // fallback try simple query
    db.execute('SELECT 1').then(() => {
      res.json({ success: true, message: 'Server dan database terhubung' });
    }).catch(() => {
      res.status(503).json({ success: false, message: 'Server berjalan tetapi database tidak terhubung' });
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Health check gagal', error: e.message });
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
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   APLIKASI PARKIR - BACKEND SERVER            ║
║   Server berjalan di http://localhost:${PORT}  ║
║   Environment: ${process.env.NODE_ENV}         ║
╚═══════════════════════════════════════════════╝
  `);
});
