# ☁️ Configuração Google Cloud Vision API

## Como obter API Key

1. **Acesse**: https://console.cloud.google.com/
2. **Crie um projeto** ou selecione um existente
3. **Habilite a API**: Vision API
   - Vá para "APIs & Services" > "Library"
   - Procure "Cloud Vision API" e habilite
4. **Crie credenciais**:
   - Vá para "APIs & Services" > "Credentials"
   - Clique em "Create Credentials" > "API Key"
5. **Copie a API key** gerada

## Configurar no .env

```bash
GOOGLE_CLOUD_API_KEY=AIzaSyCFUwFsJRBPImhPmlxcadCCZf_NCjabDEM
```

## Modelo usado

- **Google Cloud Vision API** - Label Detection
  - Identificação de objetos e produtos em imagens
  - Alta precisão e confiabilidade
  - Alternativa robusta ao Hugging Face

## Limites

- ✅ **1000 requests/mês** gratuitos (Tier gratuito)
- ✅ **até 1500 requests/dia** no tier gratuito
- ✅ **Sem cartão de crédito** necessário para o tier gratuito

## Fallback implementado

Se a Google Vision API falhar → Usa termo genérico "produto eletrônico"
