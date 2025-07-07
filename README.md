

# Sistema de Formularios Dinámicos

Una aplicación web completa para crear y gestionar formularios con lógica condicional avanzada y exportación de datos.

## Características Principales

### ✨ Funcionalidades Básicas
- **Creación de formularios** con múltiples tipos de preguntas
- **Autenticación de usuarios** con JWT
- **Gestión de respuestas** y visualización de resultados
- **Interfaz moderna** y responsive

### 🎯 Lógica Condicional (Skip Logic)
- **Mostrar/ocultar preguntas** según las respuestas del usuario
- **Saltos dinámicos** entre preguntas
- **Múltiples condiciones** por pregunta
- **Soporte para todos los tipos de preguntas** (radio, checkbox, select)

### 📊 Exportación de Datos
- **Exportar a Excel** (.xlsx) con formato profesional
- **Incluir todas las respuestas** de los formularios
- **Datos organizados** por pregunta y respondente
- **Filtros y ordenamiento** de datos

## Tipos de Preguntas Soportados

- **Texto corto** - Respuestas de una línea
- **Texto largo** - Respuestas multilínea
- **Opción única** - Radio buttons
- **Múltiples opciones** - Checkboxes
- **Lista desplegable** - Select dropdown
- **Fecha** - Selector de fecha
- **Hora** - Selector de hora
- **Fecha y Hora** - Selector combinado

## Configuración de Lógica Condicional

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

## Exportación a Excel

### Características de la Exportación
- **Formato .xlsx** compatible con Microsoft Excel y Google Sheets
- **Hoja de respuestas** con todas las respuestas organizadas
- **Información del respondente** (nombre, fecha de envío)
- **Preguntas y respuestas** en columnas separadas
- **Datos limpios** y fáciles de analizar

### Cómo Exportar
1. **Acceder a las respuestas** del formulario
2. **Hacer clic en "Exportar a Excel"**
3. **Descargar automáticamente** el archivo .xlsx
4. **Abrir en Excel** o cualquier aplicación compatible

### Estructura del Excel Exportado
```
| Respondente | Fecha de Envío | Pregunta 1 | Pregunta 2 | Pregunta 3 | ...
|-------------|----------------|------------|------------|------------|-----
| Juan Pérez  | 2024-01-15     | Sí         | Premium    | Excelente  | ...
| María López | 2024-01-15     | No         | -          | -          | ...
```

## Instalación y Configuración

### Prerrequisitos
- Node.js (v14 o superior)
- npm o yarn

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd Forms
```

2. **Instalar dependencias**
```bash
npm install
cd client
npm install
```

3. **Configurar variables de entorno**
```bash
# En el directorio raíz, crear .env
JWT_SECRET=tu-clave-secreta-aqui
```

4. **Iniciar la aplicación**
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
│   │   │   ├── FormBuilder.tsx    # Constructor de formularios
│   │   │   ├── FormView.tsx       # Vista de formularios
│   │   │   ├── FormResponses.tsx  # Gestión de respuestas
│   │   │   └── ...
│   │   └── contexts/      # Contextos de React
├── data/                  # Archivos de datos JSON
│   ├── forms.json         # Formularios guardados
│   ├── responses.json     # Respuestas de usuarios
│   └── users.json         # Usuarios del sistema
└── server.js              # Servidor Express
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

### Backend
- **Node.js** con Express
- **JWT** para autenticación
- **Almacenamiento JSON** (sin base de datos)
- **CORS** habilitado
- **Validación de datos** completa
- **ExcelJS** para generación de archivos Excel

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

## Desarrollo

### Comandos Útiles

```bash
# Ejecutar tests
npm test

# Construir para producción
cd client
npm run build

# Verificar tipos TypeScript
cd client
npx tsc --noEmit
```

### Estructura de Datos

#### Formulario
```json
{
  "id": 1,
  "title": "Título del formulario",
  "description": "Descripción opcional",
  "questions": [
    {
      "id": 1,
      "question_text": "Texto de la pregunta",
      "question_type": "radio",
      "options": ["Opción 1", "Opción 2"],
      "required": true,
      "skip_logic": {
        "enabled": true,
        "conditions": [
          {
            "option": "Opción 1",
            "skip_to_question": 3
          }
        ]
      }
    }
  ]
}
```

#### Respuesta
```json
{
  "id": 1,
  "form_id": 1,
  "respondent_name": "Juan Pérez",
  "answers": [
    {
      "question_id": 1,
      "answer_text": "Opción 1"
    }
  ],
  "submitted_at": "2024-01-15T10:30:00.000Z"
}
```

## Uso de la Aplicación

### 1. Crear Formularios
- Acceder a `/form-builder`
- Configurar preguntas y lógica condicional
- Guardar formulario

### 2. Responder Formularios
- Acceder a `/form/:id`
- Las preguntas se ocultan/muestran automáticamente
- Enviar respuestas

### 3. Gestionar Respuestas
- Acceder a `/form/:id/responses`
- Ver todas las respuestas
- Exportar a Excel con un clic

### 4. Exportar Datos
- En la página de respuestas
- Hacer clic en "Exportar a Excel"
- Descargar archivo .xlsx
- Abrir en Excel para análisis

## Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para reportar bugs o solicitar nuevas características, por favor abre un issue en el repositorio.

---

## Changelog

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
