const UserModel = require('../models/UserModel');
const { hashPassword, isValidEmail } = require('../utils/helpers');

/**
 * USER CONTROLLER
 * Menangani CRUD user (hanya untuk Admin)
 */
class UserController {
  /**
   * GET /api/users
   * Ambil semua user
   */
  static async getAll(req, res, next) {
    try {
      const users = await UserModel.findAll();
      
      res.status(200).json({
        success: true,
        data: users,
        total: users.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:id
   * Ambil user berdasarkan ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/role/:role
   * Ambil user berdasarkan role
   */
  static async getByRole(req, res, next) {
    try {
      const { role } = req.params;
      const validRoles = ['admin', 'petugas', 'owner'];

      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role tidak valid. Gunakan: admin, petugas, atau owner'
        });
      }

      const users = await UserModel.findByRole(role);

      res.status(200).json({
        success: true,
        data: users,
        total: users.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users
   * Tambah user baru
   */
  static async create(req, res, next) {
    try {
      const { nama, username, password, role, email, no_telp } = req.body;

      // Validasi input
      if (!nama || !username || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'Nama, username, password, dan role harus diisi'
        });
      }

      // Validasi role
      const validRoles = ['admin', 'petugas', 'owner'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role harus: admin, petugas, atau owner'
        });
      }

      // Validasi email jika ada
      if (email && !isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Format email tidak valid'
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Tambah user
      const userId = await UserModel.create({
        nama,
        username,
        password: hashedPassword,
        role,
        email: email || null,
        no_telp: no_telp || null
      });

      res.status(201).json({
        success: true,
        message: 'User berhasil ditambahkan',
        userId: userId
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/:id
   * Update user
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { nama, username, email, no_telp, aktif, role } = req.body;

      // Cek user ada atau tidak
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      // Validasi email jika ada
      if (email && !isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Format email tidak valid'
        });
      }

      // Validasi username unik jika username diubah
      if (username && username !== user.username) {
        const existingUser = await UserModel.findByUsername(username);
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Username sudah digunakan. Pilih username lain.'
          });
        }
      }

      // Validasi role jika ada
      if (role) {
        const validRoles = ['admin', 'petugas', 'owner'];
        if (!validRoles.includes(role)) {
          return res.status(400).json({
            success: false,
            message: 'Role harus: admin, petugas, atau owner'
          });
        }
      }

      // Update user
      await UserModel.update(id, {
        nama: nama || user.nama,
        username: username || user.username,
        email: email || user.email,
        no_telp: no_telp || user.no_telp,
        aktif: aktif !== undefined ? aktif : user.aktif,
        role: role || user.role
      });

      res.status(200).json({
        success: true,
        message: 'User berhasil diupdate'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/:id/password
   * Update password user
   */
  static async updatePassword(req, res, next) {
    try {
      const { id } = req.params;
      const { passwordBaru } = req.body;

      if (!passwordBaru) {
        return res.status(400).json({
          success: false,
          message: 'Password baru harus diisi'
        });
      }

      // Cek user
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(passwordBaru);

      // Update password
      await UserModel.updatePassword(id, hashedPassword);

      res.status(200).json({
        success: true,
        message: 'Password berhasil diupdate'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id
   * Hapus user
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Cek user
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      // Hapus user
      await UserModel.delete(id);

      res.status(200).json({
        success: true,
        message: 'User berhasil dihapus'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
