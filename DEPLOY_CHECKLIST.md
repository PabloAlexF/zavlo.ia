# ✅ Checklist de Deploy - Modo Híbrido

## 🎯 Resumo Rápido

Você precisa:
1. ✅ Criar novo serviço Python no Render
2. ✅ Atualizar variável no NestJS
3. ✅ Redeploy NestJS
4. ✅ Redeploy Frontend (Vercel)

---

## 📝 Checklist Passo a Passo

### Render - Python Service

- [ ] Acessar https://dashboard.render.com
- [ ] Criar "New Web Service"
- [ ] Configurar:
  - [ ] Root Directory: `python-service`
  - [ ] Build Command: `pip install -r requirements.txt`
  - [ ] Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
  - [ ] Plano: Starter ($7/mês) ou Free
- [ ] Aguardar deploy completar
- [ ] Copiar URL (ex: `https://zavlo-python-classifier.onrender.com`)
- [ ] Testar: `curl https://SUA-URL/health`

### Render - NestJS Backend

- [ ] Ir no serviço NestJS existente
- [ ] Environment → Add Environment Variable
- [ ] Adicionar:
  ```
  PYTHON_SERVICE_URL=https://zavlo-python-classifier.onrender.com
  ```
- [ ] Salvar
- [ ] Manual Deploy → "Deploy latest commit"
- [ ] Aguardar deploy completar
- [ ] Testar: `curl https://seu-nestjs.onrender.com/api/v1/classification/health`

### Vercel - Frontend

- [ ] Acessar https://vercel.com/dashboard
- [ ] Selecionar projeto Zavlo
- [ ] Settings → Environment Variables
- [ ] Verificar se existe:
  ```
  NEXT_PUBLIC_API_URL=https://seu-nestjs.onrender.com/api/v1
  ```
- [ ] Se não existir, adicionar
- [ ] Deployments → Último deploy → Redeploy
- [ ] Aguardar deploy completar

### Testes Finais

- [ ] Abrir site na Vercel
- [ ] Ir para /chat
- [ ] Digitar "iPhone 13"
- [ ] ✅ Modal deve aparecer com pergunta
- [ ] Selecionar "usado"
- [ ] ✅ Busca deve executar
- [ ] ✅ Resultados devem aparecer

---

## ⚡ Comandos de Teste

### 1. Python Service
```bash
# Health check
curl https://zavlo-python-classifier.onrender.com/health

# Classificação
curl -X POST https://zavlo-python-classifier.onrender.com/api/classify \
  -H "Content-Type: application/json" \
  -d '{"query": "iPhone 13"}'
```

### 2. NestJS Backend
```bash
# Health do Python via NestJS
curl https://seu-nestjs.onrender.com/api/v1/classification/health

# Classificação via NestJS
curl -X POST https://seu-nestjs.onrender.com/api/v1/classification/classify \
  -H "Content-Type: application/json" \
  -d '{"query": "iPhone 13"}'
```

---

## 🐛 Problemas Comuns

### Python service retorna 404
**Causa**: URL incorreta  
**Solução**: Verificar URL no Render dashboard (sem `/api` no final da variável)

### NestJS não conecta no Python
**Causa**: Variável `PYTHON_SERVICE_URL` incorreta  
**Solução**: Verificar variável no Render (deve ser só a URL base)

### Frontend não mostra modal
**Causa**: Frontend não atualizado ou variável incorreta  
**Solução**: Redeploy na Vercel e verificar `NEXT_PUBLIC_API_URL`

### Python service lento (30s+)
**Causa**: Free tier dormindo  
**Solução**: Upgrade para Starter ($7/mês) ou aguardar acordar

---

## 💡 Dicas

1. **Free Tier**: Primeira request demora ~30s (acordar serviço)
2. **Starter**: Sempre ativo, resposta instantânea
3. **Logs**: Verificar logs no Render se algo falhar
4. **CORS**: Já configurado no código Python
5. **Cache**: Limpar cache do navegador se não funcionar

---

## 📊 Tempo Estimado

- Criar Python service: 5 min
- Configurar NestJS: 2 min
- Redeploy NestJS: 3-5 min
- Redeploy Vercel: 2-3 min
- Testes: 5 min

**Total**: ~20 minutos

---

## ✅ Quando Estiver Pronto

Você terá:
- ✅ Python classifier rodando no Render
- ✅ NestJS conectado ao Python
- ✅ Frontend mostrando perguntas inteligentes
- ✅ Modo híbrido 100% funcional em produção

---

## 📞 Arquivos de Referência

- `DEPLOY_PYTHON_RENDER.md` - Guia completo de deploy
- `HYBRID_MODE_COMPLETE.md` - Status da implementação
- `HYBRID_MODE_USAGE_GUIDE.md` - Como usar a API
