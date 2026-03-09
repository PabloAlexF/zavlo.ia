'use client';

import Link from 'next/link';
import { Package, Store, MapPin, Zap, Bot, Search, DollarSign, Sparkles, Check, Shield, Clock, Bell, TrendingDown, Image as ImageIcon, Star, MousePointer, ArrowRight, Rocket } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import LimitedOfferSection from '@/components/sections/LimitedOfferSection';
import { useUser } from '@/contexts/UserContext';

const AnimatedSection = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.section
    className={className}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    {children}
  </motion.section>
);

export default function Home() {
  const { user } = useUser();
  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);

  const orb1X = useTransform(motionX, [-1, 1], [-30, 30]);
  const orb1Y = useTransform(motionY, [-1, 1], [-30, 30]);
  const orb2X = useTransform(motionX, [-1, 1], [20, -20]);
  const orb2Y = useTransform(motionY, [-1, 1], [20, -20]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return;
    const { clientX, clientY, currentTarget } = e;
    const { width, height } = currentTarget.getBoundingClientRect();
    motionX.set((clientX / width - 0.5) * 2);
    motionY.set((clientY / height - 0.5) * 2);
  };

  return (
    <>
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1a1a2e12_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_1000px_at_50%_-200px,#3B82F618,transparent)] pointer-events-none" />
      
      <motion.div 
        className="fixed top-0 right-[10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-gradient-to-br from-blue-500/15 to-purple-500/15 rounded-full blur-[120px] pointer-events-none"
        style={{ x: orb1X, y: orb1Y }}
      />
      <motion.div 
        className="fixed bottom-0 left-[10%] w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-[120px] pointer-events-none"
        style={{ x: orb2X, y: orb2Y }}
      />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-20 pb-16 sm:pt-32 sm:pb-24">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-sm font-medium text-gray-400">Powered by Artificial Intelligence</span>
            </motion.div>

            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-white">
                Encontre o menor preço
              </span>
              <br />
              <span className="text-white">
                da internet{' '}
              </span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                em segundos
              </span>
            </motion.h1>

            <motion.p 
              className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              A IA busca em <span className="text-white font-semibold">todos os marketplaces do Brasil</span> automaticamente.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link href={user ? "/chat" : "/auth"}>
                <motion.button 
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/25 overflow-hidden"
                  whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {user ? (
                      <>
                        <Search className="w-5 h-5" />
                        Começar Busca Agora
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5" />
                        Criar Conta Grátis
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="flex flex-wrap justify-center items-center gap-6 mt-12 text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Plano gratuito disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Cadastro em 30 segundos</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Dados protegidos</span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Combined Section: Comparison + Stats/Features */}
        <AnimatedSection className="container mx-auto px-4 py-8 sm:py-16">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-4 sm:gap-6">
            {/* Left: Comparison - Larger emphasis */}
            <motion.div 
              className="bg-gradient-to-br from-red-500/5 via-white/5 to-blue-500/5 backdrop-blur-sm border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col justify-between"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 sm:mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-semibold text-blue-400 mb-3 sm:mb-4">
                  <Zap className="w-3 h-3" />
                  Antes vs Agora
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight">
                  Pare de perder
                  <br />
                  <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">tempo</span>
                  {' '}e{' '}
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">dinheiro</span>
                </h2>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {[
                  {
                    old: { icon: MousePointer, value: '15+', label: 'abas abertas', color: 'text-red-400' },
                    new: { icon: Sparkles, value: '1', label: 'conversa com IA', color: 'text-blue-400' }
                  },
                  {
                    old: { icon: Clock, value: '2h', label: 'procurando', color: 'text-orange-400' },
                    new: { icon: Zap, value: '30s', label: 'resultado pronto', color: 'text-purple-400' }
                  },
                  {
                    old: { icon: TrendingDown, value: '???', label: 'preço incerto', color: 'text-yellow-400' },
                    new: { icon: DollarSign, value: '40%', label: 'economia garantida', color: 'text-green-400' }
                  },
                  {
                    old: { icon: Search, value: 'Manual', label: 'busca repetitiva', color: 'text-red-400' },
                    new: { icon: Bot, value: 'Auto', label: 'IA faz tudo', color: 'text-cyan-400' }
                  },
                  {
                    old: { icon: Bell, value: 'Zero', label: 'sem alertas', color: 'text-orange-400' },
                    new: { icon: Bell, value: 'Real-time', label: 'notificações instantâneas', color: 'text-pink-400' }
                  }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    className="relative"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-3 items-center">
                      {/* Old Way */}
                      <div className="bg-white/5 border border-red-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-red-500/40 transition-colors">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                          <item.old.icon className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
                          <div className={`text-lg sm:text-2xl font-black ${item.old.color}`}>{item.old.value}</div>
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500 leading-tight">{item.old.label}</div>
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-red-500/20 to-green-500/20 flex items-center justify-center">
                          <span className="text-xs sm:text-sm">→</span>
                        </div>
                      </div>

                      {/* New Way */}
                      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-blue-500/50 transition-all relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                            <item.new.icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                            <div className={`text-lg sm:text-2xl font-black ${item.new.color}`}>{item.new.value}</div>
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-300 font-medium leading-tight">{item.new.label}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Link href={user ? "/chat" : "/auth"} className="block">
                <motion.button 
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center justify-center gap-2">
                    {user ? (
                      <>
                        <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                        Ir para Busca
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
                        Criar Conta Agora
                      </>
                    )}
                  </span>
                </motion.button>
              </Link>
              <p className="text-[10px] sm:text-xs text-center text-gray-500 mt-2 sm:mt-3">
                {user ? (
                  <>
                    <Sparkles className="w-3 h-3 inline text-blue-400" /> Comece a economizar agora
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3 inline text-green-400" /> Plano gratuito • Sem cartão • Acesso imediato
                  </>
                )}
              </p>
            </motion.div>

            {/* Right: Stats + Features - Compact */}
            <motion.div 
              className="space-y-4 sm:space-y-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {/* Stats Card */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
                <h3 className="text-sm sm:text-base font-bold text-gray-400 mb-4 sm:mb-6 uppercase tracking-wider flex items-center gap-2">
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  Plataforma
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { value: '1M+', label: 'Produtos', icon: Package, color: 'from-blue-500 to-cyan-500' },
                    { value: '9+', label: 'Marketplaces', icon: Store, color: 'from-purple-500 to-pink-500' },
                    { value: '27', label: 'Estados', icon: MapPin, color: 'from-green-500 to-emerald-500' },
                    { value: '40%', label: 'Economia', icon: TrendingDown, color: 'from-orange-500 to-red-500' },
                  ].map((stat, i) => (
                    <motion.div 
                      key={stat.label} 
                      className="text-center p-3 sm:p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ 
                        delay: i * 0.1,
                        type: "spring",
                        stiffness: 200,
                        damping: 15
                      }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <motion.div 
                        className={`inline-flex p-2 sm:p-2.5 bg-gradient-to-br ${stat.color} rounded-lg sm:rounded-xl mb-2 sm:mb-3 shadow-lg`}
                        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </motion.div>
                      <p className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent leading-none mb-1 sm:mb-2`}>
                        {stat.value}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-medium">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Features Card */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
                <h3 className="text-sm sm:text-base font-bold text-gray-400 mb-4 sm:mb-6 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  Recursos
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {[
                    { icon: Bot, title: 'IA Conversacional', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                    { icon: ImageIcon, title: 'Busca por Imagem', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                    { icon: Shield, title: 'Detecção de Fraude', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
                    { icon: Zap, title: 'Busca Instantânea', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
                    { icon: TrendingDown, title: 'Histórico de Preços', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                    { icon: Bell, title: 'Alertas Inteligentes', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
                  ].map((feature, i) => (
                    <motion.div 
                      key={feature.title} 
                      className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border ${feature.border} hover:bg-white/5 transition-all group cursor-pointer`}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ 
                        delay: i * 0.08,
                        type: "spring",
                        stiffness: 150
                      }}
                      whileHover={{ x: 5 }}
                    >
                      <motion.div 
                        className={`${feature.bg} p-2 sm:p-2.5 rounded-lg`}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <feature.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${feature.color}`} />
                      </motion.div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">{feature.title}</span>
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Marketplaces Section */}
        <AnimatedSection className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-black mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Conectado aos maiores marketplaces
            </h2>
            <p className="text-gray-400 mb-12">Buscamos em tempo real para você economizar</p>
            
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { name: 'OLX', color: 'from-purple-500 to-purple-600' },
                { name: 'Mercado Livre', color: 'from-yellow-400 to-yellow-500' },
                { name: 'Shopee', color: 'from-orange-500 to-red-500' },
                { name: 'Amazon', color: 'from-orange-400 to-yellow-500' },
                { name: 'Enjoei', color: 'from-pink-500 to-rose-500' },
                { name: 'Kabum', color: 'from-orange-600 to-orange-700' },
                { name: 'Webmotors', color: 'from-blue-500 to-blue-600' },
                { name: 'iCarros', color: 'from-red-500 to-red-600' },
                { name: 'Mobiauto', color: 'from-green-500 to-green-600' },
              ].map((marketplace) => (
                <motion.span
                  key={marketplace.name}
                  className={`bg-gradient-to-r ${marketplace.color} px-6 py-3 rounded-full text-sm font-bold text-white shadow-lg`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {marketplace.name}
                </motion.span>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* How it Works */}
        <AnimatedSection className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Como funciona?
              </h2>
              <p className="text-xl text-gray-400">Simples, rápido e inteligente</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  icon: Search,
                  title: 'Busque',
                  desc: 'Digite o produto, envie uma foto ou converse com nossa IA',
                  color: 'from-blue-500 to-cyan-500',
                },
                {
                  step: '02',
                  icon: Bot,
                  title: 'IA Analisa',
                  desc: 'Nossa IA busca, compara preços e detecta fraudes automaticamente',
                  color: 'from-purple-500 to-pink-500',
                },
                {
                  step: '03',
                  icon: DollarSign,
                  title: 'Economize',
                  desc: 'Veja os melhores preços e escolha a oferta perfeita',
                  color: 'from-green-500 to-emerald-500',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                >
                  {i < 2 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-white/20 to-transparent" />
                  )}
                  
                  <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] hover:border-white/20 transition-all group">
                    <div className={`absolute -top-4 -left-4 w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center font-black text-white text-lg shadow-xl group-hover:scale-110 transition-transform`}>
                      {item.step}
                    </div>
                    
                    <div className={`inline-flex p-4 bg-gradient-to-br ${item.color} rounded-xl mb-4 shadow-lg`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        <LimitedOfferSection />



        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 border-t border-white/10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-black">Z</span>
              </div>
              <span className="text-2xl font-black text-white">Zavlo.ia</span>
            </div>
            <p className="text-gray-500">
              © {new Date().getFullYear()} Zavlo.ia • Todos os direitos reservados
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
