'use client';

import { Product } from '@/types';
import Link from 'next/link';
import { useState, useCallback } from 'react';
import { Heart, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

// Mapeamento de nomes amigáveis dos marketplaces
function getSourceName(source: string): string {
  const sourceMap: Record<string, string> = {
    'amazon.com.br': 'Amazon',
    'kabum.com.br': 'Kabum',
    'olx.com.br': 'OLX',
    'enjoei.com.br': 'Enjoei',
    'mercadolivre.com.br': 'Mercado Livre',
    'magazineluiza.com.br': 'Magazine Luiza',
  };
  return sourceMap[source] || source;
}

// Cores por marketplace
function getSourceColor(source: string): string {
  const colorMap: Record<string, string> = {
    'amazon.com.br': 'from-orange-400 to-yellow-500',
    'kabum.com.br': 'from-orange-600 to-orange-700',
    'olx.com.br': 'from-purple-500 to-purple-600',
    'enjoei.com.br': 'from-pink-500 to-rose-500',
    'mercadolivre.com.br': 'from-yellow-400 to-yellow-500',
    'magazineluiza.com.br': 'from-blue-400 to-blue-500',
  };
  return colorMap[source] || 'from-blue-500 to-purple-500';
}

export function ProductCard({ product }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageRetries, setImageRetries] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Normalizar images para sempre ser array
  const images = product.images || [];
  const hasImage = images.length > 0;
  const hasMultipleImages = images.length > 1;
  const location = typeof product.location === 'string' ? product.location : `${product.location?.city || ''}, ${product.location?.state || ''}`;

  const currentImageUrl = hasImage ? images[currentImageIndex] : null;

  const nextImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
    setImageError(false);
    setIsLoading(true);
  }, [images.length]);

  const prevImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setImageError(false);
    setIsLoading(true);
  }, [images.length]);

  const handleImageError = useCallback(() => {
    if (imageRetries < 1 && images.length > 1 && currentImageIndex < images.length - 1) {
      setImageRetries(imageRetries + 1);
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
      setImageError(false);
      setIsLoading(true);
    } else {
      setImageError(true);
      setIsLoading(false);
    }
  }, [currentImageIndex, imageRetries, images.length]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setImageRetries(0);
  }, []);

  const toggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const user = localStorage.getItem('zavlo_user');
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    try {
      const userData = JSON.parse(user);
      
      if (!isFavorite) {
        const response = await fetch('http://localhost:3001/api/v1/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
          },
          body: JSON.stringify({
            id: product.id,
            title: product.title,
            price: product.price,
            image: images[0] || '',
            url: product.sourceUrl,
            source: product.source,
          }),
        });

        if (response.ok) {
          setIsFavorite(true);
          
          // Mostrar toast de sucesso
          const toast = document.createElement('div');
          toast.className = 'fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in';
          toast.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Salvo nos favoritos!</span>
          `;
          document.body.appendChild(toast);
          
          setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
    }
  }, [isFavorite, product, images]);

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
        <div className="relative w-full bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl overflow-hidden mb-4 shadow-lg border border-white/10" style={{ height: '280px' }}>
          {hasImage && !imageError ? (
            <>
              {/* Loading Skeleton */}
              {isLoading && (
                <div className="absolute inset-0 bg-white/10 animate-pulse z-10" />
              )}

              {/* Image */}
              <img
                src={currentImageUrl || ''}
                alt={product.title}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  display: 'block',
                  opacity: isLoading ? 0.5 : 1,
                  transition: 'opacity 0.2s'
                }}
                onError={handleImageError}
                onLoad={handleImageLoad}
                loading="lazy"
              />

              {/* Navigation Buttons */}
              {hasMultipleImages && !isLoading && (
                <>
                  <button
                    onClick={prevImage}
                    aria-label="Imagem anterior"
                    style={{ 
                      position: 'absolute', 
                      left: '8px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      zIndex: 20 
                    }}
                    className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 active:scale-90"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={nextImage}
                    aria-label="Próxima imagem"
                    style={{ 
                      position: 'absolute', 
                      right: '8px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      zIndex: 20 
                    }}
                    className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 active:scale-90"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Indicators */}
                  <div 
                    style={{ 
                      position: 'absolute', 
                      bottom: '12px', 
                      left: '50%', 
                      transform: 'translateX(-50%)', 
                      zIndex: 20 
                    }} 
                    className="flex gap-1.5"
                  >
                    {images.map((_, index) => (
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
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  right: '12px', 
                  zIndex: 20 
                }} 
                className={`px-3 py-1 bg-gradient-to-r ${getSourceColor(product.source)} rounded-full text-xs font-semibold text-white whitespace-nowrap shadow-lg`}
              >
                {getSourceName(product.source)}
              </div>

              {/* Favorite Button */}
              <button
                onClick={toggleFavorite}
                style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  left: '12px', 
                  zIndex: 20 
                }}
                className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                  isFavorite 
                    ? 'bg-red-500/90 scale-110' 
                    : 'bg-black/40 hover:bg-black/60'
                }`}
                aria-label="Favoritar"
              >
                <Heart 
                  className={`w-5 h-5 transition-all ${
                    isFavorite ? 'fill-white text-white' : 'text-white'
                  }`}
                />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 bg-white/5">
              <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-gray-500">Imagem indisponível</p>
            </div>
          )}
        </div>
        
        <div className="mt-3 space-y-2">
          <h3 className="font-medium text-white line-clamp-2 group-hover:text-purple-300 transition-colors text-sm sm:text-base">
            {product.title}
          </h3>
          
          <div className="flex items-center justify-between gap-2">
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-gray-500 text-right max-w-[100px] truncate">
              {location}
            </span>
          </div>

          {/* Action Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              window.open(product.sourceUrl, '_blank');
            }}
            className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-500/20"
          >
            Ver Produto
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
