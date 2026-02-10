/**
 * Middleware untuk error handling
 * Menangani error dan mengirimkan response yang konsisten
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Terjadi kesalahan pada server';

  // Error dari database
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    statusCode = 500;
    message = 'Koneksi database hilang';
  }

  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 400;
    message = 'Data sudah terdaftar di sistem';
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Referensi data tidak ditemukan';
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    code: err.code
  });
};

module.exports = errorHandler;
