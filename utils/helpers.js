const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Generate JWT Token
 * @param {object} payload - Data yang akan di-encode dalam token
 * @returns {string} JWT Token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

/**
 * Hash password menggunakan bcrypt
 * @param {string} password - Password yang akan di-hash
 * @returns {string} Password yang sudah di-hash
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Bandingkan password dengan hash
 * @param {string} password - Password yang akan dibandingkan
 * @param {string} hashedPassword - Password yang sudah di-hash
 * @returns {boolean} Apakah password cocok
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Hitung durasi parkir dalam jam
 * @param {Date} waktuMasuk - Waktu kendaraan masuk
 * @param {Date} waktuKeluar - Waktu kendaraan keluar
 * @returns {number} Durasi dalam jam (dibulatkan ke atas)
 */
const hitungDurasiParkir = (waktuMasuk, waktuKeluar) => {
  const milidetik = waktuKeluar - waktuMasuk;
  const jam = Math.ceil(milidetik / (1000 * 60 * 60));
  return jam;
};

/**
 * Hitung total biaya parkir
 * @param {number} durasiJam - Durasi parkir dalam jam
 * @param {number} tarifPerJam - Tarif per jam
 * @returns {number} Total biaya parkir
 */
const hitungBiayaParkir = (durasiJam, tarifPerJam) => {
  return durasiJam * tarifPerJam;
};

/**
 * Format mata uang rupiah
 * @param {number} nilai - Nilai yang akan diformat
 * @returns {string} Nilai dalam format Rp
 */
const formatRupiah = (nilai) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(nilai);
};

/**
 * Format tanggal dan waktu
 * @param {Date} tanggal - Tanggal yang akan diformat
 * @returns {string} Tanggal dalam format yang readable
 */
const formatTanggal = (tanggal) => {
  return new Date(tanggal).toLocaleString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Validasi format email
 * @param {string} email - Email yang akan divalidasi
 * @returns {boolean} Apakah email valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  hitungDurasiParkir,
  hitungBiayaParkir,
  formatRupiah,
  formatTanggal,
  isValidEmail
};
