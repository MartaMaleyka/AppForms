@echo off
echo ========================================
echo Configuracion Completa del Sistema
echo ========================================
echo.

echo Paso 1: Configurando base de datos MySQL...
setup_database.bat

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Paso 2: Migrando datos existentes (si los hay)...
    node migrate_from_json.js
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ========================================
        echo ¡Configuracion completada exitosamente!
        echo ========================================
        echo.
        echo Para iniciar el servidor:
        echo npm start
        echo.
        echo Para iniciar el cliente:
        echo cd client ^&^& npm start
        echo.
        echo Credenciales por defecto:
        echo Usuario: admin
        echo Password: password
        echo.
    ) else (
        echo.
        echo ⚠️ Advertencia: No se pudieron migrar datos existentes
        echo El sistema funcionará con la base de datos vacía
        echo.
    )
) else (
    echo.
    echo ❌ Error: No se pudo configurar la base de datos
    echo Verifica que MySQL esté ejecutándose y las credenciales sean correctas
    echo.
)

pause 