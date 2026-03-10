@echo off
echo 🔧 Ocultando backend da Hostinger...

REM 1. Renomear pasta backend para _backend
if exist backend (
    ren backend _backend
    echo ✅ Backend renomeado para _backend
)

REM 2. Criar package.json na raiz
echo {> package.json
echo   "name": "zavlo-frontend",>> package.json
echo   "version": "1.0.0",>> package.json
echo   "description": "Zavlo.ia Frontend",>> package.json
echo   "scripts": {>> package.json
echo     "build": "cd frontend && npm install && npm run build",>> package.json
echo     "start": "cd frontend && npm start",>> package.json
echo     "dev": "cd frontend && npm run dev">> package.json
echo   },>> package.json
echo   "engines": {>> package.json
echo     "node": ">=18.0.0">> package.json
echo   }>> package.json
echo }>> package.json

echo ✅ package.json criado na raiz

REM 3. Criar next.config.js na raiz
echo // Redirecionamento para o frontend> next.config.js
echo module.exports = require('./frontend/next.config.js');>> next.config.js

echo ✅ next.config.js criado na raiz
echo 🚀 Pronto! Agora a Hostinger vai detectar Next.js!
echo 📝 Para reverter: ren _backend backend