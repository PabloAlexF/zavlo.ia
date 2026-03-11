#!/bin/bash

echo "🚀 Criando repositório separado para o frontend..."

# 1. Criar pasta temporária
mkdir ../zavlo-frontend-deploy
cd ../zavlo-frontend-deploy

# 2. Copiar apenas o frontend
cp -r ../zavlo.ia/frontend/* .
cp -r ../zavlo.ia/frontend/.* . 2>/dev/null || true

# 3. Limpar arquivos desnecessários
rm -rf node_modules
rm -rf .next
rm -rf .git

# 4. Inicializar git
git init
git add .
git commit -m "🎉 Initial frontend deployment setup"

echo "✅ Frontend separado criado em: ../zavlo-frontend-deploy"
echo ""
echo "📝 Próximos passos:"
echo "1. Crie um novo repositório no GitHub: zavlo-frontend"
echo "2. Execute:"
echo "   git remote add origin https://github.com/SEU-USUARIO/zavlo-frontend.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo "3. Use este novo repositório na Hostinger"