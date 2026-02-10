const pool = require('../config/database');

/**
 * TRANSAKSI PARKIR MODEL
 * Menangani semua query terkait transaksi parkir
 */
class TransaksiParkirModel {
  // Cari transaksi berdasarkan ID
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT t.id, t.kendaraan_id, t.area_parkir_id, t.petugas_masuk_id, t.petugas_keluar_id,
              t.waktu_masuk, t.waktu_keluar, t.durasi_jam, t.tarif_per_jam, t.total_bayar, t.status,
              t.created_at, t.updated_at,
              k.plat_nomor, jk.nama_jenis,
              a.nama_area,
              u1.nama as petugas_masuk_nama,
              u2.nama as petugas_keluar_nama
       FROM transaksi_parkir t
       JOIN kendaraan k ON t.kendaraan_id = k.id
       JOIN jenis_kendaraan jk ON k.jenis_kendaraan_id = jk.id
       JOIN area_parkir a ON t.area_parkir_id = a.id
       JOIN users u1 ON t.petugas_masuk_id = u1.id
       LEFT JOIN users u2 ON t.petugas_keluar_id = u2.id
       WHERE t.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Ambil transaksi yang sedang aktif (belum keluar) berdasarkan plat nomor
  static async findAktifByPlatNomor(platNomor) {
    const [rows] = await pool.execute(
      `SELECT t.id, t.kendaraan_id, t.area_parkir_id, t.petugas_masuk_id, t.petugas_keluar_id,
              t.waktu_masuk, t.waktu_keluar, t.durasi_jam, t.tarif_per_jam, t.total_bayar, t.status,
              t.created_at, t.updated_at,
              k.plat_nomor, jk.nama_jenis,
              a.nama_area,
              u1.nama as petugas_masuk_nama,
              u2.nama as petugas_keluar_nama
       FROM transaksi_parkir t
       JOIN kendaraan k ON t.kendaraan_id = k.id
       JOIN jenis_kendaraan jk ON k.jenis_kendaraan_id = jk.id
       JOIN area_parkir a ON t.area_parkir_id = a.id
       JOIN users u1 ON t.petugas_masuk_id = u1.id
       LEFT JOIN users u2 ON t.petugas_keluar_id = u2.id
       WHERE k.plat_nomor = ? AND t.status = 'parkir'`,
      [platNomor]
    );
    return rows[0];
  }

