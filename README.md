

# Sistema de Formularios Dinámicos Avanzado

Una aplicación web completa para crear y gestionar formularios con funcionalidades avanzadas, lógica condicional, plantillas, versionado, analytics, notificaciones y mucho más.

## 🚀 Características Principales

### ✨ Funcionalidades Básicas
- **Creación de formularios** con múltiples tipos de preguntas
- **Autenticación de usuarios** con JWT y roles avanzados
- **Gestión de respuestas** y visualización de resultados
- **Interfaz moderna** y responsive con navegación mejorada
- **Base de datos MySQL** para almacenamiento persistente

### 🎯 Lógica Condicional (Skip Logic)
- **Mostrar/ocultar preguntas** según las respuestas del usuario
- **Saltos dinámicos** entre preguntas
- **Múltiples condiciones** por pregunta
- **Soporte para todos los tipos de preguntas** (radio, checkbox, select)

### 📋 Nuevas Funcionalidades Avanzadas

#### 🏗️ **Plantillas de Formularios**
- **Crear plantillas reutilizables** para formularios comunes
- **Categorías de plantillas** (Encuestas, Registros, Evaluaciones, etc.)
- **Plantillas públicas y privadas**
- **Conversión de formularios existentes** a plantillas
- **Búsqueda y filtrado** de plantillas

#### 🔄 **Versionado de Formularios**
- **Múltiples versiones** de un mismo formulario
- **Activación/desactivación** de versiones
- **Comparación entre versiones** con diferencias visuales
- **Historial completo** de cambios
- **Migración de datos** entre versiones

#### 🔐 **Sistema de Permisos y Roles Avanzado**
- **Roles granulares**: Admin, Form Manager, Form Creator, Form Viewer
- **Permisos específicos** por formulario
- **Gestión de accesos** individual y por roles
- **Permisos de exportación** y gestión de respuestas
- **Auditoría de accesos** completa

#### 🔔 **Sistema de Notificaciones**
- **Notificaciones en tiempo real** para nuevas respuestas
- **Diferentes tipos**: Info, Success, Warning, Error
- **Marcado de leídas/no leídas**
- **Filtros por tipo y fecha**
- **Badge de notificaciones** en navegación
- **Notificaciones por email** (configurable)

#### 📊 **Analytics y Reportes Avanzados**
- **Dashboard de métricas** en tiempo real
- **Estadísticas por formulario**: vistas, respuestas, tasa de completitud
- **Reportes personalizados** con filtros avanzados
- **Exportación de analytics** a Excel/CSV
- **Gráficos interactivos** de rendimiento
- **Métricas de tiempo** de completitud

#### 📁 **Gestión de Archivos Adjuntos**
- **Subida de archivos** con drag & drop
- **Múltiples formatos** soportados
- **Vista previa** de archivos
- **Descarga segura** de archivos
- **Filtros por tipo** y fecha
- **Estadísticas de uso** de archivos

#### ✅ **Validaciones Personalizadas**
- **Múltiples tipos de validación**: Regex, Longitud, Email, Teléfono, etc.
- **Validación en tiempo real** en servidor y cliente
- **Mensajes de error** personalizables
- **Validaciones condicionales** según respuestas previas
- **Testing de validaciones** antes de aplicar

#### 📋 **Logs de Auditoría**
- **Registro completo** de todas las acciones
- **Filtros avanzados** por usuario, acción, fecha
- **Exportación de logs** para análisis
- **Detalles de cambios** con valores anteriores y nuevos
- **Información de IP** y User Agent

#### ⚙️ **Configuración de Formularios**
- **Configuración flexible** por formulario
- **Almacenamiento JSON** para configuraciones complejas
- **Configuraciones por defecto** y personalizadas
- **Gestión de temas** y estilos

