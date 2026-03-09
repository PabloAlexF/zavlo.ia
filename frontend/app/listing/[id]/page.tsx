'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Mail, 
  Share2, 
  Heart, 
  Eye, 
  Clock, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  X,
  Check,
  AlertTriangle,
  ShoppingCart,
  User,
  Calendar
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Toast } from '@/components/ui/Toast';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  condition: 'new' | 'used';
  active: boolean;
  views: number;
  clicks: number;
  location?: { cep?: string; city?: string; state?: string };
  contact?: { phone?: string; whatsapp?: string; email?: string };
  createdAt: string;
  updatedAt?: string;
  // Additional fields
  brand?: string;
  model?: string;
  year?: string;
  specifications?: Record<string, string>;
  shipping?: { available: boolean; cost?: number };
  userId?: string;
}

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMethod, setContactMethod] = useState<'whatsapp' | 'phone' | 'email' | null>(null);
  const [favoriteMessage, setFavoriteMessage] = useState<string | null>(null);

  useEffect(() => {
    loadListing();
  }, [resolvedParams.id]);

  const loadListing = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/listings/${resolvedParams.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setListing(data);
        
        // Increment views
        fetch(`http://localhost:3001/api/v1/listings/${resolvedParams.id}/view`, {
          method: 'POST',
        }).catch(() => {});
        
        // Check if is favorite
        const favorites = JSON.parse(localStorage.getItem('zavlo_favorites') || '[]');
        setIsFavorite(favorites.includes(resolvedParams.id));
      } else {
        setError('Anúncio não encontrado');
      }
    } catch (err) {
      console.error('Error loading listing:', err);
      setError('Erro ao carregar o anúncio');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('zavlo_favorites') || '[]');
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== resolvedParams.id);
      setFavoriteMessage('Removido dos favoritos');
    } else {
      newFavorites = [...favorites, resolvedParams.id];
      setFavoriteMessage('Adicionado aos favoritos!');
    }
    
    localStorage.setItem('zavlo_favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
    
    // Clear message after 3 seconds
    setTimeout(() => setFavoriteMessage(null), 3000);
  };

  const shareListing = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: `Olha esse produto: ${listing?.title}`,
          url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert('Link copiado para a área de transferência!');
    }
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'Data não disponível';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data não disponível';
      
      return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Data não disponível';
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const nextImage = () => {
    if (listing && listing.images.length > 0) {
      setSelectedImage((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing && listing.images.length > 0) {
      setSelectedImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  const getWhatsappLink = () => {
    if (!listing?.contact?.whatsapp) return '#';
    const phone = listing.contact.whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá! Estou interessado no anúncio: ${listing.title}`);
    return `https://wa.me/${phone}?text=${message}`;
  };

  const getPhoneLink = () => {
    if (!listing?.contact?.phone) return '#';
    return `tel:${listing.contact.phone.replace(/\D/g, '')}`;
  };

  const getEmailLink = () => {
    if (!listing?.contact?.email) return '#';
    const subject = encodeURIComponent(`Interesse no anúncio: ${listing.title}`);
    const body = encodeURIComponent(`Olá! Estou interessado no seu anúncio "${listing.title}".\n\nLink: ${window.location.href}`);
    return `mailto:${listing.contact.email}?subject=${subject}&body=${body}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F]">
        <Header />
        <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded w-32 mb-6" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-white/10 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 bg-white/10 rounded w-3/4" />
                <div className="h-12 bg-white/10 rounded w-1/3" />
                <div className="h-24 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#0B0B0F]">
        <Header />
        <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Anúncio não encontrado</h1>
            <p className="text-gray-400 mb-8">{error || 'Este anúncio pode ter sido removido ou nunca existiu.'}</p>
            <button
              onClick={() => router.push('/marketplace')}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
            >
              Ver outros anúncios
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categoryLabels: Record<string, string> = {
    geral: 'Geral',
    eletronicos: 'Eletrônicos',
    roupas: 'Roupas e Acessórios',
    casa: 'Casa e Jardim',
    veiculos: 'Veículos',
    esportes: 'Esportes e Lazer',
    livros: 'Livros e Revistas',
    moveis: 'Móveis',
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <button onClick={() => router.back()} className="hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <span>/</span>
          <button onClick={() => router.push('/marketplace')} className="hover:text-white transition-colors">
            Marketplace
          </button>
          <span>/</span>
          <span className="text-white truncate max-w-xs">{listing.title}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white/5 rounded-2xl overflow-hidden group">
              {listing.images && listing.images.length > 0 ? (
                <>
                  <img
                    src={listing.images[selectedImage]}
                    alt={listing.title}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600"%3E%3Crect fill="%231a1a2e" width="600" height="600"/%3E%3Ctext fill="%23ffffff" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESem Imagem%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  
                  {/* Image Navigation */}
                  {listing.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 text-white text-sm rounded-full">
                        {selectedImage + 1} / {listing.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">Sem imagens</p>
                  </div>
                </div>
              )}
              
              {/* Condition Badge */}
              <span className="absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm border border-white/20 bg-black/50 text-white">
                {listing.condition === 'new' ? '✨ Novo' : '🔹 Usado'}
              </span>
            </div>

            {/* Thumbnails */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-blue-500 ring-2 ring-blue-500/50' 
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${listing.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl font-bold text-white">{listing.title}</h1>
                <div className="flex gap-2">
                  <button
                    onClick={shareListing}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
                    title="Compartilhar"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={toggleFavorite}
                    className={`p-3 rounded-xl transition-colors ${
                      isFavorite 
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
              
              <p className="text-4xl font-black text-green-400">
                {formatPrice(listing.price)}
              </p>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-4">
              {listing.category && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                  <span className="text-gray-400 text-sm">Categoria:</span>
                  <span className="text-white font-medium">{categoryLabels[listing.category] || listing.category}</span>
                </div>
              )}
              
              {(listing.brand || listing.model || listing.year) && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                  {listing.brand && <span className="text-white">{listing.brand}</span>}
                  {listing.model && <span className="text-gray-400">{listing.model}</span>}
                  {listing.year && <span className="text-gray-400">{listing.year}</span>}
                </div>
              )}
            </div>

            {/* Location */}
            {listing.location && (listing.location.city || listing.location.state) && (
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Localização</p>
                  <p className="text-white font-medium">
                    {listing.location.city}{listing.location.city && listing.location.state ? ', ' : ''}{listing.location.state}
                  </p>
                  {listing.location.cep && (
                    <p className="text-gray-500 text-sm">CEP: {listing.location.cep}</p>
                  )}
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${listing.location.city}, ${listing.location.state}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                >
                  Ver no mapa
                </a>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{listing.views || 0} visualizações</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Publicado em {formatDate(listing.createdAt)}</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Descrição</h3>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Specifications */}
            {(listing.specifications && Object.keys(listing.specifications).length > 0) || listing.brand || listing.model || listing.year ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Especificações</h3>
                
                {/* Table format: Marca Modelo in columns */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[280px]">
                    <tbody>
                      {listing.brand && (
                        <tr className="border-b border-white/5">
                          <td className="py-3 text-gray-400 font-medium w-1/3">Marca</td>
                          <td className="py-3 text-white font-semibold">{listing.brand}</td>
                        </tr>
                      )}
                      {listing.model && (
                        <tr className="border-b border-white/5">
                          <td className="py-3 text-gray-400 font-medium">Modelo</td>
                          <td className="py-3 text-white font-semibold">{listing.model}</td>
                        </tr>
                      )}
                      {listing.year && (
                        <tr className="border-b border-white/5">
                          <td className="py-3 text-gray-400 font-medium">Ano</td>
                          <td className="py-3 text-white font-semibold">{listing.year}</td>
                        </tr>
                      )}
                      {listing.specifications && Object.entries(listing.specifications).map(([key, value]) => (
                        <tr key={key} className="border-b border-white/5">
                          <td className="py-3 text-gray-400 font-medium">{key}</td>
                          <td className="py-3 text-white font-semibold">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {/* Contact Button */}
            <button
              onClick={() => setShowContactModal(true)}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-3"
            >
              <MessageCircle className="w-6 h-6" />
              Falar com o Vendedor
            </button>

            {/* Safety Tips */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-yellow-400 font-semibold mb-1">Dicas de Segurança</p>
                  <ul className="text-gray-400 space-y-1">
                    <li>• Nunca faça pagamentos antecipados</li>
                    <li>• PrefiraMeet em locais públicos</li>
                    <li>• Verifique o produto antes de comprar</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {showImageModal && listing.images.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-8 h-8" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <img
            src={listing.images[selectedImage]}
            alt={listing.title}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {listing.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); setSelectedImage(index); }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  selectedImage === index ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowContactModal(false)}
        >
          <div 
            className="bg-[#1a1a2e] border border-white/20 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Contatar Vendedor</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {listing.contact?.whatsapp && (
                <a
                  href={getWhatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl transition-colors"
                  onClick={() => setShowContactModal(false)}
                >
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">WhatsApp</p>
                    <p className="text-green-400 text-sm">{listing.contact.whatsapp}</p>
                  </div>
                </a>
              )}

              {listing.contact?.phone && (
                <a
                  href={getPhoneLink()}
                  className="flex items-center gap-4 p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl transition-colors"
                  onClick={() => setShowContactModal(false)}
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Telefone</p>
                    <p className="text-blue-400 text-sm">{listing.contact.phone}</p>
                  </div>
                </a>
              )}

              {listing.contact?.email && (
                <a
                  href={getEmailLink()}
                  className="flex items-center gap-4 p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl transition-colors"
                  onClick={() => setShowContactModal(false)}
                >
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">E-mail</p>
                    <p className="text-purple-400 text-sm">{listing.contact.email}</p>
                  </div>
                </a>
              )}

              {!listing.contact?.whatsapp && !listing.contact?.phone && !listing.contact?.email && (
                <div className="text-center py-8 text-gray-400">
                  <p>Este vendedor não disponibilizou informações de contato.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Favorite Toast */}
      {favoriteMessage && (
        <Toast
          message={favoriteMessage}
          type={isFavorite ? 'error' : 'success'}
          onClose={() => setFavoriteMessage(null)}
        />
      )}
    </div>
  );
}

