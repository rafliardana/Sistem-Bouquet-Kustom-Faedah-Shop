@echo off
title Faedah Shop Fullstack Launcher
:: Memastikan Node.js terinstall di PATH
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ====================================================================
    echo [ERROR] Node.js tidak terdeteksi di system PATH Anda.
    echo Pastikan Node.js sudah diinstal atau jalankan lewat Terminal Laragon.
    echo ====================================================================
    pause
    exit /b
)

echo ==================================================================
echo             MENJALANKAN FULLSTACK FAEDAH SHOP (1-CLICK)
echo ==================================================================
echo.
echo [+] Memulai Express Backend (Port 3001) di jendela baru...
start "Backend - Faedah Shop" cmd /k "cd /d "%~dp0\server" && npm run dev"

echo [+] Memulai Vite Frontend (Port 5173)...
cd /d "%~dp0"
npm run dev

pause
