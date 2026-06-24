@echo off
setlocal

cd /d %~dp0app
start "" powershell.exe -NoExit -Command "nvm use 20; npm run dev"
timeout /t 5 /nobreak >nul
start http://localhost:3000
pause
