#!/usr/bin/env pwsh
<#
 * TaleForge – Daily Audit Task Setup for Windows
 * run:  pwsh scripts/setup-daily-audit.ps1
 #>

$projectPath = Get-Location
$taskName = "TaleForgeDailyAudit"
$scriptPath = Join-Path $projectPath "scripts\run-full-audit.ps1"

Write-Host "Setting up daily audit task for TaleForge..." -ForegroundColor Green

# Create the scheduled task
$action = New-ScheduledTaskAction -Execute "pwsh.exe" -Argument "-File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -Daily -At 2:00AM
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "Daily TaleForge audit and performance check"
    Write-Host "✅ Daily audit task created successfully!" -ForegroundColor Green
    Write-Host "Task will run daily at 2:00 AM" -ForegroundColor Yellow
    Write-Host "To remove: Unregister-ScheduledTask -TaskName '$taskName'" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to create task: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try running as Administrator" -ForegroundColor Yellow
} 