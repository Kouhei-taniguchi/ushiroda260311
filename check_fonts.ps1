$fonts = @(
    'C:\Windows\Fonts\yumin.ttf',
    'C:\Windows\Fonts\yumindb.ttf',
    'C:\Windows\Fonts\yuminl.ttf',
    'C:\Windows\Fonts\HGRSMP.TTF',
    'C:\Windows\Fonts\HGRSKP.TTF',
    'C:\Windows\Fonts\NotoSansJP-VF.ttf',
    'C:\Windows\Fonts\NotoSerifJP-VF.ttf',
    'C:\Windows\Fonts\malgun.ttf'
)
foreach ($path in $fonts) {
    if (Test-Path $path) {
        $bytes = [System.IO.File]::ReadAllBytes($path)
        $hdr = $bytes[0..3]
        $hex = ($hdr | ForEach-Object { $_.ToString('X2') }) -join ' '
        $sizeMB = [math]::Round($bytes.Length/1024/1024, 2)
        Write-Host "$([System.IO.Path]::GetFileName($path)) - $sizeMB MB - Header: $hex"
    }
}
