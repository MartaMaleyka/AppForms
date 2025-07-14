const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Importar configuración de base de datos y modelos
const { testConnection } = require('./config/database');
const User = require('./models/User');
const Form = require('./models/Form');
const Response = require('./models/Response');
const Analytics = require('./models/Analytics'); // Added Analytics model
const AuditLog = require('./models/AuditLog'); // Added AuditLog model
const FileAttachment = require('./models/FileAttachment'); // Added FileAttachment model
const FormTemplate = require('./models/FormTemplate'); // Added FormTemplate model
const Validation = require('./models/Validation'); // Added Validation model
const Notification = require('./models/Notification'); // Added Notification model


const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de autenticación
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// API Routes

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validar datos de entrada
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findByUsernameOrEmail(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear usuario
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user'
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Find user by username or email
    const user = await User.findByUsernameOrEmail(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({ error: 'Error getting user info' });
  }
});

// Protected routes - require authentication
// Create a new form
app.post('/api/forms', authenticateToken, async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    
    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ error: 'Title and at least one question are required' });
    }
    
    const newForm = await Form.create({
      title,
      description: description || '',
      questions
    }, req.user.id);
    
    res.json({ id: newForm.id, message: 'Form created successfully' });
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: 'Error creating form' });
  }
});

// Get all forms
app.get('/api/forms', authenticateToken, async (req, res) => {
  try {
    const forms = await Form.findByUser(req.user.id);
    res.json(forms);
  } catch (error) {
    console.error('Error reading forms:', error);
    res.status(500).json({ error: 'Error reading forms' });
  }
});

// Get a specific form with questions
app.get('/api/forms/:id', async (req, res) => {
  try {
    const formId = parseInt(req.params.id);
    const form = await Form.findById(formId);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Obtener validaciones para cada pregunta
        res.json(form);
  } catch (error) {
    console.error('Error reading form:', error);
    res.status(500).json({ error: 'Error reading form' });
  }
});

// Submit a form response
app.post('/api/forms/:id/responses', async (req, res) => {
  try {
    const formId = parseInt(req.params.id);
    const { respondent_name, answers } = req.body;
    
    if (!respondent_name || !answers || answers.length === 0) {
      return res.status(400).json({ error: 'Respondent name and answers are required' });
    }
    
    // Verificar que el formulario existe
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    const newResponse = await Response.create({
      form_id: formId,
      respondent_name,
      answers
    });
    
    // Generar notificación para el creador del formulario
    try {
      await Notification.notifyNewResponse(formId, newResponse.id, respondent_name);
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // No fallar la respuesta si la notificación falla
    }
    
    res.json({ message: 'Response submitted successfully' });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: 'Error submitting response' });
  }
});

// Get form responses
app.get('/api/forms/:id/responses', authenticateToken, async (req, res) => {
  try {
    const formId = parseInt(req.params.id);
    
    // Verificar que el formulario existe y pertenece al usuario
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Verificar que el formulario pertenece al usuario autenticado
    if (form.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const responses = await Response.findByFormId(formId);
    res.json(responses);
  } catch (error) {
    console.error('Error reading responses:', error);
    res.status(500).json({ error: 'Error reading responses' });
  }
});

// Delete a form
app.delete('/api/forms/:id', authenticateToken, async (req, res) => {
  try {
    const formId = parseInt(req.params.id);
    
    // Verificar que el formulario existe y pertenece al usuario
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Verificar que el formulario pertenece al usuario autenticado
    if (form.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Eliminar formulario (las respuestas se eliminan automáticamente por CASCADE)
    const deleted = await Form.delete(formId);
    
    if (deleted) {
      res.json({ message: 'Form deleted successfully' });
    } else {
      res.status(404).json({ error: 'Form not found' });
    }
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: 'Error deleting form' });
  }
});

