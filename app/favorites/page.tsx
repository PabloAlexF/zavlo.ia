'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Toast } from '@/components/ui/Toast';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zavlo-ia.onrender.com/api/v1';

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
    const localFavorites = JSON.parse(localStorage.getItem('zavlo_favorites') || '[]');
    const user = localStorage.getItem('zavlo_user');
    
    if (!user) {
      await loadLocalFavorites(localFavorites);
      return;
    }

    try {
      const userData = JSON.parse(user);
      
      const response = await fetch(`${API_URL}/favorites`, {
        headers: {
          'Authorization': `Bearer ${userData.token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      } else {
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
    if (favoriteIds.length === 0) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const favoritesData: Favorite[] = [];
    
    for (const id of favoriteIds) {
      try {
        let response = await fetch(`${API_URL}/products/${id}`);
        
        if (response.ok) {
          const product = await response.json();
          favoritesData.push({
            id,
            productId: product.id,
            productTitle: product.title,
            productPrice: product.price,
            productImage: product.images?.[0],
            productUrl: `/product/${product.id}`,
            source: product.source || 'Zavlo.ia',
            createdAt: product.createdAt || new Date().toISOString(),
          });
        } else {
          response = await fetch(`${API_URL}/listings/${id}`);
          if (response.ok) {
            const listing = await response.json();
            favoritesData.push({
              id,
              productId: listing.id,
              productTitle: listing.title,
              productPrice: listing.price,
              productImage: listing.images?.[0],
              productUrl: `/product/${listing.id}`,
              source: listing.source || 'Zavlo.ia',
              createdAt: listing.createdAt || new Date().toISOString(),
            });
          }
        }
      } catch (e) {
        console.error('[FAVORITES] Erro ao carregar produto:', id, e);
      }
    }
    
    setFavorites(favoritesData);
    setLoading(false);
  };

  const removeFavorite = async (favoriteId: string) => {
    const user = localStorage.getItem('zavlo_user');
    
    if (!user) {
      const stored = JSON.parse(localStorage.getItem('zavlo_favorites') || '[]');
      localStorage.setItem('zavlo_favorites', JSON.stringify(stored.filter((id: string) => id !== favoriteId)));
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      setToast({ message: 'Favorito removido!', type: 'success' });
      return;
    }

    try {
      const userData = JSON.parse(user);
      const response = await fetch(`${API_URL}/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userData.token}` },
      });
      
      if (response.ok) {
        setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
        setToast({ message: 'Favorito removido!', type: 'success' });
      } else {
        setToast({ message: 'Erro ao remover favorito', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Erro ao remover favorito', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0C10]">
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
    <div className="min-h-screen bg-[#0A0C10]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2">Meus Favoritos</h1>
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
              className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Buscar Produtos
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/[0.05] transition-all duration-200"
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
                      <span className="text-2xl font-semibold text-white">
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
                          className="p-2 rounded-lg bg-white/[0.04] border border-white/10 text-gray-300 hover:bg-white/[0.08] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        
                        <a
                          href={favorite.productUrl}
                          className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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