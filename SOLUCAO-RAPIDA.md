# 🚨 SOLUÇÃO RÁPIDA - Erro de SSL

## O problema é o SSL do npm no Windows. Use YARN!

### ✅ SOLUÇÃO (Execute nesta ordem):

#### 1. FRONTEND:
```bash
cd frontend
./install-yarn.bat    # Instala Yarn e dependências
./start-yarn.bat      # Inicia o frontend
```

#### 2. BACKEND (em outro terminal):
```bash
cd backend
./install-yarn.bat    # Instala Yarn e dependências
./start-yarn.bat      # Inicia o backend
```

---

## 📝 Comandos Manuais (se preferir):

```bash
# Instalar Yarn globalmente (uma vez só)
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

## 🎯 URLs:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001/health

---

## ⚠️ Se ainda não funcionar:

1. **Reinicie o computador**
2. **Desabilite o antivírus temporariamente**
3. **Execute o PowerShell como Administrador**
4. **Atualize o Node.js**: https://nodejs.org/

---

## 🔧 Alternativa Final:

Se nada funcionar, mova o projeto para outra pasta:

```bash
# Mova para C:\projetos\
C:\projetos\zavlo.ia\
```

Caminhos muito longos no Windows podem causar problemas.

---

**Yarn é mais estável que npm no Windows!** 🚀
