param(
  [string] $EnvFile = ".env.submit",
  [string] $FirefoxZip = ".output/linkclean-1.3.3-firefox.zip",
  [string] $SourcesZip = ".output/linkclean-1.3.3-sources.zip",
  [string] $Channel = "listed"
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

function Redact-Secret($Text, $Secret) {
  if (-not $Secret) { return $Text }
  return ($Text -replace [regex]::Escape($Secret), "[redacted]")
}

$envMap = Read-DotEnv $EnvFile
$issuer = $envMap["FIREFOX_JWT_ISSUER"]
$secret = $envMap["FIREFOX_JWT_SECRET"]
$extensionId = $envMap["FIREFOX_EXTENSION_ID"]

if (-not $issuer -or -not $secret -or -not $extensionId) {
  throw "Missing FIREFOX_JWT_ISSUER, FIREFOX_JWT_SECRET, or FIREFOX_EXTENSION_ID"
}

if (-not (Test-Path -LiteralPath $FirefoxZip)) {
  throw "Firefox ZIP not found: $FirefoxZip"
}

if (-not (Test-Path -LiteralPath $SourcesZip)) {
  throw "Firefox sources ZIP not found: $SourcesZip"
}

$submitArgs = @(
  "npm", "exec", "--", "wxt", "submit",
  "--firefox-zip", $FirefoxZip,
  "--firefox-sources-zip", $SourcesZip,
  "--firefox-extension-id", $extensionId,
  "--firefox-jwt-issuer", $issuer,
  "--firefox-jwt-secret", $secret,
  "--firefox-channel", $Channel
)

Write-Output "Firefox submit started"
$output = & rtk @submitArgs 2>&1
$exitCode = $LASTEXITCODE

$redacted = foreach ($line in $output) {
  $text = [string] $line
  $text = Redact-Secret $text $issuer
  $text = Redact-Secret $text $secret
  $text
}

$redacted | Write-Output

if ($exitCode -ne 0) {
  throw "Firefox submit failed with exit code $exitCode"
}

Write-Output "Firefox submit finished"
