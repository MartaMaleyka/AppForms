const { query, getConnection } = require('../config/database');

class Permission {
  // Obtener todos los permisos
  static async findAll() {
    const sql = 'SELECT * FROM permissions ORDER BY name';
    
    try {
      return await query(sql);
    } catch (error) {
      throw error;
    }
  }

  // Obtener permisos por rol
  static async findByRole(roleId) {
    const sql = `
      SELECT p.* 
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
      ORDER BY p.name
    `;
    
    try {
      return await query(sql, [roleId]);
    } catch (error) {
      throw error;
    }
  }

  // Obtener permisos por usuario
  static async findByUser(userId) {
    const sql = `
      SELECT DISTINCT p.* 
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = ?
      ORDER BY p.name
    `;
    
    try {
      return await query(sql, [userId]);
    } catch (error) {
      throw error;
    }
  }

  // Verificar si un usuario tiene un permiso específico
  static async userHasPermission(userId, permissionName) {
    const sql = `
      SELECT COUNT(*) as count
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = ? AND p.name = ?
    `;
    
    try {
      const result = await query(sql, [userId, permissionName]);
      return result[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  // Verificar si un usuario tiene permisos específicos de formulario
  static async userHasFormPermission(userId, formId, permissionType) {
    const sql = `
      SELECT COUNT(*) as count
      FROM form_permissions
      WHERE form_id = ? AND permission_type = ? AND (user_id = ? OR role_id IN (
        SELECT role_id FROM user_roles WHERE user_id = ?
      ))
    `;
    
    try {
      const result = await query(sql, [formId, permissionType, userId, userId]);
      return result[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  // Asignar permisos a un rol
  static async assignToRole(roleId, permissionIds) {
    const connection = await getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Eliminar permisos existentes del rol
      const deleteSql = 'DELETE FROM role_permissions WHERE role_id = ?';
      await connection.execute(deleteSql, [roleId]);
      
      // Insertar nuevos permisos
      for (const permissionId of permissionIds) {
        const insertSql = `
          INSERT INTO role_permissions (role_id, permission_id) 
          VALUES (?, ?)
        `;
        await connection.execute(insertSql, [roleId, permissionId]);
      }
      
      await connection.commit();
      return { message: 'Permissions assigned successfully' };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Asignar roles a un usuario
  static async assignRolesToUser(userId, roleIds) {
    const connection = await getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Eliminar roles existentes del usuario
      const deleteSql = 'DELETE FROM user_roles WHERE user_id = ?';
      await connection.execute(deleteSql, [userId]);
      
      // Insertar nuevos roles
      for (const roleId of roleIds) {
        const insertSql = `
          INSERT INTO user_roles (user_id, role_id) 
          VALUES (?, ?)
        `;
        await connection.execute(insertSql, [userId, roleId]);
      }
      
      await connection.commit();
      return { message: 'Roles assigned successfully' };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener roles del usuario
  static async getUserRoles(userId) {
    const sql = `
      SELECT r.* 
      FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ?
      ORDER BY r.name
    `;
    
    try {
      return await query(sql, [userId]);
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los roles
  static async getAllRoles() {
    const sql = 'SELECT * FROM roles ORDER BY name';
    
    try {
      return await query(sql);
    } catch (error) {
      throw error;
    }
  }

  // Crear un nuevo rol
  static async createRole(roleData) {
    const { name, description } = roleData;
    
    const sql = `
      INSERT INTO roles (name, description) 
      VALUES (?, ?)
    `;
    
    try {
      const result = await query(sql, [name, description]);
      return { id: result.insertId, name, description };
    } catch (error) {
      throw error;
    }
  }

  // Actualizar un rol
  static async updateRole(roleId, roleData) {
    const { name, description } = roleData;
    
    const sql = `
      UPDATE roles 
      SET name = ?, description = ? 
      WHERE id = ?
    `;
    
    try {
      await query(sql, [name, description, roleId]);
      return await this.getRoleById(roleId);
    } catch (error) {
      throw error;
    }
  }

  // Obtener un rol por ID
  static async getRoleById(roleId) {
    const sql = 'SELECT * FROM roles WHERE id = ?';
    
    try {
      const roles = await query(sql, [roleId]);
      return roles[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar un rol
  static async deleteRole(roleId) {
    const sql = 'DELETE FROM roles WHERE id = ?';
    
    try {
      const result = await query(sql, [roleId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Asignar permisos específicos de formulario
  static async assignFormPermission(formId, permissionData) {
    const { user_id, role_id, permission_type } = permissionData;
    
    const sql = `
      INSERT INTO form_permissions (form_id, user_id, role_id, permission_type) 
      VALUES (?, ?, ?, ?)
    `;
    
    try {
      const result = await query(sql, [form_id, user_id, role_id, permission_type]);
      return { id: result.insertId, message: 'Form permission assigned successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Obtener permisos específicos de un formulario
  static async getFormPermissions(formId) {
    const sql = `
      SELECT fp.*, u.username, r.name as role_name
      FROM form_permissions fp
      LEFT JOIN users u ON fp.user_id = u.id
      LEFT JOIN roles r ON fp.role_id = r.id
      WHERE fp.form_id = ?
      ORDER BY fp.permission_type, u.username, r.name
    `;
    
    try {
      return await query(sql, [formId]);
    } catch (error) {
      throw error;
    }
  }

  // Eliminar permiso específico de formulario
  static async removeFormPermission(permissionId) {
    const sql = 'DELETE FROM form_permissions WHERE id = ?';
    
    try {
      const result = await query(sql, [permissionId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Verificar si un usuario es administrador
  static async isAdmin(userId) {
    return await this.userHasPermission(userId, 'system_admin');
  }

  // Obtener permisos disponibles para formularios
  static async getFormPermissionTypes() {
    return [
      { value: 'view', label: 'Ver formulario' },
      { value: 'edit', label: 'Editar formulario' },
      { value: 'delete', label: 'Eliminar formulario' },
      { value: 'manage_responses', label: 'Gestionar respuestas' },
      { value: 'export', label: 'Exportar datos' }
    ];
  }
}

module.exports = Permission; 