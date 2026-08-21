$contentDirs = @(
    "src/content/architectures",
    "src/content/capsulas",
    "src/content/editorial_templates",
    "src/content/ensayos",
    "src/content/essays",
    "src/content/visual_signals"
)

$workspaceRoot = "c:\Users\ygnat\TGP-PORTAL"
$bodiesMap = @{}

foreach ($dir in $contentDirs) {
    $fullDir = Join-Path $workspaceRoot $dir
    if (Test-Path $fullDir) {
        $files = Get-ChildItem -Path $fullDir -Filter *.mdoc -Recurse
        $files += Get-ChildItem -Path $fullDir -Filter *.md -Recurse
        
        foreach ($file in $files) {
            $content = [System.IO.File]::ReadAllText($file.FullName)
            
            # Simple substring split for frontmatter
            $firstIndex = $content.IndexOf("---")
            $body = ""
            if ($firstIndex -ne -1) {
                $secondIndex = $content.IndexOf("---", $firstIndex + 3)
                if ($secondIndex -ne -1) {
                    $body = $content.Substring($secondIndex + 3).Trim()
                } else {
                    $body = $content.Trim()
                }
            } else {
                $body = $content.Trim()
            }
            
            # Normalize whitespace
            $normalizedBody = $body -replace "\s+", " "
            $normalizedBody = $normalizedBody.Trim()
            
            if ($normalizedBody.Length -gt 0) {
                if (-not $bodiesMap.ContainsKey($normalizedBody)) {
                    $bodiesMap[$normalizedBody] = [System.Collections.Generic.List[string]]::new()
                }
                $relativePath = $file.FullName.Replace($workspaceRoot, "")
                $bodiesMap[$normalizedBody].Add($relativePath)
            }
        }
    }
}

Write-Host "=== ANÁLISIS DE CUERPOS REPETIDOS ==="
$duplicateCount = 0

foreach ($key in $bodiesMap.Keys) {
    $list = $bodiesMap[$key]
    if ($list.Count -gt 1) {
        $duplicateCount++
        Write-Host "`nDuplicado #$duplicateCount (Encontrado en $($list.Count) archivos):"
        foreach ($item in $list) {
            Write-Host " - $item"
        }
    }
}

if ($duplicateCount -eq 0) {
    Write-Host "No se encontraron archivos con cuerpos exactamente duplicados."
}
