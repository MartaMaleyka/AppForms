-- Migración para actualizar la tabla custom_validations
-- Ejecutar después de la migración principal

-- Agregar nuevas columnas a custom_validations
ALTER TABLE custom_validations 
ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT 'Validación',
ADD COLUMN description TEXT,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN created_by INT,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Crear índice para búsquedas
CREATE INDEX idx_custom_validations_created_by ON custom_validations(created_by);
CREATE INDEX idx_custom_validations_is_active ON custom_validations(is_active);

-- Actualizar registros existentes
UPDATE custom_validations 
SET name = CONCAT('Validación ', id),
    description = CONCAT('Validación automática para pregunta ', question_id),
    created_by = 1
WHERE name = 'Validación';

-- Agregar foreign key para created_by
ALTER TABLE custom_validations 
ADD CONSTRAINT fk_custom_validations_created_by 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Comentarios sobre la nueva estructura
-- name: Nombre descriptivo de la validación
-- description: Descripción detallada de la validación
-- validation_type: Tipo de validación (regex, length, range, email, url, phone, custom)
-- validation_rule: Regla de validación (patrón regex, parámetros JSON, etc.)
-- error_message: Mensaje de error personalizado
-- is_active: Si la validación está activa
-- created_by: Usuario que creó la validación
-- created_at: Fecha de creación
-- updated_at: Fecha de última actualización 