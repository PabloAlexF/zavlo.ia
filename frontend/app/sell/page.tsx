'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Toast } from '@/components/ui/Toast';
import { 
  Camera, Tag, MapPin, Phone, Truck, Shield, Check, X, ChevronRight,
  Package, Smartphone, Laptop, Car, Sofa, Home, Shirt, Dumbbell, 
  BookOpen, Wheat, Briefcase, Sparkles, Upload, AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  { value: 'celulares', label: 'Celulares', icon: Smartphone, color: 'from-blue-500 to-cyan-500' },
  { value: 'informatica', label: 'Informática', icon: Laptop, color: 'from-purple-500 to-pink-500' },
  { value: 'veiculos', label: 'Veículos', icon: Car, color: 'from-green-500 to-emerald-500' },
  { value: 'moveis', label: 'Móveis', icon: Sofa, color: 'from-orange-500 to-red-500' },
  { value: 'casa', label: 'Casa', icon: Home, color: 'from-yellow-500 to-orange-500' },
  { value: 'roupas', label: 'Roupas', icon: Shirt, color: 'from-pink-500 to-rose-500' },
  { value: 'esportes', label: 'Esportes', icon: Dumbbell, color: 'from-cyan-500 to-blue-500' },
  { value: 'livros', label: 'Livros', icon: BookOpen, color: 'from-indigo-500 to-purple-500' },
  { value: 'agro', label: 'Agro', icon: Wheat, color: 'from-green-600 to-green-700' },
  { value: 'servicos', label: 'Serviços', icon: Briefcase, color: 'from-gray-500 to-gray-600' },
  { value: 'geral', label: 'Geral', icon: Package, color: 'from-blue-600 to-purple-600' },
];

const STEPS = [
  { id: 1, title: 'Fotos', icon: Camera, desc: 'Adicione imagens' },
  { id: 2, title: 'Detalhes', icon: Tag, desc: 'Informações do produto' },
  { id: 3, title: 'Localização', icon: MapPin, desc: 'Onde está?' },
  { id: 4, title: 'Contato', icon: Phone, desc: 'Como te achar' },
];

