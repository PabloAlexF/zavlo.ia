/**
 * Exemplo de Implementação Frontend - Modo Híbrido Inteligente
 * 
 * Este arquivo mostra como integrar o modo híbrido no frontend React/Next.js
 */

import { useState } from 'react';

// ============================================
// TIPOS
// ============================================

interface SearchResponse {
  results: Product[];
  total: number;
  needsQuestion?: boolean;
  question?: string;
  missingFields?: string[];
  classification?: any;
  creditsUsed?: number;
  remainingCredits?: number;
}

interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  url: string;
  source: string;
}

// ============================================
// HOOK CUSTOMIZADO
// ============================================

export function useHybridSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [question, setQuestion] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [currentQuery, setCurrentQuery] = useState<string>('');

  const search = async (query: string) => {
    setIsLoading(true);
    setCurrentQuery(query);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const data: SearchResponse = await response.json();

      // Verificar se precisa fazer pergunta
      if (data.needsQuestion && data.question) {
        setQuestion(data.question);
        setMissingFields(data.missingFields || []);
        setResults([]);
      } else {
        // Mostrar resultados diretamente
        setResults(data.results);
        setQuestion(null);
        setMissingFields([]);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const answerQuestion = async (answer: string) => {
    // Enriquecer query com a resposta
    const enrichedQuery = `${currentQuery} ${answer}`;
    
    // Fazer nova busca
    await search(enrichedQuery);
  };

  return {
    search,
    answerQuestion,
    isLoading,
    results,
    question,
    missingFields
  };
}

// ============================================
// COMPONENTE DE PERGUNTA
// ============================================

interface QuestionModalProps {
  question: string;
  missingFields: string[];
  onAnswer: (answer: string) => void;
  onCancel: () => void;
}

export function QuestionModal({ question, missingFields, onAnswer, onCancel }: QuestionModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  // Gerar opções baseado no campo faltante
  const getOptions = () => {
    if (missingFields.includes('condition')) {
      return [
        { value: 'novo', label: 'Novo' },
        { value: 'usado', label: 'Usado' }
      ];
    }
    
    if (missingFields.includes('location')) {
      // Para localização, usar input de texto
      return null;
    }

    return [];
  };

  const options = getOptions();

  const handleSubmit = () => {
    if (selectedAnswer) {
      onAnswer(selectedAnswer);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">
          {question.replace(/\*\*/g, '')} {/* Remover markdown */}
        </h3>

        {options ? (
          // Opções de múltipla escolha (novo/usado)
          <div className="space-y-2 mb-4">
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedAnswer(option.value)}
                className={`w-full p-3 rounded-lg border-2 transition-colors ${
                  selectedAnswer === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          // Input de texto (localização)
          <input
            type="text"
            placeholder="Ex: São Paulo, SP"
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
          />
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
          >
            Buscar
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function SearchPage() {
  const { search, answerQuestion, isLoading, results, question, missingFields } = useHybridSearch();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      search(searchQuery);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Barra de Busca */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="O que você está procurando?"
            className="flex-1 p-3 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
          >
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      {/* Modal de Pergunta */}
      {question && (
        <QuestionModal
          question={question}
          missingFields={missingFields}
          onAnswer={answerQuestion}
          onCancel={() => {
            // Buscar mesmo sem responder (usar scrapers padrão)
            answerQuestion('');
          }}
        />
      )}

      {/* Resultados */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(product => (
            <div key={product.id} className="border rounded-lg p-4">
              <img src={product.image} alt={product.title} className="w-full h-48 object-cover rounded mb-2" />
              <h3 className="font-semibold mb-1">{product.title}</h3>
              <p className="text-lg text-blue-600 font-bold">{product.price}</p>
              <p className="text-sm text-gray-500">{product.source}</p>
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Ver Produto
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Estado Vazio */}
      {!isLoading && !question && results.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <p>Digite algo para começar a buscar</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// EXEMPLO DE USO SIMPLES
// ============================================

export function SimpleExample() {
  const { search, answerQuestion, question } = useHybridSearch();

  const handleSearch = async () => {
    await search('iPhone 13');
    
    // Se houver pergunta, responder automaticamente (exemplo)
    if (question) {
      await answerQuestion('usado');
    }
  };

  return (
    <button onClick={handleSearch}>
      Buscar iPhone 13
    </button>
  );
}
