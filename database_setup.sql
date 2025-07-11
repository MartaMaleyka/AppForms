-- Script de configuración de base de datos para Sistema de Formularios Dinámicos
-- Base de datos: forms_db
-- Usuario: root
-- Contraseña: labebe
-- Puerto: 3306

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS forms_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE forms_db;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Tabla de formularios
CREATE TABLE IF NOT EXISTS forms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_created_at (created_at),
    INDEX idx_created_by (created_by)
);

-- Tabla de preguntas
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    form_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('text', 'textarea', 'radio', 'checkbox', 'select', 'date', 'time', 'datetime-local') NOT NULL,
    required BOOLEAN DEFAULT FALSE,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    INDEX idx_form_id (form_id),
    INDEX idx_order_index (order_index)
);

-- Tabla de opciones para preguntas (radio, checkbox, select)
CREATE TABLE IF NOT EXISTS question_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_question_id (question_id),
    INDEX idx_order_index (order_index)
);

-- Tabla de lógica de saltos (skip logic)
CREATE TABLE IF NOT EXISTS skip_logic (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_question_skip_logic (question_id)
);

-- Tabla de condiciones de skip logic
CREATE TABLE IF NOT EXISTS skip_logic_conditions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    skip_logic_id INT NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    skip_to_question_id INT,
    skip_to_end BOOLEAN DEFAULT FALSE,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (skip_logic_id) REFERENCES skip_logic(id) ON DELETE CASCADE,
    FOREIGN KEY (skip_to_question_id) REFERENCES questions(id) ON DELETE SET NULL,
    INDEX idx_skip_logic_id (skip_logic_id),
    INDEX idx_order_index (order_index)
);

-- Tabla de respuestas de formularios
CREATE TABLE IF NOT EXISTS form_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    form_id INT NOT NULL,
    respondent_name VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    INDEX idx_form_id (form_id),
    INDEX idx_submitted_at (submitted_at)
);

-- Tabla de respuestas individuales
CREATE TABLE IF NOT EXISTS answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    response_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (response_id) REFERENCES form_responses(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_response_id (response_id),
    INDEX idx_question_id (question_id)
);

-- Insertar usuario administrador por defecto
-- Password: 'password' (hasheado con bcrypt)
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE 
    email = VALUES(email),
    password = VALUES(password),
    role = VALUES(role);

-- Crear índices adicionales para optimizar consultas
CREATE INDEX idx_forms_title ON forms(title);
CREATE INDEX idx_questions_form_order ON questions(form_id, order_index);
CREATE INDEX idx_responses_form_date ON form_responses(form_id, submitted_at);
CREATE INDEX idx_answers_response_question ON answers(response_id, question_id);

-- Verificar que las tablas se crearon correctamente
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as users_count FROM users;
SELECT COUNT(*) as forms_count FROM forms;
SELECT COUNT(*) as questions_count FROM questions;
SELECT COUNT(*) as responses_count FROM form_responses; 