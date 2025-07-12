const { query, getConnection } = require('../config/database');

class FormVersion {
  // Crear una nueva versión de formulario
  static async create(formId, versionData, userId) {
    const connection = await getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { title, description, questions } = versionData;
      
      // Obtener el siguiente número de versión
      const nextVersionSql = `
        SELECT COALESCE(MAX(version_number), 0) + 1 as next_version
        FROM form_versions
        WHERE form_id = ?
      `;
      
      const versionResult = await connection.execute(nextVersionSql, [form_id]);
      const versionNumber = versionResult[0][0].next_version;
      
      // Insertar versión
      const versionSql = `
        INSERT INTO form_versions (form_id, version_number, title, description, created_by) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const versionInsertResult = await connection.execute(versionSql, [
        formId, versionNumber, title, description, userId
      ]);
      const versionId = versionInsertResult[0].insertId;
      
      // Insertar preguntas de la versión
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        const questionSql = `
          INSERT INTO version_questions (version_id, question_text, question_type, required, order_index, validation_rules) 
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const questionResult = await connection.execute(questionSql, [
          versionId,
          question.question_text,
          question.question_type,
          question.required,
          i,
          question.validation_rules ? JSON.stringify(question.validation_rules) : null
        ]);
        
        const questionId = questionResult[0].insertId;
        
        // Insertar opciones si las hay
        if (question.options && question.options.length > 0) {
          for (let j = 0; j < question.options.length; j++) {
            const optionSql = `
              INSERT INTO version_question_options (version_question_id, option_text, order_index) 
              VALUES (?, ?, ?)
            `;
            
            await connection.execute(optionSql, [questionId, question.options[j], j]);
          }
        }
      }
      
      await connection.commit();
      return { id: versionId, version_number: versionNumber, message: 'Version created successfully' };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener todas las versiones de un formulario
  static async findByFormId(formId) {
    const sql = `
      SELECT id, version_number, title, description, is_active, created_at,
             u.username as created_by_username
      FROM form_versions v
      LEFT JOIN users u ON v.created_by = u.id
      WHERE v.form_id = ?
      ORDER BY v.version_number DESC
    `;
    
    try {
      return await query(sql, [formId]);
    } catch (error) {
      throw error;
    }
  }

  // Obtener una versión específica con preguntas
  static async findById(versionId) {
    const connection = await getConnection();
    
    try {
      // Obtener versión
      const versionSql = `
        SELECT v.id, v.form_id, v.version_number, v.title, v.description, v.is_active, v.created_at,
               u.username as created_by_username
        FROM form_versions v
        LEFT JOIN users u ON v.created_by = u.id
        WHERE v.id = ?
      `;
      
      const versions = await connection.execute(versionSql, [versionId]);
      if (versions[0].length === 0) {
        return null;
      }
      
      const version = versions[0][0];
      
      // Obtener preguntas de la versión
      const questionsSql = `
        SELECT id, question_text, question_type, required, order_index, validation_rules
        FROM version_questions
        WHERE version_id = ?
        ORDER BY order_index
      `;
      
      const questionsResult = await connection.execute(questionsSql, [versionId]);
      const questions = questionsResult[0];
      
      // Obtener opciones para cada pregunta
      for (let question of questions) {
        const optionsSql = `
          SELECT option_text, order_index
          FROM version_question_options
          WHERE version_question_id = ?
          ORDER BY order_index
        `;
        
        const optionsResult = await connection.execute(optionsSql, [question.id]);
        question.options = optionsResult[0].map(opt => opt.option_text);
        
        // Parsear reglas de validación
        if (question.validation_rules) {
          try {
            question.validation_rules = JSON.parse(question.validation_rules);
          } catch (e) {
            question.validation_rules = null;
          }
        }
      }
      
      version.questions = questions;
      return version;
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  // Activar una versión
  static async activate(versionId, formId) {
    const connection = await getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Desactivar todas las versiones del formulario
      const deactivateSql = `
        UPDATE form_versions 
        SET is_active = FALSE 
        WHERE form_id = ?
      `;
      
      await connection.execute(deactivateSql, [formId]);
      
      // Activar la versión específica
      const activateSql = `
        UPDATE form_versions 
        SET is_active = TRUE 
        WHERE id = ? AND form_id = ?
      `;
      
      await connection.execute(activateSql, [versionId, formId]);
      
      await connection.commit();
      return { message: 'Version activated successfully' };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener la versión activa de un formulario
  static async getActiveVersion(formId) {
    const sql = `
      SELECT id, version_number, title, description, created_at
      FROM form_versions
      WHERE form_id = ? AND is_active = TRUE
      LIMIT 1
    `;
    
    try {
      const versions = await query(sql, [formId]);
      if (versions.length === 0) {
        return null;
      }
      
      return await this.findById(versions[0].id);
    } catch (error) {
      throw error;
    }
  }

  // Eliminar una versión
  static async delete(versionId) {
    const sql = 'DELETE FROM form_versions WHERE id = ?';
    
    try {
      const result = await query(sql, [versionId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Comparar dos versiones
  static async compare(versionId1, versionId2) {
    const version1 = await this.findById(versionId1);
    const version2 = await this.findById(versionId2);
    
    if (!version1 || !version2) {
      throw new Error('One or both versions not found');
    }
    
    const comparison = {
      version1: {
        version_number: version1.version_number,
        title: version1.title,
        question_count: version1.questions.length
      },
      version2: {
        version_number: version2.version_number,
        title: version2.title,
        question_count: version2.questions.length
      },
      differences: {
        title_changed: version1.title !== version2.title,
        questions_added: [],
        questions_removed: [],
        questions_modified: []
      }
    };
    
    // Comparar preguntas
    const questions1 = version1.questions;
    const questions2 = version2.questions;
    
    // Encontrar preguntas agregadas
    for (let question of questions2) {
      const exists = questions1.find(q => q.question_text === question.question_text);
      if (!exists) {
        comparison.differences.questions_added.push(question);
      }
    }
    
    // Encontrar preguntas removidas
    for (let question of questions1) {
      const exists = questions2.find(q => q.question_text === question.question_text);
      if (!exists) {
        comparison.differences.questions_removed.push(question);
      }
    }
    
    // Encontrar preguntas modificadas
    for (let question1 of questions1) {
      const question2 = questions2.find(q => q.question_text === question1.question_text);
      if (question2) {
        const modified = {
          question_text: question1.question_text,
          changes: {}
        };
        
        if (question1.question_type !== question2.question_type) {
          modified.changes.question_type = {
            from: question1.question_type,
            to: question2.question_type
          };
        }
        
        if (question1.required !== question2.required) {
          modified.changes.required = {
            from: question1.required,
            to: question2.required
          };
        }
        
        if (JSON.stringify(question1.options) !== JSON.stringify(question2.options)) {
          modified.changes.options = {
            from: question1.options,
            to: question2.options
          };
        }
        
        if (Object.keys(modified.changes).length > 0) {
          comparison.differences.questions_modified.push(modified);
        }
      }
    }
    
    return comparison;
  }

  // Crear versión desde formulario existente
  static async createFromForm(formId, userId) {
    const Form = require('./Form');
    const form = await Form.findById(formId);
    
    if (!form) {
      throw new Error('Form not found');
    }
    
    const versionData = {
      title: form.title,
      description: form.description,
      questions: form.questions
    };
    
    return await this.create(formId, versionData, userId);
  }
}

module.exports = FormVersion; 