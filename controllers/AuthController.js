const UserModel = require('../models/UserModel');
const { generateToken, hashPassword, comparePassword } = require('../utils/helpers');

/**
 * AUTH CONTROLLER
 * Menangani proses login dan logout
 */
class AuthController {
  /**
   * POST /api/auth/register
   * Registrasi user baru
   */
  static async register(req, res, next) {
    try {
      const { nama, username, password, role, email } = req.body;

      console.log('📝 Register attempt:', { nama, username, role, email });

      // Validasi input
      if (!nama || !username || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'Nama, username, password, dan role harus diisi'
        });
      }

      // Validasi role
      const validRoles = ['admin', 'owner', 'petugas'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role harus salah satu dari: admin, owner, petugas'
        });
      }

      // Cek apakah username sudah ada
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username sudah digunakan'
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Buat user baru
      const userData = {
        nama,
        username,
        password: hashedPassword,
        role,
        email: email || null
      };

      const userId = await UserModel.create(userData);
      console.log('✅ User created with ID:', userId);

      // Generate token untuk login otomatis
      const token = generateToken({
        userId: userId,
        username: username,
        nama: nama,
        role: role
      });

      // Return response
      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        token: token,
        user: {
          id: userId,
          nama: nama,
          username: username,
          role: role,
          email: email
        }
      });
    } catch (error) {
      console.error('❌ Register error:', error);
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Login user dengan username dan password
   */
  static async login(req, res, next) {
    try {
      const { username, password } = req.body;

      console.log('🔍 Login attempt for username:', username);

      // Validasi input
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username dan password harus diisi'
        });
      }

      // Cari user berdasarkan username
      const user = await UserModel.findByUsername(username);
      console.log('👤 User found:', user ? { id: user.id, username: user.username, role: user.role } : 'NOT FOUND');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Username atau password salah'
        });
      }

      // Cek password
      const isPasswordValid = await comparePassword(password, user.password);
      console.log('🔐 Password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Username atau password salah'
        });
      }

      // Cek status user
      if (!user.aktif) {
        return res.status(403).json({
          success: false,
          message: 'Akun Anda telah dinonaktifkan'
        });
      }

      // Generate token
      const token = generateToken({
        userId: user.id,
        username: user.username,
        nama: user.nama,
        role: user.role
      });

      // Return response
      res.status(200).json({
        success: true,
        message: 'Login berhasil',
        token: token,
        user: {
          id: user.id,
          nama: user.nama,
          username: user.username,
          role: user.role,
          email: user.email
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Logout user (front-end akan menghapus token)
   */
  static async logout(req, res) {
    res.status(200).json({
      success: true,
      message: 'Logout berhasil. Silakan hapus token dari storage Anda.'
    });
  }

  /**
   * GET /api/auth/profile
   * Ambil profil user yang sedang login
   */
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.userId;
      const user = await UserModel.findById(userId);

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
}

module.exports = AuthController;
