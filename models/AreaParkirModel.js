const pool = require('../config/database');

/**
 * AREA PARKIR MODEL
 * Menangani semua query terkait area parkir
 */
class AreaParkirModel {
  // Cari area berdasarkan ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM area_parkir WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Ambil semua area parkir
  static async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM area_parkir ORDER BY nama_area ASC'
    );
    return rows;
  }

  // Cari area berdasarkan nama (unique)
  static async findByName(namaArea) {
    const [rows] = await pool.execute(
      'SELECT * FROM area_parkir WHERE nama_area = ?',
      [namaArea]
    );
    return rows[0];
  }

  // Tambah area parkir baru
  static async create(data) {
    const { namaArea, jenisArea, lokasi, kapasitas, hargaPerJam, deskripsi } = data;
    const [result] = await pool.execute(
      'INSERT INTO area_parkir (nama_area, jenis_area, lokasi, kapasitas, harga_per_jam, deskripsi) VALUES (?, ?, ?, ?, ?, ?)',
      [namaArea, jenisArea, lokasi, kapasitas, hargaPerJam, deskripsi]
    );
    return result.insertId;
  }

  // Update area parkir
  static async update(id, data) {
    const { namaArea, jenisArea, lokasi, kapasitas, hargaPerJam, deskripsi } = data;
    await pool.execute(
      'UPDATE area_parkir SET nama_area = ?, jenis_area = ?, lokasi = ?, kapasitas = ?, harga_per_jam = ?, deskripsi = ? WHERE id = ?',
      [namaArea, jenisArea, lokasi, kapasitas, hargaPerJam, deskripsi, id]
    );
  }

  // Hapus area parkir
  static async delete(id) {
    await pool.execute('DELETE FROM area_parkir WHERE id = ?', [id]);
  }

  // Hitung kendaraan yang sedang parkir di area
  static async hitungKendaraanAktif(areaId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as jumlah FROM transaksi_parkir WHERE area_parkir_id = ? AND status = "parkir"',
      [areaId]
    );
    return rows[0].jumlah;
  }

  // Dapatkan tarif parkir berdasarkan jenis kendaraan dan area
  static async getTarifByVehicleAndArea(jenisKendaraanId, areaId) {
    const [rows] = await pool.execute(
      'SELECT tarif_per_jam FROM tarif_parkir WHERE jenis_kendaraan_id = ? AND area_parkir_id = ?',
      [jenisKendaraanId, areaId]
    );
    return rows[0]?.tarif_per_jam || 0;
  }
}

module.exports = AreaParkirModel;
