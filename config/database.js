const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'labebe12',
  database: 'forms_db',
  charset: 'utf8mb4',
  timezone: '+00:00',
  // Configuraciones adicionales para mejor rendimiento
  connectionLimit: 10
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:', error.message);
    return false;
  }
}

// Función para ejecutar consultas
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Error en consulta SQL:', error);
    throw error;
  }
}

// Función para obtener una conexión
async function getConnection() {
  return await pool.getConnection();
}

module.exports = {
  pool,
  query,
  getConnection,
  testConnection,
  dbConfig
}; 