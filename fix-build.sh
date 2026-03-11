#!/bin/bash

# Script para corrigir o build do Next.js
echo "🔧 Corrigindo build do Next.js..."

# 1. Limpar build antigo
echo "1️⃣ Removendo build antigo..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache

# 2. Reinstalar dependências
echo "2️⃣ Reinstalando dependências..."
npm ci

# 3. Build sem Turbopack (produção)
echo "3️⃣ Gerando build de produção..."
npm run build

# 4. Verificar se build foi criado
if [ -d ".next" ]; then
    echo "✅ Build criado com sucesso!"
    echo "📁 Arquivos gerados:"
    ls -la .next/static/chunks/ | head -10
else
    echo "❌ Erro: Build não foi criado!"
    exit 1
fi

echo "🚀 Pronto! Agora execute: npm start"