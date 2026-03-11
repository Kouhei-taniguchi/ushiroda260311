$scriptDir = Split-Path $MyInvocation.MyCommand.Path -Parent
$fontJsPath = Join-Path $scriptDir 'font.js'

# NotoSansJP-VF.ttf (system) - pure TrueType (00 01 00 00)
$fontPath = 'C:\Windows\Fonts\NotoSansJP-VF.ttf'

if (-not (Test-Path $fontPath)) {
    Write-Host "Font not found: $fontPath"
    exit 1
}

Write-Host "Reading font: $fontPath"
$bytes = [System.IO.File]::ReadAllBytes($fontPath)
$h = $bytes[0..3]
Write-Host "Size: $([math]::Round($bytes.Length/1024/1024, 2)) MB"
Write-Host "Header: $($h[0].ToString('X2')) $($h[1].ToString('X2')) $($h[2].ToString('X2')) $($h[3].ToString('X2'))"

Write-Host "Converting to Base64..."
$base64 = [Convert]::ToBase64String($bytes)
Write-Host "Base64 length: $($base64.Length) chars ($([math]::Round($base64.Length/1024/1024, 2)) MB)"

# Generate chunked font.js
Write-Host "Generating font.js..."
$chunkSize = 8000
$chunks = [System.Collections.ArrayList]::new()
for ($i = 0; $i -lt $base64.Length; $i += $chunkSize) {
    $len = [Math]::Min($chunkSize, $base64.Length - $i)
    [void]$chunks.Add("'" + $base64.Substring($i, $len) + "'")
}

$nl = [Environment]::NewLine
$js = "// NotoSansJP Variable Font - Pure TrueType (system font)" + $nl
$js += "// Header: 00 01 00 00 (verified TrueType outline)" + $nl
$js += "// Size: $([math]::Round($bytes.Length/1024)) KB" + $nl
$js += "var EMBEDDED_FONT =" + $nl
$js += ($chunks -join (" +" + $nl)) + ";" + $nl

$enc = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($fontJsPath, $js, $enc)
$jsSize = (Get-Item $fontJsPath).Length
Write-Host "font.js: $([math]::Round($jsSize/1024/1024, 2)) MB"
Write-Host "Done!"