  // Ambil semua transaksi
  static async findAll(limit = 100, offset = 0) {
    const [rows] = await pool.execute(
      `SELECT t.id, t.kendaraan_id, t.area_parkir_id, t.petugas_masuk_id, t.petugas_keluar_id,
              t.waktu_masuk, t.waktu_keluar, t.durasi_jam, t.tarif_per_jam, t.total_bayar, t.status,
              t.created_at, t.updated_at,
              k.plat_nomor, jk.nama_jenis,
              a.nama_area,
              u1.nama as petugas_masuk_nama,
              u2.nama as petugas_keluar_nama
       FROM transaksi_parkir t
       JOIN kendaraan k ON t.kendaraan_id = k.id
       JOIN jenis_kendaraan jk ON k.jenis_kendaraan_id = jk.id
       JOIN area_parkir a ON t.area_parkir_id = a.id
       JOIN users u1 ON t.petugas_masuk_id = u1.id
       LEFT JOIN users u2 ON t.petugas_keluar_id = u2.id
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  }

  // Ambil transaksi berdasarkan tanggal
  static async findByDateRange(startDate, endDate) {
    const [rows] = await pool.execute(
      `SELECT t.id, t.kendaraan_id, t.area_parkir_id, t.petugas_masuk_id, t.petugas_keluar_id,
              t.waktu_masuk, t.waktu_keluar, t.durasi_jam, t.tarif_per_jam, t.total_bayar, t.status,
              t.created_at, t.updated_at,
              k.plat_nomor, jk.nama_jenis,
              a.nama_area,
              u1.nama as petugas_masuk_nama,
              u2.nama as petugas_keluar_nama
       FROM transaksi_parkir t
       JOIN kendaraan k ON t.kendaraan_id = k.id
       JOIN jenis_kendaraan jk ON k.jenis_kendaraan_id = jk.id
       JOIN area_parkir a ON t.area_parkir_id = a.id
       JOIN users u1 ON t.petugas_masuk_id = u1.id
       LEFT JOIN users u2 ON t.petugas_keluar_id = u2.id
       WHERE t.waktu_masuk >= ? AND t.waktu_masuk <= ?
       ORDER BY t.waktu_masuk DESC`,
      [startDate, endDate]
    );
    return rows;
  }

  // Buat transaksi parkir (kendaraan masuk)
  static async createMasuk(data) {
    const { kendaraanId, areaParkId, petugasMasukId, waktuMasuk, tarifPerJam } = data;
    try {
      console.log('TransaksiModel.createMasuk called with:', data);
      const [result] = await pool.execute(
        `INSERT INTO transaksi_parkir 
         (kendaraan_id, area_parkir_id, petugas_masuk_id, waktu_masuk, tarif_per_jam, status) 
         VALUES (?, ?, ?, ?, ?, 'parkir')`,
        [kendaraanId, areaParkId, petugasMasukId, waktuMasuk, tarifPerJam]
      );
      console.log('DB insert result:', result);
      return result.insertId;
    } catch (error) {
      console.error('Error in createMasuk:', error);
      throw error;
    }
  }

  // Update transaksi parkir (kendaraan keluar)
  static async updateKeluar(id, data) {
    const { petugasKeluarId, waktuKeluar, durasiJam, totalBayar } = data;
    await pool.execute(
      `UPDATE transaksi_parkir 
       SET petugas_keluar_id = ?, waktu_keluar = ?, durasi_jam = ?, total_bayar = ?, status = 'selesai' 
       WHERE id = ?`,
      [petugasKeluarId, waktuKeluar, durasiJam, totalBayar, id]
    );
  }

  // Update transaksi parkir (pembayaran)
  static async updatePembayaran(id, data) {
    const { metode_pembayaran, uang_diterima, kembalian, waktu_pembayaran } = data;
    await pool.execute(
      `UPDATE transaksi_parkir 
       SET metode_pembayaran = ?, uang_diterima = ?, kembalian = ?, waktu_pembayaran = ?
       WHERE id = ?`,
      [metode_pembayaran, uang_diterima, kembalian, waktu_pembayaran, id]
    );
  }

  // Ambil laporan transaksi by area
  static async getLaporanByArea(startDate, endDate, areaId = null) {
    let query = `
      SELECT 
        a.id, a.nama_area, 
        COUNT(t.id) as total_transaksi,
        SUM(t.total_bayar) as total_pendapatan
      FROM area_parkir a
      LEFT JOIN transaksi_parkir t ON a.id = t.area_parkir_id
      WHERE t.waktu_masuk IS NULL OR (t.waktu_masuk >= ? AND t.waktu_masuk <= ?)
    `;
    const params = [startDate, endDate];

    if (areaId) {
      query += ' AND a.id = ?';
      params.push(areaId);
    }

    query += ' GROUP BY a.id, a.nama_area';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Ambil laporan transaksi by jenis kendaraan
  static async getLaporanByKendaraan(startDate, endDate) {
    const [rows] = await pool.execute(
      `SELECT 
        jk.id, jk.nama_jenis,
        COUNT(t.id) as total_transaksi,
        SUM(t.total_bayar) as total_pendapatan
      FROM jenis_kendaraan jk
      LEFT JOIN kendaraan k ON jk.id = k.jenis_kendaraan_id
      LEFT JOIN transaksi_parkir t ON k.id = t.kendaraan_id
      WHERE t.waktu_masuk IS NULL OR (t.waktu_masuk >= ? AND t.waktu_masuk <= ?)
      GROUP BY jk.id, jk.nama_jenis`,
      [startDate, endDate]
    );
    return rows;
  }
}

module.exports = TransaksiParkirModel;