### 📊 Exportación de Datos Avanzada
- **Exportar a Excel** (.xlsx) con formato profesional
- **Incluir todas las respuestas** de los formularios
- **Datos organizados** por pregunta y respondente
- **Filtros y ordenamiento** de datos
- **Exportación de analytics** y reportes
- **Exportación de logs** de auditoría

## 🎨 Tipos de Preguntas Soportados

- **Texto corto** - Respuestas de una línea
- **Texto largo** - Respuestas multilínea
- **Opción única** - Radio buttons
- **Múltiples opciones** - Checkboxes
- **Lista desplegable** - Select dropdown
- **Fecha** - Selector de fecha
- **Hora** - Selector de hora
- **Fecha y Hora** - Selector combinado
- **Archivo** - Subida de archivos
- **Rating** - Sistema de calificación
- **Escala** - Escalas numéricas

## 🏗️ Configuración de Lógica Condicional

### Cómo Funciona
1. **Activar skip logic** en cualquier pregunta
2. **Configurar condiciones**: "Si el usuario selecciona X, entonces..."
3. **Definir destino**: Ir a otra pregunta o finalizar formulario
4. **Aplicación automática**: Las preguntas se ocultan/muestran dinámicamente

### Ejemplo de Uso
```
Pregunta 1: "¿Has usado nuestro servicio?"
- Opciones: "Sí" / "No"

Condición: Si selecciona "No" → Saltar a Pregunta 5
Resultado: Las preguntas 2, 3, 4 se ocultan automáticamente
```

## 📋 Gestión de Plantillas

### Características
- **Crear plantillas** desde formularios existentes
- **Categorizar plantillas** para fácil búsqueda
- **Plantillas públicas** para toda la organización
- **Plantillas privadas** para uso personal
- **Conversión rápida** de plantilla a formulario

### Tipos de Plantillas Disponibles
- **Encuestas de Satisfacción**
- **Registros de Usuarios**
- **Evaluaciones de Productos**
- **Formularios de Contacto**
- **Encuestas de Eventos**
- **Evaluaciones de Servicios**

## 🔄 Sistema de Versionado

### Funcionalidades
- **Crear versiones** de formularios existentes
- **Comparar versiones** lado a lado
- **Activar/desactivar** versiones
- **Migrar respuestas** entre versiones
- **Historial de cambios** completo

### Flujo de Trabajo
1. **Crear nueva versión** desde formulario existente
2. **Modificar preguntas** y lógica
3. **Probar cambios** antes de activar
4. **Activar versión** cuando esté lista
5. **Migrar datos** si es necesario

## 🔐 Sistema de Permisos

### Roles Disponibles
- **Administrador**: Acceso completo al sistema
- **Gestor de Formularios**: Crear, editar, ver respuestas
- **Creador de Formularios**: Crear y editar formularios
- **Visualizador**: Solo ver formularios y respuestas

### Permisos Granulares
- **form_create**: Crear formularios
- **form_edit**: Editar formularios
- **form_delete**: Eliminar formularios
- **form_view**: Ver formularios
- **response_view**: Ver respuestas
- **response_export**: Exportar respuestas
- **user_manage**: Gestionar usuarios
- **system_admin**: Administración del sistema

## 🔔 Sistema de Notificaciones

### Tipos de Notificaciones
- **Nueva respuesta** recibida
- **Formulario compartido** contigo
- **Versión activada** de formulario
- **Reporte generado** automáticamente
- **Error en validación** de formulario

### Características
- **Badge de contador** en navegación
- **Marcado de leídas** con un clic
- **Filtros por tipo** y fecha
- **Notificaciones persistentes** hasta leer
- **Actualización automática** cada 30 segundos

## 📊 Analytics y Reportes

### Métricas Disponibles
- **Total de vistas** por formulario
- **Tasa de completitud** de formularios
- **Tiempo promedio** de completitud
- **Respuestas por día/semana/mes**
- **Preguntas más respondidas**
- **Tendencias temporales**

