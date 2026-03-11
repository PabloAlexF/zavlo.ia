'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Image as ImageIcon, Smartphone, Car, Home, ShoppingBag, Zap, CheckCircle, Sparkles, Upload, Camera } from 'lucide-react';
import TextSearchModal from '@/components/modals/TextSearchModal';
import ProductIdentifiedModal from '@/components/modals/ProductIdentifiedModal';

interface SearchHubProps {
  onSearch?: (query: string) => void;
  onImageSearch?: (file: File) => void;
  initialValue?: string;
}

export function SearchHub({ onSearch, onImageSearch, initialValue = '' }: SearchHubProps) {
  const [query, setQuery] = useState(initialValue);
  const [activeMode, setActiveMode] = useState<'text' | 'image'>('text');
  const [dragActive, setDragActive] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [identifiedProduct, setIdentifiedProduct] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [userCredits, setUserCredits] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const router = useRouter();

  // Ensure this runs only on client side
  useEffect(() => {
    setIsMounted(true);
    loadUserCredits();
  }, []);

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

  const getUserCredits = () => {
    return userCredits;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        router.push('/auth');
        return;
      }

      // Mostrar modal de confirmação
      setShowTextModal(true);
    }
  };

  const confirmTextSearch = () => {
    setShowTextModal(false);
    if (onSearch) {
      onSearch(query);
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}&type=text`);
    }
    
    // Recarregar créditos do usuário
    setTimeout(() => {
      loadUserCredits();
    }, 1000);
  };

  const handleImageUpload = async (file: File) => {
    if (file) {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        router.push('/auth');
        return;
      }

      console.log('📸 Iniciando upload de imagem:', file.name, file.size, 'bytes');
      setUploadedImage(file);
      setIsIdentifying(true);

      try {
        const userData = JSON.parse(user);
        
        // Primeiro, fazer upload para o Cloudinary para obter URL pública
        console.log('☁️ Fazendo upload para Cloudinary...');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'zavlo_preset');
        
        const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dj2nkf9od/image/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!cloudinaryResponse.ok) {
          const errorText = await cloudinaryResponse.text();
          console.error('❌ Erro Cloudinary:', errorText);
          throw new Error(`Cloudinary error: ${cloudinaryResponse.status}`);
        }
        
        const cloudinaryData = await cloudinaryResponse.json();
        
        if (!cloudinaryData.secure_url) {
          console.error('❌ Cloudinary não retornou URL');
          throw new Error('Cloudinary não retornou URL da imagem');
        }
        
        const imageUrl = cloudinaryData.secure_url;
        console.log('✅ Imagem hospedada no Cloudinary:', imageUrl);
        
        // Remover versão da URL para compatibilidade com Apify
        const cleanUrl = imageUrl.replace(/\/v\d+\//, '/');
        console.log('🔧 URL limpa:', cleanUrl);
        setImageUrl(cleanUrl); // Armazenar URL para busca posterior
        
        // Agora enviar a URL para a API de busca por imagem
        console.log('🔍 Enviando URL para API...');
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${API_URL}/search/image`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl: cleanUrl })
        });
        
        console.log('📡 Resposta recebida:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Produto identificado:', data);
          
          // Get product name from response
          const productName = data.results?.productName || data.productName || 'Produto não identificado';
          setIdentifiedProduct(productName);
          console.log('🎯 Abrindo modal com produto:', productName);
        } else {
          const errorData = await response.json();
          console.error('❌ Erro na resposta:', errorData);
          
          // Se falhar, tenta identificar apenas
          const identifyResponse = await fetch(`${API_URL}/scraping/identify-product`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${userData.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageUrl: cleanUrl })
          });
          
          if (identifyResponse.ok) {
            const identifyData = await identifyResponse.json();
            setIdentifiedProduct(identifyData.productName || 'Produto não identificado');
          } else {
            setIdentifiedProduct('Produto não identificado');
          }
        }
      } catch (error) {
        console.error('❌ Erro ao identificar produto:', error);
        setIdentifiedProduct('Erro ao identificar produto');
      }
      
      setIsIdentifying(false);
      setShowImageModal(true);
    }
  };

  const confirmImageSearch = () => {
    console.log('🔍 Iniciando busca por:', identifiedProduct);
    console.log('🔗 URL da imagem:', imageUrl);
    setShowImageModal(false);
    if (onImageSearch && uploadedImage) {
      onImageSearch(uploadedImage);
    } else {
      // Enviar URL da imagem + nome do produto editado
      router.push(`/search?q=${encodeURIComponent(identifiedProduct)}&type=image&imageUrl=${encodeURIComponent(imageUrl)}`);
    }
    
    // Recarregar créditos do usuário
    setTimeout(() => {
      loadUserCredits();
    }, 1000);
  };

  const handleQuickSearch = (searchQuery: string) => {
    const user = localStorage.getItem('zavlo_user');
    if (!user) {
      router.push('/auth');
      return;
    }

    setQuery(searchQuery);
    setShowTextModal(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 handleFileInput chamado');
    const file = e.target.files?.[0];
    console.log('📁 Arquivo:', file);
    if (file) {
      console.log('✅ Arquivo válido, chamando handleImageUpload');
      handleImageUpload(file);
    } else {
      console.log('❌ Nenhum arquivo selecionado');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 relative z-20">
      {/* Mode Toggle */}
      <div className="flex bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-1 mb-8 w-fit mx-auto">
        <button
          onClick={() => setActiveMode('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
            activeMode === 'text'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Search className="w-4 h-4" />
          Texto
        </button>
        <button
          onClick={() => setActiveMode('image')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all relative ${
            activeMode === 'image'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          IA
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </button>
      </div>

      {/* Content */}
      {activeMode === 'text' ? (
        <div className="space-y-4">
          {/* Search Input */}
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="O que você está procurando?"
                className="w-full h-16 pl-6 pr-16 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl text-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-2xl"
              />
              <button 
                type="submit"
                className="absolute right-2 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white hover:scale-105 transition-transform shadow-lg"
              >
                <Search className="w-6 h-6" />
              </button>
            </div>
          </form>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { 
                icon: <Smartphone className="w-5 h-5" />,
                text: 'Celulares', 
                query: 'smartphone',
                color: 'text-blue-400'
              },
              { 
                icon: <Car className="w-5 h-5" />,
                text: 'Carros',
                query: 'carro',
                color: 'text-green-400'
              },
              { 
                icon: <Home className="w-5 h-5" />,
                text: 'Imóveis',
                query: 'apartamento',
                color: 'text-purple-400'
              },
              { 
                icon: <ShoppingBag className="w-5 h-5" />,
                text: 'Roupas',
                query: 'roupas',
                color: 'text-pink-400'
              },
            ].map((item) => (
              <button
                key={item.text}
                onClick={() => handleQuickSearch(item.query)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <div className={`p-1 ${item.color}`}>{item.icon}</div>
                <span className="text-sm font-medium text-gray-300 group-hover:text-white">{item.text}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* AI Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
                : getUserCredits() > 0 
                  ? 'border-white/20 bg-white/5 hover:bg-white/10'
                  : 'border-red-500/30 bg-red-500/5'
            }`}
          >
            <div className="space-y-4">
              {/* AI Icon */}
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
                getUserCredits() > 0
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500'
                  : 'bg-gradient-to-br from-gray-600 to-gray-700'
              }`}>
                <Camera className="w-8 h-8 text-white" />
              </div>

              <div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  getUserCredits() > 0 ? 'text-white' : 'text-gray-400'
                }`}>
                  Busca por Imagem com IA
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {getUserCredits() > 0 
                    ? 'Tire uma foto ou escolha da galeria'
                    : 'Você não possui créditos suficientes'
                  }
                </p>
              </div>

              {/* Upload Button */}
              {getUserCredits() > 0 ? (
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={isIdentifying}
                  />
                  <div className={`w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl flex items-center justify-center font-medium cursor-pointer hover:scale-105 transition-transform shadow-lg ${
                    isIdentifying ? 'opacity-50 cursor-not-allowed' : ''
                  }`}>
                    {isIdentifying ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Identificando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Escolher Foto
                      </>
                    )}
                  </div>
                </label>
              ) : (
                <button
                  onClick={() => router.push('/plans')}
                  className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl flex items-center justify-center font-medium cursor-pointer hover:scale-105 transition-transform shadow-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Adquirir Créditos
                </button>
              )}

              <p className="text-xs text-gray-500">
                {getUserCredits() > 0 
                  ? 'ou arraste uma imagem aqui'
                  : `Você tem ${getUserCredits()} créditos disponíveis`
                }
              </p>
            </div>
          </div>

          {/* AI Features */}
          <div className="space-y-3">
            {[
              { 
                icon: <Zap className="w-5 h-5 text-yellow-400" />,
                title: 'Reconhecimento instantâneo' 
              },
              { 
                icon: <CheckCircle className="w-5 h-5 text-green-400" />,
                title: 'Resultados precisos' 
              },
              { 
                icon: <Search className="w-5 h-5 text-blue-400" />,
                title: 'Comparação em 9+ marketplaces' 
              },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="p-1">{feature.icon}</div>
                <span className="text-sm font-medium text-gray-300">{feature.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modais */}
      <TextSearchModal
        isOpen={showTextModal}
        onClose={() => setShowTextModal(false)}
        onConfirm={confirmTextSearch}
        userCredits={getUserCredits()}
      />

      <ProductIdentifiedModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onSearch={confirmImageSearch}
        productName={identifiedProduct}
        onEdit={(name) => setIdentifiedProduct(name)}
        userCredits={getUserCredits()}
      />
    </div>
  );
}

