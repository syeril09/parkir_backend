-- Script untuk menambahkan kolom jenis_area ke tabel area_parkir jika belum ada

USE db_parkir1;

-- Cek dan tambahkan kolom jenis_area jika belum ada
ALTER TABLE area_parkir 
ADD COLUMN IF NOT EXISTS jenis_area ENUM('mobil', 'bus', 'motor') DEFAULT 'mobil' AFTER nama_area;

-- Tambahkan INDEX jika belum ada
ALTER TABLE area_parkir ADD INDEX idx_jenis_area (jenis_area);

-- Set default jenis_area berdasarkan nama area (opsional, untuk data lama)
UPDATE area_parkir SET jenis_area = 'mobil' WHERE jenis_area IS NULL OR jenis_area = '';
UPDATE area_parkir SET jenis_area = 'motor' WHERE nama_area LIKE '%motor%' OR nama_area LIKE '%Motor%';
UPDATE area_parkir SET jenis_area = 'bus' WHERE nama_area LIKE '%bus%' OR nama_area LIKE '%Bus%';

-- Selesai
SELECT 'Migration completed: jenis_area column added to area_parkir table' AS status;
