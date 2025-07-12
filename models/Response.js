const { query, getConnection } = require('../config/database');

class Response {
  // Crear una nueva respuesta
  static async create(responseData) {
    const connection = await getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { form_id, respondent_name, answers } = responseData;
      
      // Insertar respuesta principal
      const responseSql = `
        INSERT INTO form_responses (form_id, respondent_name) 
        VALUES (?, ?)
      `;
      
      const responseResult = await connection.execute(responseSql, [form_id, respondent_name]);
      const responseId = responseResult[0].insertId;
      
      // Insertar respuestas individuales
      for (const answer of answers) {
        const answerSql = `
          INSERT INTO answers (response_id, question_id, answer_text) 
          VALUES (?, ?, ?)
        `;
        
        await connection.execute(answerSql, [responseId, answer.question_id, answer.answer_text]);
      }
      
      await connection.commit();
      return { id: responseId, message: 'Response submitted successfully' };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener todas las respuestas de un formulario
  static async findByFormId(formId) {
    const connection = await getConnection();
    
    try {
      // Obtener respuestas principales
      const responsesSql = `
        SELECT id, respondent_name, submitted_at
        FROM form_responses
        WHERE form_id = ?
        ORDER BY submitted_at DESC
      `;
      
      const responsesResult = await connection.execute(responsesSql, [formId]);
      const responses = responsesResult[0];
      
      // Obtener respuestas individuales para cada respuesta
      for (let response of responses) {
        const answersSql = `
          SELECT a.question_id, a.answer_text, q.question_text, q.question_type
          FROM answers a
          JOIN questions q ON a.question_id = q.id
          WHERE a.response_id = ?
          ORDER BY q.order_index
        `;
        
        const answersResult = await connection.execute(answersSql, [response.id]);
        response.answers = answersResult[0].map(answer => ({
          question_id: answer.question_id,
          question_text: answer.question_text,
          question_type: answer.question_type,
          answer_text: answer.answer_text
        }));
      }
      
      return responses;
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener una respuesta específica
  static async findById(id) {
    const connection = await getConnection();
    
    try {
      // Obtener respuesta principal
      const responseSql = `
        SELECT id, form_id, respondent_name, submitted_at
        FROM form_responses
        WHERE id = ?
      `;
      
      const responsesResult = await connection.execute(responseSql, [id]);
      if (responsesResult[0].length === 0) {
        return null;
      }
      
      const response = responsesResult[0][0];
      
      // Obtener respuestas individuales
      const answersSql = `
        SELECT a.question_id, a.answer_text, q.question_text, q.question_type
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        WHERE a.response_id = ?
        ORDER BY q.order_index
      `;
      
      const answersResult = await connection.execute(answersSql, [id]);
      response.answers = answersResult[0].map(answer => ({
        question_id: answer.question_id,
        question_text: answer.question_text,
        question_type: answer.question_type,
        answer_text: answer.answer_text
      }));
      
      return response;
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  // Eliminar una respuesta
  static async delete(id) {
    const sql = 'DELETE FROM form_responses WHERE id = ?';
    
    try {
      const result = await query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar todas las respuestas de un formulario
  static async deleteByFormId(formId) {
    const sql = 'DELETE FROM form_responses WHERE form_id = ?';
    
    try {
      const result = await query(sql, [formId]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas de respuestas
  static async getStats(formId) {
    const sql = `
      SELECT 
        COUNT(*) as total_responses,
        MIN(submitted_at) as first_response,
        MAX(submitted_at) as last_response
      FROM form_responses
      WHERE form_id = ?
    `;
    
    try {
      const stats = await query(sql, [formId]);
      return stats[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener respuestas recientes de un usuario
  static async findRecentByUser(userId, limit = 10) {
    const sql = `
      SELECT fr.id, fr.respondent_name, fr.submitted_at, f.title as form_title
      FROM form_responses fr
      JOIN forms f ON fr.form_id = f.id
      WHERE f.created_by = ?
      ORDER BY fr.submitted_at DESC
      LIMIT ?
    `;
    
    try {
      return await query(sql, [userId, limit]);
    } catch (error) {
      throw error;
    }
  }

  // Obtener respuestas con paginación
  static async findByFormIdPaginated(formId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT id, respondent_name, submitted_at
      FROM form_responses
      WHERE form_id = ?
      ORDER BY submitted_at DESC
      LIMIT ? OFFSET ?
    `;
    
    try {
      const responses = await query(sql, [formId, limit, offset]);
      
      // Obtener respuestas individuales para cada respuesta
      for (let response of responses) {
        const answersSql = `
          SELECT a.question_id, a.answer_text, q.question_text, q.question_type
          FROM answers a
          JOIN questions q ON a.question_id = q.id
          WHERE a.response_id = ?
          ORDER BY q.order_index
        `;
        
        const answersResult = await query(answersSql, [response.id]);
        response.answers = answersResult.map(answer => ({
          question_id: answer.question_id,
          question_text: answer.question_text,
          question_type: answer.question_type,
          answer_text: answer.answer_text
        }));
      }
      
      return responses;
      
    } catch (error) {
      throw error;
    }
  }

  // Contar respuestas de un formulario
  static async countByFormId(formId) {
    const sql = 'SELECT COUNT(*) as count FROM form_responses WHERE form_id = ?';
    
    try {
      const result = await query(sql, [formId]);
      return result[0].count;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Response; 