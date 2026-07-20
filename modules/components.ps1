<#
.SYNOPSIS
    Audit modul -- bandingkan folder di disk vs registrasi di components.js
.DESCRIPTION
    Memindai subdirektori di assets/modules/, membaca registrasi components.js,
    lalu melaporkan modul baru, modul hilang, dan perubahan file.
    Otomatis membuat README.md untuk folder yang belum punya.
    Output: konsol + file components.md.
.EXAMPLE
    .\components.ps1
    .\components.ps1 -Verbose
#>

param(
    [switch]$Verbose
)

# -- Konfigurasi -----------------------------------------------------------
$ModulesDir   = Join-Path $PSScriptRoot "."
$ComponentsJs = Join-Path $PSScriptRoot "components.js"
$ComponentsMd = Join-Path $PSScriptRoot "components.md"
$NxDomJs      = Join-Path $PSScriptRoot "nxdom.js"
$Timestamp    = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$Tick         = [char]96

# -- Fungsi bantu konsol ---------------------------------------------------

function Write-Section ($title) {
    Write-Host ""
    Write-Host ("-" * 60) -ForegroundColor DarkGray
    Write-Host "  $title" -ForegroundColor Cyan
    Write-Host ("-" * 60) -ForegroundColor DarkGray
}
function Write-Ok ($msg)   { Write-Host "   [OK] $msg" -ForegroundColor Green }
function Write-Warn ($msg) { Write-Host "   [!] $msg" -ForegroundColor Yellow }
function Write-Info ($msg) { Write-Host "       $msg" -ForegroundColor Gray }
function Write-Add ($msg)  { Write-Host "   [+] $msg" -ForegroundColor Green }
function Write-Del ($msg)  { Write-Host "   [-] $msg" -ForegroundColor Red }
function Write-Chg ($msg)  { Write-Host "   [~] $msg" -ForegroundColor Magenta }

# -- Koleksi output markdown -----------------------------------------------

$mdLines = [System.Collections.ArrayList]@()
function Md-Append {
    param([string]$text)
    [void]$mdLines.Add($text)
}
function Md-Section {
    param([string]$title)
    Md-Append ""
    Md-Append "---"
    Md-Append ""
    Md-Append "## $title"
    Md-Append ""
}
function Md-TableHeader {
    param([string[]]$columns)
    Md-Append ("| " + ($columns -join " | ") + " |")
    Md-Append ("| " + (($columns | ForEach-Object { "---" }) -join " | ") + " |")
}
function Md-TableRow {
    param([string[]]$values)
    Md-Append ("| " + ($values -join " | ") + " |")
}
function Md-Code {
    param([string]$text)
    return $Tick + $text + $Tick
}

# ==========================================================================
# 1. Baca registrasi dari components.js
# ==========================================================================

Write-Section "1. Registrasi components.js"
Md-Section "1. Registrasi components.js"

if (-not (Test-Path $ComponentsJs)) {
    Write-Warn "components.js tidak ditemukan"
    Md-Append "WARNING: components.js tidak ditemukan."
    $registered = @{}
} else {
    $jsContent = Get-Content $ComponentsJs -Raw
    $registered = [ordered]@{}

    $pattern = [regex]'id:\s*(\d+),\s*version:\s*"[^"]+",\s*label:\s*"([^"]+)"'
    $matches = $pattern.Matches($jsContent)
    $count = 0
    foreach ($m in $matches) {
        $id    = [int]$m.Groups[1].Value
        $label = $m.Groups[2].Value
        $registered[$label.ToLower()] = @{ id = $id; label = $label }
        $count++
    }
    Write-Ok ("$count modul terdaftar")
    Md-Append ("**" + $count + "** modul terdaftar di " + (Md-Code "components.js") + ".")
}

# ==========================================================================
# 2. Pindai folder di disk
# ==========================================================================

Write-Section "2. Folder modul di disk"
Md-Section "2. Folder modul di disk"