export default function SellPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [specifications, setSpecifications] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'geral',
    condition: 'used',
    cep: '',
    phone: '',
    whatsapp: '',
    email: '',
    images: [] as string[],
    shipping: false,
  });

  const formatPrice = (value: string) => {
    const num = value.replace(/\D/g, '').slice(0, 10);
    if (!num) return '';
    const formatted = (parseInt(num) / 100).toFixed(2).replace('.', ',');
    return formatted.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  };

  const formatCEP = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
  };

  const formatPhone = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d)/, '($1) $2-$3').slice(0, 15);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.images.length > 0;
      case 2: {
        const priceNum = parseFloat(formData.price.replace(/\./g, '').replace(',', '.'));
        return formData.title.trim().length >= 3 && 
               formData.description.trim().length >= 10 && 
               formData.price && 
               priceNum > 0 && 
               priceNum <= 999999.99;
      }
      case 3: return formData.cep.replace(/\D/g, '').length === 8;
      case 4: return formData.phone || formData.whatsapp || formData.email;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    const user = localStorage.getItem('zavlo_user');
    if (!user) {
      router.push('/auth');
      return;
    }

    if (!formData.title || !formData.description || !formData.price || !formData.cep) {
      setToast({ message: 'Preencha todos os campos obrigatorios', type: 'error' });
      return;
    }

    if (formData.title.trim().length < 3) {
      setToast({ message: 'Titulo deve ter no minimo 3 caracteres', type: 'error' });
      return;
    }

    if (formData.description.trim().length < 10) {
      setToast({ message: 'Descricao deve ter no minimo 10 caracteres', type: 'error' });
      return;
    }

    const priceNum = parseFloat(formData.price.replace(/\./g, '').replace(',', '.'));
    if (priceNum <= 0 || priceNum > 999999.99) {
      setToast({ message: 'Preco deve estar entre R$ 0,01 e R$ 999.999,99', type: 'error' });
      return;
    }

    if (formData.images.length === 0) {
      setToast({ message: 'Adicione pelo menos 1 foto', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const userData = JSON.parse(user);
      
      let location = null;
      try {
        const cepResponse = await fetch(`process.env.NEXT_PUBLIC_API_URL/locations/cep/${formData.cep.replace(/\D/g, '')}`);
        if (cepResponse.ok) {
          const cepText = await cepResponse.text();
          if (cepText) location = JSON.parse(cepText);
        }
      } catch (cepError) {
        console.warn('CEP lookup failed:', cepError);
      }

      const listingData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price.replace(/\./g, '').replace(',', '.')),
        category: formData.category,
        condition: formData.condition,
        images: formData.images,
        source: 'zavlo',
        sourceUrl: window.location.origin,
        state: location?.state || 'MG',
        city: location?.city || 'Belo Horizonte',
        sellerName: userData.name || userData.email || 'Vendedor',
        cep: formData.cep.replace(/\D/g, ''),
        contact: {
          phone: formData.phone ? formData.phone.replace(/\D/g, '') : undefined,
          whatsapp: formData.whatsapp ? formData.whatsapp.replace(/\D/g, '') : undefined,
          email: formData.email || undefined,
        },
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        shipping: { available: formData.shipping },
      };
      
      console.log('Sending to API:', listingData);
      
      const response = await fetch('process.env.NEXT_PUBLIC_API_URL/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`,
        },
        body: JSON.stringify(listingData),
      });

      const responseData = await response.json();
      console.log('API Response:', responseData);

      if (response.ok) {
        setToast({ message: 'Anuncio criado com sucesso!', type: 'success' });
        setTimeout(() => router.push('/my-listings'), 2000);
      } else {
        const errorMsg = Array.isArray(responseData?.message) 
          ? responseData.message.join(', ')
          : typeof responseData?.message === 'string'
          ? responseData.message
          : 'Erro ao criar anuncio';
        setToast({ message: errorMsg, type: 'error' });
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      setToast({ message: 'Erro ao criar anuncio. Verifique sua conexao.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const formDataImg = new FormData();
        formDataImg.append('file', file);
        formDataImg.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'zavlo_preset');

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo'}/image/upload`,
          { method: 'POST', body: formDataImg }
        );

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.secure_url);
        }
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls].slice(0, 10)
      }));
      setToast({ message: `${uploadedUrls.length} imagem(ns) enviada(s)!`, type: 'success' });
    } catch (error) {
      setToast({ message: 'Erro ao enviar imagens', type: 'error' });
    } finally {
      setUploadingImages(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] relative overflow-hidden">
      <Header />
      
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a2e12_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e12_1px,transparent_1px)] bg-[size:32px_32px]" />
      
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-8 max-w-4xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Venda Rápido</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2">
            Criar Anúncio
          </h1>
          <p className="text-gray-400">Preencha os dados e publique em minutos</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <motion.div
                  className="flex flex-col items-center flex-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2 transition-all ${
                    currentStep >= step.id 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/50' 
                      : 'bg-white/5 border border-white/10'
                  }`}>
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    ) : (
                      <step.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${currentStep >= step.id ? 'text-white' : 'text-gray-500'}`} />
                    )}
                  </div>
                  <span className={`text-xs sm:text-sm font-medium hidden sm:block ${currentStep >= step.id ? 'text-white' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </motion.div>
                {index < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 transition-all ${
                    currentStep > step.id ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10"
          >
            {/* Step 1: Photos */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Adicione Fotos</h2>
                  <p className="text-gray-400 text-sm">Anúncios com fotos vendem 5x mais rápido</p>
                </div>

                <label className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-blue-500/50 transition-colors cursor-pointer block">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                    className="hidden"
                  />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">
                    {uploadingImages ? 'Enviando...' : 'Clique para adicionar fotos'}
                  </p>
                  <p className="text-gray-500 text-sm">Até 10 imagens • PNG, JPG até 5MB</p>
                </label>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Detalhes do Produto</h2>
                  <p className="text-gray-400 text-sm">Quanto mais informações, melhor</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Título *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Ex: iPhone 13 Pro Max 256GB"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Descrição *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                      placeholder="Descreva seu produto..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Preço (R$) <span className="text-red-400">*</span>
                        <span className="text-xs text-gray-500 ml-2">(máx: R$ 999.999,99)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                        <input
                          type="text"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: formatPrice(e.target.value) }))}
                          className={`w-full bg-white/10 border rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                            formData.price && parseFloat(formData.price.replace(/\./g, '').replace(',', '.')) > 999999.99 
                              ? 'border-red-500' 
                              : 'border-white/20 focus:border-blue-500'
                          }`}
                          placeholder="0,00"
                        />
                      </div>
                      {formData.price && parseFloat(formData.price.replace(/\./g, '').replace(',', '.')) > 999999.99 && (
                        <p className="text-xs text-red-400 mt-1">Valor máximo excedido</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Categoria *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value} className="bg-gray-900">{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Condição</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['new', 'used'].map((cond) => (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, condition: cond as 'new' | 'used' }))}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.condition === cond
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <span className="text-white font-medium">{cond === 'new' ? 'Novo' : 'Usado'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Localização</h2>
                  <p className="text-gray-400 text-sm">Onde o produto está localizado?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">CEP *</label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => setFormData(prev => ({ ...prev, cep: formatCEP(e.target.value) }))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <Shield className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <p className="text-sm text-gray-300">Seu endereço completo não será exibido publicamente</p>
                </div>
              </div>
            )}

            {/* Step 4: Contact */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Informações de Contato</h2>
                  <p className="text-gray-400 text-sm">Como os compradores podem te encontrar?</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp</label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: formatPhone(e.target.value) }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.shipping}
                      onChange={(e) => setFormData(prev => ({ ...prev, shipping: e.target.checked }))}
                      className="w-5 h-5 accent-blue-500 rounded"
                    />
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-gray-400" />
                      <span className="text-white">Aceito enviar via transportadora</span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-6 mb-8">
          {currentStep > 1 && (
            <motion.button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex-1 bg-white/10 border border-white/20 text-white py-4 rounded-xl font-medium hover:bg-white/20 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Voltar
            </motion.button>
          )}
          
          {currentStep < 4 ? (
            <motion.button
              type="button"
              onClick={() => canProceed() && setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
              whileHover={canProceed() ? { scale: 1.02 } : {}}
              whileTap={canProceed() ? { scale: 0.98 } : {}}
            >
              Continuar
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !canProceed()}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
              whileHover={canProceed() ? { scale: 1.02 } : {}}
              whileTap={canProceed() ? { scale: 0.98 } : {}}
            >
              {loading ? 'Publicando...' : 'Publicar Anúncio'}
              <Check className="w-5 h-5" />
            </motion.button>
          )}
        </div>
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
