Write-Host "=== TTF files ==="
$ttfs = Get-ChildItem 'C:\Windows\Fonts' -Filter '*.ttf'
foreach ($f in $ttfs) {
    if ($f.Length -gt 1000000) {
        Write-Host "$($f.Name) - $([math]::Round($f.Length/1024/1024, 2)) MB"
    }
}
Write-Host ""
Write-Host "=== TTC files ==="
$ttcs = Get-ChildItem 'C:\Windows\Fonts' -Filter '*.ttc'
foreach ($f in $ttcs) {
    Write-Host "$($f.Name) - $([math]::Round($f.Length/1024/1024, 2)) MB"
}
Write-Host ""
Write-Host "=== All font files matching Japanese ==="
$all = Get-ChildItem 'C:\Windows\Fonts' | Where-Object { $_.Name -match 'meir|gothic|yugo|msgo|msmi|noto' }
foreach ($f in $all) {
    Write-Host "$($f.Name) - $([math]::Round($f.Length/1024/1024, 2)) MB"
}