$diskFolders = Get-ChildItem -Path $ModulesDir -Directory |
    Where-Object { $_.Name -notin @('node_modules', '.git', '.svn', 'Mobile') } |
    Sort-Object Name

$onDisk = [ordered]@{}
foreach ($folder in $diskFolders) {
    $key = $folder.Name.ToLower()
    $files = Get-ChildItem -Path $folder.FullName -File -Recurse -Force |
        ForEach-Object { $_.Name }

    $hasReadme = (Test-Path (Join-Path $folder.FullName "README.md"))
    $onDisk[$key] = @{
        name      = $folder.Name
        path      = $folder.FullName
        files     = $files
        count     = $files.Count
        hasReadme = $hasReadme
    }
}

Write-Ok ("$($diskFolders.Count) folder ditemukan")
Md-Append ("**" + $diskFolders.Count + "** folder ditemukan di disk.")

# ==========================================================================
# 2b. Baca import dari nxdom.js
# ==========================================================================

Write-Section "2b. Import di nxdom.js"
Md-Section "2b. Import di nxdom.js"

$importedFolders = [ordered]@{}

if (Test-Path $NxDomJs) {
    $nxContent = Get-Content $NxDomJs -Raw

    # Cari semua import: from "./Folder/" | _nxImport("./Folder/") | _nxSafeImport("./Folder/")
    $importPattern = [regex]'(?:from\s+["'']\.\/|_nxImport\(\s*["'']\.\/|_nxSafeImport\(\s*["'']\.\/)([^"''/]+)'
    $importMatches = $importPattern.Matches($nxContent)

    foreach ($m in $importMatches) {
        $folderName = $m.Groups[1].Value
        $key = $folderName.ToLower()
        if (-not $importedFolders.Contains($key)) {
            $importedFolders[$key] = @{ name = $folderName }
        }
    }

    Write-Ok ("$($importedFolders.Count) folder terimport di nxdom.js")
    Md-Append ("**" + $importedFolders.Count + "** folder terimport di " + (Md-Code "nxdom.js") + ".")
} else {
    Write-Warn "nxdom.js tidak ditemukan"
    Md-Append "WARNING: nxdom.js tidak ditemukan."
}

# ==========================================================================
# 3. Daftar lengkap semua modul (tabel)
# ==========================================================================

Write-Section "3. Daftar modul"
Md-Section "3. Daftar modul"

Write-Host ("{0,-4} {1,-24} {2,-8} {3,-6} {4,-8} {5,-8} {6}" -f "NO", "NAMA MODUL", "REG-ID", "FILE", "README", "IMPORT", "STATUS") -ForegroundColor White
Md-TableHeader @("No", "Modul", "ID", "File", "README", "Import", "Status")

$allKeys = ($registered.Keys + $onDisk.Keys) | Sort-Object -Unique
$newModulesList = @()
$missingModulesList = @()
$rowIndex = 1

