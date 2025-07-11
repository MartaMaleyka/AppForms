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
app.get('/api/forms', async (req, res) => {
  try {
    const forms = await Form.findAll();
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
    
    // Verificar que el formulario existe
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
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
    
    // Verificar que el formulario existe
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
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
    
    // Verificar que el formulario existe
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
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