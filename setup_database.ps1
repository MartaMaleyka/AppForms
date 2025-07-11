# Script de configuración de base de datos MySQL para Sistema de Formularios
# PowerShell script

Write-Host "========================================" -ForegroundColor Green
Write-Host "Configuración de Base de Datos MySQL" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Conectando a MySQL..." -ForegroundColor Yellow
Write-Host "Usuario: root" -ForegroundColor Cyan
Write-Host "Password: labebe12" -ForegroundColor Cyan
Write-Host "Puerto: 3306" -ForegroundColor Cyan
Write-Host ""

Write-Host "Ejecutando script de configuración..." -ForegroundColor Yellow

try {
    # Ejecutar el script SQL
    $result = mysql -h localhost -P 3306 -u root -plabebe12 -e "source database_setup.sql" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "¡Base de datos configurada exitosamente!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Base de datos: forms_db" -ForegroundColor Cyan
        Write-Host "Usuario admin creado con password: password" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Puedes conectarte con:" -ForegroundColor Yellow
        Write-Host "mysql -h localhost -P 3306 -u root -plabebe forms_db" -ForegroundColor White
        Write-Host ""
    } else {
        throw "Error al ejecutar el script SQL"
    }
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Error al configurar la base de datos" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifica que:" -ForegroundColor Yellow
    Write-Host "1. MySQL esté ejecutándose en localhost:3306" -ForegroundColor White
    Write-Host "2. El usuario root tenga la contraseña 'labebe'" -ForegroundColor White
    Write-Host "3. Tengas permisos para crear bases de datos" -ForegroundColor White
    Write-Host "4. El archivo database_setup.sql esté en el directorio actual" -ForegroundColor White
    Write-Host ""
    Write-Host "Error detallado:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 