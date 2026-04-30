param(
  [string] $EnvFile = ".env.submit",
  [string] $ZipPath = ".output/linkclean-1.3.3-chrome.zip",
  [string] $Notes = "LinkClean 1.3.3: safer LinkedIn feed-only DOM cleanup, preserved layout styles, and reduced sidebar/profile false positives."
)

$ErrorActionPreference = "Stop"

function Read-DotEnv($Path) {
  $map = @{}
  Get-Content -LiteralPath $Path | ForEach-Object {
    if ($_ -match '^([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
      $map[$matches[1]] = $matches[2]
    }
  }
  return $map
}

function Get-HeaderValue($Path, $Name) {
  $line = Get-Content -LiteralPath $Path |
    Where-Object { $_ -match "^$([regex]::Escape($Name)):" } |
    Select-Object -First 1
  if (-not $line) { return "" }
  return ($line -split ":", 2)[1].Trim()
}

function Invoke-CurlOrThrow($CurlArgs, $BodyPath) {
  & curl.exe @CurlArgs | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "curl exited with code $LASTEXITCODE"
  }
  if (Test-Path -LiteralPath $BodyPath) {
    $body = Get-Content -LiteralPath $BodyPath -Raw
    if ($body -match '"error"|"message"') {
      Write-Output $body
    }
  }
}

$envMap = Read-DotEnv $EnvFile
$clientId = $envMap["EDGE_CLIENT_ID"]
$apiKey = $envMap["EDGE_API_KEY"]
$productId = $envMap["EDGE_PRODUCT_ID"]

if (-not $clientId -or -not $apiKey -or -not $productId) {
  throw "Missing EDGE_CLIENT_ID, EDGE_API_KEY, or EDGE_PRODUCT_ID"
}

if (-not (Test-Path -LiteralPath $ZipPath)) {
  throw "ZIP not found: $ZipPath"
}

$apiRoot = "https://api.addons.microsoftedge.microsoft.com"
$tmp = Join-Path $env:TEMP ("linkclean-edge-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $tmp | Out-Null

$uploadHeaders = Join-Path $tmp "upload.headers"
$uploadBody = Join-Path $tmp "upload.body"
$uploadUrl = "$apiRoot/v1/products/$productId/submissions/draft/package"

$uploadArgs = @(
  "-sS", "-D", $uploadHeaders, "-o", $uploadBody,
  "-X", "POST",
  "-H", "Authorization: ApiKey $apiKey",
  "-H", "X-ClientID: $clientId",
  "-H", "Content-Type: application/zip",
  "-T", $ZipPath,
  $uploadUrl
)
Invoke-CurlOrThrow $uploadArgs $uploadBody

$uploadStatusLine = Get-Content -LiteralPath $uploadHeaders | Select-Object -First 1
Write-Output "Edge upload $uploadStatusLine"

$location = Get-HeaderValue $uploadHeaders "Location"
if (-not $location) {
  if (Test-Path -LiteralPath $uploadBody) { Get-Content -LiteralPath $uploadBody -Raw }
  throw "Edge upload did not return operation Location"
}
$uploadOperationId = ($location -split "/")[-1]
Write-Output "Edge upload operation $uploadOperationId"

$status = "InProgress"
for ($i = 1; $i -le 24 -and $status -eq "InProgress"; $i++) {
  Start-Sleep -Seconds 5
  $statusHeaders = Join-Path $tmp "status-$i.headers"
  $statusBody = Join-Path $tmp "status-$i.body"
  $statusUrl = "$apiRoot/v1/products/$productId/submissions/draft/package/operations/$uploadOperationId"
  $statusArgs = @(
    "-sS", "-D", $statusHeaders, "-o", $statusBody,
    "-X", "GET",
    "-H", "Authorization: ApiKey $apiKey",
    "-H", "X-ClientID: $clientId",
    $statusUrl
  )
  Invoke-CurlOrThrow $statusArgs $statusBody
  $json = Get-Content -LiteralPath $statusBody -Raw | ConvertFrom-Json
  $status = $json.status
  Write-Output "Edge upload status $status"
  if ($status -eq "Failed") {
    $json | ConvertTo-Json -Depth 5
    throw "Edge upload failed"
  }
}

if ($status -ne "Succeeded") {
  throw "Edge upload did not finish"
}

$publishHeaders = Join-Path $tmp "publish.headers"
$publishBodyPath = Join-Path $tmp "publish.body"
$notesPath = Join-Path $tmp "notes.json"
@{ notes = $Notes } | ConvertTo-Json | Set-Content -LiteralPath $notesPath -Encoding UTF8
$publishUrl = "$apiRoot/v1/products/$productId/submissions"
$publishArgs = @(
  "-sS", "-D", $publishHeaders, "-o", $publishBodyPath,
  "-X", "POST",
  "-H", "Authorization: ApiKey $apiKey",
  "-H", "X-ClientID: $clientId",
  "-H", "Content-Type: application/json",
  "--data-binary", "@$notesPath",
  $publishUrl
)
Invoke-CurlOrThrow $publishArgs $publishBodyPath

$publishStatusLine = Get-Content -LiteralPath $publishHeaders | Select-Object -First 1
Write-Output "Edge publish $publishStatusLine"
$publishLocation = Get-HeaderValue $publishHeaders "Location"
if ($publishLocation) {
  Write-Output "Edge publish operation $(($publishLocation -split '/')[-1])"
}