foreach ($key in $allKeys) {
    $reg  = $registered[$key]
    $disk = $onDisk[$key]

    $name   = if ($disk) { $disk.name } else { $reg.label }
    $regId  = if ($reg)  { $reg.id.ToString() } else { "-" }
    $fCount = if ($disk) { $disk.count.ToString() } else { "-" }
    $hasRm  = if ($disk) { if ($disk.hasReadme) { "YA" } else { "tidak" } } else { "-" }
    $hasIm  = if ($importedFolders[$key]) { "YA" } else { "tidak" }
    $imIcon = if ($importedFolders[$key]) { "$([char]0x2705)" } else { "$([char]0x274C)" }
    $noStr  = $rowIndex.ToString()

    if ($reg -and $disk) {
        Write-Host ("{0,-4} {1,-24} {2,-8} {3,-6} {4,-8} {5,-8}" -f $noStr, $name, $regId, $fCount, $hasRm, $hasIm) -NoNewline
        Write-Host "  OK" -ForegroundColor Green
        Md-TableRow @($noStr, $name, $regId, $fCount, $hasRm, $imIcon, "OK")
    } elseif ($reg -and -not $disk) {
        Write-Host ("{0,-4} {1,-24} {2,-8} {3,-6} {4,-8} {5,-8}" -f $noStr, $reg.label, $regId, "-", "-", $hasIm) -NoNewline
        Write-Host "  [-] FOLDER HILANG" -ForegroundColor Red
        Md-TableRow @($noStr, $reg.label, $regId, "-", "-", $imIcon, "FOLDER HILANG")
        $missingModulesList += $reg
    } elseif (-not $reg -and $disk) {
        Write-Host ("{0,-4} {1,-24} {2,-8} {3,-6} {4,-8} {5,-8}" -f $noStr, $name, "-", $fCount, $hasRm, $hasIm) -NoNewline
        Write-Host "  [+] BELUM TERDAFTAR" -ForegroundColor Green
        Md-TableRow @($noStr, $name, "-", $fCount, $hasRm, $imIcon, "BELUM TERDAFTAR")
        $newModulesList += $disk
    }

    $rowIndex++
}

# ==========================================================================
# 4. Modul baru
# ==========================================================================

Write-Section "4. Modul baru -- belum terdaftar"
Md-Section "4. Modul baru -- belum terdaftar"

if ($newModulesList.Count -eq 0) {
    Write-Ok "Tidak ada modul baru."
    Md-Append "Tidak ada modul baru - semua folder sudah terdaftar."
} else {
    Write-Warn ($newModulesList.Count.ToString() + " modul baru:")
    Md-Append ("**" + $newModulesList.Count + " modul baru** ditemukan:")
    Md-Append ""
    Md-TableHeader @("Modul", "Jumlah File", "README")
    foreach ($m in $newModulesList) {
        $rm = if ($m.hasReadme) { "YA" } else { "tidak" }
        Write-Add ($m.name + " -- " + $m.count.ToString() + " file " + $(if($m.hasReadme){"(README ada)"}else{"(tanpa README)"}))
        Md-TableRow @($m.name, $m.count.ToString(), $rm)
        if ($Verbose) {
            foreach ($f in $m.files) {
                Write-Info ("  -> $f")
            }
        }
    }
}

# ==========================================================================
# 4b. Daftar lengkap modul yang sudah di-import (✅)
# ==========================================================================

Write-Section "4b. Daftar modul terimport di nxdom.js"
Md-Section "4b. Daftar modul terimport di nxdom.js"

$importedList = @()
foreach ($key in $allKeys) {
    $reg  = $registered[$key]
    $disk = $onDisk[$key]
    if ($reg -and $disk -and $importedFolders[$key]) {
        $importedList += @{
            name  = $disk.name
            id    = $reg.id
            label = $reg.label
        }
    }
}

Write-Ok ("{0} modul terimport di nxdom.js:" -f $importedList.Count)
$checkIcon = [char]0x2705
Md-Append ("**" + $importedList.Count + " modul** terimport di " + (Md-Code "nxdom.js") + ":")
Md-Append ""
Md-TableHeader @("No", "Modul", "ID")

$no = 1
foreach ($m in $importedList) {
    $noStr = $no.ToString()
    Write-Info (($checkIcon.ToString() + " " + $m.name + " (id=" + $m.id + ")"))
    Md-TableRow @($noStr, $m.name, $m.id.ToString())
    $no++
}

# ==========================================================================
# 5. Modul hilang
# ==========================================================================

Write-Section "5. Modul hilang -- terdaftar tapi folder tidak ada"
Md-Section "5. Modul hilang -- terdaftar tapi folder tidak ada"

