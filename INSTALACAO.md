# 🚀 Guia de Instalação - Zavlo.ia

## ⚠️ Problema de SSL no Windows

Se você está tendo erros de SSL ao instalar dependências, siga estas etapas:

---

## 📦 Instalação

### Opção 1: Scripts Automáticos (Recomendado)

#### Frontend:
1. Vá para a pasta `frontend`
2. Execute `reinstall.bat` (clique duplo)
3. Aguarde a instalação
4. Execute `start.bat` para iniciar

#### Backend:
1. Vá para a pasta `backend`
2. Execute `reinstall.bat` (clique duplo)
3. Aguarde a instalação
4. Execute `start.bat` para iniciar

---

### Opção 2: Manual

#### 1. Feche TODOS os programas que possam estar usando os arquivos:
- VS Code
- Navegadores
- Terminais
- Antivírus (temporariamente)

#### 2. Execute como Administrador no PowerShell:

```powershell
# Frontend
cd frontend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm cache clean --force
npm config set strict-ssl false
npm install
npm config set strict-ssl true
npm run dev

# Backend (em outro terminal)
cd backend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm cache clean --force
npm config set strict-ssl false
npm install
npm config set strict-ssl true
npm run dev
```

---

### Opção 3: Usar Yarn (Mais estável no Windows)

```bash
# Instalar Yarn globalmente
npm install -g yarn

# Frontend
cd frontend
yarn install
yarn dev

# Backend
cd backend
yarn install
yarn dev
```

---

## 🔧 Solução Definitiva

Se nada funcionar, atualize o Node.js:

1. Desinstale o Node.js atual
2. Baixe a versão LTS em: https://nodejs.org/
3. Instale e reinicie o computador
4. Tente novamente

---

## ✅ Verificar se está funcionando

### Frontend:
- URL: http://localhost:3000
- Deve abrir a página inicial do Zavlo

### Backend:
- URL: http://localhost:3001/health
- Deve retornar: `{"status":"ok"}`

---

## 📝 Comandos Úteis

```bash
# Ver versão do Node
node -v

# Ver versão do npm
npm -v

# Limpar cache
npm cache clean --force

# Verificar dependências instaladas
npm list --depth=0
```

---

## 🆘 Ainda com problemas?

1. Desabilite temporariamente o antivírus
2. Execute o terminal como Administrador
3. Verifique se tem espaço em disco
4. Tente em outra pasta (ex: C:\projetos\zavlo.ia)

---

## 🎯 Estrutura do Projeto

```
zavlo.ia/
├── frontend/          (Next.js - Porta 3000)
│   ├── reinstall.bat  ← Execute para reinstalar
│   └── start.bat      ← Execute para iniciar
│
└── backend/           (NestJS - Porta 3001)
    ├── reinstall.bat  ← Execute para reinstalar
    └── start.bat      ← Execute para iniciar
```

---

**Desenvolvido com ❤️ pela equipe Zavlo**
