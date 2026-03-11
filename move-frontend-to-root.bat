@echo off
echo 🚀 Movendo frontend para raiz para deploy...

REM 1. Criar backup
echo 📦 Criando backup...
if not exist .backup mkdir .backup
xcopy /E /I /Y frontend .backup\frontend
xcopy /E /I /Y _backend .backup\_backend

REM 2. Mover conteúdo do frontend para raiz
echo 📁 Movendo arquivos do frontend...
xcopy /E /Y frontend\* .
xcopy /H /Y frontend\*.* . 2>nul

REM 3. Remover pasta frontend
echo 🗑️ Limpando...
rmdir /s /q frontend

echo ✅ Frontend movido para raiz!
echo 📋 Estrutura atual:
dir

echo.
echo 🔄 Para reverter: execute restore-structure.bat