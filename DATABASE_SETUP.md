# Configuración de Base de Datos MySQL

Este documento explica cómo configurar la base de datos MySQL para el Sistema de Formularios Dinámicos.

## 📋 Prerrequisitos

- MySQL Server instalado y ejecutándose
- Cliente MySQL (mysql.exe) disponible en el PATH
- Usuario root con contraseña 'labebe12'

## 🗄️ Estructura de la Base de Datos

### Tablas Principales

1. **users** - Usuarios del sistema
2. **forms** - Formularios creados
3. **questions** - Preguntas de cada formulario
4. **question_options** - Opciones para preguntas (radio, checkbox, select)
5. **skip_logic** - Configuración de lógica condicional
6. **skip_logic_conditions** - Condiciones específicas de skip logic
7. **form_responses** - Respuestas completas de formularios
8. **answers** - Respuestas individuales a preguntas

### Relaciones

```
users (1) ←→ (N) forms
forms (1) ←→ (N) questions
questions (1) ←→ (N) question_options
questions (1) ←→ (1) skip_logic
skip_logic (1) ←→ (N) skip_logic_conditions
forms (1) ←→ (N) form_responses
form_responses (1) ←→ (N) answers
questions (1) ←→ (N) answers
```

## 🚀 Configuración Automática

### Opción 1: Script Batch (Windows)

```bash
# Ejecutar el script batch
setup_database.bat
```

### Opción 2: Script PowerShell

```powershell
# Ejecutar el script PowerShell
.\setup_database.ps1
```

### Opción 3: Manual

```bash
# Conectar a MySQL
mysql -h localhost -P 3306 -u root -plabebe12

# Ejecutar el script SQL
source database_setup.sql;
```

## 📊 Verificación

Después de ejecutar el script, puedes verificar que todo esté correcto:

```sql
-- Conectar a la base de datos
USE forms_db;

-- Verificar tablas creadas
SHOW TABLES;

-- Verificar usuario admin
SELECT username, email, role FROM users;

-- Verificar estructura de tablas
DESCRIBE forms;
DESCRIBE questions;
DESCRIBE form_responses;
```

## 🔧 Configuración Manual

Si necesitas configurar manualmente:

### 1. Crear Base de Datos

```sql
CREATE DATABASE forms_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### 2. Crear Usuario Admin

```sql
USE forms_db;

INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
```

**Credenciales por defecto:**
- Usuario: `admin`
- Contraseña: `password`

## 🔍 Solución de Problemas

### Error: "Access denied for user 'root'"

1. Verifica que MySQL esté ejecutándose:
   ```bash
   net start mysql
   ```

2. Verifica la contraseña del usuario root:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'labebe12';
   FLUSH PRIVILEGES;
   ```

### Error: "Can't connect to MySQL server"

1. Verifica que MySQL esté ejecutándose en el puerto 3306
2. Verifica que el servicio esté iniciado:
   ```bash
   services.msc
   # Buscar "MySQL" y verificar que esté "Running"
   ```

### Error: "Database doesn't exist"

El script crea automáticamente la base de datos. Si el error persiste:

```sql
CREATE DATABASE IF NOT EXISTS forms_db;
```

## 📝 Notas Importantes

- La base de datos usa `utf8mb4` para soporte completo de caracteres Unicode
- Todas las tablas tienen índices optimizados para consultas frecuentes
- Las claves foráneas están configuradas con `ON DELETE CASCADE` donde es apropiado
- El usuario admin se crea automáticamente con las credenciales mencionadas

## 🔄 Migración desde JSON

Si ya tienes datos en archivos JSON, puedes migrarlos ejecutando:

```bash
# Instalar dependencias adicionales
npm install mysql2

# Ejecutar script de migración (si existe)
node migrate_from_json.js
```

## 📞 Soporte

Si encuentras problemas:

1. Verifica que MySQL esté ejecutándose
2. Verifica las credenciales de conexión
3. Revisa los logs de MySQL para errores específicos
4. Asegúrate de tener permisos de administrador en MySQL 