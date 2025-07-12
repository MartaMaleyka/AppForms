const { query, getConnection } = require('../config/database');

class AuditLog {
  // Crear un log de auditoría
  static async create(auditData) {
    const { 
      user_id, 
      action, 
      table_name, 
      record_id, 
      old_values = null, 
      new_values = null,
      ip_address = null,
      user_agent = null 
    } = auditData;
    
    const sql = `
      INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const result = await query(sql, [
        user_id, action, table_name, record_id,
        old_values ? JSON.stringify(old_values) : null,
        new_values ? JSON.stringify(new_values) : null,
        ip_address, user_agent
      ]);
      return { id: result.insertId, message: 'Audit log created successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Obtener logs de auditoría con filtros
  static async find(filters = {}, limit = 100, offset = 0) {
    let sql = `
      SELECT al.*, u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.user_id) {
      sql += ' AND al.user_id = ?';
      params.push(filters.user_id);
    }
    
    if (filters.action) {
      sql += ' AND al.action = ?';
      params.push(filters.action);
    }
    
    if (filters.table_name) {
      sql += ' AND al.table_name = ?';
      params.push(filters.table_name);
    }
    
    if (filters.record_id) {
      sql += ' AND al.record_id = ?';
      params.push(filters.record_id);
    }
    
    if (filters.start_date) {
      sql += ' AND al.created_at >= ?';
      params.push(filters.start_date);
    }
    
    if (filters.end_date) {
      sql += ' AND al.created_at <= ?';
      params.push(filters.end_date);
    }
    
    sql += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    try {
      const logs = await query(sql, params);
      
      // Parsear valores JSON
      for (let log of logs) {
        if (log.old_values) {
          try {
            log.old_values = JSON.parse(log.old_values);
          } catch (e) {
            log.old_values = null;
          }
        }
        
        if (log.new_values) {
          try {
            log.new_values = JSON.parse(log.new_values);
          } catch (e) {
            log.new_values = null;
          }
        }
      }
      
      return logs;
    } catch (error) {
      throw error;
    }
  }

  // Obtener logs de auditoría por usuario
  static async findByUser(userId, limit = 50) {
    return await this.find({ user_id: userId }, limit);
  }

  // Obtener logs de auditoría por tabla
  static async findByTable(tableName, limit = 50) {
    return await this.find({ table_name: tableName }, limit);
  }

  // Obtener logs de auditoría por acción
  static async findByAction(action, limit = 50) {
    return await this.find({ action: action }, limit);
  }

  // Obtener logs de auditoría por registro específico
  static async findByRecord(tableName, recordId, limit = 50) {
    return await this.find({ table_name: tableName, record_id: recordId }, limit);
  }

  // Obtener estadísticas de auditoría
  static async getStats(filters = {}) {
    let sql = `
      SELECT 
        COUNT(*) as total_logs,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT action) as unique_actions,
        COUNT(DISTINCT table_name) as unique_tables,
        MIN(created_at) as first_log,
        MAX(created_at) as last_log
      FROM audit_logs
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.start_date) {
      sql += ' AND created_at >= ?';
      params.push(filters.start_date);
    }
    
    if (filters.end_date) {
      sql += ' AND created_at <= ?';
      params.push(filters.end_date);
    }
    
    try {
      const result = await query(sql, params);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener acciones más comunes
  static async getTopActions(limit = 10) {
    const sql = `
      SELECT 
        action,
        COUNT(*) as count
      FROM audit_logs
      GROUP BY action
      ORDER BY count DESC
      LIMIT ?
    `;
    
    try {
      return await query(sql, [limit]);
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuarios más activos
  static async getTopUsers(limit = 10) {
    const sql = `
      SELECT 
        al.user_id,
        u.username,
        COUNT(*) as action_count
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.user_id IS NOT NULL
      GROUP BY al.user_id
      ORDER BY action_count DESC
      LIMIT ?
    `;
    
    try {
      return await query(sql, [limit]);
    } catch (error) {
      throw error;
    }
  }

  // Obtener tablas más auditadas
  static async getTopTables(limit = 10) {
    const sql = `
      SELECT 
        table_name,
        COUNT(*) as action_count
      FROM audit_logs
      GROUP BY table_name
      ORDER BY action_count DESC
      LIMIT ?
    `;
    
    try {
      return await query(sql, [limit]);
    } catch (error) {
      throw error;
    }
  }

  // Limpiar logs antiguos
  static async cleanOldLogs(days = 90) {
    const sql = `
      DELETE FROM audit_logs 
      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    
    try {
      const result = await query(sql, [days]);
      return { deletedCount: result.affectedRows, message: 'Old audit logs cleaned' };
    } catch (error) {
      throw error;
    }
  }

  // Métodos de conveniencia para acciones comunes
  static async logFormCreated(userId, formId, formData, ipAddress = null, userAgent = null) {
    return await this.create({
      user_id: userId,
      action: 'CREATE',
      table_name: 'forms',
      record_id: formId,
      new_values: formData,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  static async logFormUpdated(userId, formId, oldData, newData, ipAddress = null, userAgent = null) {
    return await this.create({
      user_id: userId,
      action: 'UPDATE',
      table_name: 'forms',
      record_id: formId,
      old_values: oldData,
      new_values: newData,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  static async logFormDeleted(userId, formId, formData, ipAddress = null, userAgent = null) {
    return await this.create({
      user_id: userId,
      action: 'DELETE',
      table_name: 'forms',
      record_id: formId,
      old_values: formData,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  static async logResponseSubmitted(userId, responseId, responseData, ipAddress = null, userAgent = null) {
    return await this.create({
      user_id: userId,
      action: 'CREATE',
      table_name: 'form_responses',
      record_id: responseId,
      new_values: responseData,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  static async logUserLogin(userId, ipAddress = null, userAgent = null) {
    return await this.create({
      user_id: userId,
      action: 'LOGIN',
      table_name: 'users',
      record_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  static async logUserLogout(userId, ipAddress = null, userAgent = null) {
    return await this.create({
      user_id: userId,
      action: 'LOGOUT',
      table_name: 'users',
      record_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  static async logPermissionChanged(userId, targetUserId, oldRoles, newRoles, ipAddress = null, userAgent = null) {
    return await this.create({
      user_id: userId,
      action: 'PERMISSION_CHANGE',
      table_name: 'user_roles',
      record_id: targetUserId,
      old_values: { roles: oldRoles },
      new_values: { roles: newRoles },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  // Obtener acciones disponibles
  static getAvailableActions() {
    return [
      'CREATE',
      'UPDATE', 
      'DELETE',
      'LOGIN',
      'LOGOUT',
      'PERMISSION_CHANGE',
      'FORM_SHARE',
      'FORM_EXPORT',
      'REPORT_GENERATE',
      'TEMPLATE_CREATE',
      'VERSION_CREATE',
      'VERSION_ACTIVATE'
    ];
  }

  // Obtener tablas auditadas
  static getAuditedTables() {
    return [
      'users',
      'forms', 
      'questions',
      'form_responses',
      'answers',
      'form_templates',
      'form_versions',
      'user_roles',
      'form_permissions',
      'notifications',
      'custom_reports'
    ];
  }
}

module.exports = AuditLog; 