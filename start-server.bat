@echo off
REM start-server.bat - Install Node (if needed) and start the Express server

echo Checking for Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo Node.js not found. Attempting to install via winget...
    winget install --id OpenJS.NodeJS.LTS -e --silent
    if errorlevel 1 (
        echo Winget failed. Trying choco...
        choco install nodejs-lts -y
        if errorlevel 1 (
            echo Installation failed. Please install Node.js manually from https://nodejs.org
            pause
            exit /b 1
        )
    )
    echo Waiting for Node to be available...
    timeout /t 3
)

echo.
echo Node version:
node -v
echo NPM version:
npm -v
echo.

echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
)

echo.
echo Starting server on http://localhost:3000
echo Admin panel at http://localhost:3000/admin (password: kitkat09)
echo Press Ctrl+C in this window to stop the server.
echo.

node server.js

pause
