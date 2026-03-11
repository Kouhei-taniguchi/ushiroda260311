$scriptDir = Split-Path $MyInvocation.MyCommand.Path -Parent
$fontJsPath = Join-Path $scriptDir 'font.js'
$tempZip = Join-Path $scriptDir '_font_temp.zip'
$tempDir = Join-Path $scriptDir '_font_temp'

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Google Fonts download
$zipUrl = 'https://fonts.google.com/download?family=Noto+Sans+JP'
Write-Host "Downloading Noto Sans JP from Google Fonts..."

$wc = New-Object System.Net.WebClient
$wc.DownloadFile($zipUrl, $tempZip)
$zipSize = (Get-Item $tempZip).Length
Write-Host "ZIP downloaded: $([math]::Round($zipSize/1024/1024, 2)) MB"

if ($zipSize -lt 100000) {
    Write-Host "ERROR: ZIP file too small"
    exit 1
}

# Extract ZIP
Write-Host "Extracting..."
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($tempZip, $tempDir)

# Find TTF files
Write-Host "Looking for TTF files..."
$ttfFiles = Get-ChildItem $tempDir -Recurse -Filter '*.ttf'
foreach ($f in $ttfFiles) {
    $hdr = [System.IO.File]::ReadAllBytes($f.FullName)[0..3]
    $hex = ($hdr | ForEach-Object { $_.ToString('X2') }) -join ' '
    Write-Host "  $($f.Name) - $([math]::Round($f.Length/1024)) KB - Header: $hex"
}

# Find static Regular TrueType font (header 00 01 00 00)
$targetFont = $null

# First check static folder
$staticDirs = Get-ChildItem $tempDir -Recurse -Directory | Where-Object { $_.Name -eq 'static' }
foreach ($sd in $staticDirs) {
    $staticTtfs = Get-ChildItem $sd.FullName -Filter '*.ttf'
    foreach ($f in $staticTtfs) {
        if ($f.Name -match 'Regular') {
            $hdr = [System.IO.File]::ReadAllBytes($f.FullName)[0..3]
            if ($hdr[0] -eq 0 -and $hdr[1] -eq 1 -and $hdr[2] -eq 0 -and $hdr[3] -eq 0) {
                $targetFont = $f.FullName
                Write-Host "Found static TrueType: $($f.Name)"
                break
            }
        }
    }
    if ($targetFont) { break }
}

# If no static font, check any TTF with TrueType header
if (-not $targetFont) {
    foreach ($f in $ttfFiles) {
        $hdr = [System.IO.File]::ReadAllBytes($f.FullName)[0..3]
        if ($hdr[0] -eq 0 -and $hdr[1] -eq 1 -and $hdr[2] -eq 0 -and $hdr[3] -eq 0) {
            $targetFont = $f.FullName
            Write-Host "Found TrueType: $($f.Name)"
            break
        }
    }
}

if (-not $targetFont) {
    Write-Host "ERROR: No TrueType font found! All fonts have CFF outlines."
    Write-Host "Falling back to system font..."

    # Use system Meiryo or Yu Gothic
    $sysFonts = @(
        'C:\Windows\Fonts\yumin.ttf',
        'C:\Windows\Fonts\YuGothR.ttc'
    )
    foreach ($sf in $sysFonts) {
        if (Test-Path $sf) {
            $hdr = [System.IO.File]::ReadAllBytes($sf)[0..3]
            $hex = ($hdr | ForEach-Object { $_.ToString('X2') }) -join ' '
            Write-Host "System font: $sf - Header: $hex"
        }
    }

    Remove-Item $tempZip -Force -ErrorAction SilentlyContinue
    Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    exit 1
}

# Convert to Base64
Write-Host ""
Write-Host "Converting to Base64: $targetFont"
$bytes = [System.IO.File]::ReadAllBytes($targetFont)
$base64 = [Convert]::ToBase64String($bytes)
Write-Host "Font size: $([math]::Round($bytes.Length/1024)) KB"
Write-Host "Base64 length: $($base64.Length) chars"
$h = $bytes[0..3]
Write-Host "Verified header: $($h[0].ToString('X2')) $($h[1].ToString('X2')) $($h[2].ToString('X2')) $($h[3].ToString('X2'))"

# Generate font.js
$chunkSize = 8000
$chunks = [System.Collections.ArrayList]::new()
for ($i = 0; $i -lt $base64.Length; $i += $chunkSize) {
    $len = [Math]::Min($chunkSize, $base64.Length - $i)
    [void]$chunks.Add("'" + $base64.Substring($i, $len) + "'")
}

$nl = [Environment]::NewLine
$jsContent = "// Noto Sans JP Regular - Pure TrueType Embedded Font" + $nl
$jsContent += "// Source: Google Fonts (TrueType outline, header: 00 01 00 00)" + $nl
$jsContent += "// Size: $([math]::Round($bytes.Length/1024)) KB" + $nl
$jsContent += "var EMBEDDED_FONT = " + $nl
$jsContent += ($chunks -join (" +" + $nl)) + ";" + $nl

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($fontJsPath, $jsContent, $utf8NoBom)
Write-Host "font.js created: $([math]::Round((Get-Item $fontJsPath).Length/1024)) KB"

# Cleanup
Remove-Item $tempZip -Force -ErrorAction SilentlyContinue
Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Done!"
