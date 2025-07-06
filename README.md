# 📋 Forms App - Aplicación de Formularios

Una aplicación web tipo Google Forms para crear, compartir y gestionar formularios personalizados usando archivos JSON.

## 🚀 Características

- **Crear formularios personalizados** con diferentes tipos de preguntas:
  - Texto corto
  - Texto largo
  - Opción única (radio)
  - Múltiples opciones (checkbox)
  - Lista desplegable (select)
  - Fecha
  - Hora
  - Fecha y Hora
- **Compartir formularios** mediante enlaces directos
- **Recibir respuestas** en tiempo real
- **Ver estadísticas** de respuestas con gráficos
- **Interfaz moderna** y responsive
- **Almacenamiento en archivos JSON** para simplicidad
- 🔐 **Sistema de Autenticación**: Login y registro de usuarios
- 📝 **Creación de Formularios**: Interfaz intuitiva para crear formularios personalizados
- 📊 **Visualización de Respuestas**: Análisis detallado de las respuestas recibidas
- 🎨 **Interfaz Moderna**: Diseño responsive y atractivo
- 🔒 **Rutas Protegidas**: Acceso seguro a funcionalidades administrativas

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **Archivos JSON** - Almacenamiento de datos
- **CORS** - Middleware para peticiones cross-origin
- **bcryptjs** - Para hashear contraseñas
- **jsonwebtoken** - Para generar tokens JWT

### Frontend
- **React** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **React Router** - Navegación
- **CSS3** - Estilos modernos y responsive

## 📦 Instalación

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd Forms
   ```

2. **Instalar dependencias del backend**
   ```bash
   npm install
   ```

3. **Instalar dependencias del frontend**
   ```bash
   cd client
   npm install
   cd ..
   ```

## 🚀 Ejecución

### Desarrollo

1. **Iniciar el servidor backend**
   ```bash
   npm run dev
   ```
   El servidor se ejecutará en `http://localhost:5000`

2. **Iniciar el frontend** (en otra terminal)
   ```bash
   cd client
   npm start
   ```
   La aplicación se abrirá en `http://localhost:3000`

### Producción

1. **Construir el frontend**
   ```bash
   npm run build
   ```

2. **Iniciar en modo producción**
   ```bash
   npm start
   ```

## 📖 Uso de la Aplicación

### 1. Crear un Formulario

1. Ve a la página principal
2. Haz clic en "Crear Nuevo Formulario"
3. Completa la información del formulario:
   - **Título**: Nombre del formulario
   - **Descripción**: Explicación opcional
4. Agrega preguntas:
   - Haz clic en "+ Agregar Pregunta"
   - Selecciona el tipo de pregunta
   - Escribe el texto de la pregunta
   - Para preguntas de opciones, agrega las opciones disponibles
   - Marca como obligatoria si es necesario
5. Haz clic en "Crear Formulario"

### 2. Compartir el Formulario

1. Una vez creado, serás redirigido al formulario
2. Copia la URL del navegador
3. Comparte el enlace con los encuestados

### 3. Ver Respuestas

1. En la página principal, busca tu formulario
2. Haz clic en "Ver Respuestas"
3. Visualiza:
   - Tabla con todas las respuestas
   - Estadísticas por pregunta
   - Gráficos de distribución para preguntas de opciones

## 📁 Estructura de Datos

### Archivos JSON

- **`data/forms.json`**: Almacena todos los formularios creados
- **`data/responses.json`**: Almacena todas las respuestas recibidas

### Estructura de un Formulario
```json
{
  "id": 1234567890,
  "title": "Encuesta de Satisfacción",
  "description": "Ayúdanos a mejorar",
  "questions": [
    {
      "id": 1234567891,
      "question_text": "¿Cómo calificarías nuestro servicio?",
      "question_type": "radio",
      "options": ["Excelente", "Bueno", "Regular", "Malo"],
      "required": true,
      "order_index": 0
    }
  ],
  "created_at": "2024-01-01T12:00:00.000Z"
}
```

### Estructura de una Respuesta
```json
{
  "id": 1234567892,
  "form_id": 1234567890,
  "respondent_name": "Juan Pérez",
  "answers": [
    {
      "question_id": 1234567891,
      "answer_text": "Excelente"
    }
  ],
  "submitted_at": "2024-01-01T13:00:00.000Z"
}
```

## 🔧 Scripts Disponibles

- `npm start` - Inicia el servidor en modo producción
- `npm run dev` - Inicia el servidor en modo desarrollo con nodemon
- `npm run build` - Construye el frontend para producción
- `npm run install-client` - Instala dependencias del frontend

## 📱 Características Responsive

La aplicación está optimizada para:
- **Desktop**: Pantallas grandes con layout completo
- **Tablet**: Adaptación de elementos para pantallas medianas
- **Mobile**: Navegación y formularios optimizados para móviles

## 🎨 Personalización

### Colores
Los colores principales se pueden modificar en los archivos CSS:
- Gradiente principal: `#667eea` a `#764ba2`
- Colores de estado: `#28a745` (éxito), `#dc3545` (error)

### Estilos
Todos los estilos están en archivos CSS separados por componente para fácil personalización.

## 🔒 Seguridad

- Validación de datos en frontend y backend
- Sanitización de inputs
- Almacenamiento local en archivos JSON
- 🔐 **Sistema de Autenticación**: Login y registro de usuarios
- **Contraseñas hasheadas con bcrypt**
- **Tokens JWT para autenticación**
- **Rutas protegidas en el frontend y backend**
- **Validación de datos en cliente y servidor**

## 🚧 Limitaciones Actuales

- No hay autenticación de usuarios
- Los formularios son públicos (cualquiera con el enlace puede responder)
- No hay límite en el número de respuestas
- No hay exportación de datos
- Almacenamiento local (no persistente en servidor remoto)

## 🔮 Próximas Mejoras

- [ ] Migración a SQLite para mejor rendimiento
- [ ] Sistema de autenticación
- [ ] Formularios privados con contraseña
- [ ] Exportación a Excel/CSV
- [ ] Plantillas de formularios
- [ ] Notificaciones por email
- [ ] Límites de respuestas
- [ ] Editor de formularios más avanzado

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 📞 Soporte

Si tienes problemas o preguntas, puedes:
- Abrir un issue en el repositorio
- Contactar al desarrollador

---
