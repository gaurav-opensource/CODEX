$ErrorActionPreference = "Stop"

Set-Location "$PSScriptRoot\..\frontend"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw "Node.js/npm is not installed or not on PATH. Install Node.js 22+, then run this script again."
}

if (-not (Test-Path "node_modules")) {
  npm install
}

npm run dev

