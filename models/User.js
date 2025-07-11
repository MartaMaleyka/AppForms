const { query } = require('../config/database');

class User {
  // Crear un nuevo usuario
  static async create(userData) {
    const { username, email, password, role = 'user' } = userData;
    
    const sql = `
      INSERT INTO users (username, email, password, role) 
      VALUES (?, ?, ?, ?)
    `;
    
    try {
      const result = await query(sql, [username, email, password, role]);
      return { id: result.insertId, username, email, role };
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuario por username o email
  static async findByUsernameOrEmail(identifier) {
    const sql = `
      SELECT id, username, email, password, role, created_at 
      FROM users 
      WHERE username = ? OR email = ?
    `;
    
    try {
      const users = await query(sql, [identifier, identifier]);
      return users[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuario por ID
  static async findById(id) {
    const sql = `
      SELECT id, username, email, role, created_at 
      FROM users 
      WHERE id = ?
    `;
    
    try {
      const users = await query(sql, [id]);
      return users[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Verificar si existe un usuario
  static async exists(username, email) {
    const sql = `
      SELECT id FROM users 
      WHERE username = ? OR email = ?
    `;
    
    try {
      const users = await query(sql, [username, email]);
      return users.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los usuarios (para admin)
  static async findAll() {
    const sql = `
      SELECT id, username, email, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    
    try {
      return await query(sql);
    } catch (error) {
      throw error;
    }
  }

  // Actualizar usuario
  static async update(id, userData) {
    const { username, email, role } = userData;
    
    const sql = `
      UPDATE users 
      SET username = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    try {
      await query(sql, [username, email, role, id]);
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Eliminar usuario
  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    
    try {
      const result = await query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User; 