const fs = require('fs').promises;
const path = require('path');
const { testConnection } = require('./config/database');
const User = require('./models/User');
const Form = require('./models/Form');
const Response = require('./models/Response');

async function migrateFromJSON() {
  console.log('🔄 Iniciando migración desde JSON a MySQL...');
  
  try {
    // Verificar conexión a la base de datos
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a MySQL. Verifica la configuración.');
      return;
    }
    
    // Migrar usuarios
    await migrateUsers();
    
    // Migrar formularios
    await migrateForms();
    
    // Migrar respuestas
    await migrateResponses();
    
    console.log('✅ Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  }
}

async function migrateUsers() {
  console.log('📝 Migrando usuarios...');
  
  try {
    const usersPath = path.join(__dirname, 'data', 'users.json');
    const usersData = await fs.readFile(usersPath, 'utf8');
    const users = JSON.parse(usersData);
    
    let migratedCount = 0;
    
    for (const user of users) {
      try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findByUsernameOrEmail(user.username);
        if (!existingUser) {
          await User.create({
            username: user.username,
            email: user.email,
            password: user.password,
            role: user.role
          });
          migratedCount++;
        }
      } catch (error) {
        console.error(`Error migrando usuario ${user.username}:`, error.message);
      }
    }
    
    console.log(`✅ ${migratedCount} usuarios migrados`);
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('ℹ️ No se encontró archivo de usuarios JSON');
    } else {
      console.error('Error migrando usuarios:', error);
    }
  }
}

async function migrateForms() {
  console.log('📋 Migrando formularios...');
  
  try {
    const formsPath = path.join(__dirname, 'data', 'forms.json');
    const formsData = await fs.readFile(formsPath, 'utf8');
    const forms = JSON.parse(formsData);
    
    let migratedCount = 0;
    
    for (const form of forms) {
      try {
        // Verificar si el formulario ya existe
        const existingForm = await Form.findById(form.id);
        if (!existingForm) {
          await Form.create({
            title: form.title,
            description: form.description || '',
            questions: form.questions
          }, form.created_by || 1); // Usar admin como creador por defecto
          migratedCount++;
        }
      } catch (error) {
        console.error(`Error migrando formulario ${form.id}:`, error.message);
      }
    }
    
    console.log(`✅ ${migratedCount} formularios migrados`);
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('ℹ️ No se encontró archivo de formularios JSON');
    } else {
      console.error('Error migrando formularios:', error);
    }
  }
}

async function migrateResponses() {
  console.log('📊 Migrando respuestas...');
  
  try {
    const responsesPath = path.join(__dirname, 'data', 'responses.json');
    const responsesData = await fs.readFile(responsesPath, 'utf8');
    const responses = JSON.parse(responsesData);
    
    let migratedCount = 0;
    
    for (const response of responses) {
      try {
        // Verificar si la respuesta ya existe
        const existingResponse = await Response.findById(response.id);
        if (!existingResponse) {
          await Response.create({
            form_id: response.form_id,
            respondent_name: response.respondent_name,
            answers: response.answers
          });
          migratedCount++;
        }
      } catch (error) {
        console.error(`Error migrando respuesta ${response.id}:`, error.message);
      }
    }
    
    console.log(`✅ ${migratedCount} respuestas migradas`);
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('ℹ️ No se encontró archivo de respuestas JSON');
    } else {
      console.error('Error migrando respuestas:', error);
    }
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateFromJSON().then(() => {
    console.log('🎉 Proceso de migración finalizado');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Error fatal durante la migración:', error);
    process.exit(1);
  });
}

module.exports = { migrateFromJSON }; 