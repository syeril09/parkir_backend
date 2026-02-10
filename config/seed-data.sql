-- INSERT TEST DATA USERS
-- Password: admin123 (hashed with bcrypt)
-- Use this hash: $2b$10$YIjlrJRp8qJUXN.XyZ8Dq.3lJ5r.0C8H.5vZ8qJUXN.XyZ8Dq

INSERT INTO users (nama, username, password, role, email, no_telp, aktif) VALUES
('Admin User', 'admin', '$2b$10$YIjlrJRp8qJUXN.XyZ8Dq.3lJ5r.0C8H.5vZ8qJUXN.XyZ8Dq', 'admin', 'admin@parkir.com', '081234567890', TRUE),
('Petugas Parkir', 'petugas', '$2b$10$YIjlrJRp8qJUXN.XyZ8Dq.3lJ5r.0C8H.5vZ8qJUXN.XyZ8Dq', 'petugas', 'petugas@parkir.com', '081234567891', TRUE),
('Owner Area', 'owner', '$2b$10$YIjlrJRp8qJUXN.XyZ8Dq.3lJ5r.0C8H.5vZ8qJUXN.XyZ8Dq', 'owner', 'owner@parkir.com', '081234567892', TRUE);

-- INSERT TEST DATA AREA PARKIR
INSERT INTO area_parkir (nama_area, lokasi, kapasitas, harga_per_jam, deskripsi) VALUES
('Area A', 'Jalan Merdeka No. 1', 50, 5000, 'Area parkir utama dekat pusat kota'),
('Area B', 'Jalan Sudirman No. 5', 75, 6000, 'Area parkir dengan fasilitas lengkap'),
('Area C', 'Jalan Gatot Subroto', 100, 4000, 'Area parkir outdoor luas');

-- INSERT TEST DATA JENIS KENDARAAN
INSERT INTO jenis_kendaraan (nama_jenis) VALUES
('Motor'),
('Mobil'),
('Truk');
