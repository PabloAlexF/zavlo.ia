'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Package, Store, MapPin, Zap, Bot, Search, DollarSign, Sparkles, Check, Shield, Clock, Bell, TrendingDown, Image as ImageIcon, Star, MousePointer, ArrowRight, Rocket } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { MouseEvent, ReactNode } from 'react';
import LimitedOfferSection from '@/components/sections/LimitedOfferSection';
import { useUser } from '@/contexts/UserContext';

const AnimatedSection = ({ children, className }: { children: ReactNode; className?: string }) => (
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

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
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
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-4 pt-20 pb-16 sm:pt-32 sm:pb-24">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-7xl mx-auto">
              {/* Left Column - Text Content */}
              <motion.div
                className="text-center lg:text-left"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <motion.div 
                  className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-xs sm:text-sm font-medium text-gray-400">Powered by Artificial Intelligence</span>
                </motion.div>

                <motion.h1 
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 sm:mb-6 leading-[1.05] tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-white block mb-1 sm:mb-2">
                    Encontre o
                  </span>
                  <span className="text-white block mb-1 sm:mb-2">
                    menor preço
                  </span>
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent block">
                    em segundos
                  </span>
                </motion.h1>

                <motion.p 
                  className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 mb-6 sm:mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  A IA busca em <span className="text-white font-semibold">todos os marketplaces do Brasil</span> automaticamente.
                </motion.p>

                <motion.div 
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link href={user ? "/chat" : "/auth"} className="w-full sm:w-auto">
                    <motion.button 
                      className="w-full sm:w-auto group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-blue-500/25 overflow-hidden"
                      whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {user ? (
                          <>
                            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                            Começar Busca Agora
                          </>
                        ) : (
                          <>
                            <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
                            Criar Conta Grátis
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  </Link>
                  
                  <Link href="#como-funciona" className="w-full sm:w-auto">
                    <motion.button 
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl font-bold text-base sm:text-lg hover:bg-white/10 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex items-center justify-center gap-2 text-white">
                        Ver Como Funciona
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </span>
                    </motion.button>
                  </Link>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div 
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                    <span>Plano gratuito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                    <span>30 segundos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                    <span>100% seguro</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Column - Overlapping Images Desktop */}
              <motion.div
                className="relative h-[600px] hidden lg:block"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              >
                {/* Background decorative elements */}
                <div className="absolute inset-0">
                  <motion.div 
                    className="absolute top-[10%] right-[5%] w-72 h-72 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ 
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div 
                    className="absolute bottom-[15%] left-[10%] w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl"
                    animate={{ 
                      scale: [1, 1.15, 1],
                      rotate: [0, -5, 0]
                    }}
                    transition={{ 
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                  />
                </div>

                {/* Card 1 - Search Results */}
                <motion.div
                  className="absolute top-[5%] right-[10%] w-80 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl"
                  initial={{ opacity: 0, y: 20, rotate: -5 }}
                  animate={{ opacity: 1, y: 0, rotate: -3 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  whileHover={{ rotate: 0, scale: 1.02 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Busca Inteligente</p>
                      <p className="text-sm font-bold text-white">iPhone 15 Pro</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg" />
                          <div>
                            <p className="text-xs text-gray-400">Loja {i}</p>
                            <p className="text-sm font-bold text-white">R$ {(7000 - i * 200).toLocaleString()}</p>
                          </div>
                        </div>
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Card 2 - Price Alert */}
                <motion.div
                  className="absolute top-[35%] left-[5%] w-72 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl"
                  initial={{ opacity: 0, y: 20, rotate: 5 }}
                  animate={{ opacity: 1, y: 0, rotate: 3 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  whileHover={{ rotate: 0, scale: 1.02 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Economia Detectada</p>
                      <p className="text-2xl font-black text-green-400">-40%</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">Encontramos um preço melhor para você!</p>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                    <div>
                      <p className="text-xs text-gray-400 line-through">R$ 8.999</p>
                      <p className="text-xl font-black text-white">R$ 5.399</p>
                    </div>
                    <Bell className="w-5 h-5 text-green-400" />
                  </div>
                </motion.div>

                {/* Card 3 - AI Assistant */}
                <motion.div
                  className="absolute bottom-[8%] right-[15%] w-64 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl"
                  initial={{ opacity: 0, y: 20, rotate: -3 }}
                  animate={{ opacity: 1, y: 0, rotate: -2 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  whileHover={{ rotate: 0, scale: 1.02 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Assistente IA</p>
                      <p className="text-sm font-bold text-white">Zavlo</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white/5 rounded-lg p-2">
                      <p className="text-xs text-gray-300">"Encontrei 127 ofertas em 9 marketplaces"</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-2 border border-blue-500/30">
                        <p className="text-xs font-semibold text-blue-300">Ver Ofertas</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Stats */}
                <motion.div
                  className="absolute top-[20%] left-[0%] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 shadow-xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="text-xs text-gray-400 mb-1">Marketplaces</p>
                  <p className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">9+</p>
                </motion.div>

                <motion.div
                  className="absolute bottom-[35%] left-[8%] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 shadow-xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="text-xs text-gray-400 mb-1">Produtos</p>
                  <p className="text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">1M+</p>
                </motion.div>
              </motion.div>

              {/* Mobile Version - Compact Cards */}
              <motion.div
                className="lg:hidden space-y-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {/* Mobile Card 1 - Search Results */}
                <motion.div
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-5 shadow-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400">Busca Inteligente</p>
                      <p className="text-sm sm:text-base font-bold text-white truncate">iPhone 15 Pro</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400">Loja {i}</p>
                            <p className="text-sm font-bold text-white">R$ {(7000 - i * 200).toLocaleString()}</p>
                          </div>
                        </div>
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Mobile Card 2 - Price Alert */}
                <motion.div
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-5 shadow-xl"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Economia Detectada</p>
                      <p className="text-xl sm:text-2xl font-black text-green-400">-40%</p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300 mb-3">Encontramos um preço melhor para você!</p>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                    <div>
                      <p className="text-xs text-gray-400 line-through">R$ 8.999</p>
                      <p className="text-lg sm:text-xl font-black text-white">R$ 5.399</p>
                    </div>
                    <Bell className="w-5 h-5 text-green-400 flex-shrink-0" />
                  </div>
                </motion.div>

                {/* Mobile Stats Row */}
                <motion.div
                  className="grid grid-cols-3 gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-3 text-center">
                    <div className="w-8 h-8 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Store className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-lg sm:text-xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">9+</p>
                    <p className="text-[10px] sm:text-xs text-gray-400">Marketplaces</p>
                  </div>
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-3 text-center">
                    <div className="w-8 h-8 mx-auto mb-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-lg sm:text-xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">1M+</p>
                    <p className="text-[10px] sm:text-xs text-gray-400">Produtos</p>
                  </div>
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-3 text-center">
                    <div className="w-8 h-8 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-lg sm:text-xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">IA</p>
                    <p className="text-[10px] sm:text-xs text-gray-400">Assistente</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
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

            {/* Right: Stats + Features - Compact - Hidden on Mobile */}
            <motion.div 
              className="hidden lg:block space-y-4 sm:space-y-6"
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
        <AnimatedSection id="como-funciona" className="container mx-auto px-4 py-20">
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
              <Image 
                src="/assets/icons/logo.ico" 
                alt="Zavlo.ia Logo" 
                width={40} 
                height={40}
                className="rounded-xl"
              />
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