// Export form responses to Excel
app.get('/api/forms/:id/responses/export', authenticateToken, async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    const formId = parseInt(req.params.id);
    
    // Verificar que el formulario existe y pertenece al usuario
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Verificar que el formulario pertenece al usuario autenticado
    if (form.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const responses = await Response.findByFormId(formId);
    
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Responses');
    
    // Define columns
    const columns = [
      { header: 'Respondent', key: 'respondent_name', width: 20 },
      { header: 'Date Submitted', key: 'submitted_at', width: 20 }
    ];
    
    // Add question columns
    form.questions.forEach((question, index) => {
      columns.push({
        header: `Q${index + 1}: ${question.question_text}`,
        key: `question_${question.id}`,
        width: 30
      });
    });
    
    worksheet.columns = columns;
    
    // Add data rows
    responses.forEach(response => {
      const row = {
        respondent_name: response.respondent_name,
        submitted_at: new Date(response.submitted_at).toLocaleString()
      };
      
      // Add answers to row
      response.answers.forEach(answer => {
        row[`question_${answer.question_id}`] = answer.answer_text;
      });
      
      worksheet.addRow(row);
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="form_${formId}_responses.xlsx"`);
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error('Error exporting responses:', error);
    res.status(500).json({ error: 'Error exporting responses' });
  }
});

// Analytics endpoints - filtrados por usuario
app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const { form_id, date_range } = req.query;
    const userId = req.user.id;
    
    let analyticsData;
    let recentResponses = [];
    
    if (form_id && form_id !== 'all') {
      // Verificar que el formulario pertenece al usuario
      const form = await Form.findById(parseInt(form_id));
      if (!form || form.created_by !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      analyticsData = await Analytics.getFormStats(parseInt(form_id), parseInt(date_range) || 30);
      recentResponses = await Response.findByFormId(parseInt(form_id));
    } else {
      // Obtener analytics de todos los formularios del usuario
      analyticsData = await Analytics.getUserStats(userId, parseInt(date_range) || 30);
      recentResponses = await Response.findRecentByUser(userId, 10);
    }
    
    res.json({
      analytics: analyticsData,
      recent_responses: recentResponses
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Error fetching analytics' });
  }
});

app.get('/api/analytics/forms', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const forms = await Form.findByUser(userId);
    
    const analyticsPromises = forms.map(async (form) => {
      const stats = await Analytics.getFormStats(form.id, 30);
      return {
        ...form,
        stats: stats
      };
    });
    
    const formsWithStats = await Promise.all(analyticsPromises);
    res.json(formsWithStats);
  } catch (error) {
    console.error('Error fetching forms analytics:', error);
    res.status(500).json({ error: 'Error fetching forms analytics' });
  }
});

// Audit logs filtrados por usuario
app.get('/api/audit-logs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { action_type, severity_level, date_from, date_to, page = 1, limit = 20 } = req.query;
    
    const filters = {
      user_id: userId,
      action: action_type !== 'all' ? action_type : null,
      start_date: date_from || null,
      end_date: date_to || null
    };
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const logs = await AuditLog.find(filters, parseInt(limit), offset);
    const stats = await AuditLog.getStats(filters);
    
    res.json({
      logs: logs,
      stats: stats,
      total_pages: Math.ceil(stats.total_logs / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Error fetching audit logs' });
  }
});

// File attachments filtrados por usuario
app.get('/api/files', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const files = await FileAttachment.findByUser(userId);
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Error fetching files' });
  }
});

app.get('/api/files/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await FileAttachment.getUserStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching file stats:', error);
    res.status(500).json({ error: 'Error fetching file stats' });
  }
});

// Templates filtrados por usuario
app.get('/api/templates', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const templates = await FormTemplate.findByUser(userId);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Error fetching templates' });
  }
});

// Notification endpoints
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;
    
    const notifications = await Notification.findByUser(userId, parseInt(limit), parseInt(offset));
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Error fetching notifications' });
  }
});

app.get('/api/notifications/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadNotifications = await Notification.findUnreadByUser(userId, 100);
    const count = unreadNotifications.length;
    
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Error fetching unread count' });
  }
});

app.get('/api/notifications/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await Notification.getStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Error fetching notification stats' });
  }
});

app.post('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const success = await Notification.markAsRead(parseInt(id), userId);
    
    if (success) {
      res.json({ message: 'Notification marked as read' });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Error marking notification as read' });
  }
});

app.post('/api/notifications/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sql = `
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE user_id = ? AND is_read = FALSE
    `;
    const { query } = require('./config/database');
    await query(sql, [userId]);
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Error marking all notifications as read' });
  }
});

app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const success = await Notification.delete(parseInt(id), userId);
    
    if (success) {
      res.json({ message: 'Notification deleted successfully' });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Error deleting notification' });
  }
});

app.delete('/api/notifications/clear-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sql = `
      DELETE FROM notifications 
      WHERE user_id = ?
    `;
    const { query } = require('./config/database');
    await query(sql, [userId]);
    
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    res.status(500).json({ error: 'Error clearing all notifications' });
  }
});

// Test endpoint para crear notificaciones de prueba
app.post('/api/notifications/test', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, message, type = 'info', related_form_id = null } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    
    const notificationData = {
      user_id: userId,
      title,
      message,
      type,
      related_form_id
    };
    
    const result = await Notification.create(notificationData);
    res.json({ 
      id: result.id, 
      message: 'Test notification created successfully',
      notification: notificationData
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ error: 'Error creating test notification' });
  }
});

// Validation endpoints - DISABLED
/*
app.get('/api/validations', authenticateToken, async (req, res) => {
  try {
    const validations = await Validation.findAll();
    res.json(validations);
  } catch (error) {
    console.error('Error fetching validations:', error);
    res.status(500).json({ error: 'Error fetching validations' });
  }
});

app.get('/api/validations/global', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sql = `
      SELECT * FROM custom_validations
      WHERE question_id IS NULL AND created_by = ? AND is_active = 1
      ORDER BY created_at DESC
    `;
    const { query } = require('./config/database');
    const validations = await query(sql, [userId]);
    res.json(validations);
  } catch (error) {
    console.error('Error fetching global validations:', error);
    res.status(500).json({ error: 'Error fetching global validations' });
  }
});

app.post('/api/validations', authenticateToken, async (req, res) => {
  try {
    const { name, description, validation_type, parameters, error_message, is_active } = req.body;
    
    console.log('Creating validation with data:', { name, description, validation_type, parameters, error_message, is_active });
    
    if (!name || !validation_type || !error_message) {
      return res.status(400).json({ error: 'Name, validation type and error message are required' });
    }
    
    // Convertir parámetros a regla de validación
    let validation_rule = '';
    switch (validation_type) {
      case 'regex':
        validation_rule = parameters.pattern || '';
        break;
      case 'length':
        validation_rule = JSON.stringify({
          min_length: parameters.min_length,
          max_length: parameters.max_length
        });
        break;
      case 'range':
        validation_rule = JSON.stringify({
          min_value: parameters.min_value,
          max_value: parameters.max_value
        });
        break;
      case 'email':
        validation_rule = 'email';
        break;
      case 'url':
        validation_rule = 'url';
        break;
      case 'phone':
        validation_rule = 'phone';
        break;
      case 'custom':
        validation_rule = parameters.function || '';
        break;
      default:
        validation_rule = '';
    }
    
    const validationData = {
      name,
      description,
      validation_type,
      validation_rule,
      error_message,
      is_active: is_active !== false,
      created_by: req.user.id
    };
    
    console.log('Validation data to save:', validationData);
    
    const result = await Validation.create(validationData);
    res.json({ id: result.id, message: 'Validation created successfully' });
  } catch (error) {
    console.error('Error creating validation:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: `Error creating validation: ${error.message}` });
  }
});

app.put('/api/validations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, validation_type, parameters, error_message, is_active } = req.body;
    
    const validationData = {
      name,
      description,
      validation_type,
      validation_rule: JSON.stringify(parameters),
      error_message,
      is_active
    };
    
    await Validation.update(parseInt(id), validationData);
    res.json({ message: 'Validation updated successfully' });
  } catch (error) {
    console.error('Error updating validation:', error);
    res.status(500).json({ error: 'Error updating validation' });
  }
});

app.delete('/api/validations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Validation.delete(parseInt(id));
    
    if (deleted) {
      res.json({ message: 'Validation deleted successfully' });
    } else {
      res.status(404).json({ error: 'Validation not found' });
    }
  } catch (error) {
    console.error('Error deleting validation:', error);
    res.status(500).json({ error: 'Error deleting validation' });
  }
});

app.post('/api/validations/test', authenticateToken, async (req, res) => {
  try {
    const { validation_id, test_value } = req.body;
    
    if (!validation_id || test_value === undefined) {
      return res.status(400).json({ error: 'Validation ID and test value are required' });
    }
    
    const validation = await Validation.findById(validation_id);
    if (!validation) {
      return res.status(404).json({ error: 'Validation not found' });
    }
    
    const isValid = await Validation.validateSingleRule(validation, test_value);
    
    res.json({
      success: isValid,
      message: isValid ? 'Validation passed' : validation.error_message
    });
  } catch (error) {
    console.error('Error testing validation:', error);
    res.status(500).json({ error: 'Error testing validation' });
  }
});

app.post('/api/validations/validate', async (req, res) => {
  try {
    const { questionId, value } = req.body;
    
    if (!questionId || value === undefined) {
      return res.status(400).json({ error: 'Question ID and value are required' });
    }
    
    const result = await Validation.validateValue(questionId, value);
    res.json(result);
  } catch (error) {
    console.error('Error validating value:', error);
    res.status(500).json({ error: 'Error validating value' });
  }
});
*/

// Serve React app
app.get('*', (req, res) => {
  // In development, redirect to React dev server
  if (process.env.NODE_ENV !== 'production') {
    return res.redirect('http://localhost:3000' + req.url);
  }
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Initialize and start server
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos MySQL');
      console.error('Por favor, ejecuta el script de configuración de la base de datos');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📊 Base de datos MySQL conectada correctamente`);
      console.log(`🌐 Frontend: http://localhost:3000`);
      console.log(`🔧 API: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer().catch(console.error); 