### Reportes Personalizados
- **Configurar filtros** avanzados
- **Seleccionar métricas** específicas
- **Programar reportes** automáticos
- **Exportar a Excel/CSV**
- **Compartir reportes** con otros usuarios

## 📁 Gestión de Archivos

### Características
- **Subida drag & drop** de archivos
- **Vista previa** de imágenes y documentos
- **Descarga segura** con autenticación
- **Filtros por tipo** de archivo
- **Estadísticas de uso** y almacenamiento
- **Límites de tamaño** configurables

### Formatos Soportados
- **Imágenes**: JPG, PNG, GIF, SVG
- **Documentos**: PDF, DOC, DOCX, TXT
- **Hojas de cálculo**: XLS, XLSX, CSV
- **Presentaciones**: PPT, PPTX
- **Archivos comprimidos**: ZIP, RAR

## ✅ Validaciones Personalizadas

### Tipos de Validación
- **Regex**: Expresiones regulares personalizadas
- **Longitud**: Mínimo y máximo de caracteres
- **Valores**: Rango numérico
- **Email**: Validación de formato de email
- **Teléfono**: Validación de números telefónicos
- **Personalizada**: Lógica de validación propia

### Características
- **Validación en tiempo real** en el cliente
- **Validación en servidor** para seguridad
- **Mensajes de error** personalizables
- **Testing de validaciones** antes de aplicar
- **Validaciones condicionales** según respuestas previas

## 📋 Logs de Auditoría

### Información Registrada
- **Usuario** que realizó la acción
- **Tipo de acción** (crear, editar, eliminar, etc.)
- **Tabla afectada** y registro específico
- **Valores anteriores** y nuevos (JSON)
- **IP address** y User Agent
- **Timestamp** exacto de la acción

### Filtros Disponibles
- **Por usuario** específico
- **Por tipo de acción**
- **Por tabla afectada**
- **Por rango de fechas**
- **Por IP address**

## Instalación y Configuración

### Prerrequisitos
- Node.js (v14 o superior)
- MySQL Server (v8.0 o superior)
- npm o yarn

### Configuración de Base de Datos

#### Opción 1: Configuración Automática (Recomendado)

```bash
# Ejecutar configuración completa
setup_complete.bat
```

#### Opción 2: Configuración Manual

1. **Configurar MySQL**
   ```bash
   # Ejecutar script de configuración de base de datos
   setup_database.bat
   ```

2. **Ejecutar migración de nuevas funcionalidades**
   ```bash
   # Migrar a nuevas funcionalidades
   mysql -u root -plabebe12 forms_db < migrate_to_new_features.sql
   ```

3. **Migrar datos existentes (opcional)**
   ```bash
   # Migrar datos desde archivos JSON
   node migrate_from_json.js
   ```

### Instalación de Dependencias

1. **Instalar dependencias del servidor**
   ```bash
   npm install
   ```

2. **Instalar dependencias del cliente**
   ```bash
   cd client
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # En el directorio raíz, crear .env
   JWT_SECRET=tu-clave-secreta-aqui
   ```

### Iniciar la Aplicación

```bash
# Terminal 1 - Servidor backend
npm start

# Terminal 2 - Cliente React
cd client
npm start
```

### Acceso
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Estructura del Proyecto

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

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Información del usuario actual

### Formularios
- `GET /api/forms` - Listar todos los formularios
- `POST /api/forms` - Crear nuevo formulario
- `GET /api/forms/:id` - Obtener formulario específico
- `DELETE /api/forms/:id` - Eliminar formulario

### Respuestas
- `POST /api/forms/:id/responses` - Enviar respuesta
- `GET /api/forms/:id/responses` - Ver respuestas (requiere auth)
- `GET /api/forms/:id/responses/export` - Exportar respuestas a Excel

### Plantillas
- `GET /api/templates` - Listar plantillas
- `POST /api/templates` - Crear plantilla
- `GET /api/templates/:id` - Obtener plantilla
- `PUT /api/templates/:id` - Actualizar plantilla
- `DELETE /api/templates/:id` - Eliminar plantilla
- `POST /api/templates/:id/use` - Usar plantilla para crear formulario

