const pool = require('../config/database');

/**
 * USER MODEL
 * Menangani semua query terkait user
 */
class UserModel {
  // Cari user berdasarkan username
  static async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  // Cari user berdasarkan ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, nama, username, role, email, no_telp, aktif, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Ambil semua user
  static async findAll() {
    const [rows] = await pool.execute(
      'SELECT id, nama, username, role, email, no_telp, aktif, created_at FROM users'
    );
    return rows;
  }

  // Ambil user berdasarkan role
  static async findByRole(role) {
    const [rows] = await pool.execute(
      'SELECT id, nama, username, role, email, no_telp, aktif, created_at FROM users WHERE role = ?',
      [role]
    );
    return rows;
  }

  // Tambah user baru
  static async create(data) {
    const { nama, username, password, role, email } = data;
    const [result] = await pool.execute(
      'INSERT INTO users (nama, username, password, role, email) VALUES (?, ?, ?, ?, ?)',
      [nama, username, password, role, email]
    );
    return result.insertId;
  }

  // Update user
  static async update(id, data) {
    const { nama, username, email, no_telp, aktif, role } = data;
    await pool.execute(
      'UPDATE users SET nama = ?, username = ?, email = ?, no_telp = ?, aktif = ?, role = ? WHERE id = ?',
      [nama, username, email, no_telp, aktif, role, id]
    );
  }

  // Update password user
  static async updatePassword(id, password) {
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [password, id]
    );
  }

  // Hapus user
  static async delete(id) {
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
  }
}

module.exports = UserModel;
