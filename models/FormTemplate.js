const { query, getConnection } = require('../config/database');

class FormTemplate {
  // Crear una nueva plantilla
  static async create(templateData, userId) {
    const connection = await getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { name, description, category, is_public, questions } = templateData;
      
      // Insertar plantilla
      const templateSql = `
        INSERT INTO form_templates (name, description, category, is_public, created_by) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const templateResult = await connection.execute(templateSql, [
        name, description, category, is_public, userId
      ]);
      const templateId = templateResult[0].insertId;
      
      // Guardar las preguntas como JSON en la descripción o crear tabla separada
      if (questions && questions.length > 0) {
        const questionsJson = JSON.stringify(questions);
        const updateSql = `
          UPDATE form_templates 
          SET description = CONCAT(description, '\n\nQUESTIONS_JSON:', ?) 
          WHERE id = ?
        `;
        await connection.execute(updateSql, [questionsJson, templateId]);
      }
      
      await connection.commit();
      return { id: templateId, message: 'Template created successfully' };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener todas las plantillas públicas
  static async findPublic() {
    const sql = `
      SELECT id, name, description, category, created_at,
             u.username as created_by_username
      FROM form_templates t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.is_public = TRUE
      ORDER BY t.created_at DESC
    `;
    
    try {
      const templates = await query(sql);
      
      // Extraer preguntas del JSON en la descripción
      for (let template of templates) {
        if (template.description && template.description.includes('QUESTIONS_JSON:')) {
          const parts = template.description.split('QUESTIONS_JSON:');
          template.description = parts[0].trim();
          try {
            template.questions = JSON.parse(parts[1]);
          } catch (e) {
            template.questions = [];
          }
        } else {
          template.questions = [];
        }
      }
      
      return templates;
    } catch (error) {
      throw error;
    }
  }

  // Obtener plantillas por categoría
  static async findByCategory(category) {
    const sql = `
      SELECT id, name, description, category, created_at,
             u.username as created_by_username
      FROM form_templates t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.category = ? AND t.is_public = TRUE
      ORDER BY t.created_at DESC
    `;
    
    try {
      const templates = await query(sql, [category]);
      
      // Extraer preguntas del JSON en la descripción
      for (let template of templates) {
        if (template.description && template.description.includes('QUESTIONS_JSON:')) {
          const parts = template.description.split('QUESTIONS_JSON:');
          template.description = parts[0].trim();
          try {
            template.questions = JSON.parse(parts[1]);
          } catch (e) {
            template.questions = [];
          }
        } else {
          template.questions = [];
        }
      }
      
      return templates;
    } catch (error) {
      throw error;
    }
  }

  // Obtener una plantilla específica
  static async findById(id) {
    const sql = `
      SELECT id, name, description, category, is_public, created_at,
             u.username as created_by_username
      FROM form_templates t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = ?
    `;
    
    try {
      const templates = await query(sql, [id]);
      if (templates.length === 0) {
        return null;
      }
      
      const template = templates[0];
      
      // Extraer preguntas del JSON en la descripción
      if (template.description && template.description.includes('QUESTIONS_JSON:')) {
        const parts = template.description.split('QUESTIONS_JSON:');
        template.description = parts[0].trim();
        try {
          template.questions = JSON.parse(parts[1]);
        } catch (e) {
          template.questions = [];
        }
      } else {
        template.questions = [];
      }
      
      return template;
    } catch (error) {
      throw error;
    }
  }

  // Obtener plantillas del usuario
  static async findByUser(userId) {
    const sql = `
      SELECT id, name, description, category, is_public, created_at
      FROM form_templates
      WHERE created_by = ?
      ORDER BY created_at DESC
    `;
    
    try {
      const templates = await query(sql, [userId]);
      
      // Extraer preguntas del JSON en la descripción
      for (let template of templates) {
        if (template.description && template.description.includes('QUESTIONS_JSON:')) {
          const parts = template.description.split('QUESTIONS_JSON:');
          template.description = parts[0].trim();
          try {
            template.questions = JSON.parse(parts[1]);
          } catch (e) {
            template.questions = [];
          }
        } else {
          template.questions = [];
        }
      }
      
      return templates;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar una plantilla
  static async delete(id, userId) {
    const sql = 'DELETE FROM form_templates WHERE id = ? AND created_by = ?';
    
    try {
      const result = await query(sql, [id, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar una plantilla
  static async update(id, templateData, userId) {
    const connection = await getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { name, description, category, is_public, questions } = templateData;
      
      // Preparar descripción con preguntas JSON
      let finalDescription = description;
      if (questions && questions.length > 0) {
        finalDescription = description + '\n\nQUESTIONS_JSON:' + JSON.stringify(questions);
      }
      
      // Actualizar plantilla
      const templateSql = `
        UPDATE form_templates 
        SET name = ?, description = ?, category = ?, is_public = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND created_by = ?
      `;
      
      await connection.execute(templateSql, [
        name, finalDescription, category, is_public, id, userId
      ]);
      
      await connection.commit();
      return await this.findById(id);
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener categorías disponibles
  static async getCategories() {
    const sql = `
      SELECT DISTINCT category 
      FROM form_templates 
      WHERE is_public = TRUE AND category IS NOT NULL
      ORDER BY category
    `;
    
    try {
      const categories = await query(sql);
      return categories.map(cat => cat.category);
    } catch (error) {
      throw error;
    }
  }

  // Crear formulario desde plantilla
  static async createFormFromTemplate(templateId, formData, userId) {
    const template = await this.findById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }
    
    // Combinar datos del formulario con preguntas de la plantilla
    const formWithQuestions = {
      ...formData,
      questions: template.questions
    };
    
    // Usar el modelo Form para crear el formulario
    const Form = require('./Form');
    return await Form.create(formWithQuestions, userId);
  }
}

module.exports = FormTemplate; 