@echo off
title ALC_Hemy — Local Server

echo Starting nginx...
taskkill /F /IM nginx.exe >nul 2>&1
powershell -Command "Start-Process 'C:\nginx\nginx-1.26.2\nginx.exe' -WorkingDirectory 'C:\nginx\nginx-1.26.2'"
timeout /t 3 /nobreak >nul

echo Starting Cloudflare Tunnel...
echo Your public URL will appear below in a moment...
echo (Keep this window open while the site needs to be live)
echo.
"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:8080

pause
