const { query, getConnection } = require('../config/database');

class Notification {
  // Crear una nueva notificación
  static async create(notificationData) {
    const { user_id, title, message, type = 'info', related_form_id = null } = notificationData;
    
    const sql = `
      INSERT INTO notifications (user_id, title, message, type, related_form_id) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    try {
      const result = await query(sql, [user_id, title, message, type, related_form_id]);
      return { id: result.insertId, message: 'Notification created successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Crear notificación para múltiples usuarios
  static async createForMultipleUsers(userIds, notificationData) {
    const connection = await getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { title, message, type = 'info', related_form_id = null } = notificationData;
      
      for (const userId of userIds) {
        const sql = `
          INSERT INTO notifications (user_id, title, message, type, related_form_id) 
          VALUES (?, ?, ?, ?, ?)
        `;
        
        await connection.execute(sql, [userId, title, message, type, related_form_id]);
      }
      
      await connection.commit();
      return { message: `Notifications created for ${userIds.length} users` };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener notificaciones de un usuario
  static async findByUser(userId, limit = 50, offset = 0) {
    const sql = `
      SELECT n.*, f.title as form_title
      FROM notifications n
      LEFT JOIN forms f ON n.related_form_id = f.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    try {
      return await query(sql, [userId, limit, offset]);
    } catch (error) {
      throw error;
    }
  }

  // Obtener notificaciones no leídas de un usuario
  static async findUnreadByUser(userId, limit = 20) {
    const sql = `
      SELECT n.*, f.title as form_title
      FROM notifications n
      LEFT JOIN forms f ON n.related_form_id = f.id
      WHERE n.user_id = ? AND n.is_read = FALSE
      ORDER BY n.created_at DESC
      LIMIT ?
    `;
    
    try {
      return await query(sql, [userId, limit]);
    } catch (error) {
      throw error;
    }
  }

  // Contar notificaciones no leídas de un usuario
  static async countUnreadByUser(userId) {
    const sql = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = ? AND is_read = FALSE
    `;
    
    try {
      const result = await query(sql, [userId]);
      return result[0].count;
    } catch (error) {
      throw error;
    }
  }

  // Marcar notificación como leída
  static async markAsRead(notificationId, userId) {
    const sql = `
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE id = ? AND user_id = ?
    `;
    
    try {
      const result = await query(sql, [notificationId, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Marcar todas las notificaciones de un usuario como leídas
  static async markAllAsRead(userId) {
    const sql = `
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE user_id = ?
    `;
    
    try {
      const result = await query(sql, [userId]);
      return { affectedRows: result.affectedRows, message: 'All notifications marked as read' };
    } catch (error) {
      throw error;
    }
  }

  // Eliminar una notificación
  static async delete(notificationId, userId) {
    const sql = `
      DELETE FROM notifications 
      WHERE id = ? AND user_id = ?
    `;
    
    try {
      const result = await query(sql, [notificationId, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar notificaciones antiguas (más de 30 días)
  static async deleteOld() {
    const sql = `
      DELETE FROM notifications 
      WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;
    
    try {
      const result = await query(sql);
      return { deletedCount: result.affectedRows, message: 'Old notifications deleted' };
    } catch (error) {
      throw error;
    }
  }

  // Crear notificación de nueva respuesta
  static async notifyNewResponse(formId, responseId, respondentName) {
    const connection = await getConnection();
    
    try {
      // Obtener creador del formulario y usuarios con permisos
      const usersSql = `
        SELECT DISTINCT u.id, u.username
        FROM users u
        LEFT JOIN form_permissions fp ON u.id = fp.user_id
        WHERE fp.form_id = ? AND fp.permission_type IN ('manage_responses', 'view')
        UNION
        SELECT f.created_by as id, u2.username
        FROM forms f
        JOIN users u2 ON f.created_by = u2.id
        WHERE f.id = ?
      `;
      
      const usersResult = await connection.execute(usersSql, [formId, formId]);
      const users = usersResult[0];
      
      if (users.length === 0) {
        return { message: 'No users to notify' };
      }
      
      // Obtener título del formulario
      const formSql = 'SELECT title FROM forms WHERE id = ?';
      const formResult = await connection.execute(formSql, [formId]);
      const formTitle = formResult[0][0]?.title || 'Formulario';
      
      // Crear notificaciones
      const notificationData = {
        title: 'Nueva respuesta recibida',
        message: `Se recibió una nueva respuesta de "${respondentName}" en el formulario "${formTitle}"`,
        type: 'info',
        related_form_id: formId
      };
      
      const userIds = users.map(user => user.id);
      
      for (const userId of userIds) {
        const insertSql = `
          INSERT INTO notifications (user_id, title, message, type, related_form_id) 
          VALUES (?, ?, ?, ?, ?)
        `;
        
        await connection.execute(insertSql, [
          userId,
          notificationData.title,
          notificationData.message,
          notificationData.type,
          notificationData.related_form_id
        ]);
      }
      
      return { message: `Notifications sent to ${users.length} users` };
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  // Crear notificación de formulario compartido
  static async notifyFormShared(formId, sharedByUserId, sharedWithUserId) {
    const connection = await getConnection();
    
    try {
      // Obtener información del formulario y usuarios
      const formSql = 'SELECT title FROM forms WHERE id = ?';
      const formResult = await connection.execute(formSql, [formId]);
      const formTitle = formResult[0][0]?.title || 'Formulario';
      
      const userSql = 'SELECT username FROM users WHERE id = ?';
      const userResult = await connection.execute(userSql, [sharedByUserId]);
      const sharedByUsername = userResult[0][0]?.username || 'Usuario';
      
      const notificationData = {
        user_id: sharedWithUserId,
        title: 'Formulario compartido contigo',
        message: `${sharedByUsername} ha compartido el formulario "${formTitle}" contigo`,
        type: 'info',
        related_form_id: formId
      };
      
      return await this.create(notificationData);
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  // Crear notificación de sistema
  static async notifySystem(userId, title, message, type = 'info') {
    const notificationData = {
      user_id: userId,
      title,
      message,
      type
    };
    
    return await this.create(notificationData);
  }

  // Obtener estadísticas de notificaciones
  static async getStats(userId) {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread,
        SUM(CASE WHEN type = 'info' THEN 1 ELSE 0 END) as info_count,
        SUM(CASE WHEN type = 'success' THEN 1 ELSE 0 END) as success_count,
        SUM(CASE WHEN type = 'warning' THEN 1 ELSE 0 END) as warning_count,
        SUM(CASE WHEN type = 'error' THEN 1 ELSE 0 END) as error_count
      FROM notifications
      WHERE user_id = ?
    `;
    
    try {
      const result = await query(sql, [userId]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener tipos de notificación disponibles
  static getNotificationTypes() {
    return [
      { value: 'info', label: 'Información', color: 'blue' },
      { value: 'success', label: 'Éxito', color: 'green' },
      { value: 'warning', label: 'Advertencia', color: 'yellow' },
      { value: 'error', label: 'Error', color: 'red' }
    ];
  }
}

module.exports = Notification; 