$ErrorActionPreference = "Stop"

$root = Resolve-Path "$PSScriptRoot\.."

Start-Process powershell -WindowStyle Hidden -WorkingDirectory $root -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$root\scripts\start-backend.ps1"
Start-Process powershell -WindowStyle Hidden -WorkingDirectory $root -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$root\scripts\start-frontend.ps1"

Write-Host "CORTEX startup launched."
Write-Host "Backend:  http://127.0.0.1:8000/api/v1/health"
Write-Host "Frontend: http://localhost:5173"
