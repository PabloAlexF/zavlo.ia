'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { QuickSuggestions } from '@/components/chat/QuickSuggestions';
import { QuestionModal } from '@/components/chat/QuestionModal';
import { SearchConfirmationModal } from '@/components/chat/SearchConfirmationModal';
import { detectIntent } from '@/utils/chat/intentDetector';
import { contextManager } from '@/utils/chat/contextManager';
import { chatHistoryService } from '@/lib/chatHistory';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'products' | 'image_confirmation' | 'sort_question';
  content: string;
  products?: any[];
  timestamp: Date;
  creditCost?: number;
  imageData?: string;
  detectedProduct?: string;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Olá! 👋 Eu sou a Zavlo, sua assistente de compras inteligente!\n\nQue produto você está procurando?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Image search states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [detectedProductName, setDetectedProductName] = useState<string>('');
  const [awaitingImageConfirmation, setAwaitingImageConfirmation] = useState(false);
  const [awaitingImageSort, setAwaitingImageSort] = useState(false);
  
  // Hybrid mode states
  const [hybridQuestion, setHybridQuestion] = useState<string | null>(null);
  const [hybridMissingFields, setHybridMissingFields] = useState<string[]>([]);
  const [originalQuery, setOriginalQuery] = useState<string>('');
  const [finalQuery, setFinalQuery] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [userCredits, setUserCredits] = useState(0);
  
  // Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messages.length > 1) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  }, [messages.length]);

  useEffect(() => {
    loadUserCredits();
    loadChatHistory();

    const handleUserChanged = () => loadUserCredits();
    window.addEventListener('userChanged', handleUserChanged);
    return () => window.removeEventListener('userChanged', handleUserChanged);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentChatId && messages.length > 1) {
        saveChatToHistory();
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [messages, currentChatId]);

  const loadUserCredits = async () => {
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) return;
      const userData = JSON.parse(user);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${userData.token}` },
      });
      if (response.ok) {
        const profile = await response.json();
        setUserCredits(profile.credits || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar créditos:', error);
    }
  };

  const loadChatHistory = async () => {
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        setChatHistory([]);
        return;
      }
      
      const userData = JSON.parse(user);
      const userId = userData.userId;
      
      try {
        const firestoreHistory = await chatHistoryService.load(userId);
        if (firestoreHistory.length > 0) {
          setChatHistory(firestoreHistory);
          localStorage.setItem(`zavlo_chat_history_${userId}`, JSON.stringify(firestoreHistory));
          return;
        }
      } catch (firestoreError) {
        console.warn('Firestore indisponível, usando localStorage');
      }
      
      const saved = localStorage.getItem(`zavlo_chat_history_${userId}`);
      if (saved) {
        const parsedHistory = JSON.parse(saved);
        setChatHistory(Array.isArray(parsedHistory) ? parsedHistory : []);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setChatHistory([]);
    }
    
    if (!currentChatId) {
      setCurrentChatId(Date.now().toString());
    }
  };

  const saveChatToHistory = async () => {
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) return;
      const userData = JSON.parse(user);
      const userId = userData.userId;
      
      const chatTitle = messages.find(m => m.type === 'user')?.content.slice(0, 30) || 'Nova conversa';
      const existingIndex = chatHistory.findIndex(c => c.id === currentChatId);
      
      const cleanedMessages = messages.slice(-50).map(m => 
        m.type === 'products' ? { ...m, products: m.products?.slice(0, 6) } : { ...m }
      );
      
      const chatData: ChatHistory = {
        id: currentChatId,
        title: chatTitle,
        messages: cleanedMessages,
        createdAt: existingIndex >= 0 ? chatHistory[existingIndex].createdAt : new Date(),
        updatedAt: new Date(),
      };
      
      let updatedHistory;
      if (existingIndex >= 0) {
        updatedHistory = [...chatHistory];
        updatedHistory[existingIndex] = chatData;
      } else {
        updatedHistory = [chatData, ...chatHistory];
      }
      
      setChatHistory(updatedHistory);
      localStorage.setItem(`zavlo_chat_history_${userId}`, JSON.stringify(updatedHistory));
      chatHistoryService.save(userId, currentChatId, chatTitle, cleanedMessages).catch(() => {});
    } catch (error) {
      console.error('Erro ao salvar chat:', error);
    }
  };

  const loadChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
      contextManager.clear();
      if (window.innerWidth < 768) setSidebarOpen(false);
    }
  };

  const createNewChat = () => {
    setIsCreatingNewChat(true);
    
    if (currentChatId && messages.length > 1) {
      saveChatToHistory();
    }
    
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setMessages([{
      id: '1',
      type: 'ai',
      content: 'Olá! 👋 Eu sou a Zavlo, sua assistente de compras inteligente!\n\nQue produto você está procurando?',
      timestamp: new Date(),
    }]);
    setUploadedImage(null);
    setImageFile(null);
    setDetectedProductName('');
    setAwaitingImageConfirmation(false);
    setAwaitingImageSort(false);
    contextManager.clear();
    
    setTimeout(() => {
      setIsCreatingNewChat(false);
      inputRef.current?.focus();
    }, 300);
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = chatHistory.filter(c => c.id !== chatId);
    setChatHistory(updatedHistory);
    
    const user = localStorage.getItem('zavlo_user');
    if (user) {
      const userData = JSON.parse(user);
      const userId = userData.userId;
      localStorage.setItem(`zavlo_chat_history_${userId}`, JSON.stringify(updatedHistory));
      chatHistoryService.delete(userId, chatId).catch(() => {});
    }
    
    if (currentChatId === chatId) {
      createNewChat();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem muito grande. Máximo 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageSearch = async () => {
    if (!imageFile || loading) return;

    setLoading(true);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: '[Busca por imagem]',
      timestamp: new Date(),
      imageData: uploadedImage || undefined,
    };
    setMessages(prev => [...prev, userMessage]);

    if (userCredits < 1) {
      setTimeout(() => {
        addMessage('ai', 'Créditos insuficientes para busca por imagem!');
        setLoading(false);
        setUploadedImage(null);
        setImageFile(null);
      }, 500);
      return;
    }

    addMessage('ai', '🔍 Analisando sua imagem...\n\nAguarde enquanto identifico o produto.');

    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        router.push('/auth');
        return;
      }

      const userData = JSON.parse(user);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/search/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData: uploadedImage }),
      });

      if (response.status === 401) {
        localStorage.removeItem('zavlo_user');
        router.push('/auth');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        
        if (typeof data.remainingCredits === 'number') {
          updateCredits(data.remainingCredits, userData);
        }

        const creditsUsed = data.creditsUsed || 1;
        const remainingCredits = data.remainingCredits ?? userCredits - 1;
        let productName = (data.productName || 'Produto não identificado')
          .replace(/^Esta imagem mostra uma?\\s*/i, '')
          .replace(/^Esta é uma?\\s*/i, '')
          .replace(/^Este é um\\s*/i, '')
          .trim();

        setTimeout(() => {
          setUploadedImage(null);
          setImageFile(null);
          setDetectedProductName(productName);
          
          const confirmationMessage: Message = {
            id: crypto.randomUUID(),
            type: 'image_confirmation',
            content: `✅ Produto identificado!\n\n📦 ${productName}\n\n💳 Já gasto: -${creditsUsed} crédito(s)\n💰 Saldo: ${remainingCredits} créditos\n\n🔍 Deseja buscar preços? (custará +1 crédito)`,
            timestamp: new Date(),
            detectedProduct: productName,
            creditCost: creditsUsed,
          };
          setMessages(prev => [...prev, confirmationMessage]);
          setAwaitingImageConfirmation(true);
          setLoading(false);
        }, 800);
      } else {
        addMessage('ai', 'Erro na busca por imagem. Tente novamente.');
        setUploadedImage(null);
        setImageFile(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('Image search error:', error);
      addMessage('ai', 'Erro ao processar imagem. Tente novamente.');
      setUploadedImage(null);
      setImageFile(null);
      setLoading(false);
    }
  };

  const handleImagePriceSearch = () => {
    setMessages(prev => prev.filter(m => m.type !== 'image_confirmation'));
    
    const sortMessage: Message = {
      id: crypto.randomUUID(),
      type: 'sort_question',
      content: 'Como deseja ordenar os resultados?',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, sortMessage]);
    setAwaitingImageConfirmation(false);
    setAwaitingImageSort(true);
  };

  const executeImageSearch = async (sortBy: string) => {
    if (!detectedProductName || loading) return;
    
    setLoading(true);
    setMessages(prev => prev.filter(m => m.type !== 'sort_question'));
    addMessage('ai', 'searching_animation');

    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        router.push('/auth');
        return;
      }

      const userData = JSON.parse(user);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      
      const params = new URLSearchParams({
        query: detectedProductName,
        limit: '50',
        sortBy: sortBy
      });
      
      const response = await fetch(`${API_URL}/search/text?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userData.token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('zavlo_user');
        router.push('/auth');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const products = data.results || [];
        
        if (typeof data.remainingCredits === 'number') {
          updateCredits(data.remainingCredits, userData);
        }

        const creditsUsed = data.creditsUsed || 1;
        const remainingCredits = data.remainingCredits ?? userCredits - 1;

        setTimeout(() => {
          const productsMessage: Message = {
            id: crypto.randomUUID(),
            type: 'products',
            content: `✅ Encontrei ${products.length} produtos!\n\n💳 Créditos: -${creditsUsed} | Restantes: ${remainingCredits}`,
            products: products,
            timestamp: new Date(),
            creditCost: creditsUsed,
          };
          setMessages(prev => [...prev, productsMessage]);
          setAwaitingImageSort(false);
          setDetectedProductName('');
          setLoading(false);
        }, 1000);
      } else {
        addMessage('ai', 'Erro ao buscar preços. Tente novamente.');
        setAwaitingImageSort(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Image price search error:', error);
      addMessage('ai', 'Erro ao buscar preços. Tente novamente.');
      setAwaitingImageSort(false);
      setLoading(false);
    }
  };

  const handleImageSearchReject = () => {
    setMessages(prev => prev.filter(m => m.type !== 'image_confirmation'));
    addMessage('ai', '🔄 Ok! Quando quiser buscar preços, é só enviar outra imagem.');
    setAwaitingImageConfirmation(false);
    setUploadedImage(null);
    setImageFile(null);
    setDetectedProductName('');
    setLoading(false);
  };

  const handleHybridAnswer = async (answer: string) => {
    const enrichedQuery = `${originalQuery} ${answer}`.trim();
    
    // Verificar se ainda tem campos faltantes
    const currentMissingIndex = hybridMissingFields.indexOf(hybridMissingFields[0]);
    
    if (currentMissingIndex < hybridMissingFields.length - 1) {
      // Ainda tem mais perguntas, continuar
      setHybridQuestion(null);
      setHybridMissingFields([]);
      setOriginalQuery(enrichedQuery);
      await executeTextSearch(enrichedQuery);
    } else {
      // Última pergunta respondida, mostrar confirmação
      setHybridQuestion(null);
      setHybridMissingFields([]);
      setFinalQuery(enrichedQuery);
      setShowConfirmation(true);
    }
  };

  const handleHybridSkip = async () => {
    // Pular pergunta e mostrar confirmação
    setHybridQuestion(null);
    setHybridMissingFields([]);
    setFinalQuery(originalQuery);
    setShowConfirmation(true);
  };

  const handleConfirmSearch = async (editedQuery: string) => {
    setShowConfirmation(false);
    await executeTextSearch(editedQuery);
  };

  const handleCancelSearch = () => {
    setShowConfirmation(false);
    setFinalQuery('');
    setOriginalQuery('');
    setLoading(false);
    setMessages(prev => prev.filter(m => m.content !== 'searching_animation'));
  };

  const handleSend = async (messageText?: string) => {
    const currentInput = messageText || input;
    if (!currentInput || !String(currentInput).trim() || loading) return;

    // Handle image confirmation
    if (awaitingImageConfirmation) {
      const lowerInput = currentInput.toLowerCase().trim();
      if (['sim', 'sim!', 'yes', 'y', 's'].includes(lowerInput)) {
        handleImagePriceSearch();
        return;
      } else if (['não', 'nao', 'no', 'n'].includes(lowerInput)) {
        handleImageSearchReject();
        return;
      } else {
        addMessage('ai', '❓ Por favor, responda apenas com \"sim\" ou \"não\".');
        return;
      }
    }

    // Handle image sort
    if (awaitingImageSort) {
      const sortInput = currentInput.toLowerCase();
      let sortBy = 'RELEVANCE';
      if (sortInput.includes('menor') || sortInput.includes('barato')) sortBy = 'LOWEST_PRICE';
      else if (sortInput.includes('maior') || sortInput.includes('caro')) sortBy = 'HIGHEST_PRICE';
      executeImageSearch(sortBy);
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: currentInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    if (userCredits < 1) {
      setTimeout(() => {
        addMessage('ai', '💳 Créditos insuficientes! Você precisa de pelo menos 1 crédito para fazer buscas.');
        setLoading(false);
      }, 500);
      return;
    }

    setTimeout(() => {
      const intent = detectIntent(currentInput);

      // Handle special commands
      if (intent.type === 'introduction') {
        const userName = intent.userName || 'amigo(a)';
        addMessage('ai', `Prazer em conhecer você, ${userName}! 😊\n\nDigite o produto que procura!`);
        setLoading(false);
        return;
      }

      if (intent.type === 'greeting') {
        addMessage('ai', 'Olá! 👋 Que produto você está procurando?');
        setLoading(false);
        return;
      }

      if (intent.type === 'help') {
        addMessage('ai', '❓ Como usar:\n\n1️⃣ Digite o produto\n2️⃣ Responda perguntas (se houver)\n3️⃣ Veja os resultados!');
        setLoading(false);
        return;
      }

      if (intent.type === 'credits_question') {
        addMessage('ai', `💰 Seus Créditos: ${userCredits}\n\n📊 Custos:\n• Busca por texto: 1 crédito\n• Busca por imagem: 2 créditos`);
        setLoading(false);
        return;
      }

      if (intent.type === 'plans_question') {
        addMessage('ai', '📊 Nossos Planos:\n\n🌱 Básico - R$ 27/mês\n🚀 Pro - R$ 77/mês\n👑 Business - R$ 197/mês');
        setLoading(false);
        return;
      }

      if (intent.type !== 'search' && intent.type !== 'buy') {
        addMessage('ai', '🤔 Não entendi... Digite um produto para buscar!');
        setLoading(false);
        return;
      }

      // Execute search
      executeTextSearch(currentInput);
    }, 500);
  };

  const executeTextSearch = async (query: string) => {
    addMessage('ai', 'searching_animation');

    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        router.push('/auth');
        return;
      }

      const userData = JSON.parse(user);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      
      const params = new URLSearchParams({
        query: query,
        limit: '50',
        sortBy: 'RELEVANCE'
      });
      
      const response = await fetch(`${API_URL}/search/text?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userData.token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('zavlo_user');
        router.push('/auth');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        
        // Check if it's a question about the system
        if (data.classification?.is_question) {
          setLoading(false);
          setMessages(prev => prev.filter(m => m.content !== 'searching_animation'));
          
          const guidedResponse = data.classification?.guided_response;
          if (guidedResponse) {
            addMessage('ai', guidedResponse);
          } else {
            addMessage('ai', '❓ Como usar:\n\n1️⃣ Digite o produto que procura\n2️⃣ Responda perguntas se necessário\n3️⃣ Veja os melhores preços!\n\n💡 Exemplos:\n• "iPhone 13 usado"\n• "Honda Civic 2020"\n• "Notebook gamer"');
          }
          return;
        }
        
        // Check if it's a greeting
        if (data.classification?.is_greeting) {
          setLoading(false);
          setMessages(prev => prev.filter(m => m.content !== 'searching_animation'));
          addMessage('ai', 'Olá! 👋 Que produto você está procurando?');
          return;
        }
        
        // HYBRID MODE: Check if needs question
        if (data.needsQuestion && data.question) {
          setHybridQuestion(data.question);
          setHybridMissingFields(data.missingFields || []);
          setOriginalQuery(query);
          setLoading(false);
          setMessages(prev => prev.filter(m => m.content !== 'searching_animation'));
          return;
        }
        
        const products = data.results || [];
        
        if (typeof data.remainingCredits === 'number') {
          updateCredits(data.remainingCredits, userData);
        }
        
        const creditsUsed = data.creditsUsed || 1;
        const remainingCredits = data.remainingCredits ?? userCredits - 1;
        
        setTimeout(() => {
          const productsMessage: Message = {
            id: crypto.randomUUID(),
            type: 'products',
            content: `✅ Encontrei ${products.length} produtos!\n\n💳 Créditos: -${creditsUsed} | Restantes: ${remainingCredits}`,
            products: products,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, productsMessage]);
          contextManager.update({
            lastResults: products,
            lastProduct: query
          });
          setLoading(false);
        }, 1000);
      } else {
        addMessage('ai', 'Erro na busca. Tente novamente.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      addMessage('ai', 'Erro ao processar busca. Tente novamente.');
      setLoading(false);
    }
  };

  const addMessage = (type: 'ai' | 'user', content: string) => {
    const message: Message = {
      id: crypto.randomUUID(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const updateCredits = (newCredits: number, userData: any) => {
    console.log('💳 [CREDITS] Atualizando créditos:', {
      anterior: userCredits,
      novo: newCredits,
      diferença: userCredits - newCredits
    });
    
    setUserCredits(newCredits);
    const updatedUser = { ...userData, credits: newCredits };
    localStorage.setItem('zavlo_user', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('userChanged'));
  };

  return (
    <div className="h-screen bg-[#0A0A12] flex overflow-hidden">
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        userCredits={userCredits}
        isCreatingNewChat={isCreatingNewChat}
        onNewChat={createNewChat}
        onLoadChat={loadChat}
        onDeleteChat={deleteChat}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userCredits={userCredits}
          onClearChat={createNewChat}
        />

        {messages.length === 1 && messages[0].type === 'ai' ? (
          <QuickSuggestions
            onSuggestionClick={(text) => {
              setInput(text);
              inputRef.current?.focus();
            }}
            showMoreSuggestions={false}
            onToggleMore={() => {}}
            isIntroduction={false}
          />
        ) : (
          <ChatMessages
            messages={messages}
            loading={loading}
            userCredits={userCredits}
            onSendMessage={handleSend}
            onImageSearchReject={handleImageSearchReject}
            onImagePriceSearch={handleImagePriceSearch}
            onExecuteImageSearch={executeImageSearch}
            onConfirmSearch={() => {}}
            onCancelSearch={() => {}}
            isEditingQuery={false}
            editedQuery=""
            onEditQueryChange={() => {}}
            onStartEditQuery={() => {}}
            onCancelEditQuery={() => {}}
            onConfirmEditQuery={() => {}}
            onUpdateDetectedProduct={(messageId, newName) => {
              setDetectedProductName(newName);
              setMessages(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(m => m.id === messageId);
                if (idx >= 0 && updated[idx].detectedProduct) {
                  updated[idx].detectedProduct = newName;
                }
                return updated;
              });
            }}
            messagesEndRef={messagesEndRef}
          />
        )}

        <ChatInput
          input={input}
          onInputChange={setInput}
          onSend={() => handleSend()}
          onImageUpload={handleImageUpload}
          onImageSearch={handleImageSearch}
          uploadedImage={uploadedImage}
          onRemoveImage={() => {
            setUploadedImage(null);
            setImageFile(null);
          }}
          loading={loading}
          inputRef={inputRef}
          fileInputRef={fileInputRef}
        />
      </div>

      {/* Hybrid Mode Question Modal */}
      {hybridQuestion && (
        <QuestionModal
          question={hybridQuestion}
          missingFields={hybridMissingFields}
          onAnswer={handleHybridAnswer}
          onSkip={handleHybridSkip}
        />
      )}

      {/* Search Confirmation Modal */}
      {showConfirmation && (
        <SearchConfirmationModal
          finalQuery={finalQuery}
          onConfirm={handleConfirmSearch}
          onCancel={handleCancelSearch}
        />
      )}
    </div>
  );
}
