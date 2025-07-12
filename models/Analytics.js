const { query, getConnection } = require('../config/database');

class Analytics {
  // Registrar vista de formulario
  static async recordFormView(formId) {
    const today = new Date().toISOString().split('T')[0];
    
    const connection = await getConnection();
    
    try {
      // Verificar si ya existe registro para hoy
      const checkSql = `
        SELECT id, total_views 
        FROM form_analytics 
        WHERE form_id = ? AND date = ?
      `;
      
      const checkResult = await connection.execute(checkSql, [formId, today]);
      
      if (checkResult[0].length > 0) {
        // Actualizar registro existente
        const updateSql = `
          UPDATE form_analytics 
          SET total_views = total_views + 1 
          WHERE id = ?
        `;
        await connection.execute(updateSql, [checkResult[0][0].id]);
      } else {
        // Crear nuevo registro
        const insertSql = `
          INSERT INTO form_analytics (form_id, date, total_views) 
          VALUES (?, ?, 1)
        `;
        await connection.execute(insertSql, [formId, today]);
      }
      
      return { message: 'Form view recorded' };
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  // Registrar respuesta de formulario
  static async recordFormResponse(formId, completionTime = null) {
    const today = new Date().toISOString().split('T')[0];
    
    const connection = await getConnection();
    
    try {
      // Verificar si ya existe registro para hoy
      const checkSql = `
        SELECT id, total_responses, avg_completion_time 
        FROM form_analytics 
        WHERE form_id = ? AND date = ?
      `;
      
      const checkResult = await connection.execute(checkSql, [formId, today]);
      
      if (checkResult[0].length > 0) {
        const record = checkResult[0][0];
        const newTotal = record.total_responses + 1;
        
        // Calcular nuevo promedio de tiempo de completado
        let newAvgTime = record.avg_completion_time;
        if (completionTime) {
          newAvgTime = Math.round((record.avg_completion_time * record.total_responses + completionTime) / newTotal);
        }
        
        // Actualizar registro existente
        const updateSql = `
          UPDATE form_analytics 
          SET total_responses = ?, avg_completion_time = ? 
          WHERE id = ?
        `;
        await connection.execute(updateSql, [newTotal, newAvgTime, record.id]);
      } else {
        // Crear nuevo registro
        const insertSql = `
          INSERT INTO form_analytics (form_id, date, total_responses, avg_completion_time) 
          VALUES (?, ?, 1, ?)
        `;
        await connection.execute(insertSql, [formId, today, completionTime || 0]);
      }
      
      return { message: 'Form response recorded' };
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener estadísticas de un formulario
  static async getFormStats(formId, days = 30) {
    const sql = `
      SELECT 
        date,
        total_views,
        total_responses,
        CASE 
          WHEN total_views > 0 THEN ROUND((total_responses / total_views) * 100, 2)
          ELSE 0 
        END as completion_rate,
        avg_completion_time
      FROM form_analytics
      WHERE form_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      ORDER BY date DESC
    `;
    
    try {
      return await query(sql, [formId, days]);
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas generales del sistema
  static async getSystemStats() {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM forms) as total_forms,
        (SELECT COUNT(*) FROM form_responses) as total_responses,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM forms WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as forms_this_week,
        (SELECT COUNT(*) FROM form_responses WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as responses_this_week
    `;
    
    try {
      const result = await query(sql);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener formularios más populares
  static async getPopularForms(limit = 10) {
    const sql = `
      SELECT 
        f.id,
        f.title,
        f.description,
        COUNT(fr.id) as response_count,
        COUNT(DISTINCT fr.id) as unique_responses,
        MAX(fr.submitted_at) as last_response
      FROM forms f
      LEFT JOIN form_responses fr ON f.id = fr.form_id
      GROUP BY f.id
      ORDER BY response_count DESC
      LIMIT ?
    `;
    
    try {
      return await query(sql, [limit]);
    } catch (error) {
      throw error;
    }
  }

  // Obtener análisis de respuestas por pregunta
  static async getQuestionAnalytics(formId) {
    const sql = `
      SELECT 
        q.id,
        q.question_text,
        q.question_type,
        COUNT(a.id) as answer_count,
        COUNT(DISTINCT a.response_id) as response_count,
        GROUP_CONCAT(DISTINCT a.answer_text ORDER BY a.answer_text SEPARATOR '|') as unique_answers
      FROM questions q
      LEFT JOIN answers a ON q.id = a.question_id
      WHERE q.form_id = ?
      GROUP BY q.id
      ORDER BY q.order_index
    `;
    
    try {
      const results = await query(sql, [formId]);
      
      // Procesar respuestas únicas
      for (let result of results) {
        if (result.unique_answers) {
          result.unique_answers = result.unique_answers.split('|');
        } else {
          result.unique_answers = [];
        }
      }
      
      return results;
    } catch (error) {
      throw error;
    }
  }

  // Crear reporte personalizado
  static async createCustomReport(reportData) {
    const { name, description, form_id, created_by, report_config, schedule_type = 'manual' } = reportData;
    
    const sql = `
      INSERT INTO custom_reports (name, description, form_id, created_by, report_config, schedule_type) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const result = await query(sql, [
        name, description, form_id, created_by, 
        JSON.stringify(report_config), schedule_type
      ]);
      return { id: result.insertId, message: 'Custom report created successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Obtener reportes personalizados de un usuario
  static async getCustomReports(userId) {
    const sql = `
      SELECT id, name, description, form_id, report_config, schedule_type, last_generated, created_at
      FROM custom_reports
      WHERE created_by = ?
      ORDER BY created_at DESC
    `;
    
    try {
      const reports = await query(sql, [userId]);
      
      // Parsear configuración de reporte
      for (let report of reports) {
        try {
          report.report_config = JSON.parse(report.report_config);
        } catch (e) {
          report.report_config = {};
        }
      }
      
      return reports;
    } catch (error) {
      throw error;
    }
  }

  // Generar reporte personalizado
  static async generateCustomReport(reportId) {
    const sql = 'SELECT * FROM custom_reports WHERE id = ?';
    
    try {
      const reports = await query(sql, [reportId]);
      if (reports.length === 0) {
        throw new Error('Report not found');
      }
      
      const report = reports[0];
      let reportConfig;
      
      try {
        reportConfig = JSON.parse(report.report_config);
      } catch (e) {
        throw new Error('Invalid report configuration');
      }
      
      // Generar reporte basado en la configuración
      const reportData = await this.generateReportData(report.form_id, reportConfig);
      
      // Actualizar última generación
      const updateSql = `
        UPDATE custom_reports 
        SET last_generated = NOW() 
        WHERE id = ?
      `;
      await query(updateSql, [reportId]);
      
      return {
        report_id: reportId,
        report_name: report.name,
        generated_at: new Date(),
        data: reportData
      };
      
    } catch (error) {
      throw error;
    }
  }

  // Generar datos de reporte
  static async generateReportData(formId, config) {
    const reportData = {
      form_info: {},
      response_summary: {},
      question_analytics: [],
      time_series: [],
      filters: config.filters || {}
    };
    
    // Información del formulario
    const formSql = 'SELECT * FROM forms WHERE id = ?';
    const formResult = await query(formSql, [formId]);
    reportData.form_info = formResult[0] || {};
    
    // Resumen de respuestas
    const responseSql = `
      SELECT 
        COUNT(*) as total_responses,
        MIN(submitted_at) as first_response,
        MAX(submitted_at) as last_response,
        AVG(TIMESTAMPDIFF(MINUTE, submitted_at, submitted_at)) as avg_completion_time
      FROM form_responses
      WHERE form_id = ?
    `;
    const responseResult = await query(responseSql, [formId]);
    reportData.response_summary = responseResult[0] || {};
    
    // Análisis por pregunta
    if (config.include_question_analytics !== false) {
      reportData.question_analytics = await this.getQuestionAnalytics(formId);
    }
    
    // Serie temporal
    if (config.include_time_series !== false) {
      const timeSeriesSql = `
        SELECT 
          DATE(submitted_at) as date,
          COUNT(*) as responses
        FROM form_responses
        WHERE form_id = ?
        GROUP BY DATE(submitted_at)
        ORDER BY date DESC
        LIMIT 30
      `;
      const timeSeriesResult = await query(timeSeriesSql, [formId]);
      reportData.time_series = timeSeriesResult;
    }
    
    return reportData;
  }

  // Obtener tendencias de formularios
  static async getFormTrends(days = 30) {
    const sql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as forms_created
      FROM forms
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    
    try {
      return await query(sql, [days]);
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas de usuarios activos
  static async getActiveUsersStats(days = 30) {
    const sql = `
      SELECT 
        COUNT(DISTINCT f.created_by) as active_creators,
        COUNT(DISTINCT fr.id) as total_responses,
        COUNT(DISTINCT DATE(fr.submitted_at)) as active_days
      FROM forms f
      LEFT JOIN form_responses fr ON f.id = fr.form_id
      WHERE f.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         OR fr.submitted_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    
    try {
      const result = await query(sql, [days, days]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Exportar datos de formulario
  static async exportFormData(formId, format = 'json') {
    const connection = await getConnection();
    
    try {
      // Obtener formulario con preguntas
      const formSql = `
        SELECT f.*, u.username as created_by_username
        FROM forms f
        LEFT JOIN users u ON f.created_by = u.id
        WHERE f.id = ?
      `;
      const formResult = await connection.execute(formSql, [formId]);
      const form = formResult[0][0];
      
      if (!form) {
        throw new Error('Form not found');
      }
      
      // Obtener preguntas
      const questionsSql = `
        SELECT q.*, GROUP_CONCAT(qo.option_text ORDER BY qo.order_index SEPARATOR '|') as options
        FROM questions q
        LEFT JOIN question_options qo ON q.id = qo.question_id
        WHERE q.form_id = ?
        GROUP BY q.id
        ORDER BY q.order_index
      `;
      const questionsResult = await connection.execute(questionsSql, [formId]);
      const questions = questionsResult[0].map(q => ({
        ...q,
        options: q.options ? q.options.split('|') : []
      }));
      
      // Obtener respuestas
      const responsesSql = `
        SELECT fr.*, GROUP_CONCAT(
          CONCAT(q.question_text, ': ', a.answer_text) 
          ORDER BY q.order_index SEPARATOR '|'
        ) as answers
        FROM form_responses fr
        LEFT JOIN answers a ON fr.id = a.response_id
        LEFT JOIN questions q ON a.question_id = q.id
        WHERE fr.form_id = ?
        GROUP BY fr.id
        ORDER BY fr.submitted_at DESC
      `;
      const responsesResult = await connection.execute(responsesSql, [formId]);
      const responses = responsesResult[0].map(r => ({
        ...r,
        answers: r.answers ? r.answers.split('|') : []
      }));
      
      const exportData = {
        form,
        questions,
        responses,
        export_date: new Date().toISOString(),
        total_responses: responses.length
      };
      
      return exportData;
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Analytics; 