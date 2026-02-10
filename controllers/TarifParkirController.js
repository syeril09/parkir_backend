const TarifParkirModel = require('../models/TarifParkirModel');
const KendaraanModel = require('../models/KendaraanModel');
const AreaParkirModel = require('../models/AreaParkirModel');

/**
 * TARIF PARKIR CONTROLLER
 * Menangani CRUD tarif parkir (hanya untuk Admin)
 */
class TarifParkirController {
  /**
   * GET /api/tarif-parkir
   * Ambil semua tarif parkir
   */
  static async getAll(req, res, next) {
    try {
      const tarifs = await TarifParkirModel.findAll();

      res.status(200).json({
        success: true,
        data: tarifs,
        total: tarifs.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tarif-parkir/:id
   * Ambil tarif parkir berdasarkan ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const tarif = await TarifParkirModel.findById(id);

      if (!tarif) {
        return res.status(404).json({
          success: false,
          message: 'Tarif parkir tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        data: tarif
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tarif-parkir/vehicle/:vehicleTypeId
   * Ambil semua tarif untuk jenis kendaraan tertentu
   */
  static async getByVehicleType(req, res, next) {
    try {
      const { vehicleTypeId } = req.params;
      const tarifs = await TarifParkirModel.findByVehicleType(vehicleTypeId);

      res.status(200).json({
        success: true,
        data: tarifs,
        total: tarifs.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tarif-parkir/area/:areaId
   * Ambil semua tarif untuk area tertentu
   */
  static async getByArea(req, res, next) {
    try {
      const { areaId } = req.params;
      const tarifs = await TarifParkirModel.findByArea(areaId);

      res.status(200).json({
        success: true,
        data: tarifs,
        total: tarifs.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/tarif-parkir
   * Tambah tarif parkir baru
   */
  static async create(req, res, next) {
    try {
      const { namaJenis, tarifPerJam } = req.body;

      // Validasi input
      if (!namaJenis || !tarifPerJam) {
        return res.status(400).json({
          success: false,
          message: 'Jenis kendaraan dan tarif per jam harus diisi'
        });
      }

      // Validasi tarif minimal
      if (tarifPerJam <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Tarif per jam harus lebih dari 0'
        });
      }

      // Cek jenis kendaraan sudah ada atau tidak, jika tidak ada buat baru
      let jenisKendaraanId;
      const allJenis = await KendaraanModel.findAllJenisKendaraan();
      const existingJenis = allJenis.find(j => j.nama_jenis.toLowerCase() === namaJenis.toLowerCase());
      
      if (existingJenis) {
        jenisKendaraanId = existingJenis.id;
        console.log(`[TARIF CREATE] Found existing jenis: "${namaJenis}" (ID: ${jenisKendaraanId})`);
        // Cek kombinasi jenis kendaraan sudah ada di tarif
        const existingTarif = await TarifParkirModel.findByVehicleType(jenisKendaraanId);
        if (existingTarif && existingTarif.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Tarif untuk ${namaJenis} sudah ada`
          });
        }
      } else {
        // Buat jenis kendaraan baru
        jenisKendaraanId = await KendaraanModel.createJenisKendaraan(namaJenis);
        console.log(`[TARIF CREATE] Created new jenis: "${namaJenis}" (ID: ${jenisKendaraanId})`);
      }

      // Tambah tarif
      const tarifId = await TarifParkirModel.create({
        jenisKendaraanId,
        tarifPerJam
      });
      console.log(`[TARIF CREATE SUCCESS] Tarif ID: ${tarifId}, Jenis ID: ${jenisKendaraanId}, Tarif: ${tarifPerJam}`);

      // Fetch tarif yang baru dibuat
      const tarifCreated = await TarifParkirModel.findById(tarifId);

      res.status(201).json({
        success: true,
        message: 'Tarif parkir berhasil ditambahkan',
        tarifId: tarifId,
        data: tarifCreated
      });
    } catch (error) {
      console.error('[TARIF CREATE ERROR]', error.message);
      next(error);
    }
  }

  /**
   * PUT /api/tarif-parkir/:id
   * Update tarif parkir
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { namaJenis, tarifPerJam } = req.body;

      // Cek tarif ada atau tidak
      const tarif = await TarifParkirModel.findById(id);
      if (!tarif) {
        return res.status(404).json({
          success: false,
          message: 'Tarif parkir tidak ditemukan'
        });
      }

      // Validasi tarif minimal
      if (tarifPerJam && tarifPerJam <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Tarif per jam harus lebih dari 0'
        });
      }

      // Handle jenis kendaraan update
      let jenisKendaraanId = tarif.jenis_kendaraan_id;
      if (namaJenis && namaJenis !== tarif.nama_jenis) {
        // Cek jenis kendaraan baru sudah ada atau tidak
        const allJenis = await KendaraanModel.findAllJenisKendaraan();
        const existingJenis = allJenis.find(j => j.nama_jenis.toLowerCase() === namaJenis.toLowerCase());
        
        if (existingJenis) {
          jenisKendaraanId = existingJenis.id;
        } else {
          // Buat jenis kendaraan baru
          jenisKendaraanId = await KendaraanModel.createJenisKendaraan(namaJenis);
        }
      }

      // Update tarif
      await TarifParkirModel.update(id, {
        jenisKendaraanId,
        tarifPerJam: tarifPerJam || tarif.tarif_per_jam
      });

      // Fetch tarif yang sudah diupdate
      const tarifUpdated = await TarifParkirModel.findById(id);

      res.status(200).json({
        success: true,
        message: 'Tarif parkir berhasil diupdate',
        data: tarifUpdated
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/tarif-parkir/:id
   * Hapus tarif parkir
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Cek tarif ada atau tidak
      const tarif = await TarifParkirModel.findById(id);
      if (!tarif) {
        return res.status(404).json({
          success: false,
          message: 'Tarif parkir tidak ditemukan'
        });
      }

      // Hapus tarif
      await TarifParkirModel.delete(id);

      res.status(200).json({
        success: true,
        message: 'Tarif parkir berhasil dihapus',
        data: { id }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TarifParkirController;
