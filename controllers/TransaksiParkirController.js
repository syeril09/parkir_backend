const TransaksiParkirModel = require('../models/TransaksiParkirModel');
const KendaraanModel = require('../models/KendaraanModel');
const AreaParkirModel = require('../models/AreaParkirModel');
const { hitungDurasiParkir, hitungBiayaParkir } = require('../utils/helpers');

/**
 * TRANSAKSI PARKIR CONTROLLER
 * Menangani transaksi parkir (masuk & keluar)
 */
class TransaksiParkirController {
  /**
   * GET /api/transaksi
   * Ambil semua transaksi parkir dengan pagination
   */
  static async getAll(req, res, next) {
    try {
      const page = req.query.page || 1;
      const limit = 50;
      const offset = (page - 1) * limit;

      const transaksi = await TransaksiParkirModel.findAll(limit, offset);

      res.status(200).json({
        success: true,
        data: transaksi,
        total: transaksi.length,
        page: page,
        limit: limit
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/transaksi/:id
   * Ambil transaksi parkir berdasarkan ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const transaksi = await TransaksiParkirModel.findById(id);

      if (!transaksi) {
        return res.status(404).json({
          success: false,
          message: 'Transaksi tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        data: transaksi
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/transaksi/masuk
   * Kendaraan masuk area parkir
   * Required: plat_nomor, area_id
   */
  static async masuk(req, res, next) {
    try {
      const { platNomor, areaId } = req.body;
      const petugasId = req.user?.userId;

      console.log('=== TRANSAKSI MASUK REQUEST ===');
      console.log('Body:', req.body);
      console.log('Petugas ID from token:', petugasId);

      // Validasi input
      if (!platNomor || !areaId) {
        return res.status(400).json({
          success: false,
          message: 'Plat nomor dan area parkir harus diisi'
        });
      }

      // Cek kendaraan ada atau tidak
      const kendaraan = await KendaraanModel.findByPlatNomor(platNomor);
      if (!kendaraan) {
        return res.status(404).json({
          success: false,
          message: `Kendaraan dengan plat ${platNomor} tidak ditemukan. Silakan tambahkan terlebih dahulu.`
        });
      }

      // Cek apakah kendaraan sudah parkir di area lain (status masih aktif)
      const transaksiAktif = await TransaksiParkirModel.findAktifByPlatNomor(platNomor);
      if (transaksiAktif) {
        return res.status(400).json({
          success: false,
          message: `Kendaraan ini masih parkir di area ${transaksiAktif.nama_area}. Silakan lakukan checkout terlebih dahulu.`
        });
      }

      // Cek area parkir
      const area = await AreaParkirModel.findById(areaId);
      if (!area) {
        return res.status(404).json({
          success: false,
          message: 'Area parkir tidak ditemukan'
        });
      }

      // Cek kapasitas area
      const kendaraanAktif = await AreaParkirModel.hitungKendaraanAktif(areaId);
      if (kendaraanAktif >= area.kapasitas) {
        return res.status(400).json({
          success: false,
          message: `Area parkir ${area.nama_area} sudah penuh. Kapasitas maksimal ${area.kapasitas}.`
        });
      }

      // Gunakan tarif dari area (harga_per_jam)
      const tarifPerJam = area.harga_per_jam || 0;
      if (tarifPerJam <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Tarif parkir untuk area ini belum ditentukan. Hubungi admin.'
        });
      }

      // Buat transaksi masuk
      const transId = await TransaksiParkirModel.createMasuk({
        kendaraanId: kendaraan.id,
        areaParkId: areaId,
        petugasMasukId: petugasId,
        waktuMasuk: new Date(),
        tarifPerJam: tarifPerJam
      });

      console.log('Inserted transaksi ID:', transId);

      // Fetch transaksi yang baru dibuat untuk menampilkan data lengkap
      const transaksiCreated = await TransaksiParkirModel.findById(transId);

      console.log('Fetched created transaksi:', transaksiCreated);

      res.status(201).json({
        success: true,
        message: 'Kendaraan berhasil masuk area parkir',
        transaksiId: transId,
        data: transaksiCreated
      });
    } catch (error) {
      console.error('Error in masuk controller:', error);
      next(error);
    }
  }

  /**
   * POST /api/transaksi/keluar
   * Kendaraan keluar dari area parkir
   * Required: plat_nomor
   */
  static async keluar(req, res, next) {
    try {
      const { platNomor } = req.body;
      const petugasId = req.user.userId;

      // Validasi input
      if (!platNomor) {
        return res.status(400).json({
          success: false,
          message: 'Plat nomor harus diisi'
        });
      }

      // Cari transaksi aktif
      const transaksiAktif = await TransaksiParkirModel.findAktifByPlatNomor(platNomor);
      if (!transaksiAktif) {
        return res.status(404).json({
          success: false,
          message: `Kendaraan dengan plat ${platNomor} tidak ada di area parkir atau sudah checkout.`
        });
      }

      // Hitung durasi parkir
      const waktuKeluar = new Date();
      const durasiJam = hitungDurasiParkir(transaksiAktif.waktu_masuk, waktuKeluar);
      const totalBayar = hitungBiayaParkir(durasiJam, transaksiAktif.tarif_per_jam);

      // Update transaksi keluar
      await TransaksiParkirModel.updateKeluar(transaksiAktif.id, {
        petugasKeluarId: petugasId,
        waktuKeluar: waktuKeluar,
        durasiJam: durasiJam,
        totalBayar: totalBayar
      });

      // Fetch transaksi yang sudah diupdate untuk menampilkan data lengkap
      const transaksiUpdated = await TransaksiParkirModel.findById(transaksiAktif.id);

      res.status(200).json({
        success: true,
        message: 'Kendaraan berhasil checkout',
        transaksiId: transaksiAktif.id,
        data: transaksiUpdated
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/transaksi/:id
   * Update transaksi parkir (pembayaran)
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { metode_pembayaran, uang_diterima, kembalian, waktu_pembayaran } = req.body;

      console.log('=== UPDATE PEMBAYARAN ===');
      console.log('ID:', id);
      console.log('Data:', { metode_pembayaran, uang_diterima, kembalian, waktu_pembayaran });

      // Validasi input
      if (!metode_pembayaran) {
        return res.status(400).json({
          success: false,
          message: 'Metode pembayaran harus diisi (cash/qris)'
        });
      }

      if (!['cash', 'qris'].includes(metode_pembayaran)) {
        return res.status(400).json({
          success: false,
          message: 'Metode pembayaran harus cash atau qris'
        });
      }

      // Cek transaksi
      const transaksi = await TransaksiParkirModel.findById(id);
      if (!transaksi) {
        return res.status(404).json({
          success: false,
          message: 'Transaksi tidak ditemukan'
        });
      }

      console.log('Transaksi ditemukan:', transaksi.id, transaksi.plat_nomor);

      // Update transaksi
      await TransaksiParkirModel.updatePembayaran(id, {
        metode_pembayaran,
        uang_diterima: uang_diterima || transaksi.total_bayar,
        kembalian: kembalian || 0,
        waktu_pembayaran: waktu_pembayaran || new Date().toISOString().slice(0, 19).replace('T', ' ')
      });

      console.log('Update selesai');

      // Fetch transaksi yang sudah diupdate
      const transaksiUpdated = await TransaksiParkirModel.findById(id);

      res.status(200).json({
        success: true,
        message: 'Pembayaran berhasil diproses',
        data: transaksiUpdated
      });
    } catch (error) {
      console.error('Error di update pembayaran:', error);
      next(error);
    }
  }

  /**
   * GET /api/transaksi/laporan/range
   * Ambil laporan transaksi berdasarkan rentang tanggal
   * Query: start_date, end_date (format: YYYY-MM-DD)
   */
  static async getLaporanByRange(req, res, next) {
    try {
      const { start_date, end_date } = req.query;

      // Validasi input
      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Tanggal mulai dan tanggal akhir harus diisi (format: YYYY-MM-DD)'
        });
      }

      // Validasi format tanggal
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (isNaN(startDate) || isNaN(endDate)) {
        return res.status(400).json({
          success: false,
          message: 'Format tanggal tidak valid (gunakan YYYY-MM-DD)'
        });
      }

      // Set waktu end_date ke akhir hari
      endDate.setHours(23, 59, 59, 999);

      // Ambil transaksi
      const transaksi = await TransaksiParkirModel.findByDateRange(startDate, endDate);

      // Hitung total
      const totalTransaksi = transaksi.length;
      const totalPendapatan = transaksi.reduce((sum, t) => sum + (t.total_bayar || 0), 0);

      res.status(200).json({
        success: true,
        message: `Laporan transaksi dari ${start_date} hingga ${end_date}`,
        summary: {
          totalTransaksi,
          totalPendapatan,
          startDate,
          endDate
        },
        data: transaksi
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/transaksi/laporan/area
   * Ambil laporan transaksi grouped by area
   */
  static async getLaporanByArea(req, res, next) {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Tanggal mulai dan tanggal akhir harus diisi'
        });
      }

      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      endDate.setHours(23, 59, 59, 999);

      const laporan = await TransaksiParkirModel.getLaporanByArea(startDate, endDate);

      res.status(200).json({
        success: true,
        data: laporan
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TransaksiParkirController;
