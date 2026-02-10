-- Add jenis_area column to area_parkir table if it doesn't exist
ALTER TABLE area_parkir ADD COLUMN jenis_area ENUM('mobil', 'bus', 'motor') NOT NULL DEFAULT 'mobil' AFTER nama_area;

-- Add index for jenis_area
ALTER TABLE area_parkir ADD INDEX idx_jenis_area (jenis_area);

-- Update existing records to have proper jenis_area based on nama_area patterns
UPDATE area_parkir SET jenis_area = 'motor' WHERE LOWER(nama_area) LIKE '%motor%' OR LOWER(nama_area) LIKE '%bike%';
UPDATE area_parkir SET jenis_area = 'bus' WHERE LOWER(nama_area) LIKE '%bus%';
UPDATE area_parkir SET jenis_area = 'mobil' WHERE jenis_area IS NULL OR jenis_area = '';
