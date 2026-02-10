const AreaParkirModel = require('../models/AreaParkirModel');
const KendaraanModel = require('../models/KendaraanModel');
const TarifParkirModel = require('../models/TarifParkirModel');

/**
 * AREA PARKIR CONTROLLER
 * Menangani CRUD area parkir (hanya untuk Admin)
 */
class AreaParkirController {
  /**
   * GET /api/area-parkir
   * Ambil semua area parkir dengan status kapasitas
   */
  static async getAll(req, res, next) {
    try {
      const areas = await AreaParkirModel.findAll();

      // Normalisasi field nama dan jenis, lalu hitung kendaraan aktif untuk setiap area
      const areasWithStatus = await Promise.all(
        areas.map(async (area) => {
          // normalisasi nama field dari DB (handle snake_case atau camelCase)
          const normalized = {
            id: area.id,
            nama: area.nama_area ?? area.nama ?? area.namaArea,
            jenisArea: area.jenis_area ?? 'mobil',
            lokasi: area.lokasi,
            kapasitas: area.kapasitas,
            hargaPerJam: area.harga_per_jam ?? area.hargaPerJam ?? 0,
            deskripsi: area.deskripsi ?? ''
          };

          const kendaraanAktif = await AreaParkirModel.hitungKendaraanAktif(area.id);
          const tersedia = normalized.kapasitas - kendaraanAktif;
          // fetch tarif for this area to include typed kendaraan name when available
          let jenisKendaraanName = undefined;
          try {
            const tarifs = await TarifParkirModel.findByArea(area.id);
            if (tarifs && tarifs.length > 0) {
              jenisKendaraanName = tarifs[0].nama_jenis || tarifs[0].namaJenis;
              console.log(`[DEBUG AREA ${area.id}] Found ${tarifs.length} tarifs. First: nama_jenis="${jenisKendaraanName}"`);
            }
          } catch (e) {
            console.error(`[WARNING] Failed to fetch tarifs for area ${area.id}:`, e.message);
          }
          return {
            ...normalized,
            jenisKendaraanName,
            kendaraanAktif,
            tersedia,
            persentasiPenuh: Math.round((kendaraanAktif / normalized.kapasitas) * 100)
          };
        })
      );

      res.status(200).json({
        success: true,
        data: areasWithStatus,
        total: areasWithStatus.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/area-parkir/:id
   * Ambil area parkir berdasarkan ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const area = await AreaParkirModel.findById(id);

      if (!area) {
        return res.status(404).json({
          success: false,
          message: 'Area parkir tidak ditemukan'
        });
      }

      const kendaraanAktif = await AreaParkirModel.hitungKendaraanAktif(id);
      const normalized = {
        id: area.id,
        nama: area.nama_area ?? area.nama ?? area.namaArea,
        jenisArea: area.jenis_area ?? 'mobil',
        lokasi: area.lokasi,
        kapasitas: area.kapasitas,
        hargaPerJam: area.harga_per_jam ?? area.hargaPerJam ?? 0,
        deskripsi: area.deskripsi ?? ''
      };
      const tersedia = normalized.kapasitas - kendaraanAktif;
      // try to fetch tarif(s) for this area and include typed kendaraan name
      let jenisKendaraanName = undefined;
      try {
        const tarifs = await TarifParkirModel.findByArea(id);
        if (tarifs && tarifs.length > 0) jenisKendaraanName = tarifs[0].nama_jenis ?? tarifs[0].namaJenis;
      } catch (e) {
        // ignore
      }

      const areaWithStatus = {
        ...normalized,
        jenisKendaraanName,
        kendaraanAktif,
        tersedia,
        persentasiPenuh: Math.round((kendaraanAktif / normalized.kapasitas) * 100)
      };

      res.status(200).json({
        success: true,
        data: areaWithStatus
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/area-parkir
   * Tambah area parkir baru
   */
  static async create(req, res, next) {
    try {
      const { namaArea, jenisArea, lokasi, kapasitas, hargaPerJam, deskripsi, jenisKendaraanId, jenisKendaraanName } = req.body;

      // Validasi input
      if (!namaArea || !kapasitas || !hargaPerJam) {
        return res.status(400).json({
          success: false,
          message: 'Nama area, kapasitas, dan harga per jam harus diisi'
        });
      }

      // Validasi kapasitas dan harga
      if (kapasitas <= 0 || hargaPerJam <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Kapasitas dan harga harus lebih besar dari 0'
        });
      }

      // Derive jenisArea from jenisKendaraanName or use provided jenisArea
      let area_jenis = jenisArea || 'mobil';
      if (!jenisArea && jenisKendaraanName) {
        const nameLower = String(jenisKendaraanName).toLowerCase();
        if (nameLower.includes('motor') || nameLower.includes('sepeda')) area_jenis = 'motor';
        else if (nameLower.includes('bus')) area_jenis = 'bus';
        else area_jenis = 'mobil'; // default: Mobil, Truk, Avanza, etc.
      }

      // Validasi jenis area
      const validJenis = ['mobil', 'bus', 'motor'];
      if (!validJenis.includes(area_jenis)) {
        return res.status(400).json({
          success: false,
          message: 'Jenis area harus: mobil, bus, atau motor'
        });
      }

      // Check if area with same name exists; if so, update it instead to avoid duplicate key errors
      let areaId;
      const existing = await AreaParkirModel.findByName(namaArea);
      if (existing) {
        areaId = existing.id;
        await AreaParkirModel.update(areaId, {
          namaArea,
          jenisArea: area_jenis,
          lokasi: lokasi !== undefined ? lokasi : existing.lokasi,
          kapasitas: kapasitas || existing.kapasitas,
          hargaPerJam: hargaPerJam || existing.harga_per_jam,
          deskripsi: deskripsi !== undefined ? deskripsi : existing.deskripsi
        });
      } else {
        // Tambah area
        areaId = await AreaParkirModel.create({
          namaArea,
          jenisArea: area_jenis,
          lokasi: lokasi || null,
          kapasitas,
          hargaPerJam,
          deskripsi: deskripsi || null
        });
      }

      // If frontend provided a jenis kendaraan (id or name), ensure jenis exists and upsert tarif for this area
      try {
        let jenisId = jenisKendaraanId ?? null;
        if (!jenisId && jenisKendaraanName) {
          console.log(`[UPSERT] Searching jenis for: "${jenisKendaraanName}"`);
          // find existing jenis by name
          const allJenis = await KendaraanModel.findAllJenisKendaraan();
          const found = allJenis.find(j => j.nama_jenis.toLowerCase() === String(jenisKendaraanName).toLowerCase());
          if (found) {
            jenisId = found.id;
            console.log(`[UPSERT] Found existing jenis ID: ${jenisId}`);
          } else {
            jenisId = await KendaraanModel.createJenisKendaraan(jenisKendaraanName);
            console.log(`[UPSERT] Created new jenis ID: ${jenisId}`);
          }
        }

        if (jenisId) {
          const tarifValue = hargaPerJam || (existing ? existing.harga_per_jam : 0);
          await TarifParkirModel.upsertForArea(jenisId, areaId, tarifValue);
          console.log(`[UPSERT SUCCESS] Area ID ${areaId}, Jenis ID ${jenisId}, Tarif ${tarifValue}`);
        }
      } catch (e) {
        // don't fail area creation if tarif upsert fails; just log
        console.error('⚠️ Warning: failed to upsert tarif for area:', e.message, e);
      }

      const statusCode = existing ? 200 : 201;
      res.status(statusCode).json({
        success: true,
        message: existing ? 'Area parkir sudah ada, data diperbarui' : 'Area parkir berhasil ditambahkan',
        areaId: areaId
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/area-parkir/:id
   * Update area parkir
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { namaArea, jenisArea, lokasi, kapasitas, hargaPerJam, deskripsi, jenisKendaraanId, jenisKendaraanName } = req.body;

      // Cek area ada atau tidak
      const area = await AreaParkirModel.findById(id);
      if (!area) {
        return res.status(404).json({
          success: false,
          message: 'Area parkir tidak ditemukan'
        });
      }

      // Validasi jenis area jika ada input
      if (jenisArea) {
        const validJenis = ['mobil', 'bus', 'motor'];
        if (!validJenis.includes(jenisArea)) {
          return res.status(400).json({
            success: false,
            message: 'Jenis area harus: mobil, bus, atau motor'
          });
        }
      }

      // Validasi kapasitas dan harga jika ada input
      if ((kapasitas && kapasitas <= 0) || (hargaPerJam && hargaPerJam <= 0)) {
        return res.status(400).json({
          success: false,
          message: 'Kapasitas dan harga harus lebih besar dari 0'
        });
      }

      // Update area
      await AreaParkirModel.update(id, {
        namaArea: namaArea || area.nama_area,
        jenisArea: jenisArea || area.jenis_area,
        lokasi: lokasi !== undefined ? lokasi : area.lokasi,
        kapasitas: kapasitas || area.kapasitas,
        hargaPerJam: hargaPerJam || area.harga_per_jam,
        deskripsi: deskripsi !== undefined ? deskripsi : area.deskripsi
      });

      // If frontend passed jenis info, resolve and upsert tarif for this area
      try {
        let jenisId = jenisKendaraanId ?? null;
        if (!jenisId && jenisKendaraanName) {
          const allJenis = await KendaraanModel.findAllJenisKendaraan();
          const found = allJenis.find(j => j.nama_jenis.toLowerCase() === String(jenisKendaraanName).toLowerCase());
          if (found) jenisId = found.id;
          else {
            jenisId = await KendaraanModel.createJenisKendaraan(jenisKendaraanName);
          }
        }

        if (jenisId) {
          await TarifParkirModel.upsertForArea(jenisId, id, hargaPerJam || area.harga_per_jam || 0);
        }
      } catch (e) {
        console.error('⚠️ Warning: failed to upsert tarif for area (update):', e);
      }

      res.status(200).json({
        success: true,
        message: 'Area parkir berhasil diupdate'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/area-parkir/:id
   * Hapus area parkir
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Cek area
      const area = await AreaParkirModel.findById(id);
      if (!area) {
        return res.status(404).json({
          success: false,
          message: 'Area parkir tidak ditemukan'
        });
      }

      // Remove all transactions referencing this area to avoid FK constraint errors.
      try {
        await require('../config/database').execute(
          'DELETE FROM transaksi_parkir WHERE area_parkir_id = ?',
          [id]
        );
      } catch (e) {
        console.error('⚠️ Warning: gagal menghapus transaksi terkait area sebelum menghapus area:', e.message || e);
      }

      // Hapus tarif terkait area
      try {
        await TarifParkirModel.deleteByArea(id);
      } catch (e) {
        console.error('⚠️ Warning: gagal menghapus tarif terkait area sebelum menghapus area:', e.message || e);
      }

      // Hapus area
      await AreaParkirModel.delete(id);

      res.status(200).json({
        success: true,
        message: 'Area parkir berhasil dihapus'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AreaParkirController;
