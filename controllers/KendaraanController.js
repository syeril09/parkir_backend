const KendaraanModel = require('../models/KendaraanModel');

/**
 * KENDARAAN CONTROLLER
 * Menangani CRUD kendaraan (hanya untuk Admin)
 */
class KendaraanController {
  /**
   * GET /api/kendaraan
   * Ambil semua kendaraan
   */
  static async getAll(req, res, next) {
    try {
      const kendaraan = await KendaraanModel.findAll();

      res.status(200).json({
        success: true,
        data: kendaraan,
        total: kendaraan.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/kendaraan/:id
   * Ambil kendaraan berdasarkan ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const kendaraan = await KendaraanModel.findById(id);

      if (!kendaraan) {
        return res.status(404).json({
          success: false,
          message: 'Kendaraan tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        data: kendaraan
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/kendaraan/plat/:platNomor
   * Cari kendaraan berdasarkan plat nomor
   */
  static async getByPlatNomor(req, res, next) {
    try {
      const { platNomor } = req.params;
      const kendaraan = await KendaraanModel.findByPlatNomor(platNomor);

      if (!kendaraan) {
        return res.status(404).json({
          success: false,
          message: 'Kendaraan tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        data: kendaraan
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/kendaraan
   * Tambah kendaraan baru
   */
  static async create(req, res, next) {
    try {
      const { platNomor, jenisKendaraanId, pemilikNama, pemilikNoTelp, warna } = req.body;
      console.log('✨ CREATE - req.body:', JSON.stringify(req.body));
      console.log('   ✓ platNomor:', platNomor, 'type:', typeof platNomor);
      console.log('   ✓ jenisKendaraanId:', jenisKendaraanId, 'type:', typeof jenisKendaraanId);

      // Validasi input
      if (!platNomor || !jenisKendaraanId) {
        console.log('❌ VALIDATION FAILED - platNomor:', platNomor, 'jenisKendaraanId:', jenisKendaraanId);
        return res.status(400).json({
          success: false,
          message: 'Plat nomor dan jenis kendaraan harus diisi'
        });
      }

      // Tambah kendaraan
      const kendaraanId = await KendaraanModel.create({
        platNomor,
        jenisKendaraanId,
        pemilikNama: pemilikNama || null,
        pemilikNoTelp: pemilikNoTelp || null,
        warna: warna || null
      });

      res.status(201).json({
        success: true,
        message: 'Kendaraan berhasil ditambahkan',
        kendaraanId: kendaraanId
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/kendaraan/:id
   * Update kendaraan
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { pemilikNama, pemilikNoTelp, warna, jenisKendaraanId, platNomor } = req.body;
      console.log('🔄 UPDATE received - id:', id, 'body:', req.body);

      // Cek kendaraan ada atau tidak
      const kendaraan = await KendaraanModel.findById(id);
      if (!kendaraan) {
        return res.status(404).json({
          success: false,
          message: 'Kendaraan tidak ditemukan'
        });
      }

      // Update kendaraan - now supports all fields including jenisKendaraanId
      await KendaraanModel.update(id, {
        platNomor: platNomor || kendaraan.plat_nomor,
        jenisKendaraanId: jenisKendaraanId || kendaraan.jenis_kendaraan_id,
        pemilikNama: pemilikNama || kendaraan.pemilik_nama,
        pemilikNoTelp: pemilikNoTelp || kendaraan.pemilik_no_telp,
        warna: warna || kendaraan.warna
      });

      res.status(200).json({
        success: true,
        message: 'Kendaraan berhasil diupdate'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/kendaraan/:id
   * Hapus kendaraan
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Cek kendaraan
      const kendaraan = await KendaraanModel.findById(id);
      if (!kendaraan) {
        return res.status(404).json({
          success: false,
          message: 'Kendaraan tidak ditemukan'
        });
      }

      // Hapus kendaraan
      await KendaraanModel.delete(id);

      res.status(200).json({
        success: true,
        message: 'Kendaraan berhasil dihapus'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = KendaraanController;
