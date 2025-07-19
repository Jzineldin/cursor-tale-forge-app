#!/usr/bin/env pwsh
<#
 * TaleForge – Full PRD Compliance & QA Audit – PowerShell Version
 * run:  pwsh scripts/run-full-audit.ps1
 #>

$url = if ($env:URL) { $env:URL } else { 'http://localhost:8082' }
$prdFile = 'TALEFORGE_PRD_2025.md'
$report = "audits/$(Get-Date -Format 'yyyy-MM-dd-HH-mm').report.md"

New-Item -ItemType Directory -Force -Path 'audits' | Out-Null
$log = ''

# --- helper ---
function Invoke-Command {
    param($cmd, $title)
    try {
        $out = Invoke-Expression $cmd 2>&1 | Out-String
        $script:log += "## $title`n``````$($out.Trim())```````n`n"
    } catch {
        $script:log += "## ❌ $title FAILED`n``````$($_.Exception.Message)```````n`n"
    }
}

# 1. lint & type
Invoke-Command 'npm run lint' 'Linting'
Invoke-Command 'npm run build' 'Build'

# 2. lighthouse batch on routes
$routes = @('/', '/login', '/signup', '/create', '/story/63', '/my-stories', '/gallery', '/privacy', '/terms')

foreach ($r in $routes) {
    Invoke-Command "npx lighthouse-batch --url=`"$url$r`" --out=audits/ --chrome-flags=`"--headless=new --disable-gpu`"" "Lighthouse $r"
}

# 3. axe + playwright pass
Invoke-Command 'npx playwright test --grep @axe --reporter=line' 'Axe Accessibility'

# 4. match PRD gaps
Invoke-Command "Select-String -Pattern '^- \[ \]' $prdFile | Measure-Object | Select-Object -ExpandProperty Count" 'Remaining PRD TODOs'

# 5. size budgets
Invoke-Command 'Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum | Select-Object @{Name="Size(MB)";Expression={[math]::Round($_.Sum/1MB,2)}}' 'Bundle Size'
Invoke-Command 'git diff --name-only' 'Changed Files'

$log | Out-File -FilePath $report -Encoding UTF8
Write-Host "🧾 Written full report → $report" 