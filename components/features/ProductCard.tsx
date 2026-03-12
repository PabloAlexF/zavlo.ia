'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { getUser } from '@/utils/auth';
import { toast } from 'sonner';
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

export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const { user } = useUser();
  const fallbackUser = getUser(); // Fallback para casos sem context
  const currentUser = user || fallbackUser;
  
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
    
    if (!currentUser?.token) {
      window.location.href = '/auth';
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zavlo-ia.onrender.com/api/v1';
      const response = await fetch(`${API_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
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
        toast.success("Salvo nos favoritos!");
      } else {
        toast.error("Erro ao salvar favorito");
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      toast.error("Erro ao favoritar");
    }
  }, [currentUser, product, images, isFavorite]);

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
        <div className="relative w-full bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl overflow-hidden mb-4 shadow-lg border border-white/10" style={{ height: '280px', position: 'relative' }}>
          {hasImage && !imageError ? (
            <>
              {/* Loading Skeleton */}
              {isLoading && (
                <div className="absolute inset-0 bg-white/10 animate-pulse z-10" />
              )}

              {/* Next.js Image */}
              <Image
                src={currentImageUrl || ''}
                alt={product.title}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 25vw"
                onError={handleImageError}
                onLoadingComplete={handleImageLoad}
                priority={false}
              />

              {/* Navigation Buttons */}
              {hasMultipleImages && !isLoading && (
                <>
                  <button
                    onClick={prevImage}
                    aria-label="Imagem anterior"
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 active:scale-90 z-20"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={nextImage}
                    aria-label="Próxima imagem"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 active:scale-90 z-20"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20" >
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
              <div className={`absolute top-3 right-3 px-3 py-1 bg-gradient-to-r ${getSourceColor(product.source)} rounded-full text-xs font-semibold text-white whitespace-nowrap shadow-lg z-20`}>
                {getSourceName(product.source)}
              </div>

              {/* Favorite Button */}
              <button
                onClick={toggleFavorite}
                className={`absolute top-3 left-3 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all z-20 ${
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
});

ProductCard.displayName = 'ProductCard';
