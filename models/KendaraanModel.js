const db = require('../config/database');

/**
 * KENDARAAN MODEL
 * Menangani semua query terkait kendaraan
 */
const KendaraanModel = {
  // Cari kendaraan berdasarkan plat nomor
  findByPlatNomor: async (platNomor) => {
    const [rows] = await db.execute(
      `SELECT k.*, j.nama_jenis 
       FROM kendaraan k 
       JOIN jenis_kendaraan j ON k.jenis_kendaraan_id = j.id 
       WHERE k.plat_nomor = ?`,
      [platNomor]
    );
    return rows[0];
  },

  // Cari kendaraan berdasarkan ID
  findById: async (id) => {
    const [rows] = await db.execute(
      `SELECT k.*, j.nama_jenis 
       FROM kendaraan k 
       JOIN jenis_kendaraan j ON k.jenis_kendaraan_id = j.id 
       WHERE k.id = ?`,
      [id]
    );
    return rows[0];
  },

  // Ambil semua kendaraan
  findAll: async () => {
    const [rows] = await db.execute(
      `SELECT k.*, j.nama_jenis 
       FROM kendaraan k 
       JOIN jenis_kendaraan j ON k.jenis_kendaraan_id = j.id 
       ORDER BY k.created_at DESC`
    );
    return rows;
  },

  // Tambah kendaraan baru
  create: async (data) => {
    const { platNomor, jenisKendaraanId, pemilikNama, pemilikNoTelp, warna } = data;
    console.log('📝 KendaraanModel.create - data:', data);
    console.log('   ✓ jenisKendaraanId:', jenisKendaraanId, 'type:', typeof jenisKendaraanId);
    const [result] = await db.execute(
      'INSERT INTO kendaraan (plat_nomor, jenis_kendaraan_id, pemilik_nama, pemilik_no_telp, warna) VALUES (?, ?, ?, ?, ?)',
      [platNomor, jenisKendaraanId, pemilikNama, pemilikNoTelp, warna]
    );
    console.log('   ✅ Inserted - id:', result.insertId);
    return result.insertId;
  },

  // Update kendaraan - supports all fields
  update: async (id, data) => {
    const { platNomor, jenisKendaraanId, pemilikNama, pemilikNoTelp, warna } = data;
    const updateFields = [];
    const updateValues = [];
    
    if (platNomor) { updateFields.push('plat_nomor = ?'); updateValues.push(platNomor); }
    if (jenisKendaraanId) { updateFields.push('jenis_kendaraan_id = ?'); updateValues.push(jenisKendaraanId); }
    if (pemilikNama !== undefined) { updateFields.push('pemilik_nama = ?'); updateValues.push(pemilikNama); }
    if (pemilikNoTelp !== undefined) { updateFields.push('pemilik_no_telp = ?'); updateValues.push(pemilikNoTelp); }
    if (warna !== undefined) { updateFields.push('warna = ?'); updateValues.push(warna); }
    
    if (updateFields.length === 0) return; // Nothing to update
    
    updateValues.push(id); // Add id for WHERE clause
    const query = `UPDATE kendaraan SET ${updateFields.join(', ')} WHERE id = ?`;
    console.log('🔄 UPDATE query:', query, 'values:', updateValues);
    
    await db.execute(query, updateValues);
  },

  // Hapus kendaraan
  delete: async (id) => {
    await db.execute('DELETE FROM kendaraan WHERE id = ?', [id]);
  },

  // Cari jenis kendaraan berdasarkan ID
  findJenisKendaraanById: async (id) => {
    const [rows] = await db.execute(
      'SELECT * FROM jenis_kendaraan WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  // Ambil semua jenis kendaraan
  findAllJenisKendaraan: async () => {
    const [rows] = await db.execute(
      'SELECT * FROM jenis_kendaraan ORDER BY nama_jenis ASC'
    );
    return rows;
  },

  // Buat jenis kendaraan baru
  createJenisKendaraan: async (namJenis) => {
    const [result] = await db.execute(
      'INSERT INTO jenis_kendaraan (nama_jenis) VALUES (?)',
      [namJenis]
    );
    return result.insertId;
  }
};

module.exports = KendaraanModel;
