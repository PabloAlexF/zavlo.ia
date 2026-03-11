@echo off
echo ========================================
echo   INSTALACAO COM YARN - ZAVLO FRONTEND
echo ========================================
echo.

echo [1/4] Instalando Yarn globalmente...
call npm install -g yarn
echo.

echo [2/4] Removendo node_modules antigo...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
echo.

echo [3/4] Instalando dependencias com Yarn...
call yarn install
echo.

echo [4/4] Concluido!
echo.
echo Para iniciar o frontend, execute: yarn dev
echo.
pause
