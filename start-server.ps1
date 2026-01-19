# start-server.ps1
# Helper: checks for node, attempts to install (winget or choco), installs npm deps, and starts the server.
# Run in PowerShell as: .\start-server.ps1

function Write-Err($m){ Write-Host "ERROR: $m" -ForegroundColor Red }
function Write-Ok($m){ Write-Host "$m" -ForegroundColor Green }

# Check node
$node = (Get-Command node -ErrorAction SilentlyContinue)
if (-not $node) {
    Write-Host "Node.js not found on PATH. Attempting to install..."
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Host "Installing Node.js LTS via winget..."
        winget install --id OpenJS.NodeJS.LTS -e --silent
    } elseif (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Host "Installing Node.js LTS via choco..."
        choco install nodejs-lts -y
    } else {
        Write-Err "Package manager not found (winget or choco). Please install Node.js from https://nodejs.org and re-run this script."
        exit 1
    }
    # re-check
    Start-Sleep -Seconds 2
    $node = (Get-Command node -ErrorAction SilentlyContinue)
    if (-not $node) { Write-Err "Node installation failed or node not on PATH. Install manually and retry."; exit 1 }
}

# Show versions
Write-Ok "Node version: $(node -v)"
Write-Ok "NPM version: $(npm -v)"

# Install dependencies
Write-Host "Running npm install..."
npm install
if ($LASTEXITCODE -ne 0) { Write-Err "npm install failed. Check output above."; exit 1 }

# Start server (foreground)
Write-Host "Starting server (node server.js). Press Ctrl+C to stop."
node server.js

# If you prefer background start, run: Start-Process node -ArgumentList 'server.js' -NoNewWindow
