#!/bin/bash

echo "🚀 Movendo frontend para raiz para deploy..."

# 1. Fazer backup da estrutura atual
echo "📦 Criando backup..."
mkdir -p .backup
cp -r frontend .backup/
cp -r _backend .backup/

# 2. Mover conteúdo do frontend para raiz
echo "📁 Movendo arquivos do frontend..."
cp -r frontend/* .
cp -r frontend/.* . 2>/dev/null || true

# 3. Remover pasta frontend vazia
echo "🗑️ Limpando..."
rm -rf frontend

# 4. Atualizar package.json se necessário
echo "📝 Atualizando configurações..."

echo "✅ Frontend movido para raiz!"
echo "📋 Estrutura atual:"
ls -la

echo ""
echo "🔄 Para reverter: execute restore-structure.sh"