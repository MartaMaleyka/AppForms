@echo off
echo ========================================
echo Configuracion de Base de Datos MySQL
echo ========================================
echo.

echo Conectando a MySQL...
echo Usuario: root
echo Password: labebe12
echo Puerto: 3306
echo.

echo Ejecutando script de configuracion...
mysql -h localhost -P 3306 -u root -plabebe12 < database_setup.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ¡Base de datos configurada exitosamente!
    echo ========================================
    echo.
    echo Base de datos: forms_db
    echo Usuario admin creado con password: password
    echo.
    echo Puedes conectarte con:
    echo mysql -h localhost -P 3306 -u root -plabebe forms_db
    echo.
) else (
    echo.
    echo ========================================
    echo Error al configurar la base de datos
    echo ========================================
    echo.
    echo Verifica que:
    echo 1. MySQL esté ejecutándose en localhost:3306
    echo 2. El usuario root tenga la contraseña 'labebe'
    echo 3. Tengas permisos para crear bases de datos
    echo.
)

pause 