$ErrorActionPreference = "Stop"

$workspace = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$referenceRoot = [IO.Path]::GetFullPath((Join-Path $workspace "references"))
$outputRoot = [IO.Path]::GetFullPath((Join-Path $workspace ".tmp-reference-ppt-samples"))
if (-not $outputRoot.StartsWith($workspace + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Unsafe output path: $outputRoot"
}
if (Test-Path -LiteralPath $outputRoot) {
  Remove-Item -LiteralPath $outputRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $outputRoot | Out-Null

$source = Get-ChildItem -LiteralPath $referenceRoot -Recurse -File -Filter "*.pptx" |
  Sort-Object Length -Descending |
  Select-Object -First 1
if ($null -eq $source) { throw "No reference PPTX found" }

$powerPoint = New-Object -ComObject PowerPoint.Application
$presentation = $null
try {
  $presentation = $powerPoint.Presentations.Open($source.FullName, $true, $true, $false)
  foreach ($slideNo in @(5, 7, 8, 10, 11, 12, 14)) {
    if ($slideNo -gt $presentation.Slides.Count) { continue }
    $target = Join-Path $outputRoot ("reference-slide-{0:D3}.png" -f $slideNo)
    $presentation.Slides.Item($slideNo).Export($target, "PNG", 1920, 1080)
    Write-Output "exported=$target"
  }
} finally {
  if ($null -ne $presentation) {
    $presentation.Close()
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($presentation)
  }
  $powerPoint.Quit()
  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($powerPoint)
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}

Write-Output "source=$($source.FullName)"
