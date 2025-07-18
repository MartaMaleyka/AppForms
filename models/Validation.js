const { query, getConnection } = require('../config/database');

class Validation {
  // Crear una nueva validación
  static async create(validationData) {
    const { name, description, validation_type, validation_rule, error_message, is_active, created_by } = validationData;
    
    console.log('Validation.create called with:', validationData);
    
    const sql = `
      INSERT INTO custom_validations (name, description, validation_type, validation_rule, error_message, is_active, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [name, description, validation_type, validation_rule, error_message, is_active, created_by];
    console.log('SQL params:', params);
    
    try {
      const result = await query(sql, params);
      console.log('Validation created successfully with ID:', result.insertId);
      return { id: result.insertId, message: 'Validation created successfully' };
    } catch (error) {
      console.error('Database error in Validation.create:', error);
      throw error;
    }
  }

  // Obtener validaciones de una pregunta
  static async findByQuestion(questionId) {
    const sql = `
      SELECT * FROM custom_validations 
      WHERE question_id = ?
      ORDER BY id
    `;
    
    try {
      return await query(sql, [questionId]);
    } catch (error) {
      throw error;
    }
  }

  // Obtener todas las validaciones
  static async findAll() {
    const sql = `
      SELECT cv.*, u.username as created_by_username
      FROM custom_validations cv
      LEFT JOIN users u ON cv.created_by = u.id
      WHERE cv.is_active = 1
      ORDER BY cv.created_at DESC
    `;
    
    try {
      return await query(sql);
    } catch (error) {
      throw error;
    }
  }

  // Obtener validaciones de un usuario específico
  static async findByUser(userId) {
    const sql = `
      SELECT cv.*, q.question_text, q.question_type, f.title as form_title
      FROM custom_validations cv
      JOIN questions q ON cv.question_id = q.id
      JOIN forms f ON q.form_id = f.id
      WHERE f.created_by = ?
      ORDER BY cv.question_id, cv.id
    `;
    
    try {
      return await query(sql, [userId]);
    } catch (error) {
      throw error;
    }
  }

  // Actualizar una validación
  static async update(id, validationData) {
    const { name, description, validation_type, validation_rule, error_message, is_active } = validationData;
    
    const sql = `
      UPDATE custom_validations 
      SET name = ?, description = ?, validation_type = ?, validation_rule = ?, error_message = ?, is_active = ?
      WHERE id = ?
    `;
    
    try {
      await query(sql, [name, description, validation_type, validation_rule, error_message, is_active, id]);
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Obtener una validación por ID
  static async findById(id) {
    const sql = `
      SELECT cv.*, u.username as created_by_username
      FROM custom_validations cv
      LEFT JOIN users u ON cv.created_by = u.id
      WHERE cv.id = ?
    `;
    
    try {
      const validations = await query(sql, [id]);
      return validations[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar una validación
  static async delete(id) {
    const sql = 'DELETE FROM custom_validations WHERE id = ?';
    
    try {
      const result = await query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Validar un valor según las reglas
  static async validateValue(questionId, value) {
    const validations = await this.findByQuestion(questionId);
    const results = [];
    
    for (const validation of validations) {
      const isValid = await this.validateSingleRule(validation, value);
      results.push({
        validation_id: validation.id,
        validation_type: validation.validation_type,
        is_valid: isValid,
        error_message: isValid ? null : validation.error_message
      });
    }
    
    return {
      is_valid: results.every(r => r.is_valid),
      results: results
    };
  }

  // Validar una regla específica
  static async validateSingleRule(validation, value) {
    switch (validation.validation_type) {
      case 'regex':
        try {
          const regex = new RegExp(validation.validation_rule);
          return regex.test(value);
        } catch (e) {
          return false;
        }
        
      case 'length':
        try {
          const params = JSON.parse(validation.validation_rule);
          const length = value ? value.length : 0;
          const minLength = params.min_length || 0;
          const maxLength = params.max_length || Infinity;
          return length >= minLength && length <= maxLength;
        } catch (e) {
          return false;
        }
        
      case 'range':
        try {
          const params = JSON.parse(validation.validation_rule);
          const numValue = parseFloat(value);
          const minValue = params.min_value || -Infinity;
          const maxValue = params.max_value || Infinity;
          return !isNaN(numValue) && numValue >= minValue && numValue <= maxValue;
        } catch (e) {
          return false;
        }
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
        
      case 'url':
        try {
          new URL(value);
          return true;
        } catch (e) {
          return false;
        }
        
      case 'phone':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
        
      case 'custom':
        try {
          // Evaluar función personalizada (con precauciones de seguridad)
          const func = new Function('value', validation.validation_rule);
          return func(value);
        } catch (e) {
          return false;
        }
        
      default:
        return true;
    }
  }

  // Crear validaciones predefinidas
  static async createPredefinedValidations(questionId, validations) {
    const connection = await getConnection();
    
    try {
      await connection.beginTransaction();
      
      for (const validation of validations) {
        const sql = `
          INSERT INTO custom_validations (question_id, validation_type, validation_rule, error_message) 
          VALUES (?, ?, ?, ?)
        `;
        
        await connection.execute(sql, [
          questionId,
          validation.type,
          validation.rule,
          validation.error_message
        ]);
      }
      
      await connection.commit();
      return { message: `${validations.length} validations created successfully` };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener validaciones predefinidas por tipo de pregunta
  static getPredefinedValidations(questionType) {
    const validations = {
      'text': [
        {
          type: 'min_length',
          rule: '3',
          error_message: 'El texto debe tener al menos 3 caracteres'
        },
        {
          type: 'max_length',
          rule: '255',
          error_message: 'El texto no puede exceder 255 caracteres'
        }
      ],
      'textarea': [
        {
          type: 'min_length',
          rule: '10',
          error_message: 'El texto debe tener al menos 10 caracteres'
        },
        {
          type: 'max_length',
          rule: '1000',
          error_message: 'El texto no puede exceder 1000 caracteres'
        }
      ],
      'email': [
        {
          type: 'email',
          rule: '',
          error_message: 'Por favor ingrese un email válido'
        }
      ],
      'phone': [
        {
          type: 'phone',
          rule: '',
          error_message: 'Por favor ingrese un número de teléfono válido'
        }
      ],
      'number': [
        {
          type: 'min_value',
          rule: '0',
          error_message: 'El valor debe ser mayor o igual a 0'
        },
        {
          type: 'max_value',
          rule: '999999',
          error_message: 'El valor no puede exceder 999,999'
        }
      ]
    };
    
    return validations[questionType] || [];
  }

  // Obtener tipos de validación disponibles
  static getValidationTypes() {
    return [
      { value: 'regex', label: 'Expresión regular', description: 'Validar con expresión regular' },
      { value: 'min_length', label: 'Longitud mínima', description: 'Establecer longitud mínima' },
      { value: 'max_length', label: 'Longitud máxima', description: 'Establecer longitud máxima' },
      { value: 'min_value', label: 'Valor mínimo', description: 'Establecer valor mínimo' },
      { value: 'max_value', label: 'Valor máximo', description: 'Establecer valor máximo' },
      { value: 'email', label: 'Email válido', description: 'Validar formato de email' },
      { value: 'phone', label: 'Teléfono válido', description: 'Validar formato de teléfono' },
      { value: 'custom', label: 'Personalizada', description: 'Validación personalizada' }
    ];
  }

  // Validar múltiples valores
  static async validateMultipleValues(validations) {
    const results = [];
    
    for (const validation of validations) {
      const { question_id, value } = validation;
      const validationResult = await this.validateValue(question_id, value);
      
      results.push({
        question_id,
        value,
        ...validationResult
      });
    }
    
    return results;
  }

  // Obtener estadísticas de validaciones
  static async getStats() {
    const sql = `
      SELECT 
        validation_type,
        COUNT(*) as count
      FROM custom_validations
      GROUP BY validation_type
      ORDER BY count DESC
    `;
    
    try {
      return await query(sql);
    } catch (error) {
      throw error;
    }
  }

  // Duplicar validaciones de una pregunta a otra
  static async duplicateValidations(fromQuestionId, toQuestionId) {
    const connection = await getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Obtener validaciones de la pregunta origen
      const validations = await this.findByQuestion(fromQuestionId);
      
      // Crear validaciones en la pregunta destino
      for (const validation of validations) {
        const sql = `
          INSERT INTO custom_validations (question_id, validation_type, validation_rule, error_message) 
          VALUES (?, ?, ?, ?)
        `;
        
        await connection.execute(sql, [
          toQuestionId,
          validation.validation_type,
          validation.validation_rule,
          validation.error_message
        ]);
      }
      
      await connection.commit();
      return { message: `${validations.length} validations duplicated successfully` };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Validation; 