-- CREATE DATABASE
CREATE DATABASE IF NOT EXISTS db_parkir1;
USE db_parkir1;

-- TABLE: USERS
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'petugas', 'owner') NOT NULL,
  email VARCHAR(100) UNIQUE,
  no_telp VARCHAR(15),
  aktif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_role (role)
);

-- TABLE: AREA PARKIR
CREATE TABLE IF NOT EXISTS area_parkir (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama_area VARCHAR(100) NOT NULL UNIQUE,
  jenis_area ENUM('mobil', 'bus', 'motor') NOT NULL,
  lokasi TEXT,
  kapasitas INT NOT NULL,
  harga_per_jam DECIMAL(10, 2) NOT NULL,
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_jenis_area (jenis_area)
);

-- TABLE: JENIS KENDARAAN
CREATE TABLE IF NOT EXISTS jenis_kendaraan (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama_jenis VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: TARIF PARKIR
CREATE TABLE IF NOT EXISTS tarif_parkir (
  id INT PRIMARY KEY AUTO_INCREMENT,
  jenis_kendaraan_id INT NOT NULL,
  area_parkir_id INT,
  tarif_per_jam DECIMAL(10, 2) NOT NULL,
  tarif_per_hari DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (jenis_kendaraan_id) REFERENCES jenis_kendaraan(id),
  FOREIGN KEY (area_parkir_id) REFERENCES area_parkir(id),
  UNIQUE KEY unique_tarif (jenis_kendaraan_id)
);

-- TABLE: KENDARAAN
CREATE TABLE IF NOT EXISTS kendaraan (
  id INT PRIMARY KEY AUTO_INCREMENT,
  plat_nomor VARCHAR(20) NOT NULL UNIQUE,
  jenis_kendaraan_id INT NOT NULL,
  pemilik_nama VARCHAR(100),
  pemilik_no_telp VARCHAR(15),
  warna VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (jenis_kendaraan_id) REFERENCES jenis_kendaraan(id),
  INDEX idx_plat (plat_nomor)
);

-- TABLE: TRANSAKSI PARKIR
CREATE TABLE IF NOT EXISTS transaksi_parkir (
  id INT PRIMARY KEY AUTO_INCREMENT,
  kendaraan_id INT NOT NULL,
  area_parkir_id INT NOT NULL,
  petugas_masuk_id INT NOT NULL,
  waktu_masuk DATETIME NOT NULL,
  petugas_keluar_id INT,
  waktu_keluar DATETIME,
  durasi_jam INT,
  tarif_per_jam DECIMAL(10, 2),
  total_bayar DECIMAL(10, 2),
  status ENUM('parkir', 'selesai') DEFAULT 'parkir',
  metode_pembayaran ENUM('cash', 'qris') DEFAULT NULL,
  uang_diterima DECIMAL(10, 2),
  kembalian DECIMAL(10, 2),
  waktu_pembayaran DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (kendaraan_id) REFERENCES kendaraan(id) ON DELETE CASCADE,
  FOREIGN KEY (area_parkir_id) REFERENCES area_parkir(id),
  FOREIGN KEY (petugas_masuk_id) REFERENCES users(id),
  FOREIGN KEY (petugas_keluar_id) REFERENCES users(id),
  INDEX idx_kendaraan (kendaraan_id),
  INDEX idx_status (status),
  INDEX idx_waktu_masuk (waktu_masuk),
  INDEX idx_waktu_keluar (waktu_keluar)
);

-- TABLE: LOG AKTIVITAS
CREATE TABLE IF NOT EXISTS log_aktivitas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  aktivitas TEXT NOT NULL,
  tabel_terkait VARCHAR(50),
  id_record INT,
  waktu_aktivitas TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user (user_id),
  INDEX idx_waktu (waktu_aktivitas)
);

-- INSERT DATA DUMMY JENIS KENDARAAN
INSERT IGNORE INTO jenis_kendaraan (nama_jenis) VALUES 
('Motor'),
('Mobil'),
('Bus');

-- INSERT DATA DUMMY AREA PARKIR
INSERT IGNORE INTO area_parkir (nama_area, jenis_area, lokasi, kapasitas, harga_per_jam, deskripsi) VALUES 
('Area A', 'mobil', 'Lantai 1', 50, 5000, 'Area parkir lantai 1 untuk mobil'),
('Area B', 'mobil', 'Lantai 2', 40, 5000, 'Area parkir lantai 2 untuk mobil'),
('Area Motor', 'motor', 'Samping Gedung', 100, 2000, 'Area khusus parkir motor'),
('Area Bus', 'bus', 'Halaman Belakang', 20, 10000, 'Area khusus parkir bus');

-- INSERT DATA DUMMY TARIF PARKIR (All combinations)
INSERT IGNORE INTO tarif_parkir (jenis_kendaraan_id, area_parkir_id, tarif_per_jam) VALUES 
-- Motor tariffs
(1, 1, 2000),
(1, 2, 2000),
(1, 3, 2000),
(1, 4, 5000),
-- Mobil tariffs
(2, 1, 5000),
(2, 2, 5000),
(2, 3, 5000),
(2, 4, 10000),
-- Bus tariffs
(3, 1, 10000),
(3, 2, 10000),
(3, 3, 10000),
(3, 4, 10000);

-- INSERT DATA DUMMY USERS
-- Password: admin123 (hashed dengan bcrypt)
INSERT IGNORE INTO users (nama, username, password, role, email, no_telp, aktif) VALUES 
('Admin Parkir', 'admin', '$2a$10$FcL8llKO0h1F7l5PxYJh5OKFmTl3GGJqXhWu1qqJ8tGBw1qKgJnGe', 'admin', 'admin@parkir.com', '081234567890', TRUE);

-- Password: petugas123
INSERT IGNORE INTO users (nama, username, password, role, email, no_telp, aktif) VALUES 
('Petugas Parkir', 'petugas', '$2a$10$FcL8llKO0h1F7l5PxYJh5OKFmTl3GGJqXhWu1qqJ8tGBw1qKgJnGe', 'petugas', 'petugas@parkir.com', '081234567891', TRUE);

-- Password: owner123
INSERT IGNORE INTO users (nama, username, password, role, email, no_telp, aktif) VALUES 
('Pemilik Parkir', 'owner', '$2a$10$FcL8llKO0h1F7l5PxYJh5OKFmTl3GGJqXhWu1qqJ8tGBw1qKgJnGe', 'owner', 'owner@parkir.com', '081234567892', TRUE);
