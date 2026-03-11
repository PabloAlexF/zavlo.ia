@echo off
echo 🔄 Restaurando estrutura original...

REM 1. Criar pasta frontend
mkdir frontend

REM 2. Mover arquivos Next.js de volta para frontend
echo 📁 Movendo arquivos Next.js...
move app frontend\
move components frontend\
move contexts frontend\
move lib frontend\
move public frontend\
move utils frontend\
move next.config.js frontend\
move tailwind.config.ts frontend\
move tsconfig.json frontend\
move package.json frontend\
move package-lock.json frontend\

REM 3. Restaurar backend
echo 📁 Restaurando backend...
xcopy /E /I /Y .backup\_backend _backend

REM 4. Restaurar package.json da raiz
copy .backup\package.json .

echo ✅ Estrutura restaurada!
echo 🗑️ Limpando backup...
rmdir /s /q .backup