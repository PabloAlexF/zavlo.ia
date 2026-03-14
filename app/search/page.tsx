'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchResults from '@/components/features/SearchResults';
import { Toast } from '@/components/ui/Toast';
import { Search, SlidersHorizontal, X, MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

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
  const [showFilters, setShowFilters] = useState(false);
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
    setShowFilters(false);
    
    try {
      const user = localStorage.getItem('zavlo_user');
      const userData = user ? JSON.parse(user) : null;

      const endpoint = type === 'image' 
        ? `${API_URL}/api/v1/scraping/search-by-image`
        : `${API_URL}/api/v1/scraping/google-shopping`;

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
      <div className="min-h-screen bg-black pt-24 pb-12">
        <div className="fixed inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 pointer-events-none" />
        
        <main className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-semibold mb-3 text-white">Busca Inteligente</h1>
            <p className="text-lg text-gray-500">Encontre os melhores preços com IA</p>
          </div>

          <motion.div 
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Chat com IA</h2>
                <p className="text-gray-400">Converse naturalmente e deixe a IA encontrar o que você precisa</p>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-sm text-gray-400">
              <p className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Converse naturalmente: "Quero um notebook para programar até R$ 3000"</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>IA entende contexto e faz perguntas para refinar sua busca</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Resultados personalizados de 9+ marketplaces</span>
              </p>
            </div>

            <Link href="/chat">
              <motion.button
                className="w-full py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <MessageSquare className="w-4 h-4" />
                Conversar com IA
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-12">
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 pointer-events-none" />
      
      <main className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="mb-6">
          <form onSubmit={handleNewSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full h-12 pl-4 pr-24 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 focus:border-white/20 focus:bg-white/[0.06] outline-none transition-all"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        <div className="mb-6">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-medium text-white mb-1">
                  "{query}"
                </h1>
                <p className="text-sm text-gray-500">{finalResults.length} produtos encontrados</p>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white hover:bg-white/[0.08] transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6">
          {showFilters && (
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 lg:sticky lg:top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-white">Filtros</h3>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Ordenar por</label>
                    <select 
                      value={filters.sortBy} 
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })} 
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:border-white/20 outline-none"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="relevance">Relevância</option>
                      <option value="price_asc">Menor preço</option>
                      <option value="price_desc">Maior preço</option>
                      <option value="newest">Mais recentes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Faixa de preço</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="Mín" 
                        value={filters.minPrice} 
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} 
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:border-white/20 outline-none"
                      />
                      <input 
                        type="number" 
                        placeholder="Máx" 
                        value={filters.maxPrice} 
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} 
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:border-white/20 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Marketplace</label>
                    <select 
                      value={filters.source} 
                      onChange={(e) => setFilters({ ...filters, source: e.target.value })} 
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:border-white/20 outline-none"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="all">Todos</option>
                      <option value="OLX">OLX</option>
                      <option value="Mercado Livre">Mercado Livre</option>
                      <option value="Amazon">Amazon</option>
                      <option value="Kabum">Kabum</option>
                      <option value="Shopee">Shopee</option>
                    </select>
                  </div>

                  <button 
                    onClick={handleClearFilters} 
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white py-2 rounded-lg text-sm hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Limpar
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
