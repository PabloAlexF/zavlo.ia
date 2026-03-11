@echo off
echo Limpando node_modules...
rmdir /s /q node_modules 2>nul
echo.
echo Limpando cache npm...
call npm cache clean --force
echo.
echo Desabilitando SSL temporariamente...
call npm config set strict-ssl false
echo.
echo Instalando dependencias...
call npm install
echo.
echo Reabilitando SSL...
call npm config set strict-ssl true
echo.
echo Concluido!
pause
