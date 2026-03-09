'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Toast } from '@/components/ui/Toast';
import Image from 'next/image';

interface Favorite {
  id: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImage?: string;
  productUrl: string;
  source: string;
  createdAt: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    console.log('[FAVORITES] Iniciando carregamento de favoritos');
    
    // First try localStorage (for users not logged in or for local favorites)
    const localFavorites = JSON.parse(localStorage.getItem('zavlo_favorites') || '[]');
    console.log('[FAVORITES] Favoritos locais encontrados:', localFavorites);
    
    // Check if user is logged in
    const user = localStorage.getItem('zavlo_user');
    console.log('[FAVORITES] Usuário logado:', !!user);
    
    if (!user) {
      console.log('[FAVORITES] Usuário não logado, usando favoritos locais');
      await loadLocalFavorites(localFavorites);
      return;
    }

    try {
      const userData = JSON.parse(user);
      console.log('[FAVORITES] Buscando favoritos da API para usuário:', userData.email);
      
      const response = await fetch('http://localhost:3001/api/v1/favorites', {
        headers: {
          'Authorization': `Bearer ${userData.token}`,
        },
      });

      console.log('[FAVORITES] Resposta da API:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[FAVORITES] Favoritos da API carregados:', data.length);
        setFavorites(data);
      } else {
        console.log('[FAVORITES] Erro na API, usando favoritos locais como fallback');
        await loadLocalFavorites(localFavorites);
      }
    } catch (error) {
      console.error('[FAVORITES] Erro ao carregar favoritos da API:', error);
      await loadLocalFavorites(localFavorites);
    } finally {
      setLoading(false);
    }
  };

  const loadLocalFavorites = async (favoriteIds: string[]) => {
    console.log('[FAVORITES] Carregando favoritos locais, IDs:', favoriteIds);
    
    if (favoriteIds.length === 0) {
      console.log('[FAVORITES] Nenhum favorito local encontrado');
      setFavorites([]);
      setLoading(false);
      return;
    }

    // Fetch product details for each favorite
    const favoritesData: Favorite[] = [];
    
    for (const id of favoriteIds) {
      console.log('[FAVORITES] Buscando produto ID:', id);
      
      try {
        // Try products endpoint first
        let response = await fetch(`http://localhost:3001/api/v1/products/${id}`);
        console.log('[FAVORITES] Resposta products API:', response.status);
        
        if (response.ok) {
          const product = await response.json();
          console.log('[FAVORITES] Produto encontrado:', product.title);
          
          favoritesData.push({
            id: id,
            productId: product.id,
            productTitle: product.title,
            productPrice: product.price,
            productImage: product.images?.[0],
            productUrl: `/product/${product.id}`,
            source: product.source || 'Zavlo.ia',
            createdAt: product.createdAt || new Date().toISOString(),
          });
        } else {
          console.log('[FAVORITES] Produto não encontrado, tentando listings');
          
          // Try listings endpoint as fallback
          response = await fetch(`http://localhost:3001/api/v1/listings/${id}`);
          console.log('[FAVORITES] Resposta listings API:', response.status);
          
          if (response.ok) {
            const listing = await response.json();
            console.log('[FAVORITES] Listing encontrado:', listing.title);
            
            favoritesData.push({
              id: id,
              productId: listing.id,
              productTitle: listing.title,
              productPrice: listing.price,
              productImage: listing.images?.[0],
              productUrl: `/product/${listing.id}`,
              source: listing.source || 'Zavlo.ia',
              createdAt: listing.createdAt || new Date().toISOString(),
            });
          } else {
            console.log('[FAVORITES] Listing não encontrado para ID:', id);
          }
        }
      } catch (e) {
        console.error('[FAVORITES] Erro ao carregar produto:', id, e);
      }
    }
    
    console.log('[FAVORITES] Total de favoritos carregados:', favoritesData.length);
    setFavorites(favoritesData);
    setLoading(false);
  };

  const removeFavorite = async (favoriteId: string) => {
    console.log('[FAVORITES] Removendo favorito ID:', favoriteId);
    
    const user = localStorage.getItem('zavlo_user');
    
    if (!user) {
      console.log('[FAVORITES] Usuário não logado, removendo do localStorage');
      
      // Remove from localStorage for non-logged users
      const favorites = JSON.parse(localStorage.getItem('zavlo_favorites') || '[]');
      console.log('[FAVORITES] Favoritos antes da remoção:', favorites);
      
      const updatedFavorites = favorites.filter((id: string) => id !== favoriteId);
      console.log('[FAVORITES] Favoritos após remoção:', updatedFavorites);
      
      localStorage.setItem('zavlo_favorites', JSON.stringify(updatedFavorites));
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      setToast({ message: 'Favorito removido!', type: 'success' });
      return;
    }

    try {
      console.log('[FAVORITES] Usuário logado, removendo via API');
      
      const userData = JSON.parse(user);
      const response = await fetch(`http://localhost:3001/api/v1/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userData.token}`,
        },
      });

      console.log('[FAVORITES] Resposta da API para remoção:', response.status);
      
      if (response.ok) {
        console.log('[FAVORITES] Favorito removido com sucesso');
        setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
        setToast({ message: 'Favorito removido!', type: 'success' });
      } else {
        console.error('[FAVORITES] Erro ao remover favorito da API');
        setToast({ message: 'Erro ao remover favorito', type: 'error' });
      }
    } catch (error) {
      console.error('[FAVORITES] Erro na requisição de remoção:', error);
      setToast({ message: 'Erro ao remover favorito', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F]">
        <Header />
        <main className="max-w-4xl mx-auto px-4 pt-24 pb-12">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-white/10 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-3 bg-white/10 rounded w-1/2"></div>
                    <div className="h-4 bg-white/10 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Meus Favoritos</h1>
          <p className="text-gray-400">
            {favorites.length} produtos salvos
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Nenhum favorito ainda</h3>
            <p className="text-gray-400 mb-6">Comece a salvar produtos que você gosta</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Buscar Produtos
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex gap-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    {favorite.productImage ? (
                      <Image
                        src={favorite.productImage}
                        alt={favorite.productTitle}
                        fill
                        className="object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white mb-1 line-clamp-2">
                      {favorite.productTitle}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-green-400">
                        R$ {favorite.productPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="bg-white/10 px-2 py-1 rounded text-xs">
                          {favorite.source}
                        </span>
                        <span>
                          Salvo em {new Date(favorite.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFavorite(favorite.id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        
                        <a
                          href={favorite.productUrl}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Ver Produto
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}