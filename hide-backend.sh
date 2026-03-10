#!/bin/bash

echo "🔧 Ocultando backend da Hostinger..."

# 1. Renomear pasta backend para _backend (oculta da detecção)
if [ -d "backend" ]; then
    mv backend _backend
    echo "✅ Backend renomeado para _backend"
fi

# 2. Criar package.json na raiz apontando para frontend
cat > package.json << 'EOF'
{
  "name": "zavlo-frontend",
  "version": "1.0.0",
  "description": "Zavlo.ia Frontend",
  "scripts": {
    "build": "cd frontend && npm install && npm run build",
    "start": "cd frontend && npm start",
    "dev": "cd frontend && npm run dev"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

echo "✅ package.json criado na raiz"

# 3. Criar next.config.js na raiz
cat > next.config.js << 'EOF'
// Redirecionamento para o frontend
module.exports = require('./frontend/next.config.js');
EOF

echo "✅ next.config.js criado na raiz"

echo "🚀 Pronto! Agora a Hostinger vai detectar Next.js!"
echo "📝 Para reverter: mv _backend backend"