### Versionado
- `GET /api/forms/:formId/versions` - Listar versiones
- `POST /api/forms/:formId/versions` - Crear nueva versión
- `PUT /api/forms/:formId/versions/:versionId/activate` - Activar versión
- `DELETE /api/forms/:formId/versions/:versionId` - Eliminar versión
- `GET /api/forms/:formId/versions/compare` - Comparar versiones

### Notificaciones
- `GET /api/notifications` - Listar notificaciones
- `PUT /api/notifications/:id/read` - Marcar como leída
- `DELETE /api/notifications/:id` - Eliminar notificación
- `GET /api/notifications/unread-count` - Contador de no leídas

### Analytics
- `GET /api/analytics` - Dashboard general
- `GET /api/analytics/form/:formId` - Analytics por formulario
- `POST /api/analytics/export` - Exportar analytics
- `POST /api/analytics/reports` - Crear reporte personalizado

### Auditoría
- `GET /api/audit-logs` - Listar logs de auditoría
- `POST /api/audit-logs/export` - Exportar logs
- `GET /api/audit-logs/stats` - Estadísticas de auditoría

### Validaciones
- `GET /api/validations` - Listar validaciones
- `POST /api/validations` - Crear validación
- `PUT /api/validations/:id` - Actualizar validación
- `DELETE /api/validations/:id` - Eliminar validación
- `POST /api/validations/:id/test` - Probar validación

### Archivos
- `GET /api/files` - Listar archivos
- `POST /api/files/upload` - Subir archivo
- `GET /api/files/:id/download` - Descargar archivo
- `DELETE /api/files/:id` - Eliminar archivo
- `GET /api/files/stats` - Estadísticas de archivos

## Base de Datos MySQL

### Configuración
- **Host**: tu_host
- **Puerto**: tu_puerto
- **Usuario**: tu_usuario
- **Contraseña**: tu_contraseña
- **Base de datos**: forms_db

### Tablas Principales
- **users** - Usuarios del sistema
- **forms** - Formularios creados
- **questions** - Preguntas de cada formulario
- **question_options** - Opciones para preguntas
- **skip_logic** - Configuración de lógica condicional
- **skip_logic_conditions** - Condiciones específicas
- **form_responses** - Respuestas completas
- **answers** - Respuestas individuales

### Nuevas Tablas (v3.0)
- **form_templates** - Plantillas de formularios
- **form_versions** - Versiones de formularios
- **version_questions** - Preguntas por versión
- **version_question_options** - Opciones por versión
- **permissions** - Permisos del sistema
- **roles** - Roles de usuarios
- **role_permissions** - Relación roles-permisos
- **user_roles** - Asignación de roles a usuarios
- **form_permissions** - Permisos específicos por formulario
- **notifications** - Sistema de notificaciones
- **file_attachments** - Archivos adjuntos
- **audit_logs** - Logs de auditoría
- **form_analytics** - Analytics y métricas
- **custom_reports** - Reportes personalizados
- **custom_validations** - Validaciones personalizadas
- **form_settings** - Configuración de formularios

### Credenciales por Defecto
- **Usuario admin**: `admin`
- **Contraseña**: `password`

## Ejemplo de Formulario con Lógica Condicional

El sistema incluye un formulario de ejemplo que demuestra la funcionalidad:

**"Encuesta de Satisfacción del Cliente"**
- Pregunta 2: Si selecciona "Ninguno aún" → Salta a Pregunta 5
- Pregunta 3: Si selecciona "Ninguno" → Salta a Pregunta 6
- Pregunta 4: Si selecciona calificaciones bajas (1-3) → Salta a Pregunta 6

## Características Técnicas

