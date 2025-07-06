# Forms CSS - Sistema de Formularios con Autenticación

Una aplicación completa para crear y gestionar formularios con sistema de autenticación integrado y campos de fecha y hora.

## Características

- 🔐 **Sistema de Autenticación**: Login y registro de usuarios
- 📝 **Creación de Formularios**: Interfaz intuitiva para crear formularios personalizados
- 📊 **Visualización de Respuestas**: Análisis detallado de las respuestas recibidas
- 🎨 **Interfaz Moderna**: Diseño responsive y atractivo
- 🔒 **Rutas Protegidas**: Acceso seguro a funcionalidades administrativas
- 📅 **Campos de Fecha y Hora**: Tipos de preguntas avanzados para recopilar información temporal

## Instalación

1. **Instalar dependencias del servidor:**
   ```bash
   npm install
   ```

2. **Instalar dependencias del cliente:**
   ```bash
   cd client
   npm install
   ```

## Uso

### Iniciar el servidor:
```bash
npm start
```

### Iniciar el cliente (en otra terminal):
```bash
cd client
npm start
```

## Credenciales de Demo

Para probar la aplicación, puedes usar las siguientes credenciales:

- **Usuario:** admin
- **Contraseña:** password

## Funcionalidades

### Autenticación
- Registro de nuevos usuarios
- Inicio de sesión
- Cerrar sesión
- Persistencia de sesión

### Gestión de Formularios
- Crear formularios con diferentes tipos de preguntas
- Ver lista de formularios creados
- Acceder a respuestas de formularios
- Compartir enlaces de formularios

### Tipos de Preguntas Soportados
- **Texto corto** - Para respuestas breves
- **Texto largo** - Para respuestas extensas
- **Opción única (radio)** - Para seleccionar una opción
- **Opciones múltiples (checkbox)** - Para seleccionar varias opciones
- **Lista desplegable (select)** - Para elegir de una lista
- **📅 Fecha** - Para seleccionar fechas
- **🕐 Hora** - Para seleccionar horas
- **📅🕐 Fecha y Hora** - Para seleccionar fecha y hora juntas

## Tecnologías Utilizadas

- **Backend:** Node.js, Express, bcryptjs, jsonwebtoken
- **Frontend:** React, TypeScript, React Router
- **Almacenamiento:** JSON files
- **Autenticación:** JWT tokens

## Seguridad

- Contraseñas hasheadas con bcrypt
- Tokens JWT para autenticación
- Rutas protegidas en el frontend y backend
- Validación de datos en cliente y servidor

## Características Avanzadas

### Campos de Fecha y Hora
- **Selector de Fecha:** Interfaz nativa del navegador para seleccionar fechas
- **Selector de Hora:** Interfaz nativa para seleccionar horas
- **Selector Combinado:** Fecha y hora en un solo campo
- **Validación:** Campos obligatorios funcionan correctamente
- **Estilos Modernos:** Diseño consistente con el resto de la aplicación

### Interfaz de Usuario
- **Diseño Responsive:** Funciona en dispositivos móviles y desktop
- **Animaciones Suaves:** Transiciones y efectos visuales
- **Validación en Tiempo Real:** Feedback inmediato al usuario
- **Mensajes de Error:** Información clara sobre errores

## Casos de Uso

### Formularios de Eventos
- Fechas de eventos
- Horarios de actividades
- Registro de participantes

### Encuestas de Satisfacción
- Fechas de servicio
- Horarios de atención
- Evaluaciones temporales

### Registros de Citas
- Programación de citas
- Horarios disponibles
- Confirmaciones de asistencia

## Licencia

Este proyecto está bajo la Licencia ISC.