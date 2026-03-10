@echo off
echo 🔧 Corrigindo build do Next.js...

echo 1️⃣ Removendo build antigo...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo 2️⃣ Reinstalando dependências...
npm ci

echo 3️⃣ Gerando build de produção...
npm run build

echo 4️⃣ Verificando build...
if exist .next (
    echo ✅ Build criado com sucesso!
    dir .next\static\chunks
) else (
    echo ❌ Erro: Build não foi criado!
    exit /b 1
)

echo 🚀 Pronto! Agora execute: npm start