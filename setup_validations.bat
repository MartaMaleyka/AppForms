@echo off
echo ========================================
echo Configuracion de Validaciones
echo ========================================
echo.

echo Ejecutando migracion de validaciones...
mysql -u root -plabebe12 forms_db < migrate_validations.sql

if %errorlevel% equ 0 (
    echo.
    echo ✅ Migracion de validaciones completada exitosamente
    echo.
    echo Las validaciones ahora estan integradas al sistema:
    echo - FormBuilder: Crear validaciones por pregunta
    echo - FormView: Validacion en tiempo real
    echo - ValidationBuilder: Gestionar validaciones globales
    echo.
    echo Para usar las validaciones:
    echo 1. Ve a /validations para crear validaciones globales
    echo 2. Ve a /create para crear formularios con validaciones
    echo 3. Las validaciones se aplican automaticamente en /form/:id
    echo.
) else (
    echo.
    echo ❌ Error en la migracion de validaciones
    echo Verifica que MySQL este ejecutandose y las credenciales sean correctas
    echo.
)

pause 