if ($missingModulesList.Count -eq 0) {
    Write-Ok "Tidak ada modul hilang."
    Md-Append "Tidak ada modul hilang."
} else {
    Write-Warn ($missingModulesList.Count.ToString() + " modul hilang:")
    Md-Append ("**" + $missingModulesList.Count + " modul** terdaftar tapi foldernya tidak ada:")
    Md-Append ""
    Md-TableHeader @("ID", "Label")
    foreach ($m in $missingModulesList) {
        Write-Del ("id=" + $m.id.ToString() + "  " + $m.label)
        Md-TableRow @($m.id.ToString(), $m.label)
    }
}

# ==========================================================================
# 6. Perubahan file
# ==========================================================================

Write-Section "6. Perubahan file pada modul terdaftar"
Md-Section "6. Perubahan file pada modul terdaftar"

$blockPattern = [regex]'\{\s*id:\s*(\d+)[^}]*?label:\s*"([^"]+)"[^}]*?file:\s*\[([^\]]*)\]\s*\}'
$blockMatches = $blockPattern.Matches($jsContent)

$changeCount = 0
$changeDetails = [System.Collections.ArrayList]@()

foreach ($block in $blockMatches) {
    $regId    = [int]$block.Groups[1].Value
    $regLabel = $block.Groups[2].Value
    $regKey   = $regLabel.ToLower()

    $regFilesRaw = $block.Groups[3].Value
    $regFiles = [regex]::Matches($regFilesRaw, '"([^"]+)"') |
        ForEach-Object { $_.Groups[1].Value } |
        ForEach-Object { $_.Replace('/', '\').Split('\')[-1] } |
        ForEach-Object { $_.ToLower() } |
        Sort-Object -Unique

    if (-not $onDisk[$regKey]) { continue }

    $diskFiles = $onDisk[$regKey].files |
        ForEach-Object { $_.ToLower() } |
        Sort-Object -Unique

    $newFiles = $diskFiles | Where-Object { $_ -notin $regFiles }
    $delFiles = $regFiles | Where-Object { $_ -notin $diskFiles -and $_ -ne 'readme.md' }

    if ($newFiles.Count -gt 0 -or $delFiles.Count -gt 0) {
        $changeCount++
        Write-Chg ($regLabel + " (id=" + $regId + "):")
        $detail = @{ label = $regLabel; id = $regId; new = @(); del = @() }
        foreach ($f in $newFiles) {
            Write-Add ("  " + $f + " (baru)")
            $detail.new += $f
        }
        foreach ($f in $delFiles) {
            Write-Del ("  " + $f + " (hilang)")
            $detail.del += $f
        }
        [void]$changeDetails.Add($detail)
    }
}

if ($changeCount -eq 0) {
    Write-Ok "Tidak ada perubahan file."
    Md-Append "Tidak ada perubahan file."
} else {
    Md-Append ("**" + $changeCount + " modul** berubah:")
    Md-Append ""
    Md-TableHeader @("Modul", "ID", "File Baru", "File Hilang")
    foreach ($d in $changeDetails) {
        $newStr = if ($d.new.Count -gt 0) { ($d.new -join ", ") } else { "-" }
        $delStr = if ($d.del.Count -gt 0) { ($d.del -join ", ") } else { "-" }
        Md-TableRow @($d.label, $d.id.ToString(), $newStr, $delStr)
    }
}

# ==========================================================================
# 6b. Update field import di components.js
# ==========================================================================

Write-Section "6b. Update field import di components.js"
Md-Section "6b. Update field import di components.js"

if ($registered.Count -eq 0) {
    Write-Warn "Tidak ada modul terdaftar. Lewati update import."
    Md-Append "Tidak ada modul terdaftar."
} else {
    # Step 1: Hapus semua baris import: true/false yang sudah ada
    $jsContent = $jsContent -replace '[ \t]*import:\s*(true|false),?\r?\n', ''
    $importChanges = [System.Collections.ArrayList]@()
    $updateCount = 0

    # Step 2: Untuk setiap modul, tambahkan import: setelah status:
    # Baca baris per baris
    $lines = $jsContent -split '\r?\n'
    $newLines = [System.Collections.ArrayList]@()
    $currentLabel = $null
    $labelRegex = [regex]'^\s*label:\s*"([^"]+)"'

    foreach ($line in $lines) {
        # Deteksi label
        $labelMatch = $labelRegex.Match($line)
        if ($labelMatch.Success) {
            $currentLabel = $labelMatch.Groups[1].Value
        }

        # Setelah baris status: true/false, tambahkan import:
        if ($line -match '^\s*status:\s*(true|false),?\s*$') {
            $newLines.Add($line) | Out-Null
            if ($currentLabel) {
                $key = $currentLabel.ToLower()
                $importValue = if ($importedFolders[$key]) { "true" } else { "false" }
                $newLines.Add("    import: $importValue,") | Out-Null
                $updateCount++
                [void]$importChanges.Add(@{ label = $currentLabel; import = $importValue })
                $currentLabel = $null
            }
        } else {
            $newLines.Add($line) | Out-Null
        }
    }

    $jsContent = $newLines -join [Environment]::NewLine

    Write-Ok ("$updateCount modul berhasil diupdate dengan field import.")
    Md-Append ("**" + $updateCount + " modul** berhasil diupdate dengan field " + (Md-Code "import") + ".")
    Md-Append ""

    # Tulis kembali components.js
    $jsContent | Out-File -FilePath $ComponentsJs -Encoding utf8

    # Hitung ringkasan
    $importTrueCount = ($importChanges | Where-Object { $_.import -eq "true" }).Count
    $importFalseCount = $importChanges.Count - $importTrueCount
    $checkIcon = [char]0x2705
    $crossIcon = [char]0x274C

    Write-Ok ("$updateCount modul diupdate. $importTrueCount import: true, $importFalseCount import: false.")
    $msg1 = "**" + $updateCount + "** modul diupdate -- **" + $importTrueCount + "** " + (Md-Code "import: true") + ", **" + $importFalseCount + "** " + (Md-Code "import: false") + "."
    Md-Append $msg1
    Md-Append ""
    Md-TableHeader @("Status Import", "Jumlah")
    Md-TableRow @(($checkIcon.ToString() + " Import: true"), $importTrueCount.ToString())
    Md-TableRow @(($crossIcon.ToString() + " Import: false"), $importFalseCount.ToString())
}

# ==========================================================================
# 7. Buat README.md untuk folder yang belum punya
# ==========================================================================

Write-Section "7. README.md yang belum ada"
Md-Section "7. README.md yang belum ada"

$foldersWithoutReadme = $onDisk.Values | Where-Object { -not $_.hasReadme } | Sort-Object name
$readmeCreated = 0

if ($foldersWithoutReadme.Count -eq 0) {
    Write-Ok "Semua folder sudah memiliki README.md."
    Md-Append "Semua folder sudah memiliki README.md."
} else {
    Write-Warn ($foldersWithoutReadme.Count.ToString() + " folder tanpa README.md:")
    Md-Append ("**" + $foldersWithoutReadme.Count + " folder** tanpa README.md:")
    Md-Append ""
    Md-TableHeader @("Folder", "Path", "Jumlah File")

    foreach ($f in $foldersWithoutReadme) {
        $folderName = $f.name
        $readmePath = Join-Path $f.path "README.md"
        $pathDisplay = "assets/modules/" + $folderName

        Write-Add ("Membuat README.md: " + $folderName)
        Md-TableRow @($folderName, $f.path, $f.count.ToString())

        $fileList = $f.files | Sort-Object | ForEach-Object { "- " + $_ }
        $fileListStr = $fileList -join [Environment]::NewLine
        $nowStr = Get-Date -Format "yyyy-MM-dd HH:mm"

        # Bangun konten baris per baris (hindari issue backtick di here-string)
        $readmeContent = "# $folderName"
        $readmeContent += [Environment]::NewLine + [Environment]::NewLine
        $readmeContent += "Modul dalam koleksi Nexa UI di folder " + $Tick + $folderName + $Tick + "."
        $readmeContent += [Environment]::NewLine + [Environment]::NewLine
        $readmeContent += "## File"
        $readmeContent += [Environment]::NewLine + [Environment]::NewLine
        $readmeContent += $fileListStr
        $readmeContent += [Environment]::NewLine + [Environment]::NewLine
        $readmeContent += "---"
        $readmeContent += [Environment]::NewLine + [Environment]::NewLine
        $readmeContent += "_Stub README — lengkapi deskripsi modul secara manual._"
        $readmeContent | Out-File -FilePath $readmePath -Encoding utf8
        $readmeCreated++

        if ($Verbose) {
            Write-Info "  -> $readmePath"
        }
    }

    Write-Ok ("$readmeCreated README.md stub ditambah.")
    Md-Append ""
    Md-Append ("**$readmeCreated** README.md stub ditambah (bukan dokumentasi final).")
}

# ==========================================================================
# 8. Ringkasan final
# ==========================================================================

Write-Section "8. Ringkasan final"
Md-Section "8. Ringkasan final"

$totalReg  = $registered.Count
$totalDisk = $onDisk.Count
$totalNew  = $newModulesList.Count
$totalMiss = $missingModulesList.Count

Write-Host "   Modul terdaftar di components.js : $totalReg"
Write-Host "   Folder ditemukan di disk          : $totalDisk"
if ($readmeCreated -gt 0) {
    Write-Add ("README.md stub ditambah               : " + $readmeCreated)
}
Write-Host ""

Md-Append ""
Md-TableHeader @("Metrik", "Jumlah")
Md-TableRow @("Modul terdaftar di components.js", $totalReg.ToString())
Md-TableRow @("Folder ditemukan di disk", $totalDisk.ToString())
if ($readmeCreated -gt 0) {
    Md-TableRow @("README.md stub ditambah", $readmeCreated.ToString())
}

if ($totalNew  -gt 0) {
    Write-Add ("Modul BARU (belum terdaftar)   : " + $totalNew)
    Md-TableRow @("Modul BARU (belum terdaftar)", $totalNew.ToString())
}
if ($totalMiss -gt 0) {
    Write-Del ("Modul HILANG (folder tidak ada) : " + $totalMiss)
    Md-TableRow @("Modul HILANG (folder tidak ada)", $totalMiss.ToString())
}
if ($changeCount -gt 0) {
    Write-Chg ("Modul dengan perubahan file   : " + $changeCount)
    Md-TableRow @("Modul dengan perubahan file", $changeCount.ToString())
}

$issuesExist = ($totalNew -gt 0 -or $totalMiss -gt 0 -or $changeCount -gt 0)
if (-not $issuesExist) {
    Write-Host ""
    Write-Ok "Semua modul sinkron."
    Md-Append ""
    Md-Append ("> Semua modul sinkron antara disk dan " + (Md-Code "components.js") + ".")
} else {
    Write-Warn ""
    Write-Warn "PERHATIAN: Ada ketidaksesuaian."
    Md-Append ""
    Md-Append ("> **Ada ketidaksesuaian. Gunakan detail di atas.**")
}

Write-Host ""
Write-Host ("-" * 60) -ForegroundColor DarkGray
Write-Host " Selesai. $Timestamp" -ForegroundColor Cyan
Write-Host ("-" * 60) -ForegroundColor DarkGray

# ==========================================================================
# Tulis file components.md
# ==========================================================================

Md-Append ""
Md-Append "---"
Md-Append ""
Md-Append ("_Laporan audit maintainer — " + $Timestamp + ". Bukan halaman dokumentasi user._")

$mdContent = $mdLines -join [Environment]::NewLine
$mdContent | Out-File -FilePath $ComponentsMd -Encoding utf8
Write-Host ""
Write-Ok ("Laporan juga ditulis ke: " + $ComponentsMd)