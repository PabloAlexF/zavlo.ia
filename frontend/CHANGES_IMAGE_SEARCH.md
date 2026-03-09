# Mudanças para Busca por Imagem

## 1. Adicionar ao interface Message:
```typescript
interface Message {
  // ... campos existentes
  imageData?: string;
  detectedProduct?: string;
}
```

## 2. Adicionar type ao ChatState:
```typescript
type ChatState = 'idle' | 'awaiting_condition' | 'awaiting_location' | 'awaiting_confirmation' | 'searching' | 'category_questions' | 'awaiting_image_confirmation';
```

## 3. Adicionar novo type de mensagem:
```typescript
type: 'user' | 'ai' | 'products' | 'confirmation' | 'category_question' | 'image_confirmation'
```

## 4. Adicionar state:
```typescript
const [detectedProductName, setDetectedProductName] = useState<string>('');
```

## 5. Melhorar responsividade do preview:
```typescript
className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-lg border-2 border-blue-500"
```

## 6. Adicionar mensagem "analyzing_image" no handleImageSearch

## 7. Adicionar lógica de confirmação no handleSend

## 8. Adicionar renderização de imagem na mensagem do usuário

## 9. Adicionar animação "analyzing_image"

## 10. Adicionar componente image_confirmation
