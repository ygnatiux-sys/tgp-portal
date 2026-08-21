# Create test content folder and move files
$root = "c:\Users\ygnat\TGP-PORTAL"
$srcDirs = @(
    "src/content/architectures",
    "src/content/capsulas",
    "src/content/editorial_templates",
    "src/content/ensayos",
    "src/content/essays",
    "src/content/visual_signals"
)
$dest = "$root\src\content\test"
if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest | Out-Null }
foreach ($d in $srcDirs) {
    $full = Join-Path $root $d
    Get-ChildItem -Path $full -Filter *.md -Recurse | ForEach-Object { Move-Item -Path $_.FullName -Destination $dest -Force }
    Get-ChildItem -Path $full -Filter *.mdoc -Recurse | ForEach-Object { Move-Item -Path $_.FullName -Destination $dest -Force }
}
Write-Host "All content files moved to test collection folder."
