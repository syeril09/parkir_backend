-- Fix Foreign Key Constraint untuk Kendaraan
-- File ini dijalankan untuk update database yang sudah ada

USE db_parkir1;

-- Step 1: Drop constraint lama
ALTER TABLE transaksi_parkir 
DROP FOREIGN KEY transaksi_parkir_ibfk_1;

-- Step 2: Tambah constraint baru dengan ON DELETE CASCADE
ALTER TABLE transaksi_parkir 
ADD CONSTRAINT transaksi_parkir_ibfk_1 
FOREIGN KEY (kendaraan_id) REFERENCES kendaraan(id) ON DELETE CASCADE;

-- Verifikasi
SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'transaksi_parkir' 
AND COLUMN_NAME = 'kendaraan_id';
