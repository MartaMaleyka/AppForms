

# 📋 Sistema de Formularios Dinámicos Avanzado

> Una aplicación web completa para crear y gestionar formularios con funcionalidades avanzadas, lógica condicional, plantillas, versionado, analytics, notificaciones y mucho más.

## 📑 Tabla de Contenidos

- [🚀 Características Principales](#-características-principales)
- [🎯 Funcionalidades Avanzadas](#-funcionalidades-avanzadas)
- [⚡ Instalación Rápida](#-instalación-rápida)
- [📖 Guía de Uso](#-guía-de-uso)
- [🔧 Configuración](#-configuración)
- [📊 API Reference](#-api-reference)
- [🏗️ Arquitectura](#-arquitectura)
- [🛠️ Desarrollo](#-desarrollo)
- [❓ FAQ](#-faq)

---

## 🚀 Características Principales

### ✨ **Funcionalidades Básicas**
- **Creación de formularios** con múltiples tipos de preguntas
- **Autenticación de usuarios** con JWT y roles avanzados
- **Gestión de respuestas** y visualización de resultados
- **Interfaz moderna** y responsive con navegación mejorada
- **Base de datos MySQL** para almacenamiento persistente

### 🎯 **Lógica Condicional (Skip Logic)**
- **Mostrar/ocultar preguntas** según las respuestas del usuario
- **Saltos dinámicos** entre preguntas
- **Múltiples condiciones** por pregunta
- **Soporte para todos los tipos de preguntas** (radio, checkbox, select)

### ✅ **Validaciones Personalizadas**
- **Validación en tiempo real** mientras el usuario escribe
- **Múltiples tipos**: Regex, Longitud, Email, Teléfono, etc.
- **Mensajes de error** personalizables
- **Indicadores visuales** de errores y éxito
- **Integración completa** con FormBuilder y FormView

---

## 🎯 Funcionalidades Avanzadas

### 🏗️ **Plantillas de Formularios**
- **Crear plantillas reutilizables** para formularios comunes
- **Categorías de plantillas** (Encuestas, Registros, Evaluaciones, etc.)
- **Plantillas públicas y privadas**
- **Conversión de formularios existentes** a plantillas
- **Búsqueda y filtrado** de plantillas

### 🔄 **Versionado de Formularios**
- **Múltiples versiones** de un mismo formulario
- **Activación/desactivación** de versiones
- **Comparación entre versiones** con diferencias visuales
- **Historial completo** de cambios
- **Migración de datos** entre versiones

### 🔐 **Sistema de Permisos y Roles Avanzado**
- **Roles granulares**: Admin, Form Manager, Form Creator, Form Viewer
- **Permisos específicos** por formulario
- **Gestión de accesos** individual y por roles
- **Permisos de exportación** y gestión de respuestas
- **Auditoría de accesos** completa

### 🔔 **Sistema de Notificaciones**
- **Notificaciones en tiempo real** para nuevas respuestas
- **Diferentes tipos**: Info, Success, Warning, Error
- **Marcado de leídas/no leídas**
- **Filtros por tipo y fecha**
- **Badge de notificaciones** en navegación
- **Notificaciones por email** (configurable)

### 📊 **Analytics y Reportes Avanzados**
- **Dashboard de métricas** en tiempo real
- **Estadísticas por formulario**: vistas, respuestas, tasa de completitud
- **Reportes personalizados** con filtros avanzados
- **Exportación de analytics** a Excel/CSV
- **Gráficos interactivos** de rendimiento
- **Métricas de tiempo** de completitud

### 📁 **Gestión de Archivos Adjuntos**
- **Subida de archivos** con drag & drop
- **Múltiples formatos** soportados
- **Vista previa** de archivos
- **Descarga segura** de archivos
- **Filtros por tipo** y fecha
- **Estadísticas de uso** de archivos

### 📋 **Logs de Auditoría**
- **Registro completo** de todas las acciones
- **Filtros avanzados** por usuario, acción, fecha
- **Exportación de logs** para análisis
- **Detalles de cambios** con valores anteriores y nuevos
- **Información de IP** y User Agent

---

## ⚡ Instalación Rápida

### 📋 Prerrequisitos
- Node.js (v14 o superior)
- MySQL Server (v8.0 o superior)
- npm o yarn

### 🚀 Instalación Automática (Recomendado)

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd Forms

# 2. Ejecutar configuración completa
setup_complete.bat

# 3. Iniciar la aplicación
npm start
```

### 🔧 Instalación Manual

```bash
# 1. Configurar base de datos
setup_database.bat

# 2. Migrar funcionalidades avanzadas
mysql -u root -plabebe12 forms_db < migrate_to_new_features.sql

# 3. Configurar validaciones
setup_validations.bat

# 4. Instalar dependencias
npm install
cd client && npm install

# 5. Configurar variables de entorno
# Crear .env en el directorio raíz:
JWT_SECRET=tu-clave-secreta-aqui

# 6. Iniciar aplicación
npm start  # Backend
cd client && npm start  # Frontend
```

### 🌐 Acceso
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Credenciales por defecto**: admin / password

---

## 📖 Guía de Uso

### 🎯 **Flujo de Trabajo Principal**

#### 1. **Crear Formularios** (`/create`)
- Diseñar formularios con preguntas personalizadas
- Configurar lógica condicional (skip logic)
- Agregar validaciones por pregunta
- Guardar y publicar formularios

#### 2. **Gestionar Plantillas** (`/templates`)
- Crear plantillas desde formularios existentes
- Categorizar plantillas para fácil búsqueda
- Usar plantillas para crear nuevos formularios

#### 3. **Gestionar Versiones** (`/form/:formId/versions`)
- Crear nuevas versiones de formularios
- Comparar versiones lado a lado
- Activar versiones cuando estén listas

#### 4. **Responder Formularios** (`/form/:id`)
- Las preguntas se ocultan/muestran automáticamente
- Validación en tiempo real
- Enviar respuestas con validación

#### 5. **Gestionar Respuestas** (`/form/:id/responses`)
- Ver todas las respuestas
- Exportar a Excel con un clic
- Filtrar y buscar respuestas

#### 6. **Ver Analytics** (`/analytics`)
- Dashboard de métricas en tiempo real
- Crear reportes personalizados
- Exportar analytics

#### 7. **Gestionar Notificaciones** (`/notifications`)
- Ver notificaciones no leídas
- Marcar como leídas
- Filtrar por tipo y fecha

#### 8. **Configurar Validaciones** (`/validations`)
- Crear validaciones globales reutilizables
- Probar validaciones antes de usar
- Gestionar biblioteca de validaciones

#### 9. **Gestionar Archivos** (`/files`)
- Subir archivos con drag & drop
- Descargar archivos adjuntos
- Ver estadísticas de uso

#### 10. **Ver Logs de Auditoría** (`/audit-logs`)
- Ver historial completo de acciones
- Exportar logs para análisis
- Filtrar por usuario y acción

### 🎨 **Tipos de Preguntas Soportados**

| Tipo | Descripción | Validaciones |
|------|-------------|--------------|
| **Texto corto** | Respuestas de una línea | Regex, Longitud, Personalizada |
| **Texto largo** | Respuestas multilínea | Regex, Longitud, Personalizada |
| **Email** | Dirección de correo electrónico | Email automático |
| **Número** | Valores numéricos | Rango, Personalizada |
| **Opción única** | Radio buttons | Skip logic |
| **Múltiples opciones** | Checkboxes | Skip logic |
| **Lista desplegable** | Select dropdown | Skip logic |
| **Fecha** | Selector de fecha | Rango de fechas |
| **Hora** | Selector de hora | Rango de horas |
| **Fecha y Hora** | Selector combinado | Rango de fechas/horas |

### ✅ **Tipos de Validación**

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **Regex** | Expresión regular personalizada | `^[A-Za-z]+$` |
| **Longitud** | Mínimo y máximo de caracteres | `{"min_length": 8, "max_length": 50}` |
| **Rango** | Valores numéricos mínimo y máximo | `{"min_value": 18, "max_value": 65}` |
| **Email** | Validación automática de formato | Automático |
| **URL** | Validación automática de formato | Automático |
| **Teléfono** | Validación de números telefónicos | Automático |
| **Personalizada** | Función JavaScript personalizada | `return value.length > 0;` |

---

## 🔧 Configuración

### 🗄️ **Base de Datos MySQL**

#### Configuración
```sql
Host: localhost
Puerto: 3306
Usuario: root
Contraseña: labebe12
Base de datos: forms_db
```

#### Tablas Principales
- **users** - Usuarios del sistema
- **forms** - Formularios creados
- **questions** - Preguntas de cada formulario
- **question_options** - Opciones para preguntas
- **skip_logic** - Configuración de lógica condicional
- **skip_logic_conditions** - Condiciones específicas
- **form_responses** - Respuestas completas
- **answers** - Respuestas individuales

#### Nuevas Tablas (v3.0)
- **form_templates** - Plantillas de formularios
- **form_versions** - Versiones de formularios
- **permissions** - Permisos del sistema
- **roles** - Roles de usuarios
- **notifications** - Sistema de notificaciones
- **file_attachments** - Archivos adjuntos
- **audit_logs** - Logs de auditoría
- **form_analytics** - Analytics y métricas
- **custom_validations** - Validaciones personalizadas
- **form_settings** - Configuración de formularios

### 🔐 **Sistema de Permisos**

#### Roles Disponibles
- **Administrador**: Acceso completo al sistema
- **Gestor de Formularios**: Crear, editar, ver respuestas
- **Creador de Formularios**: Crear y editar formularios
- **Visualizador**: Solo ver formularios y respuestas

#### Permisos Granulares
- **form_create**: Crear formularios
- **form_edit**: Editar formularios
- **form_delete**: Eliminar formularios
- **form_view**: Ver formularios
- **response_view**: Ver respuestas
- **response_export**: Exportar respuestas
- **user_manage**: Gestionar usuarios
- **system_admin**: Administración del sistema

---

## 📊 API Reference

### 🔐 **Autenticación**
```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

### 📝 **Formularios**
```http
GET /api/forms
POST /api/forms
GET /api/forms/:id
DELETE /api/forms/:id
```

### 📋 **Respuestas**
```http
POST /api/forms/:id/responses
GET /api/forms/:id/responses
GET /api/forms/:id/responses/export
```

### 📋 **Plantillas**
```http
GET /api/templates
POST /api/templates
GET /api/templates/:id
PUT /api/templates/:id
DELETE /api/templates/:id
POST /api/templates/:id/use
```

### 🔄 **Versionado**
```http
GET /api/forms/:formId/versions
POST /api/forms/:formId/versions
PUT /api/forms/:formId/versions/:versionId/activate
DELETE /api/forms/:formId/versions/:versionId
GET /api/forms/:formId/versions/compare
```

### 🔔 **Notificaciones**
```http
GET /api/notifications
PUT /api/notifications/:id/read
DELETE /api/notifications/:id
GET /api/notifications/unread-count
```

### 📊 **Analytics**
```http
GET /api/analytics
GET /api/analytics/form/:formId
POST /api/analytics/export
POST /api/analytics/reports
```

### 📋 **Auditoría**
```http
GET /api/audit-logs
POST /api/audit-logs/export
GET /api/audit-logs/stats
```

### ✅ **Validaciones**
```http
GET /api/validations
POST /api/validations
PUT /api/validations/:id
DELETE /api/validations/:id
POST /api/validations/:id/test
POST /api/validations/validate
```

### 📁 **Archivos**
```http
GET /api/files
POST /api/files/upload
GET /api/files/:id/download
DELETE /api/files/:id
GET /api/files/stats
```

---

## 🏗️ Arquitectura

### 📁 **Estructura del Proyecto**
```
Forms/
├── client/                 # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes principales
│   │   │   ├── FormBuilder.tsx        # Constructor de formularios
│   │   │   ├── FormView.tsx           # Vista de formularios
│   │   │   ├── FormResponses.tsx      # Gestión de respuestas
│   │   │   ├── TemplateManager.tsx    # Gestión de plantillas
│   │   │   ├── VersionManager.tsx     # Gestión de versiones
│   │   │   ├── NotificationCenter.tsx # Centro de notificaciones
│   │   │   ├── AnalyticsDashboard.tsx # Dashboard de analytics
│   │   │   ├── AuditLogViewer.tsx     # Visor de logs
│   │   │   ├── ValidationBuilder.tsx  # Constructor de validaciones
│   │   │   ├── FileManager.tsx        # Gestor de archivos
│   │   │   ├── Navigation.tsx         # Navegación mejorada
│   │   │   ├── Breadcrumbs.tsx        # Navegación jerárquica
│   │   │   └── NotificationBadge.tsx  # Badge de notificaciones
│   │   └── contexts/      # Contextos de React
├── config/                # Configuración de base de datos
│   └── database.js        # Configuración MySQL
├── models/                # Modelos de datos
│   ├── User.js           # Modelo de usuarios
│   ├── Form.js           # Modelo de formularios
│   ├── Response.js       # Modelo de respuestas
│   ├── Template.js       # Modelo de plantillas
│   ├── Version.js        # Modelo de versiones
│   ├── Notification.js   # Modelo de notificaciones
│   ├── Analytics.js      # Modelo de analytics
│   ├── AuditLog.js       # Modelo de logs
│   ├── Validation.js     # Modelo de validaciones
│   ├── FileAttachment.js # Modelo de archivos
│   └── Permission.js     # Modelo de permisos
├── data/                  # Archivos de datos JSON (migración)
├── server.js              # Servidor Express
├── database_setup.sql     # Script de configuración MySQL
└── migrate_to_new_features.sql # Script de migración
```

### 🛠️ **Tecnologías Utilizadas**

#### Frontend
- **React 18** con TypeScript
- **React Router** para navegación
- **Context API** para estado global
- **CSS Modules** para estilos
- **Responsive design** para móviles
- **ExcelJS** para exportación de datos
- **Drag & Drop** para archivos
- **Real-time updates** para notificaciones

#### Backend
- **Node.js** con Express
- **MySQL** para almacenamiento persistente
- **JWT** para autenticación
- **CORS** habilitado
- **Validación de datos** completa
- **ExcelJS** para generación de archivos Excel
- **Multer** para manejo de archivos
- **Rate limiting** para seguridad

#### Base de Datos
- **MySQL 8.0+** para almacenamiento
- **Transacciones** para integridad de datos
- **Índices optimizados** para rendimiento
- **Claves foráneas** para relaciones
- **Soporte Unicode** completo
- **JSON columns** para configuraciones flexibles
- **Triggers** para auditoría automática

---

## 🛠️ Desarrollo

### 🚀 **Comandos de Desarrollo**

```bash
# Instalar dependencias
npm install
cd client && npm install

# Ejecutar en modo desarrollo
npm run dev          # Backend + Frontend
npm start            # Solo backend
cd client && npm start  # Solo frontend

# Construir para producción
npm run build        # Frontend
npm run build:server # Backend

# Ejecutar tests
npm test
npm run test:watch
```

### 🔧 **Variables de Entorno**

```bash
# .env
JWT_SECRET=tu-clave-secreta-aqui
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=labebe12
DB_NAME=forms_db
PORT=5000
NODE_ENV=development
```

### 📝 **Scripts de Migración**

```bash
# Configuración inicial
setup_database.bat

# Migrar funcionalidades avanzadas
mysql -u root -plabebe12 forms_db < migrate_to_new_features.sql

# Configurar validaciones
setup_validations.bat

# Migrar datos desde JSON
node migrate_from_json.js
```

---

## ❓ FAQ

### 🤔 **Preguntas Frecuentes**

#### **¿Cómo funciona la lógica condicional?**
La lógica condicional (skip logic) permite mostrar u ocultar preguntas basándose en las respuestas del usuario. Por ejemplo, si alguien responde "No" a una pregunta, puedes saltar directamente a otra pregunta relevante.

#### **¿Qué tipos de validación están disponibles?**
- **Regex**: Expresiones regulares personalizadas
- **Longitud**: Mínimo y máximo de caracteres
- **Rango**: Valores numéricos mínimo y máximo
- **Email**: Validación automática de formato
- **URL**: Validación automática de formato
- **Teléfono**: Validación de números telefónicos
- **Personalizada**: Funciones JavaScript propias

#### **¿Cómo exportar respuestas a Excel?**
Ve a `/form/:id/responses` y haz clic en "Exportar a Excel". El archivo incluirá todas las respuestas organizadas por pregunta y respondente.

#### **¿Cómo crear plantillas reutilizables?**
Ve a `/templates` y crea plantillas desde formularios existentes. Luego puedes usar estas plantillas para crear nuevos formularios rápidamente.

#### **¿Cómo gestionar versiones de formularios?**
Ve a `/form/:formId/versions` para crear nuevas versiones, comparar cambios y activar versiones cuando estén listas.

#### **¿Cómo configurar notificaciones?**
Las notificaciones se generan automáticamente para nuevas respuestas. Puedes gestionarlas en `/notifications` y configurar filtros por tipo y fecha.

### 🔧 **Solución de Problemas**

#### **Error de Conexión a MySQL**
1. Verificar que MySQL esté ejecutándose
2. Verificar credenciales en `config/database.js`
3. Ejecutar `setup_database.bat` para configurar la base de datos

#### **Error de Migración**
1. Verificar que los archivos JSON existan en `data/`
2. Ejecutar `node migrate_from_json.js` manualmente
3. Verificar logs para errores específicos

#### **Error de Autenticación**
1. Verificar que el usuario admin exista en la base de datos
2. Usar credenciales por defecto: admin/password
3. Verificar configuración JWT_SECRET

#### **Error de Permisos**
1. Verificar que el usuario tenga los roles correctos
2. Asignar permisos específicos si es necesario
3. Verificar configuración de roles en la base de datos

---

## 📈 Changelog

### v3.0.0 - Funcionalidades Avanzadas Completas
- ✅ **Plantillas de formularios** - Crear y reutilizar plantillas
- ✅ **Versionado de formularios** - Múltiples versiones con comparación
- ✅ **Sistema de permisos avanzado** - Roles granulares y permisos específicos
- ✅ **Sistema de notificaciones** - Notificaciones en tiempo real con badge
- ✅ **Analytics y reportes** - Dashboard completo con métricas
- ✅ **Gestión de archivos** - Subida, descarga y gestión de archivos
- ✅ **Validaciones personalizadas** - Múltiples tipos de validación
- ✅ **Logs de auditoría** - Registro completo de todas las acciones
- ✅ **Configuración flexible** - Configuraciones JSON por formulario
- ✅ **Navegación mejorada** - Breadcrumbs y navegación responsive
- ✅ **Interfaz moderna** - Diseño actualizado con todas las funcionalidades

### v2.0.0 - Funcionalidades Avanzadas
- ✅ **Lógica condicional** - Mostrar/ocultar preguntas según respuestas
- ✅ **Exportación a Excel** - Descargar respuestas en formato .xlsx
- ✅ **Interfaz mejorada** - Diseño moderno y responsive
- ✅ **Validación inteligente** - Solo valida preguntas visibles

### v1.0.0 - Funcionalidades Básicas
- ✅ Creación de formularios
- ✅ Autenticación de usuarios
- ✅ Gestión de respuestas
- ✅ Interfaz básica

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras problemas:

1. Verifica que MySQL esté ejecutándose
2. Verifica la configuración de la base de datos
3. Revisa los logs del servidor
4. Ejecuta los scripts de configuración
5. Consulta la documentación de MySQL

---

**🎉 ¡El sistema de formularios dinámicos ahora incluye todas las funcionalidades avanzadas para una gestión completa y profesional!**
