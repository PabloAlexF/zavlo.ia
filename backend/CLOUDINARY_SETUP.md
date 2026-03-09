# 🔧 Configuração do Cloudinary - Zavlo.ia

## ❌ Erro Atual
```
Upload preset must be specified when using unsigned upload
```

## ✅ Solução: Configurar Preset "Unsigned"

### Passo 1: Acessar Dashboard
1. Acesse: https://cloudinary.com/console
2. Faça login na sua conta

### Passo 2: Criar Unsigned Upload Preset
1. No menu lateral, clique em **Settings** (⚙️)
2. Clique na aba **Upload**
3. Role até **Upload presets**
4. Clique em **Add upload preset**

### Passo 3: Configurar o Preset
```
Preset name: zavlo_preset
Signing mode: Unsigned ⚠️ (IMPORTANTE!)
Folder: zavlo-images (opcional)
```

### Passo 4: Salvar
- Clique em **Save**
- Copie o nome do preset: `zavlo_preset`

### Passo 5: Atualizar .env
```env
# Cloudinary (para upload de imagens)
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
CLOUDINARY_UPLOAD_PRESET=zavlo_preset  # ⚠️ Deve ser "Unsigned"
```

## 🔍 Verificar Configuração

### Teste Manual
```bash
curl -X POST \
  https://api.cloudinary.com/v1_1/SEU_CLOUD_NAME/image/upload \
  -F "upload_preset=zavlo_preset" \
  -F "file=@test.jpg"
```

Se retornar JSON com `secure_url`, está funcionando! ✅

## 📝 Notas Importantes

1. **Unsigned vs Signed**:
   - ✅ **Unsigned**: Permite upload direto do frontend/backend sem assinatura
   - ❌ **Signed**: Requer assinatura com API Secret (mais seguro, mas complexo)

2. **Segurança**:
   - Unsigned presets são seguros para uso público
   - Configure limites de tamanho e tipos de arquivo no preset

3. **Alternativa**: Se não quiser usar Cloudinary, pode usar:
   - ImgBB (mais simples)
   - Imgur
   - Upload direto para Firebase Storage

## 🚀 Após Configurar

Reinicie o backend:
```bash
cd backend
npm run start:dev
```

Teste a busca por imagem no frontend! 📸
