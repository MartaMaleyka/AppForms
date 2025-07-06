const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Data files
const FORMS_FILE = './data/forms.json';
const RESPONSES_FILE = './data/responses.json';

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

// Write data to JSON files
async function writeForms(forms) {
  await fs.writeFile(FORMS_FILE, JSON.stringify(forms, null, 2));
}

async function writeResponses(responses) {
  await fs.writeFile(RESPONSES_FILE, JSON.stringify(responses, null, 2));
}

// Initialize data
async function initializeData() {
  await ensureDataDirectory();
  await initializeDataFiles();
  console.log('Data files initialized successfully');
}

// API Routes

// Create a new form
app.post('/api/forms', async (req, res) => {
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
app.get('/api/forms/:id/responses', async (req, res) => {
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