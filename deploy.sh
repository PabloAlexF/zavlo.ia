#!/bin/bash

# Script de Deploy Automático - Zavlo.ia
# Execute no servidor: bash deploy.sh

echo "🚀 Iniciando deploy do Zavlo.ia..."

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Diretório do projeto
PROJECT_DIR="/var/www/zavlo.ia"

# Verificar se está no diretório correto
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Diretório do projeto não encontrado!${NC}"
    exit 1
fi

cd $PROJECT_DIR

# Puxar atualizações
echo -e "${BLUE}📥 Puxando atualizações do Git...${NC}"
git pull

# Backend
echo -e "${BLUE}🔧 Atualizando Backend...${NC}"
cd backend
npm install
npm run build
pm2 restart zavlo-backend
echo -e "${GREEN}✅ Backend atualizado!${NC}"

# Frontend
echo -e "${BLUE}🎨 Atualizando Frontend...${NC}"
cd ../frontend
npm install
npm run build
pm2 restart zavlo-frontend
echo -e "${GREEN}✅ Frontend atualizado!${NC}"

# Verificar status
echo -e "${BLUE}📊 Status das aplicações:${NC}"
pm2 status

echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
