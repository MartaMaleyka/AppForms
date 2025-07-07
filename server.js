const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Data files
const FORMS_FILE = './data/forms.json';
const RESPONSES_FILE = './data/responses.json';
const USERS_FILE = './data/users.json';

// Ensure data directory exists
async function ensureDataDirectory() {
  try {
    await fs.mkdir('./data', { recursive: true });
  } catch (error) {
    console.log('Data directory already exists');
  }
}

// Initialize data files if they don't exist
async function initializeDataFiles() {
  try {
    await fs.access(FORMS_FILE);
  } catch {
    await fs.writeFile(FORMS_FILE, JSON.stringify([], null, 2));
  }
  
  try {
    await fs.access(RESPONSES_FILE);
  } catch {
    await fs.writeFile(RESPONSES_FILE, JSON.stringify([], null, 2));
  }

  try {
    await fs.access(USERS_FILE);
  } catch {
    // Create default admin user
    const defaultUsers = [{
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'admin',
      created_at: new Date().toISOString()
    }];
    await fs.writeFile(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
  }
}

// Read data from JSON files
async function readForms() {
  try {
    const data = await fs.readFile(FORMS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function readResponses() {
  try {
    const data = await fs.readFile(RESPONSES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Read users from JSON file
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write data to JSON files
async function writeForms(forms) {
  await fs.writeFile(FORMS_FILE, JSON.stringify(forms, null, 2));
}

async function writeResponses(responses) {
  await fs.writeFile(RESPONSES_FILE, JSON.stringify(responses, null, 2));
}

// Write users to JSON file
async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// Initialize data
async function initializeData() {
  await ensureDataDirectory();
  await initializeDataFiles();
  console.log('Data files initialized successfully');
}

// Authentication middleware
function authenticateToken(req, res, next) {
  console.log('Authenticating request for:', req.method, req.path);
  console.log('Headers:', req.headers);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth header:', authHeader);
  console.log('Token:', token);

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    console.log('Token verified successfully, user:', user);
    req.user = user;
    next();
  });
}

// API Routes

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const users = await readUsers();
    
    // Check if user already exists
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: Date.now(),
      username,
      email,
      password: hashedPassword,
      role: 'user',
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    await writeUsers(users);
    
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
    const users = await readUsers();
    
    // Find user by username or email
    const user = users.find(u => u.username === username || u.email === username);
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
    const users = await readUsers();
    const user = users.find(u => u.id === req.user.id);
    
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
    const forms = await readForms();
    
    const newForm = {
      id: Date.now(),
      title,
      description,
      questions: questions.map((q, index) => ({
        id: Date.now() + index + 1,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options || [],
        required: q.required,
        skip_logic: q.skip_logic || { enabled: false, conditions: [] },
        order_index: index
      })),
      created_at: new Date().toISOString()
    };
    
    forms.push(newForm);
    await writeForms(forms);
    
    res.json({ id: newForm.id, message: 'Form created successfully' });
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: 'Error creating form' });
  }
});

// Get all forms
app.get('/api/forms', async (req, res) => {
  try {
    const forms = await readForms();
    res.json(forms.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
  } catch (error) {
    console.error('Error reading forms:', error);
    res.status(500).json({ error: 'Error reading forms' });
  }
});

// Get a specific form with questions
app.get('/api/forms/:id', async (req, res) => {
  try {
    const formId = parseInt(req.params.id);
    const forms = await readForms();
    const form = forms.find(f => f.id === formId);
    
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
    const responses = await readResponses();
    
    const newResponse = {
      id: Date.now(),
      form_id: formId,
      respondent_name,
      answers: answers.map(a => ({
        question_id: a.question_id,
        answer_text: a.answer_text
      })),
      submitted_at: new Date().toISOString()
    };
    
    responses.push(newResponse);
    await writeResponses(responses);
    
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
    const responses = await readResponses();
    const forms = await readForms();
    
    const form = forms.find(f => f.id === formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    const formResponses = responses
      .filter(r => r.form_id === formId)
      .map(response => ({
        id: response.id,
        respondent_name: response.respondent_name,
        submitted_at: response.submitted_at,
        answers: response.answers.map(answer => {
          const question = form.questions.find(q => q.id === answer.question_id);
          return {
            question_id: answer.question_id,
            question_text: question ? question.question_text : 'Unknown Question',
            question_type: question ? question.question_type : 'text',
            answer_text: answer.answer_text
          };
        })
      }));
    
    res.json(formResponses);
  } catch (error) {
    console.error('Error reading responses:', error);
    res.status(500).json({ error: 'Error reading responses' });
  }
});

// Delete a form
app.delete('/api/forms/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Delete request received for form ID:', req.params.id);
    console.log('User:', req.user);
    
    const formId = parseInt(req.params.id);
    const forms = await readForms();
    const responses = await readResponses();
    
    console.log('Total forms:', forms.length);
    console.log('Form IDs:', forms.map(f => f.id));
    
    const formIndex = forms.findIndex(f => f.id === formId);
    console.log('Form index:', formIndex);
    
    if (formIndex === -1) {
      console.log('Form not found');
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Remove the form
    forms.splice(formIndex, 1);
    await writeForms(forms);
    
    // Remove all responses for this form
    const filteredResponses = responses.filter(r => r.form_id !== formId);
    await writeResponses(filteredResponses);
    
    console.log('Form deleted successfully');
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: 'Error deleting form' });
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
  await initializeData();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Data files: ${FORMS_FILE}, ${RESPONSES_FILE}`);
  });
}

startServer().catch(console.error); 