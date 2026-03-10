#!/bin/bash

# Script para separar frontend em repositório próprio
echo "🔧 Criando repositório separado para frontend..."

# 1. Criar nova pasta
mkdir zavlo-frontend
cd zavlo-frontend

# 2. Copiar apenas arquivos do frontend
cp -r ../zavlo.ia/frontend/* .
cp ../zavlo.ia/frontend/.* . 2>/dev/null || true

# 3. Inicializar git
git init
git add .
git commit -m "Initial frontend commit"

# 4. Conectar ao GitHub (você precisa criar o repo primeiro)
echo "📝 Agora:"
echo "1. Crie um repo no GitHub: zavlo-frontend"
echo "2. Execute: git remote add origin https://github.com/SEU-USUARIO/zavlo-frontend.git"
echo "3. Execute: git push -u origin main"

echo "✅ Frontend separado criado!"