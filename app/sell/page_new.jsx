'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Tag, MapPin, Phone, Truck, Shield, Check, X, ChevronRight, Package, Smartphone, Laptop, Car, Sofa, Home, Shirt, Dumbbell, BookOpen, Wheat, Briefcase, Sparkles, Upload } from 'lucide-react';
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
export default function SellPageNew() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
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
        images: [],
        shipping: false,
    });
    const formatPrice = (value) => {
        const num = value.replace(/\\D/g, '');
        if (!num)
            return '';
        return (parseInt(num) / 100).toFixed(2);
    };
    const formatCEP = (value) => {
        return value.replace(/\\D/g, '').replace(/(\\d{5})(\\d)/, '$1-$2').slice(0, 9);
    };
    const formatPhone = (value) => {
        return value.replace(/\\D/g, '').replace(/(\\d{2})(\\d{5})(\\d)/, '($1) $2-$3').slice(0, 15);
    };
    const canProceed = () => {
        switch (currentStep) {
            case 1: return formData.images.length > 0;
            case 2: return formData.title && formData.description && formData.price;
            case 3: return formData.cep.replace(/\\D/g, '').length === 8;
            case 4: return formData.phone || formData.whatsapp || formData.email;
            default: return false;
        }
    };
    const handleSubmit = async () => {
        setLoading(true);
        // Submit logic here
        setTimeout(() => {
            setLoading(false);
            router.push('/my-listings');
        }, 2000);
    };
    return (<div className="min-h-screen bg-[#0B0B0F] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a2e12_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e12_1px,transparent_1px)] bg-[size:32px_32px]"/>
      
      <main className="relative z-10 container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        {/* Header */}
        <motion.div className="text-center mb-8 sm:mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-blue-400"/>
            <span className="text-sm font-medium text-gray-300">Venda Rápido</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2">
            Criar Anúncio
          </h1>
          <p className="text-gray-400">Preencha os dados e publique em minutos</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8 sm:mb-12">
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            {STEPS.map((step, index) => (<div key={step.id} className="flex items-center flex-1">
                <motion.div className="flex flex-col items-center flex-1" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2 transition-all ${currentStep >= step.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/50'
                : 'bg-white/5 border border-white/10'}`}>
                    {currentStep > step.id ? (<Check className="w-5 h-5 sm:w-6 sm:h-6 text-white"/>) : (<step.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${currentStep >= step.id ? 'text-white' : 'text-gray-500'}`}/>)}
                  </div>
                  <span className={`text-xs sm:text-sm font-medium hidden sm:block ${currentStep >= step.id ? 'text-white' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </motion.div>
                {index < STEPS.length - 1 && (<div className={`h-0.5 flex-1 mx-2 transition-all ${currentStep > step.id ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-white/10'}`}/>)}
              </div>))}
          </div>
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10">
            {/* Step 1: Photos */}
            {currentStep === 1 && (<div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Adicione Fotos</h2>
                  <p className="text-gray-400 text-sm">Anúncios com fotos vendem 5x mais rápido</p>
                </div>

                <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                  <p className="text-white font-medium mb-2">Clique para adicionar fotos</p>
                  <p className="text-gray-500 text-sm">Até 10 imagens • PNG, JPG até 5MB</p>
                </div>

                {formData.images.length > 0 && (<div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {formData.images.map((img, i) => (<div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img src={img} alt="" className="w-full h-full object-cover"/>
                        <button className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-4 h-4 text-white"/>
                        </button>
                      </div>))}
                  </div>)}
              </div>)}

            {/* Step 2: Details */}
            {currentStep === 2 && (<div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Detalhes do Produto</h2>
                  <p className="text-gray-400 text-sm">Quanto mais informações, melhor</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Título *</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData(prev => (Object.assign(Object.assign({}, prev), { title: e.target.value })))} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="Ex: iPhone 13 Pro Max 256GB"/>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Descrição *</label>
                    <textarea value={formData.description} onChange={(e) => setFormData(prev => (Object.assign(Object.assign({}, prev), { description: e.target.value })))} rows={4} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none" placeholder="Descreva seu produto..."/>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Preço (R$) *</label>
                      <input type="text" value={formData.price} onChange={(e) => setFormData(prev => (Object.assign(Object.assign({}, prev), { price: formatPrice(e.target.value) })))} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="0,00"/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Categoria *</label>
                      <select value={formData.category} onChange={(e) => setFormData(prev => (Object.assign(Object.assign({}, prev), { category: e.target.value })))} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer">
                        {CATEGORIES.map(cat => (<option key={cat.value} value={cat.value} className="bg-gray-900">{cat.label}</option>))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Condição</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['new', 'used'].map((cond) => (<button key={cond} type="button" onClick={() => setFormData(prev => (Object.assign(Object.assign({}, prev), { condition: cond })))} className={`p-4 rounded-xl border-2 transition-all ${formData.condition === cond
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                          <span className="text-white font-medium">{cond === 'new' ? 'Novo' : 'Usado'}</span>
                        </button>))}
                    </div>
                  </div>
                </div>
              </div>)}

            {/* Step 3: Location */}
            {currentStep === 3 && (<div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Localização</h2>
                  <p className="text-gray-400 text-sm">Onde o produto está localizado?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">CEP *</label>
                  <input type="text" value={formData.cep} onChange={(e) => setFormData(prev => (Object.assign(Object.assign({}, prev), { cep: formatCEP(e.target.value) })))} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="00000-000" maxLength={9}/>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <Shield className="w-5 h-5 text-blue-400 flex-shrink-0"/>
                  <p className="text-sm text-gray-300">Seu endereço completo não será exibido publicamente</p>
                </div>
              </div>)}

            {/* Step 4: Contact */}
            {currentStep === 4 && (<div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Informações de Contato</h2>
                  <p className="text-gray-400 text-sm">Como os compradores podem te encontrar?</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => (Object.assign(Object.assign({}, prev), { phone: formatPhone(e.target.value) })))} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="(00) 00000-0000" maxLength={15}/>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp</label>
                    <input type="tel" value={formData.whatsapp} onChange={(e) => setFormData(prev => (Object.assign(Object.assign({}, prev), { whatsapp: formatPhone(e.target.value) })))} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="(00) 00000-0000" maxLength={15}/>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData(prev => (Object.assign(Object.assign({}, prev), { email: e.target.value })))} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="seu@email.com"/>
                  </div>

                  <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                    <input type="checkbox" checked={formData.shipping} onChange={(e) => setFormData(prev => (Object.assign(Object.assign({}, prev), { shipping: e.target.checked })))} className="w-5 h-5 accent-blue-500 rounded"/>
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-gray-400"/>
                      <span className="text-white">Aceito enviar via transportadora</span>
                    </div>
                  </label>
                </div>
              </div>)}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {currentStep > 1 && (<motion.button onClick={() => setCurrentStep(prev => prev - 1)} className="flex-1 bg-white/10 border border-white/20 text-white py-4 rounded-xl font-medium hover:bg-white/20 transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              Voltar
            </motion.button>)}
          
          {currentStep < 4 ? (<motion.button onClick={() => canProceed() && setCurrentStep(prev => prev + 1)} disabled={!canProceed()} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2" whileHover={canProceed() ? { scale: 1.02 } : {}} whileTap={canProceed() ? { scale: 0.98 } : {}}>
              Continuar
              <ChevronRight className="w-5 h-5"/>
            </motion.button>) : (<motion.button onClick={handleSubmit} disabled={loading || !canProceed()} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2" whileHover={canProceed() ? { scale: 1.02 } : {}} whileTap={canProceed() ? { scale: 0.98 } : {}}>
              {loading ? 'Publicando...' : 'Publicar Anúncio'}
              <Check className="w-5 h-5"/>
            </motion.button>)}
        </div>
      </main>
    </div>);
}
