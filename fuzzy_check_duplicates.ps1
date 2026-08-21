$contentDirs = @(
    "src/content/architectures",
    "src/content/capsulas",
    "src/content/editorial_templates",
    "src/content/ensayos",
    "src/content/essays",
    "src/content/visual_signals"
)

$workspaceRoot = "c:\Users\ygnat\TGP-PORTAL"
$documents = @()

foreach ($dir in $contentDirs) {
    $fullDir = Join-Path $workspaceRoot $dir
    if (Test-Path $fullDir) {
        $files = Get-ChildItem -Path $fullDir -Filter *.mdoc -Recurse
        $files += Get-ChildItem -Path $fullDir -Filter *.md -Recurse
        foreach ($file in $files) {
            $content = [System.IO.File]::ReadAllText($file.FullName)
            # Extract body after frontmatter (--- ... ---)
            $firstIdx = $content.IndexOf("---")
            $body = ""
            if ($firstIdx -ne -1) {
                $secondIdx = $content.IndexOf("---", $firstIdx + 3)
                if ($secondIdx -ne -1) {
                    $body = $content.Substring($secondIdx + 3).Trim()
                } else {
                    $body = $content.Trim()
                }
            } else {
                $body = $content.Trim()
            }
            # Normalise whitespace and lower‑case
            $normBody = $body -replace "\s+", " "
            $normBody = $normBody.Trim().ToLowerInvariant()
            if ($normBody.Length -gt 0) {
                $documents += [PSCustomObject]@{ Path = $file.FullName; Body = $normBody }
            }
        }
    }
}

function Get-JaccardSimilarity([string]$a, [string]$b) {
    $setA = [System.Collections.Generic.HashSet[string]]::new($a.Split(' '))
    $setB = [System.Collections.Generic.HashSet[string]]::new($b.Split(' '))
    $intersection = [System.Collections.Generic.HashSet[string]]::new($setA)
    $intersection.IntersectWith($setB)
    $union = [System.Collections.Generic.HashSet[string]]::new($setA)
    $union.UnionWith($setB)
    if ($union.Count -eq 0) { return 0 }
    return [double]$intersection.Count / $union.Count
}

$threshold = 0.8
$found = @()
for ($i = 0; $i -lt $documents.Count; $i++) {
    for ($j = $i + 1; $j -lt $documents.Count; $j++) {
        $sim = Get-JaccardSimilarity $documents[$i].Body $documents[$j].Body
        if ($sim -ge $threshold) {
            $found += [PSCustomObject]@{
                FileA = $documents[$i].Path
                FileB = $documents[$j].Path
                Similarity = [math]::Round($sim, 3)
            }
        }
    }
}

if ($found.Count -eq 0) {
    Write-Host "No fuzzy duplicates (similarity >= $threshold) found."
} else {
    Write-Host "Fuzzy duplicate groups (similarity >= $threshold):"
    foreach ($pair in $found) {
        Write-Host "- $($pair.FileA)"
        Write-Host "  $($pair.FileB)  (sim=$($pair.Similarity))"
        Write-Host ""
    }
}
