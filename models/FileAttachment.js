const { query, getConnection } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class FileAttachment {
  // Crear un nuevo archivo adjunto
  static async create(attachmentData) {
    const { 
      response_id, 
      question_id, 
      filename, 
      original_filename, 
      file_path, 
      file_size, 
      mime_type 
    } = attachmentData;
    
    const sql = `
      INSERT INTO file_attachments (response_id, question_id, filename, original_filename, file_path, file_size, mime_type) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const result = await query(sql, [
        response_id, question_id, filename, original_filename, file_path, file_size, mime_type
      ]);
      return { id: result.insertId, message: 'File attachment created successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Obtener archivos adjuntos de una respuesta
  static async findByResponse(responseId) {
    const sql = `
      SELECT fa.*, q.question_text, q.question_type
      FROM file_attachments fa
      JOIN questions q ON fa.question_id = q.id
      WHERE fa.response_id = ?
      ORDER BY fa.uploaded_at DESC
    `;
    
    try {
      return await query(sql, [responseId]);
    } catch (error) {
      throw error;
    }
  }

  // Obtener archivos adjuntos de una pregunta
  static async findByQuestion(questionId) {
    const sql = `
      SELECT fa.*, fr.respondent_name, fr.submitted_at
      FROM file_attachments fa
      JOIN form_responses fr ON fa.response_id = fr.id
      WHERE fa.question_id = ?
      ORDER BY fa.uploaded_at DESC
    `;
    
    try {
      return await query(sql, [questionId]);
    } catch (error) {
      throw error;
    }
  }

  // Obtener un archivo adjunto específico
  static async findById(id) {
    const sql = `
      SELECT fa.*, q.question_text, q.question_type, fr.respondent_name
      FROM file_attachments fa
      JOIN questions q ON fa.question_id = q.id
      JOIN form_responses fr ON fa.response_id = fr.id
      WHERE fa.id = ?
    `;
    
    try {
      const attachments = await query(sql, [id]);
      return attachments[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar un archivo adjunto
  static async delete(id) {
    const connection = await getConnection();
    
    try {
      // Obtener información del archivo
      const attachment = await this.findById(id);
      if (!attachment) {
        throw new Error('Attachment not found');
      }
      
      // Eliminar archivo físico
      try {
        await fs.unlink(attachment.file_path);
      } catch (error) {
        console.warn('Could not delete physical file:', error.message);
      }
      
      // Eliminar registro de la base de datos
      const sql = 'DELETE FROM file_attachments WHERE id = ?';
      const result = await connection.execute(sql, [id]);
      
      return result.affectedRows > 0;
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener estadísticas de archivos adjuntos
  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_files,
        SUM(file_size) as total_size,
        AVG(file_size) as avg_size,
        COUNT(DISTINCT response_id) as responses_with_files,
        COUNT(DISTINCT question_id) as questions_with_files
      FROM file_attachments
    `;
    
    try {
      const result = await query(sql);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener tipos de archivo más comunes
  static async getTopFileTypes(limit = 10) {
    const sql = `
      SELECT 
        mime_type,
        COUNT(*) as count,
        SUM(file_size) as total_size
      FROM file_attachments
      GROUP BY mime_type
      ORDER BY count DESC
      LIMIT ?
    `;
    
    try {
      return await query(sql, [limit]);
    } catch (error) {
      throw error;
    }
  }

  // Validar archivo antes de subir
  static validateFile(file, maxSize = 10 * 1024 * 1024) { // 10MB por defecto
    const errors = [];
    
    // Verificar tamaño
    if (file.size > maxSize) {
      errors.push(`El archivo excede el tamaño máximo de ${maxSize / (1024 * 1024)}MB`);
    }
    
    // Verificar tipo de archivo
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push('Tipo de archivo no permitido');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Generar nombre único para archivo
  static generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, extension);
    
    return `${nameWithoutExt}_${timestamp}_${randomString}${extension}`;
  }

  // Obtener ruta de almacenamiento
  static getStoragePath() {
    const uploadDir = path.join(process.cwd(), 'uploads');
    return uploadDir;
  }

  // Crear directorio de uploads si no existe
  static async ensureUploadDirectory() {
    const uploadDir = this.getStoragePath();
    
    try {
      await fs.access(uploadDir);
    } catch (error) {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    
    return uploadDir;
  }

  // Mover archivo subido a ubicación final
  static async moveUploadedFile(tempPath, filename) {
    const uploadDir = await this.ensureUploadDirectory();
    const finalPath = path.join(uploadDir, filename);
    
    await fs.rename(tempPath, finalPath);
    return finalPath;
  }

  // Obtener URL pública del archivo
  static getPublicUrl(filename) {
    return `/uploads/${filename}`;
  }

  // Limpiar archivos huérfanos
  static async cleanOrphanedFiles() {
    const connection = await getConnection();
    
    try {
      // Obtener todos los archivos registrados en la base de datos
      const sql = 'SELECT file_path FROM file_attachments';
      const result = await connection.execute(sql);
      const registeredFiles = result[0].map(row => row.file_path);
      
      // Obtener todos los archivos en el directorio de uploads
      const uploadDir = this.getStoragePath();
      const files = await fs.readdir(uploadDir);
      
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(uploadDir, file);
        
        // Verificar si el archivo está registrado en la base de datos
        if (!registeredFiles.includes(filePath)) {
          try {
            await fs.unlink(filePath);
            deletedCount++;
          } catch (error) {
            console.warn(`Could not delete orphaned file ${filePath}:`, error.message);
          }
        }
      }
      
      return { deletedCount, message: `${deletedCount} orphaned files cleaned` };
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener archivos por formulario
  static async findByForm(formId) {
    const sql = `
      SELECT fa.*, q.question_text, q.question_type, fr.respondent_name, fr.submitted_at
      FROM file_attachments fa
      JOIN questions q ON fa.question_id = q.id
      JOIN form_responses fr ON fa.response_id = fr.id
      WHERE fr.form_id = ?
      ORDER BY fa.uploaded_at DESC
    `;
    
    try {
      return await query(sql, [formId]);
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas de archivos por formulario
  static async getFormStats(formId) {
    const sql = `
      SELECT 
        COUNT(*) as total_files,
        SUM(fa.file_size) as total_size,
        COUNT(DISTINCT fa.response_id) as responses_with_files,
        COUNT(DISTINCT fa.question_id) as questions_with_files
      FROM file_attachments fa
      JOIN form_responses fr ON fa.response_id = fr.id
      WHERE fr.form_id = ?
    `;
    
    try {
      const result = await query(sql, [formId]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener tipos de archivo permitidos
  static getAllowedFileTypes() {
    return [
      { mime_type: 'image/jpeg', extension: '.jpg,.jpeg', description: 'Imagen JPEG' },
      { mime_type: 'image/png', extension: '.png', description: 'Imagen PNG' },
      { mime_type: 'image/gif', extension: '.gif', description: 'Imagen GIF' },
      { mime_type: 'image/webp', extension: '.webp', description: 'Imagen WebP' },
      { mime_type: 'application/pdf', extension: '.pdf', description: 'Documento PDF' },
      { mime_type: 'application/msword', extension: '.doc', description: 'Documento Word' },
      { mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extension: '.docx', description: 'Documento Word (nuevo formato)' },
      { mime_type: 'application/vnd.ms-excel', extension: '.xls', description: 'Hoja de cálculo Excel' },
      { mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension: '.xlsx', description: 'Hoja de cálculo Excel (nuevo formato)' },
      { mime_type: 'text/plain', extension: '.txt', description: 'Archivo de texto' },
      { mime_type: 'text/csv', extension: '.csv', description: 'Archivo CSV' }
    ];
  }

  // Obtener tamaño máximo de archivo
  static getMaxFileSize() {
    return 10 * 1024 * 1024; // 10MB
  }

  // Formatear tamaño de archivo
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = FileAttachment; 