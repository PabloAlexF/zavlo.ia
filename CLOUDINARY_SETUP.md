# Configuração do Cloudinary para Upload de Imagens

## 1. Criar Conta no Cloudinary

1. Acesse: https://cloudinary.com/users/register_free
2. Crie uma conta gratuita (25GB de armazenamento grátis)
3. Confirme seu email

## 2. Obter Credenciais

1. Faça login no Cloudinary
2. Vá para o Dashboard: https://console.cloudinary.com/
3. Você verá:
   - **Cloud Name** (ex: `dxyz123abc`)
   - **API Key**
   - **API Secret**

## 3. Criar Upload Preset

1. No menu lateral, clique em **Settings** (⚙️)
2. Clique na aba **Upload**
3. Role até **Upload presets**
4. Clique em **Add upload preset**
5. Configure:
   - **Preset name**: `zavlo_preset` (ou outro nome)
   - **Signing Mode**: **Unsigned** (importante!)
   - **Folder**: `zavlo/listings` (opcional)
   - **Allowed formats**: `jpg, png, webp, gif`
   - **Max file size**: `10 MB`
   - **Image transformations**: 
     - Width: `1200`
     - Height: `900`
     - Crop: `limit`
     - Quality: `auto`
6. Clique em **Save**

## 4. Configurar Variáveis de Ambiente

Edite o arquivo `frontend/.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu_cloud_name_aqui
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=zavlo_preset
```

**Exemplo:**
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxyz123abc
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=zavlo_preset
```

## 5. Reiniciar o Frontend

```bash
cd frontend
npm run dev
```

## 6. Testar Upload

1. Acesse a página "Criar Anúncio"
2. Clique em "Escolher arquivos"
3. Selecione uma ou mais imagens
4. Aguarde o upload (você verá "Enviando imagens...")
5. As imagens aparecerão como preview
6. Crie o anúncio normalmente

## Recursos do Plano Gratuito

- ✅ 25 GB de armazenamento
- ✅ 25 GB de bandwidth/mês
- ✅ Transformações de imagem ilimitadas
- ✅ CDN global
- ✅ Otimização automática
- ✅ Suporte a WebP/AVIF

## URLs das Imagens

As imagens serão armazenadas com URLs como:
```
https://res.cloudinary.com/seu_cloud_name/image/upload/v1234567890/zavlo/listings/abc123.jpg
```

## Segurança

- ✅ Upload preset **unsigned** permite upload direto do frontend
- ✅ Limite de tamanho configurado (10MB)
- ✅ Formatos permitidos restritos
- ✅ Transformações automáticas aplicadas

## Troubleshooting

### Erro: "Upload preset not found"
- Verifique se o preset está configurado como **Unsigned**
- Confirme o nome do preset no `.env.local`

### Erro: "Invalid cloud name"
- Verifique o `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` no `.env.local`
- Não use espaços ou caracteres especiais

### Imagens não aparecem
- Verifique o console do navegador (F12)
- Confirme que as URLs começam com `https://res.cloudinary.com/`

## Alternativas

Se preferir não usar Cloudinary, você pode usar:

1. **Firebase Storage** (já configurado no backend)
2. **AWS S3** (mais complexo)
3. **Imgur API** (simples, mas limitado)
4. **ImgBB** (gratuito, 32MB por imagem)

---

**Pronto!** Agora você pode fazer upload de imagens reais para seus anúncios.
