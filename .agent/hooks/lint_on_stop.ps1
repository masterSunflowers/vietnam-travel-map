param(
    [switch]$Standalone
)

$ErrorActionPreference = "Continue"
$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")

# 1. Read stdin if available (Stop hook context from Antigravity)
$inputRaw = ""
$continuationActive = $false
try {
    if ([Console]::IsInputRedirected) {
        $inputRaw = [Console]::In.ReadToEnd()
        if ($inputRaw) {
            $context = $inputRaw | ConvertFrom-Json
            if ($context.continuationActive) {
                $continuationActive = $true
            }
        }
    }
} catch {}

# 2. Check changed files via git
$changedFiles = @()
try {
    $status = git -C $projectRoot status --porcelain
    if ($status) {
        $changedFiles = $status | ForEach-Object { $_.Substring(3).Trim() }
    }
} catch {}

if ($changedFiles.Count -eq 0) {
    try {
        $diff = git -C $projectRoot diff --name-only HEAD~1 HEAD
        if ($diff) {
            $changedFiles = $diff
        }
    } catch {}
}

$hasBackend = ($changedFiles | Where-Object { $_ -like "backend/*" -or $_ -like "*.py" }).Count -gt 0
$hasFrontend = ($changedFiles | Where-Object { $_ -like "frontend/*" -or $_ -match "\.(ts|tsx|js|jsx|css|json)$" }).Count -gt 0

$hasErrors = $false
$errorDetails = @()
$actionsTaken = @()

# 3. Process Backend (ruff, mypy)
if ($hasBackend -or $Standalone) {
    $backendDir = Join-Path $projectRoot "backend"
    $ruffExe = Join-Path $backendDir ".venv\Scripts\ruff.exe"
    $pythonExe = Join-Path $backendDir ".venv\Scripts\python.exe"

    if (Test-Path $ruffExe) {
        # Auto-fix and format
        & $ruffExe check --fix --no-cache app 2>&1 | Out-Null
        & $ruffExe format --no-cache app 2>&1 | Out-Null
        $actionsTaken += "Applied ruff auto-fix and formatting on backend/app"

        # Verify
        $ruffOut = & $ruffExe check --no-cache app 2>&1
        if ($LASTEXITCODE -ne 0) {
            $hasErrors = $true
            $errorDetails += "[Backend Ruff Errors]`n$($ruffOut -join "`n")"
        }
    }

    if (Test-Path $pythonExe) {
        # Mypy type check
        $mypyOut = & $pythonExe -m mypy --cache-dir=nul app 2>&1
        if ($LASTEXITCODE -ne 0) {
            $hasErrors = $true
            $errorDetails += "[Backend Mypy Errors]`n$($mypyOut -join "`n")"
        } else {
            $actionsTaken += "Backend mypy type check passed (0 issues)"
        }
    }
}

# 4. Process Frontend (eslint)
if ($hasFrontend -or $Standalone) {
    $frontendDir = Join-Path $projectRoot "frontend"

    # Auto-fix
    Push-Location $frontendDir
    try {
        npm run lint -- --fix 2>&1 | Out-Null
        $actionsTaken += "Applied eslint --fix on frontend"

        # Verify
        $eslintOut = npm run lint 2>&1
        if ($LASTEXITCODE -ne 0) {
            $hasErrors = $true
            $errorDetails += "[Frontend ESLint Errors]`n$($eslintOut -join "`n")"
        } else {
            $actionsTaken += "Frontend eslint check passed (0 errors)"
        }
    } finally {
        Pop-Location
    }
}

# 5. Output response JSON for Hook contract
$decision = "allow"
$reason = "All linters passed."

if ($hasErrors) {
    if (-not $continuationActive) {
        $decision = "continue"
        $reason = "[Linter Hook] Errors found after auto-fixing:`n`n$($errorDetails -join "`n`n")"
    } else {
        $decision = "allow"
        $reason = "[Linter Hook Warning] Remaining errors noted (loop guard active):`n`n$($errorDetails -join "`n`n")"
    }
} elseif ($actionsTaken.Count -gt 0) {
    $reason = "[Linter Hook] Checks passed:`n- $($actionsTaken -join "`n- ")"
} else {
    $reason = "[Linter Hook] No backend or frontend code changes detected."
}

$responseObj = [PSCustomObject]@{
    decision = $decision
    reason   = $reason
}

if ($Standalone) {
    Write-Host "Decision: $decision"
    Write-Host "Reason: $reason"
} else {
    $responseObj | ConvertTo-Json -Compress
}
