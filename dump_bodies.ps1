$dirs = @(
    "src/content/architectures",
    "src/content/capsulas",
    "src/content/editorial_templates",
    "src/content/ensayos",
    "src/content/essays",
    "src/content/visual_signals"
)

$root = "c:\Users\ygnat\TGP-PORTAL"
$outFile = "$root\article_bodies.txt"

if (Test-Path $outFile) { Remove-Item $outFile }

foreach ($d in $dirs) {
    $full = Join-Path $root $d
    $files = Get-ChildItem -Path $full -Filter *.mdoc -Recurse
    $files += Get-ChildItem -Path $full -Filter *.md -Recurse

    foreach ($f in $files) {
        $content = [System.IO.File]::ReadAllText($f.FullName)
        $firstIdx = $content.IndexOf('---')
        $body = $content
        if ($firstIdx -ne -1) {
            $secondIdx = $content.IndexOf('---', $firstIdx + 3)
            if ($secondIdx -ne -1) {
                $body = $content.Substring($secondIdx + 3).Trim()
            }
        }
        Add-Content -Path $outFile -Value "=== $($f.FullName) ==="
        Add-Content -Path $outFile -Value $body
        Add-Content -Path $outFile -Value "`n"
    }
}
Write-Host "All article bodies saved to $outFile"
