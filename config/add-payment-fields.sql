-- Migration: Tambah kolom untuk pembayaran ke table transaksi_parkir
-- Jalankan script ini di db_parkir1 untuk menambahkan fitur pembayaran

USE db_parkir1;

-- Tambah kolom metode pembayaran jika belum ada
ALTER TABLE transaksi_parkir 
ADD COLUMN metode_pembayaran ENUM('cash', 'qris') DEFAULT NULL
AFTER status;

-- Tambah kolom uang diterima jika belum ada
ALTER TABLE transaksi_parkir 
ADD COLUMN uang_diterima DECIMAL(10, 2)
AFTER metode_pembayaran;

-- Tambah kolom kembalian jika belum ada
ALTER TABLE transaksi_parkir 
ADD COLUMN kembalian DECIMAL(10, 2)
AFTER uang_diterima;

-- Tambah kolom waktu pembayaran jika belum ada
ALTER TABLE transaksi_parkir 
ADD COLUMN waktu_pembayaran DATETIME
AFTER kembalian;

-- Verifikasi struktur tabel
DESCRIBE transaksi_parkir;
