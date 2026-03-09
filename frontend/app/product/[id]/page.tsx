'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Product } from '@/types';

// Mock data com imagens
const mockProduct: Product = {
  id: '1',
  title: 'iPhone 13 Pro Max 256GB Azul Sierra',
  price: 4599.00,
  source: 'OLX',
  location: { city: 'São Paulo', state: 'SP' },
  seller: { name: 'João Silva' },
  description: 'iPhone 13 Pro Max em perfeito estado de conservação. Sempre usado com capinha e película. Bateria com 95% de saúde. Acompanha caixa, carregador e todos os acessórios originais. Sem nenhum arranhão ou defeito. Aceito propostas razoáveis.',
  sourceUrl: 'https://olx.com.br/produto/123456',
  images: [
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&h=600&fit=crop'
  ],
  category: 'Eletrônicos',
  createdAt: new Date().toISOString()
};

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // Buscar produto da API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;
      
      try {
        console.log('[PRODUCT] Buscando produto ID:', params.id);
        const response = await fetch(`http://localhost:3001/api/v1/products/${params.id}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[PRODUCT] Produto encontrado:', data.title);
          console.log('[PRODUCT] Imagens:', data.images);
          setProduct(data);
        } else {
          // Tentar buscar da lista de produtos da busca (localStorage)
          const searchResults = localStorage.getItem('lastSearchResults');
          if (searchResults) {
            const products = JSON.parse(searchResults);
            const foundProduct = products.find((p: any) => p.id === params.id);
            if (foundProduct) {
              console.log('[PRODUCT] Produto encontrado no cache:', foundProduct.title);
              setProduct(foundProduct);
              return;
            }
          }
          
          console.warn('[PRODUCT] Produto não encontrado, usando mock');
          setProduct(mockProduct);
        }
      } catch (error) {
        console.error('[PRODUCT] Erro ao buscar:', error);
        setProduct(mockProduct);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black">
        <Header />
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-16">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-16 mb-6" />
            <div className="space-y-6">
              <div className="aspect-square bg-gray-200 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-10 bg-gray-200 rounded w-1/2" />
                <div className="h-32 bg-gray-200 rounded" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white text-black">
        <Header />
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
          <div className="text-center py-20">
            <h1 className="text-2xl font-semibold mb-4">Produto não encontrado</h1>
            <button onClick={() => router.back()} className="text-blue-600 hover:underline">
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasImage = product.images && product.images.length > 0;
  const hasMultipleImages = product.images && product.images.length > 1;
  const location = typeof product.location === 'string' ? product.location : `${product.location?.city || ''}, ${product.location?.state || ''}`;
  const currentImageUrl = hasImage ? product.images[currentImageIndex] : null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    setImageError(false);
    setIsLoading(true);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    setImageError(false);
    setIsLoading(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const toggleFavorite = async () => {
    console.log('[PRODUCT] Toggling favorite para produto:', product.id);
    
    // Check if user is logged in
    const user = localStorage.getItem('zavlo_user');
    console.log('[PRODUCT] Usuário logado:', !!user);
    
    if (!user) {
      console.log('[PRODUCT] Usuário não logado, usando localStorage');
      
      // For non-logged users, use localStorage
      const favorites = JSON.parse(localStorage.getItem('zavlo_favorites') || '[]');
      console.log('[PRODUCT] Favoritos atuais:', favorites);
      console.log('[PRODUCT] Estado atual isFavorite:', isFavorite);
      
      if (!isFavorite) {
        console.log('[PRODUCT] Adicionando aos favoritos');
        favorites.push(product.id);
        localStorage.setItem('zavlo_favorites', JSON.stringify(favorites));
        console.log('[PRODUCT] Favoritos após adição:', favorites);
        setIsFavorite(true);
      } else {
        console.log('[PRODUCT] Removendo dos favoritos');
        const updatedFavorites = favorites.filter((id: string) => id !== product.id);
        localStorage.setItem('zavlo_favorites', JSON.stringify(updatedFavorites));
        console.log('[PRODUCT] Favoritos após remoção:', updatedFavorites);
        setIsFavorite(false);
      }
      return;
    }

    try {
      console.log('[PRODUCT] Usuário logado, usando API');
      const userData = JSON.parse(user);
      
      if (!isFavorite) {
        console.log('[PRODUCT] Adicionando favorito via API');
        
        const response = await fetch('http://localhost:3001/api/v1/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
          },
          body: JSON.stringify({
            productId: product.id,
            productTitle: product.title,
            productPrice: product.price,
            productImage: product.images?.[0] || '',
            productUrl: `/product/${product.id}`,
            source: product.source,
          }),
        });

        console.log('[PRODUCT] Resposta da API para adição:', response.status);
        
        if (response.ok) {
          console.log('[PRODUCT] Favorito adicionado com sucesso');
          setIsFavorite(true);
        } else {
          console.error('[PRODUCT] Erro ao adicionar favorito');
        }
      } else {
        console.log('[PRODUCT] Removendo favorito via API');
        
        // Remove from favorites - need to find the favorite ID first
        const favResponse = await fetch('http://localhost:3001/api/v1/favorites', {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
          },
        });
        
        console.log('[PRODUCT] Resposta da busca de favoritos:', favResponse.status);
        
        if (favResponse.ok) {
          const favorites = await favResponse.json();
          console.log('[PRODUCT] Favoritos encontrados:', favorites.length);
          
          const favorite = favorites.find((f: any) => f.productId === product.id);
          console.log('[PRODUCT] Favorito encontrado para remoção:', !!favorite);
          
          if (favorite) {
            const deleteResponse = await fetch(`http://localhost:3001/api/v1/favorites/${favorite.id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${userData.token}`,
              },
            });
            
            console.log('[PRODUCT] Resposta da remoção:', deleteResponse.status);
            
            if (deleteResponse.ok) {
              console.log('[PRODUCT] Favorito removido com sucesso');
              setIsFavorite(false);
            } else {
              console.error('[PRODUCT] Erro ao remover favorito');
            }
          }
        }
      }
    } catch (error) {
      console.error('[PRODUCT] Erro ao favoritar:', error);
    }
  };

  // Check if product is already favorited
  useEffect(() => {
    const checkFavorite = async () => {
      console.log('[PRODUCT] Verificando se produto está favoritado:', product?.id);
      
      const user = localStorage.getItem('zavlo_user');
      console.log('[PRODUCT] Usuário logado para verificação:', !!user);
      
      if (!user) {
        // Check localStorage for non-logged users
        const favorites = JSON.parse(localStorage.getItem('zavlo_favorites') || '[]');
        console.log('[PRODUCT] Favoritos locais:', favorites);
        
        const isFav = favorites.includes(product?.id);
        console.log('[PRODUCT] Produto está favoritado localmente:', isFav);
        
        setIsFavorite(isFav);
        return;
      }

      try {
        console.log('[PRODUCT] Verificando favoritos via API');
        
        const userData = JSON.parse(user);
        const response = await fetch('http://localhost:3001/api/v1/favorites', {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
          },
        });
        
        console.log('[PRODUCT] Resposta da API de favoritos:', response.status);
        
        if (response.ok) {
          const favorites = await response.json();
          console.log('[PRODUCT] Favoritos da API:', favorites.length);
          
          const isFav = favorites.some((f: any) => f.productId === product?.id);
          console.log('[PRODUCT] Produto está favoritado na API:', isFav);
          
          setIsFavorite(isFav);
        } else {
          console.error('[PRODUCT] Erro ao buscar favoritos da API');
        }
      } catch (error) {
        console.error('[PRODUCT] Erro na verificação de favoritos:', error);
      }
    };

    if (product) {
      checkFavorite();
    }
  }, [product]);

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />

      <div className="max-w-7xl mx-auto px-4 pt-20 pb-16">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 mb-6 hover:text-black transition flex items-center gap-2"
        >
          ← Voltar
        </button>

        {/* Product Details - Mobile First */}
        <div className="space-y-6">
          {/* Image - Full width on mobile */}
          <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden">
            {hasImage && !imageError ? (
              <>
                {/* Loading Skeleton */}
                {isLoading && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
                )}

                {/* Image */}
                <img
                  src={currentImageUrl || ''}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  style={{ opacity: isLoading ? 0.5 : 1 }}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  loading="lazy"
                />

                {/* Navigation Buttons - Smaller on mobile */}
                {hasMultipleImages && !isLoading && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition z-20"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition z-20"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Indicators */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                      {product.images.map((_, index) => (
                        <div
                          key={index}
                          className={`h-1.5 rounded-full transition-all ${
                            index === currentImageIndex ? 'bg-white w-4' : 'bg-white/50 w-1.5'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Source Badge */}
                <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium z-20">
                  {product.source}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <svg className="w-16 h-16 md:w-20 md:h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-400 text-sm">Imagem indisponível</p>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-semibold leading-tight">
              {product.title}
            </h1>

            {/* Price */}
            <div className="text-3xl md:text-4xl font-bold text-green-600">
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>

            {/* Specifications - Single column on mobile */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3">Especificações</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 text-sm">Categoria</span>
                  <span className="font-medium text-sm">{product.category || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 text-sm">Fonte</span>
                  <span className="font-medium text-sm">{product.source}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 text-sm">Localização</span>
                  <span className="font-medium text-sm">{location}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 text-sm">Vendedor</span>
                  <span className="font-medium text-sm">{typeof product.seller === 'string' ? product.seller : product.seller?.name || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Descrição</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                {product.description}
              </p>
            </div>

            {/* CTA Buttons - Fixed at bottom on mobile */}
            <div className="sticky bottom-4 z-30 flex gap-3">
              <button
                onClick={toggleFavorite}
                className={`px-6 py-4 rounded-xl font-semibold transition shadow-lg flex items-center justify-center gap-2 ${
                  isFavorite 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <svg className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isFavorite ? 'Favoritado' : 'Favoritar'}
              </button>
              <a
                href={product.sourceUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <button className="w-full px-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition shadow-lg">
                  Ver Anúncio Original
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* Similar Products Section */}
        <div className="mt-16 px-4">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">Produtos Similares</h2>
          <div className="py-16 bg-gray-50 rounded-2xl text-center">
            <p className="text-gray-600 text-sm">Produtos similares em breve...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
