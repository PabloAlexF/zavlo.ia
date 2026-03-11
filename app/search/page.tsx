'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchResults from '@/components/features/SearchResults';
import { Toast } from '@/components/ui/Toast';
import { Search, Image, DollarSign, Store, Sparkles, SlidersHorizontal, X, ChevronDown, ChevronUp, Lock, MessageSquare, CheckCircle, Zap, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  title: string;
  price: number;
  image?: string;
  source: string;
  url: string;
  location?: any;
  condition: 'new' | 'used';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'process.env.NEXT_PUBLIC_API_URL';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    source: 'all',
    sortBy: 'relevance',
  });

  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'text';
  const imageUrl = searchParams.get('imageUrl') || '';

  useEffect(() => {
    if (query) setSearchQuery(query);
  }, [query]);

  useEffect(() => {
    const savedResults = localStorage.getItem('searchResults');
    const savedQuery = localStorage.getItem('searchQuery');
    const savedFilters = localStorage.getItem('searchFilters');
    
    if (savedResults && savedQuery === query) {
      setResults(JSON.parse(savedResults));
      if (savedFilters) setFilters(JSON.parse(savedFilters));
    }
  }, []);

  useEffect(() => {
    if (results.length > 0) {
      localStorage.setItem('searchResults', JSON.stringify(results));
      localStorage.setItem('searchQuery', query);
      localStorage.setItem('searchFilters', JSON.stringify(filters));
    }
  }, [results, query, filters]);

  useEffect(() => {
    const savedQuery = localStorage.getItem('searchQuery');
    const savedResults = localStorage.getItem('searchResults');
    
    if (query && query.trim() !== '' && (savedQuery !== query || !savedResults)) {
      performSearch();
    }
  }, [query, type]);

  const getSortedAndFilteredResults = (products: Product[]) => {
    let filtered = [...products];
    
    if (filters.minPrice) filtered = filtered.filter((p) => p.price >= parseFloat(filters.minPrice));
    if (filters.maxPrice) filtered = filtered.filter((p) => p.price <= parseFloat(filters.maxPrice));
    if (filters.source !== 'all') filtered = filtered.filter((p) => p.source === filters.source);

    switch (filters.sortBy) {
      case 'price_asc': return filtered.sort((a, b) => a.price - b.price);
      case 'price_desc': return filtered.sort((a, b) => b.price - a.price);
      case 'newest': return filtered;
      default: return filtered;
    }
  };

  const performSearch = async () => {
    if (!query || query.trim() === '') return;

    setLoading(true);
    setShowMobileFilters(false);
    
    try {
      const user = localStorage.getItem('zavlo_user');
      const userData = user ? JSON.parse(user) : null;

      const endpoint = type === 'image' 
        ? `${API_URL}/api/v1/scraping/search-by-image`
        : `${API_URL}/api/v1/scraping/google-shopping`;

      // Se for busca por imagem e tiver imageUrl, usar ela; senão usar query como texto
      const body = type === 'image' && imageUrl
        ? { imageUrl, productName: query }
        : type === 'image'
        ? { imageUrl: query }
        : { query, limit: 50 };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userData?.token && { 'Authorization': `Bearer ${userData.token}` }),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.error === 'LIMIT_EXCEEDED') {
          setToast({ message: 'Limite de comparações atingido.', type: 'error' });
          return;
        }
        if (error.error === 'INSUFFICIENT_CREDITS') {
          setToast({ 
            message: `Créditos insuficientes! Você tem ${error.currentCredits} créditos e precisa de ${error.requiredCredits}. Recarregue seus créditos para continuar.`, 
            type: 'error' 
          });
          setTimeout(() => router.push('/plans'), 2000);
          return;
        }
        throw new Error('Search failed');
      }

      const data = await response.json();
      const products = type === 'image' ? data.results || [] : data.results || [];
      
      // Atualizar créditos do usuário se retornados
      if (userData && typeof data.remainingCredits === 'number') {
        const updatedUser = { ...userData, credits: data.remainingCredits };
        localStorage.setItem('zavlo_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('userChanged'));
        
        if (data.creditsUsed) {
          setToast({ 
            message: `Busca realizada! ${data.creditsUsed} crédito(s) usado(s). Restam ${data.remainingCredits} créditos.`, 
            type: 'success' 
          });
        }
      }
      
      localStorage.setItem('searchResults', JSON.stringify(products));
      localStorage.setItem('searchQuery', query);
      
      setResults(products);
    } catch (error) {
      console.error('Search error:', error);
      setToast({ message: 'Erro ao realizar comparação', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=text`);
    }
  };

  const handleClearFilters = () => {
    setFilters({ minPrice: '', maxPrice: '', source: 'all', sortBy: 'relevance' });
    setToast({ message: 'Filtros limpos', type: 'info' });
  };

  const handleFavorite = async (product: Product) => {
    const user = localStorage.getItem('zavlo_user');
    if (!user) {
      router.push('/auth');
      return;
    }

    try {
      const userData = JSON.parse(user);
      const response = await fetch(`${API_URL}/api/v1/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`,
        },
        body: JSON.stringify(product),
      });

      if (response.ok) {
        setToast({ message: 'Produto adicionado aos favoritos!', type: 'success' });
      }
    } catch (error) {
      setToast({ message: 'Erro ao adicionar favorito', type: 'error' });
    }
  };

  const finalResults = getSortedAndFilteredResults(results);

  if (!query || query.trim() === '') {
    return (
      <div className="min-h-screen bg-[#0B0B0F] pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a2e12_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e12_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
        
        <main className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Busca Inteligente</h1>
            <p className="text-xl text-gray-400">Encontre os melhores preços com ajuda da IA</p>
          </div>

          {/* Chat IA Explanation */}
          <motion.div 
            className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-3xl p-8 mb-8 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="flex items-start gap-4 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div 
                className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <MessageSquare className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  Chat com IA - Busca Conversacional
                </h2>
                <p className="text-gray-300 text-lg">Converse naturalmente e deixe a IA encontrar exatamente o que você precisa!</p>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <motion.div 
                className="bg-black/30 rounded-2xl p-6 border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.2)" }}
              >
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <motion.div 
                    className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </motion.div>
                  Como funciona?
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <motion.li 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong className="text-white">Converse naturalmente:</strong> "Quero um notebook para programar até R$ 3000"</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong className="text-white">IA entende contexto:</strong> Ela faz perguntas para refinar sua busca</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <span className="text-pink-400 mt-1">•</span>
                    <span><strong className="text-white">Resultados personalizados:</strong> Busca nos 9+ marketplaces com seus critérios</span>
                  </motion.li>
                </ul>
              </motion.div>

              <motion.div 
                className="bg-black/30 rounded-2xl p-6 border border-white/10"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.2)" }}
              >
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <motion.div 
                    className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.2, rotate: -360 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </motion.div>
                  Exemplos de uso
                </h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  {[
                    '"Preciso de um celular bom e barato"',
                    '"Quero uma TV 50 polegadas smart"',
                    '"Busco um sofá de 3 lugares em São Paulo"',
                    '"Notebook gamer com RTX 3060"'
                  ].map((example, i) => (
                    <motion.li 
                      key={i}
                      className="bg-white/5 rounded-lg p-2 border border-white/10 flex items-center gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                    >
                      <MessageSquare className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      {example}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>

            <motion.div 
              className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-6 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-start gap-3">
                <motion.div 
                  className="w-10 h-10 bg-orange-500/30 rounded-xl flex items-center justify-center flex-shrink-0"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <Lock className="w-5 h-5 text-orange-400" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Login Necessário
                  </h3>
                  <p className="text-gray-200 mb-3">
                    Para usar o Chat com IA, você precisa estar logado. Isso nos permite:
                  </p>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    {[
                      'Salvar seu histórico de conversas',
                      'Personalizar recomendações baseadas no seu perfil',
                      'Criar alertas de preço personalizados',
                      'Acessar recursos premium da IA'
                    ].map((benefit, i) => (
                      <motion.li 
                        key={i}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + i * 0.1 }}
                      >
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {benefit}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <motion.button
                onClick={() => {
                  const user = localStorage.getItem('zavlo_user');
                  if (user) {
                    router.push('/chat');
                  } else {
                    router.push('/auth?redirect=/chat');
                  }
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageSquare className="w-5 h-5" />
                Conversar com IA
              </motion.button>
              
              <motion.button
                onClick={() => router.push('/auth')}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-semibold text-lg transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserCheck className="w-5 h-5" />
                Criar Conta / Login
              </motion.button>
            </motion.div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] pt-16 sm:pt-20 pb-8 sm:pb-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e520_1px,transparent_1px),linear-gradient(to_bottom,#4f46e520_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/20 rounded-full blur-[100px] sm:blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/20 rounded-full blur-[100px] sm:blur-[120px] animate-pulse"></div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="mb-6 sm:mb-8">
          <form onSubmit={handleNewSearch} className="relative group">
            <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative flex items-center">
              <div className="absolute left-3 sm:left-4 flex items-center gap-1.5 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar com IA..."
                className="w-full h-12 sm:h-14 pl-12 sm:pl-16 pr-20 sm:pr-32 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl text-white text-base sm:text-lg placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-2xl"
              />
              <button type="submit" className="absolute right-1.5 sm:right-2 px-3 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-semibold transition-all hover:scale-105 shadow-lg flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                <span className="hidden sm:inline">Buscar</span>
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                {type === 'image' ? <Image className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-white mb-1 break-words">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">IA encontrou:</span>
                  <span className="block sm:inline sm:ml-2 text-base sm:text-2xl mt-1 sm:mt-0">"{query}"</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="flex items-center gap-1">
                    {type === 'image' ? <Image className="w-3 h-3 sm:w-4 sm:h-4" /> : <Search className="w-3 h-3 sm:w-4 sm:h-4" />}
                    {type === 'image' ? 'Busca por imagem' : 'Busca inteligente'}
                  </span>
                  <span>•</span>
                  <span>{finalResults.length} produtos</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl text-white font-semibold hover:from-white/15 hover:to-white/10 transition-all"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              <span>Filtros e Ordenação</span>
            </div>
            {showMobileFilters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 sm:gap-6">
          <div className={`lg:col-span-1 ${showMobileFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 lg:sticky lg:top-24 shadow-2xl">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <SlidersHorizontal className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-base sm:text-lg">Filtros IA</h3>
                </div>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="lg:hidden p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                    Ordenar por
                  </label>
                  <select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })} className="w-full bg-black/50 border border-white/30 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all cursor-pointer hover:bg-black/70" style={{ colorScheme: 'dark' }}>
                    <option value="relevance">Relevância</option>
                    <option value="price_asc">Menor preço</option>
                    <option value="price_desc">Maior preço</option>
                    <option value="newest">Mais recentes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
                    Faixa de Preço
                  </label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Mín" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} className="w-full bg-black/50 border border-white/30 rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-white text-xs sm:text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/50 outline-none transition-all" />
                    <input type="number" placeholder="Máx" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} className="w-full bg-black/50 border border-white/30 rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-white text-xs sm:text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/50 outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                    Loja
                  </label>
                  <select value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })} className="w-full bg-black/50 border border-white/30 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all cursor-pointer hover:bg-black/70" style={{ colorScheme: 'dark' }}>
                    <option value="all">Todas as Lojas</option>
                    <option value="OLX">OLX</option>
                    <option value="Mercado Livre">Mercado Livre</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Kabum">Kabum</option>
                    <option value="Shopee">Shopee</option>
                  </select>
                </div>

                <button onClick={handleClearFilters} className="w-full bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border border-red-500/30 text-white py-2.5 sm:py-3 px-4 rounded-xl font-semibold transition-all text-xs sm:text-sm hover:scale-105 flex items-center justify-center gap-2">
                  <X className="w-4 h-4" />
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <SearchResults results={finalResults} loading={loading} onFavorite={handleFavorite} />
          </div>
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
