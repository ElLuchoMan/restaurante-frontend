# Script para commit con fix automatico
param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

$MaxAttempts = 3
$Attempt = 1

Write-Host "Iniciando commit con fix automatico..." -ForegroundColor Green

while ($Attempt -le $MaxAttempts) {
    Write-Host "Intento $Attempt de $MaxAttempts" -ForegroundColor Yellow

    # Agregar todos los cambios
    git add .

    # Intentar hacer el commit
    $commitResult = git commit -m $Message 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Commit exitoso!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "Commit fallo, los hooks hicieron fix automatico..." -ForegroundColor Yellow
        Write-Host "Reintentando con los cambios corregidos..." -ForegroundColor Blue
    }

    $Attempt++
}

Write-Host "Fallo despues de $MaxAttempts intentos" -ForegroundColor Red
exit 1
