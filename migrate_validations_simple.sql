-- Migración simple para actualizar la tabla custom_validations

-- Agregar columnas faltantes
ALTER TABLE custom_validations 
ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT 'Validación' AFTER id,
ADD COLUMN description TEXT AFTER name,
ADD COLUMN validation_type VARCHAR(50) NOT NULL DEFAULT 'regex' AFTER description,
ADD COLUMN validation_rule TEXT AFTER validation_type,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER validation_rule,
ADD COLUMN created_by INT AFTER is_active,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Crear índices
CREATE INDEX idx_custom_validations_created_by ON custom_validations(created_by);
CREATE INDEX idx_custom_validations_is_active ON custom_validations(is_active);

-- Actualizar registros existentes
UPDATE custom_validations 
SET name = CONCAT('Validación ', id),
    description = CONCAT('Validación automática para pregunta ', COALESCE(question_id, 'global')),
    validation_type = 'regex',
    validation_rule = '',
    is_active = 1,
    created_by = 1
WHERE name IS NULL OR name = '';

-- Agregar foreign key
ALTER TABLE custom_validations 
ADD CONSTRAINT fk_custom_validations_created_by 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL; 