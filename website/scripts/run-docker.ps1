Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location (Split-Path $PSScriptRoot -Parent)
docker compose up --build
