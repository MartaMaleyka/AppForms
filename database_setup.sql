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

-- ===== NUEVAS TABLAS Y FUNCIONALIDADES =====

-- Tabla de plantillas de formularios
CREATE TABLE IF NOT EXISTS form_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT FALSE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_is_public (is_public)
);

-- Tabla de versiones de formularios
CREATE TABLE IF NOT EXISTS form_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    form_id INT NOT NULL,
    version_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_form_version (form_id, version_number),
    INDEX idx_form_id (form_id),
    INDEX idx_is_active (is_active)
);

-- Tabla de preguntas por versión
CREATE TABLE IF NOT EXISTS version_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('text', 'textarea', 'radio', 'checkbox', 'select', 'date', 'time', 'datetime-local', 'file', 'rating', 'scale') NOT NULL,
    required BOOLEAN DEFAULT FALSE,
    order_index INT NOT NULL DEFAULT 0,
    validation_rules JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (version_id) REFERENCES form_versions(id) ON DELETE CASCADE,
    INDEX idx_version_id (version_id),
    INDEX idx_order_index (order_index)
);

-- Tabla de opciones por versión
CREATE TABLE IF NOT EXISTS version_question_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version_question_id INT NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (version_question_id) REFERENCES version_questions(id) ON DELETE CASCADE,
    INDEX idx_version_question_id (version_question_id),
    INDEX idx_order_index (order_index)
);

-- Tabla de permisos avanzados
CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de roles avanzados
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación roles-permisos
CREATE TABLE IF NOT EXISTS role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id)
);

-- Tabla de asignación de roles a usuarios
CREATE TABLE IF NOT EXISTS user_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role_id)
);

-- Tabla de permisos específicos de formularios
CREATE TABLE IF NOT EXISTS form_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    form_id INT NOT NULL,
    user_id INT,
    role_id INT,
    permission_type ENUM('view', 'edit', 'delete', 'manage_responses', 'export') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    INDEX idx_form_id (form_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    related_form_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_form_id) REFERENCES forms(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Tabla de archivos adjuntos
CREATE TABLE IF NOT EXISTS file_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    response_id INT NOT NULL,
    question_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (response_id) REFERENCES form_responses(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_response_id (response_id),
    INDEX idx_question_id (question_id)
);

-- Tabla de auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
);

-- Tabla de análisis y métricas
CREATE TABLE IF NOT EXISTS form_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    form_id INT NOT NULL,
    date DATE NOT NULL,
    total_views INT DEFAULT 0,
    total_responses INT DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    avg_completion_time INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    UNIQUE KEY unique_form_date (form_id, date),
    INDEX idx_form_id (form_id),
    INDEX idx_date (date)
);

-- Tabla de reportes personalizados
CREATE TABLE IF NOT EXISTS custom_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    form_id INT NOT NULL,
    created_by INT NOT NULL,
    report_config JSON NOT NULL,
    schedule_type ENUM('manual', 'daily', 'weekly', 'monthly') DEFAULT 'manual',
    last_generated TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_form_id (form_id),
    INDEX idx_created_by (created_by)
);

-- Tabla de validaciones personalizadas
CREATE TABLE IF NOT EXISTS custom_validations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    validation_type ENUM('regex', 'min_length', 'max_length', 'min_value', 'max_value', 'email', 'phone', 'custom') NOT NULL,
    validation_rule TEXT NOT NULL,
    error_message VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_question_id (question_id)
);

-- Tabla de configuración de formularios
CREATE TABLE IF NOT EXISTS form_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    form_id INT NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    UNIQUE KEY unique_form_setting (form_id, setting_key),
    INDEX idx_form_id (form_id)
);

-- Insertar datos iniciales para roles y permisos
INSERT INTO permissions (name, description) VALUES 
('form_create', 'Crear formularios'),
('form_edit', 'Editar formularios'),
('form_delete', 'Eliminar formularios'),
('form_view', 'Ver formularios'),
('response_view', 'Ver respuestas'),
('response_export', 'Exportar respuestas'),
('user_manage', 'Gestionar usuarios'),
('system_admin', 'Administración del sistema')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO roles (name, description) VALUES 
('admin', 'Administrador del sistema'),
('form_manager', 'Gestor de formularios'),
('form_creator', 'Creador de formularios'),
('form_viewer', 'Visualizador de formularios')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Asignar permisos a roles
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'admin' AND p.name IN ('form_create', 'form_edit', 'form_delete', 'form_view', 'response_view', 'response_export', 'user_manage', 'system_admin')
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'form_manager' AND p.name IN ('form_create', 'form_edit', 'form_view', 'response_view', 'response_export')
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'form_creator' AND p.name IN ('form_create', 'form_edit', 'form_view')
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'form_viewer' AND p.name IN ('form_view', 'response_view')
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- Asignar rol de admin al usuario administrador existente
INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id FROM users u, roles r 
WHERE u.username = 'admin' AND r.name = 'admin'
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id);

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
SELECT COUNT(*) as roles_count FROM roles;
SELECT COUNT(*) as permissions_count FROM permissions; 