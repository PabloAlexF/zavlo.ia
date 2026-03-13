// New handler for credit confirmation state
import { HandlerContext, HandlerResult, ChatState, createAIMessage, PendingSearch } from './stateHandlers';
import { getCreditWarning, normalizeResultsTier } from './creditCalculator';

export function handleCreditConfirmationState(ctx: HandlerContext): HandlerResult | null {
  const { currentInput, pendingSearch } = ctx;
  
  const normalizedInput = currentInput.toLowerCase().trim();
  
  if (normalizedInput === 'sim' || normalizedInput === 's' || normalizedInput === 'yes' || normalizedInput === 'y') {
    // User confirmed - set confirmedLimit and go to final confirmation
    const confirmedLimit = pendingSearch?.limit || 20;
    return {
      nextState: ChatState.AwaitingFinalConfirmation,
      pendingSearchUpdate: { 
        confirmedLimit,
        creditWarning: undefined 
      },
      messages: [createAIMessage(`✅ Confirmação recebida! Buscando ${confirmedLimit} resultados...`)]
    };
  }
  
  if (normalizedInput === 'não' || normalizedInput === 'n' || normalizedInput === 'no') {
    // User declined - reset to limit selection
    return {
      nextState: ChatState.AwaitingLimit,
      pendingSearchUpdate: { 
        limit: undefined,
        creditWarning: undefined 
      },
      messages: [createAIMessage('❌ Ok, vamos ajustar a quantidade. Quantos produtos você quer?')]
    };
  }
  
  // Ask for clear yes/no
  return {
    messages: [createAIMessage('Por favor, responda "sim" ou "não" para confirmar a busca.')]
  };
}

// Integrate into limit handler - detect limit and go to credit confirmation
export function handleLimitState(ctx: HandlerContext): HandlerResult | null {
  const { currentInput } = ctx;
  
  const selectedLimit = parseLimitInput(currentInput);
  
  if (selectedLimit) {
    const tierLimit = normalizeResultsTier(selectedLimit);
    const warning = getCreditWarning(tierLimit);
    
    return {
      nextState: ChatState.AwaitingCreditConfirmation,
      pendingSearchUpdate: { 
        limit: tierLimit,
        creditWarning: warning
      },
      messages: [
        createAIMessage(`✅ Ok, ${tierLimit} produtos detectados!`),
        createAIMessage(warning)
      ]
    };
  }
  
  return {
    messages: [createAIMessage('Quantidade inválida. Escolha: 10, 20, 50 ou 100 produtos.')]
  };
}

