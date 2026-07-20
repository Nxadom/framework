<#
.SYNOPSIS
    Push otomatis ke GitHub - add, commit, push.
.DESCRIPTION
    Skrip one-shot untuk repo framework Nxadom.
    Remote default: https://github.com/Nxadom/framework.git (tanpa token di URL).
    Gunakan credential helper / PAT saat diminta password.

.EXAMPLE
    .\push.ps1
    .\push.ps1 -Message "feat: modul chat baru"
    .\push.ps1 -DryRun
    .\push.ps1 -SkipCommit
#>

param(
    [string]$Message = "all Update",
    [string]$Branch = "main",
    [string]$Remote = "origin",
    [string]$RemoteUrl = "https://github.com/Nxadom/framework.git",
    [switch]$DryRun,
    [switch]$SkipCommit
)

$ErrorActionPreference = "Stop"
$RepoRoot = $PSScriptRoot

function Write-Ok($m)    { Write-Host "   [OK] $m" -ForegroundColor Green }
function Write-Warn($m)  { Write-Host "   [!] $m" -ForegroundColor Yellow }
function Write-Info($m)  { Write-Host "       $m" -ForegroundColor Gray }
function Write-Step($m)  { Write-Host ""; Write-Host ">> $m" -ForegroundColor Cyan }

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)
    $out = & git @GitArgs 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw ("git " + ($GitArgs -join " ") + " gagal:`n" + ($out -join [Environment]::NewLine))
    }
    return $out
}

function Invoke-GitQuiet {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)
    $out = & git @GitArgs 2>&1
    return @{ Code = $LASTEXITCODE; Out = ($out -join [Environment]::NewLine) }
}

function Test-UrlHasCredential([string]$url) {
    return ($url -match 'ghp_[A-Za-z0-9]+') -or ($url -match '://[^/]+:[^@]+@github\.com')
}

Set-Location $RepoRoot

Write-Step "Nxadom push - $RepoRoot"

if (-not (Test-Path (Join-Path $RepoRoot ".git"))) {
    throw "Bukan git repo: $RepoRoot"
}

$gitExe = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitExe) {
    throw "git tidak ditemukan di PATH. Install Git for Windows atau jalankan nxdom-setup.ps1."
}

# Remote & branch
$remoteList = Invoke-GitQuiet remote
$remotePattern = "(?m)^" + [regex]::Escape($Remote) + "$"
if ($remoteList.Code -ne 0 -or -not ($remoteList.Out -match $remotePattern)) {
    Write-Info "Menambah remote '$Remote' -> $RemoteUrl"
    if ($DryRun) {
        Write-Warn "[dry-run] git remote add $Remote $RemoteUrl"
    } else {
        Invoke-Git remote add $Remote $RemoteUrl | Out-Null
        Write-Ok "Remote '$Remote' ditambahkan"
    }
} else {
    $currentUrl = (Invoke-Git remote get-url $Remote).Trim()
    if ($currentUrl -ne $RemoteUrl) {
        Write-Info "Memperbarui URL remote '$Remote'"
        Write-Info "  dari: $currentUrl"
        Write-Info "    ke: $RemoteUrl"
        if (Test-UrlHasCredential $currentUrl) {
            Write-Warn "URL lama mengandung token - dibersihkan ke HTTPS biasa"
        }
        if ($DryRun) {
            Write-Warn "[dry-run] git remote set-url $Remote $RemoteUrl"
        } else {
            Invoke-Git remote set-url $Remote $RemoteUrl | Out-Null
            Write-Ok "Remote URL diperbarui"
        }
    } else {
        Write-Ok "Remote '$Remote' sudah benar"
    }
}

if ($DryRun) {
    Write-Warn "[dry-run] git branch -M $Branch"
} else {
    Invoke-Git branch -M $Branch | Out-Null
    Write-Ok "Branch aktif: $Branch"
}

# Commit
if (-not $SkipCommit) {
    $status = Invoke-Git status --porcelain
    if ($status) {
        Write-Step "Commit perubahan"
        Write-Info "Pesan: $Message"
        if ($DryRun) {
            Write-Warn "[dry-run] git add ."
            Write-Warn ('[dry-run] git commit -m "' + $Message + '"')
            $status | ForEach-Object { Write-Info $_ }
        } else {
            Invoke-Git add . | Out-Null
            Invoke-Git commit -m $Message | Out-Null
            Write-Ok "Commit dibuat"
        }
    } else {
        Write-Warn "Tidak ada perubahan - lewati commit"
    }
} else {
    Write-Warn "SkipCommit - tidak ada git add / commit"
}

# Push
Write-Step "Push ke $Remote/$Branch"

$ahead = Invoke-GitQuiet rev-list --count "$Remote/$Branch..HEAD"
$hasAhead = ($ahead.Code -eq 0 -and [int]$ahead.Out -gt 0)

if (-not $DryRun -and -not $hasAhead) {
    $localHead = (Invoke-Git rev-parse HEAD).Trim()
    $remoteHead = Invoke-GitQuiet rev-parse "$Remote/$Branch"
    if ($remoteHead.Code -eq 0 -and $remoteHead.Out.Trim() -eq $localHead) {
        Write-Ok "Sudah up to date dengan $Remote/$Branch - tidak perlu push"
        exit 0
    }
}

if ($DryRun) {
    Write-Warn "[dry-run] git push -u $Remote $Branch"
    exit 0
}

Invoke-Git push -u $Remote $Branch
Write-Ok ("Push berhasil -> " + $RemoteUrl + " (" + $Branch + ")")