### Frontend
- **React 18** con TypeScript
- **React Router** para navegación
- **Context API** para estado global
- **CSS Modules** para estilos
- **Responsive design** para móviles
- **ExcelJS** para exportación de datos
- **Drag & Drop** para archivos
- **Real-time updates** para notificaciones

### Backend
- **Node.js** con Express
- **MySQL** para almacenamiento persistente
- **JWT** para autenticación
- **CORS** habilitado
- **Validación de datos** completa
- **ExcelJS** para generación de archivos Excel
- **Multer** para manejo de archivos
- **Rate limiting** para seguridad

### Base de Datos
- **MySQL 8.0+** para almacenamiento
- **Transacciones** para integridad de datos
- **Índices optimizados** para rendimiento
- **Claves foráneas** para relaciones
- **Soporte Unicode** completo
- **JSON columns** para configuraciones flexibles
- **Triggers** para auditoría automática

### Lógica Condicional
- **Evaluación en tiempo real** de condiciones
- **Cálculo dinámico** de preguntas visibles
- **Soporte para múltiples condiciones** por pregunta
- **Validación de formularios** considerando preguntas ocultas

### Exportación de Datos
- **Generación de Excel** con formato profesional
- **Inclusión de metadatos** (fecha, respondente)
- **Organización por preguntas** en columnas
- **Compatibilidad** con múltiples aplicaciones
- **Exportación de analytics** y reportes
- **Exportación de logs** de auditoría

## Uso de la Aplicación

### 1. Crear Formularios
- Acceder a `/create`
- Configurar preguntas y lógica condicional
- Guardar formulario

### 2. Gestionar Plantillas
- Acceder a `/templates`
- Crear plantillas desde formularios existentes
- Usar plantillas para crear nuevos formularios

### 3. Gestionar Versiones
- Acceder a `/form/:formId/versions`
- Crear nuevas versiones de formularios
- Activar versiones cuando estén listas

### 4. Responder Formularios
- Acceder a `/form/:id`
- Las preguntas se ocultan/muestran automáticamente
- Enviar respuestas

### 5. Gestionar Respuestas
- Acceder a `/form/:id/responses`
- Ver todas las respuestas
- Exportar a Excel con un clic

### 6. Ver Analytics
- Acceder a `/analytics`
- Ver métricas en tiempo real
- Crear reportes personalizados

### 7. Gestionar Notificaciones
- Acceder a `/notifications`
- Ver notificaciones no leídas
- Marcar como leídas

### 8. Configurar Validaciones
- Acceder a `/validations`
- Crear validaciones personalizadas
- Probar validaciones antes de aplicar

### 9. Gestionar Archivos
- Acceder a `/files`
- Subir archivos con drag & drop
- Descargar archivos adjuntos

### 10. Ver Logs de Auditoría
- Acceder a `/audit-logs`
- Ver historial completo de acciones
- Exportar logs para análisis

## Solución de Problemas

### Error de Conexión a MySQL
1. Verificar que MySQL esté ejecutándose
2. Verificar credenciales en `config/database.js`
3. Ejecutar `setup_database.bat` para configurar la base de datos

### Error de Migración
1. Verificar que los archivos JSON existan en `data/`
2. Ejecutar `node migrate_from_json.js` manualmente
3. Verificar logs para errores específicos

### Error de Autenticación
1. Verificar que el usuario admin exista en la base de datos
2. Usar credenciales por defecto: admin/password
3. Verificar configuración JWT_SECRET

### Error de Permisos
1. Verificar que el usuario tenga los roles correctos
2. Asignar permisos específicos si es necesario
3. Verificar configuración de roles en la base de datos

## Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

## Soporte

Si encuentras problemas:

1. Verifica que MySQL esté ejecutándose
2. Verifica la configuración de la base de datos
3. Revisa los logs del servidor
4. Ejecuta los scripts de configuración
5. Consulta la documentación de MySQL

---

## Changelog

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

**🎉 ¡El sistema de formularios dinámicos ahora incluye todas las funcionalidades avanzadas para una gestión completa y profesional!**
