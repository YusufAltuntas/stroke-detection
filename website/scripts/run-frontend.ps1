Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = Split-Path $PSScriptRoot -Parent
Set-Location "$Root\frontend"

if (!(Test-Path "node_modules")) {
  npm install
}

$env:VITE_API_URL = "http://localhost:8000"
npm run dev -- --host 0.0.0.0
