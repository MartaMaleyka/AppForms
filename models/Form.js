const { query, getConnection } = require('../config/database');

class Form {
  // Crear un nuevo formulario con preguntas
  static async create(formData, userId) {
    const connection = await getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { title, description, questions } = formData;
      
      // Insertar formulario
      const formSql = `
        INSERT INTO forms (title, description, created_by) 
        VALUES (?, ?, ?)
      `;
      
      const formResult = await connection.execute(formSql, [title, description, userId]);
      const formId = formResult[0].insertId;
      
      // Insertar preguntas
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        const questionSql = `
          INSERT INTO questions (form_id, question_text, question_type, required, order_index) 
          VALUES (?, ?, ?, ?, ?)
        `;
        
        const questionResult = await connection.execute(questionSql, [
          formId,
          question.question_text,
          question.question_type,
          question.required,
          i
        ]);
        
        const questionId = questionResult[0].insertId;
        
        // Insertar opciones si las hay
        if (question.options && question.options.length > 0) {
          for (let j = 0; j < question.options.length; j++) {
            const optionSql = `
              INSERT INTO question_options (question_id, option_text, order_index) 
              VALUES (?, ?, ?)
            `;
            
            await connection.execute(optionSql, [questionId, question.options[j], j]);
          }
        }
        
        // Insertar skip logic si está habilitado
        if (question.skip_logic && question.skip_logic.enabled) {
          const skipLogicSql = `
            INSERT INTO skip_logic (question_id, enabled) 
            VALUES (?, ?)
          `;
          
          const skipLogicResult = await connection.execute(skipLogicSql, [questionId, true]);
          const skipLogicId = skipLogicResult[0].insertId;
          
          // Insertar condiciones de skip logic
          if (question.skip_logic.conditions && question.skip_logic.conditions.length > 0) {
            for (let k = 0; k < question.skip_logic.conditions.length; k++) {
              const condition = question.skip_logic.conditions[k];
              
              const conditionSql = `
                INSERT INTO skip_logic_conditions (skip_logic_id, option_text, skip_to_question_id, skip_to_end, order_index) 
                VALUES (?, ?, ?, ?, ?)
              `;
              
              await connection.execute(conditionSql, [
                skipLogicId,
                condition.option,
                condition.skip_to_question || null,
                condition.skip_to_question === 0 ? true : false,
                k
              ]);
            }
          }
        }
      }
      
      await connection.commit();
      return { id: formId, message: 'Form created successfully' };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener todos los formularios
  static async findAll() {
    const sql = `
      SELECT f.id, f.title, f.description, f.created_at, f.updated_at,
             u.username as created_by_username
      FROM forms f
      LEFT JOIN users u ON f.created_by = u.id
      ORDER BY f.created_at DESC
    `;
    
    try {
      return await query(sql);
    } catch (error) {
      throw error;
    }
  }

  // Obtener formularios de un usuario específico
  static async findByUser(userId) {
    const sql = `
      SELECT f.id, f.title, f.description, f.created_at, f.updated_at,
             u.username as created_by_username
      FROM forms f
      LEFT JOIN users u ON f.created_by = u.id
      WHERE f.created_by = ?
      ORDER BY f.created_at DESC
    `;
    
    try {
      return await query(sql, [userId]);
    } catch (error) {
      throw error;
    }
  }

  // Obtener un formulario específico con preguntas
  static async findById(id) {
    const connection = await getConnection();
    
    try {
      // Obtener formulario
      const formSql = `
        SELECT f.id, f.title, f.description, f.created_at, f.updated_at, f.created_by,
               u.username as created_by_username
        FROM forms f
        LEFT JOIN users u ON f.created_by = u.id
        WHERE f.id = ?
      `;
      
      const forms = await connection.execute(formSql, [id]);
      if (forms[0].length === 0) {
        return null;
      }
      
      const form = forms[0][0];
      
      // Obtener preguntas
      const questionsSql = `
        SELECT id, question_text, question_type, required, order_index
        FROM questions
        WHERE form_id = ?
        ORDER BY order_index
      `;
      
      const questionsResult = await connection.execute(questionsSql, [id]);
      const questions = questionsResult[0];
      
      // Obtener opciones para cada pregunta
      for (let question of questions) {
        const optionsSql = `
          SELECT option_text, order_index
          FROM question_options
          WHERE question_id = ?
          ORDER BY order_index
        `;
        
        const optionsResult = await connection.execute(optionsSql, [question.id]);
        question.options = optionsResult[0].map(opt => opt.option_text);
        
        // Obtener skip logic
        const skipLogicSql = `
          SELECT sl.enabled, slc.option_text, slc.skip_to_question_id, slc.skip_to_end, slc.order_index
          FROM skip_logic sl
          LEFT JOIN skip_logic_conditions slc ON sl.id = slc.skip_logic_id
          WHERE sl.question_id = ?
          ORDER BY slc.order_index
        `;
        
        const skipLogicResult = await connection.execute(skipLogicSql, [question.id]);
        const skipLogicData = skipLogicResult[0];
        
        if (skipLogicData.length > 0 && skipLogicData[0].enabled) {
          question.skip_logic = {
            enabled: true,
            conditions: skipLogicData.map(condition => ({
              option: condition.option_text,
              skip_to_question: condition.skip_to_end ? 0 : condition.skip_to_question_id
            }))
          };
        } else {
          question.skip_logic = { enabled: false, conditions: [] };
        }
      }
      
      form.questions = questions;
      return form;
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  // Eliminar un formulario
  static async delete(id) {
    const sql = 'DELETE FROM forms WHERE id = ?';
    
    try {
      const result = await query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar un formulario
  static async update(id, formData) {
    const connection = await getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { title, description } = formData;
      
      // Actualizar formulario
      const formSql = `
        UPDATE forms 
        SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      await connection.execute(formSql, [title, description, id]);
      
      await connection.commit();
      return await this.findById(id);
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Form; 