$ErrorActionPreference = "Stop"

$workspace = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$excelFiles = @(Get-ChildItem -LiteralPath $workspace -File -Filter "01_*.xlsx")
if ($excelFiles.Count -ne 1) {
  throw "Expected one 01_*.xlsx file, found $($excelFiles.Count)"
}

$excelPath = [IO.Path]::GetFullPath($excelFiles[0].FullName)
$tempPath = [IO.Path]::GetFullPath((Join-Path $workspace ".tmp-vrew-curriculum.xlsx"))
if (-not $excelPath.StartsWith($workspace + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Unsafe Excel path: $excelPath"
}
if (-not $tempPath.StartsWith($workspace + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Unsafe temp path: $tempPath"
}

if (Test-Path -LiteralPath $tempPath) {
  Remove-Item -LiteralPath $tempPath -Force
}
Copy-Item -LiteralPath $excelPath -Destination $tempPath

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$utf8 = [Text.UTF8Encoding]::new($false)
$archive = [IO.Compression.ZipFile]::Open($tempPath, [IO.Compression.ZipArchiveMode]::Update)
try {
  $entry = $archive.GetEntry("xl/sharedStrings.xml")
  if ($null -eq $entry) { throw "sharedStrings.xml not found" }
  $reader = [IO.StreamReader]::new($entry.Open(), $utf8)
  try { $sharedStrings = $reader.ReadToEnd() } finally { $reader.Dispose() }
  $middleDot = [char]0x00B7
  $updatedStrings = $sharedStrings.Replace("CapCut", "Vrew")
  $updatedStrings = $updatedStrings.Replace("Vrew${middleDot}Suno${middleDot}Vrew", "Vrew${middleDot}Suno")
  if ($updatedStrings -eq $sharedStrings) { throw "No Excel migration target found" }
  $entry.Delete()
  $newEntry = $archive.CreateEntry("xl/sharedStrings.xml", [IO.Compression.CompressionLevel]::Optimal)
  $writer = [IO.StreamWriter]::new($newEntry.Open(), $utf8)
  try { $writer.Write($updatedStrings) } finally { $writer.Dispose() }
} finally {
  $archive.Dispose()
}

$check = [IO.Compression.ZipFile]::OpenRead($tempPath)
try {
  $entry = $check.GetEntry("xl/sharedStrings.xml")
  $reader = [IO.StreamReader]::new($entry.Open(), $utf8)
  try { $verified = $reader.ReadToEnd() } finally { $reader.Dispose() }
  if ($verified.Contains("CapCut")) { throw "Legacy editor name remains in updated Excel" }
  if (-not $verified.Contains("Vrew")) { throw "Vrew missing from updated Excel" }
} finally {
  $check.Dispose()
}

Move-Item -LiteralPath $tempPath -Destination $excelPath -Force
Write-Output "updated_excel=$($excelFiles[0].Name)"
