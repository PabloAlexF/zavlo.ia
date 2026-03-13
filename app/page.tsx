'use client';

import Link from 'next/link';
import { Package, Store, MapPin, Zap, Bot, Search, DollarSign, Sparkles, Check, Shield, Clock, Bell, TrendingDown, Image as ImageIcon, MousePointer, ArrowRight, Rocket, BrainCircuit } from 'lucide-react';
import { motion, useMotionValue, useTransform, useTime, useInView } from 'framer-motion';
import { MouseEvent, ReactNode, useRef, useEffect, useState } from 'react';
import LimitedOfferSection from '@/components/sections/LimitedOfferSection';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';

const AnimatedSection = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.section
    className={className}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.section>
);

const Particle = ({ x, y, size, delay }: { x: number, y: number, size: number, delay: number }) => {
  const time = useTime();
  const offsetX = useTransform(time, (t) => Math.sin((t + delay) / 3000) * 10);
  const offsetY = useTransform(time, (t) => Math.cos((t + delay) / 2500) * 10);
  const particleOpacity = useTransform(time, (t) => {
    const pulse = Math.sin((t + delay) / 1500) * 0.4 + 0.6;
    return pulse * 0.5;
  });

  return (
    <motion.circle
      cx={x}
      cy={y}
      r={size}
      fill="url(#particle-gradient)"
      style={{
        x: offsetX,
        y: offsetY,
        opacity: particleOpacity,
      }}
    />
  );
};

const BrainAnimation = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [particles, setParticles] = useState<{ x: number; y: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.4,
      delay: Math.random() * 5000,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div ref={ref} className="relative h-[400px] lg:h-[500px] flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: isInView ? 1 : 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="overflow-visible">
          <defs>
            <radialGradient id="particle-gradient">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {particles.map((p, i) => <Particle key={i} {...p} />)}
        </svg>
      </motion.div>

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.7, rotateY: -30 }}
        animate={{ 
          opacity: isInView ? 1 : 0, 
          scale: isInView ? 1 : 0.7,
          rotateY: isInView ? 0 : -30
        }}
        transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 blur-3xl"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)'
              }}
            />
            <BrainCircuit className="w-32 h-32 lg:w-48 lg:h-48 text-blue-400/40 relative z-10" strokeWidth={0.8} />
          </div>
        </motion.div>
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#050409] via-[#050409]/30 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050409] via-transparent to-[#050409] pointer-events-none" />
      
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isInView ? 1 : 0 }}
        transition={{ duration: 1.5, delay: 0.6 }}
        style={{
          background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.08) 0%, transparent 60%)'
        }}
      />
    </div>
  );
};

export default function Home() {
  const { user } = useUser();
  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);

  const orb1X = useTransform(motionX, [-1, 1], [-30, 30]);
  const orb1Y = useTransform(motionY, [-1, 1], [-30, 30]);
  const orb2X = useTransform(motionX, [-1, 1], [25, -25]);
  const orb2Y = useTransform(motionY, [-1, 1], [25, -25]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return;
    const { clientX, clientY, currentTarget } = e;
    const { width, height } = currentTarget.getBoundingClientRect();
    motionX.set((clientX / width - 0.5) * 2);
    motionY.set((clientY / height - 0.5) * 2);
  };

  return (
    <>
      {/* Subtle background */}
      <div className="fixed inset-0 bg-black pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 pointer-events-none" />

      {/* Very subtle glow */}
      <motion.div
        className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[70vw] h-[50vw] max-w-[900px] max-h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(59, 130, 246, 0.04) 0%, transparent 70%)',
          x: orb1X,
          y: orb1Y,
        }}
      />

      <main className="relative z-10" onMouseMove={handleMouseMove}>

        {/* ─── HERO ─── */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-4 pt-24 pb-20 sm:pt-32 sm:pb-28">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-7xl mx-auto">

              {/* Left — Text */}
              <motion.div
                className="text-center lg:text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href="/chat" className="inline-block">
                  <motion.div
                  className="inline-flex items-center gap-2 border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.06] px-3 sm:px-4 py-1.5 rounded-full mb-6 sm:mb-8 transition-colors"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
                    <span className="text-[10px] sm:text-xs font-medium text-gray-400 tracking-wide">Nova busca por imagem com IA</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500" />
                  </motion.div>
                </Link>

                <motion.h1
                  className="text-[clamp(2rem,6vw,4rem)] font-semibold mb-4 sm:mb-6 leading-[1.1] tracking-tight"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="text-white">Encontre o <span className="text-blue-400">menor preço</span> em segundos.</span>
                </motion.h1>

                <motion.p
                  className="text-sm sm:text-base md:text-lg text-gray-500 mb-8 sm:mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  Busca automática em{' '}
                  <span className="text-gray-300 font-medium">todos os marketplaces</span>{' '}
                  do Brasil.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-3 mb-10 justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Link href={user ? "/chat" : "/auth"} className="w-full sm:w-auto">
                    <motion.button
                      className="w-full sm:w-auto group px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-black hover:bg-gray-100 rounded-lg sm:rounded-xl font-medium text-sm transition-all"
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {user ? (
                          <><Search className="w-4 h-4" />Começar Busca</>
                        ) : (
                          <><Rocket className="w-4 h-4" />Criar Conta Grátis</>
                        )}
                      </span>
                    </motion.button>
                  </Link>

                  <Link href="#como-funciona" className="w-full sm:w-auto">
                    <motion.button
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] rounded-lg sm:rounded-xl font-medium text-sm text-gray-400 transition-all"
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        Ver como funciona
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </motion.button>
                  </Link>
                </motion.div>

                <motion.div
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 sm:gap-x-5 gap-y-2 text-[10px] sm:text-xs text-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  <span className="flex items-center gap-1 sm:gap-1.5"><Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />Plano gratuito</span>
                  <span className="flex items-center gap-1 sm:gap-1.5"><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />Resultados em segundos</span>
                  <span className="flex items-center gap-1 sm:gap-1.5"><Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />Seguro</span>
                </motion.div>
              </motion.div>

              {/* Right — Brain Animation (Hidden on mobile) */}
              <div className="hidden lg:block">
                <BrainAnimation />
              </div>

            </div>
          </div>
        </section>

        {/* ─── BEFORE / AFTER + STATS ─── */}
        <AnimatedSection className="container mx-auto px-4 py-10 sm:py-20">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.3fr_1fr] gap-5">

            <motion.div
              className="bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl p-5 sm:p-7 md:p-10 flex flex-col justify-between"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="mb-6 sm:mb-8">
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-white/[0.04] border border-white/[0.06] rounded-full text-[10px] sm:text-xs font-medium text-gray-400 mb-4 sm:mb-5">
                  <Zap className="w-3 h-3" />
                  Antes vs Agora
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold leading-tight text-white">
                  Pare de perder{' '}
                  <span className="text-red-400">tempo</span>{' '}
                  e{' '}
                  <span className="text-green-400">dinheiro</span>
                </h2>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {[
                  { old: { icon: MousePointer, value: '15+ abas abertas', color: 'text-red-400' }, new: { icon: Sparkles, value: '1 busca inteligente', color: 'text-blue-300' } },
                  { old: { icon: Clock, value: 'Horas procurando', color: 'text-red-400' }, new: { icon: Zap, value: 'Segundos para o resultado', color: 'text-blue-300' } },
                  { old: { icon: TrendingDown, value: 'Preço mais alto', color: 'text-red-400' }, new: { icon: DollarSign, value: 'Até 40% de economia', color: 'text-green-400' } },
                  { old: { icon: Search, value: 'Busca manual e repetitiva', color: 'text-red-400' }, new: { icon: Bot, value: 'Busca automática e centralizada', color: 'text-blue-300' } },
                  { old: { icon: Bell, value: 'sem alertas', color: 'text-red-400' }, new: { icon: Bell, value: 'notificações real-time', color: 'text-green-400' } },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="grid grid-cols-[1fr_28px_1fr] gap-2 items-center"
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                  >
                    {/* Old */}
                    <div className="flex items-center gap-2.5">
                      <item.old.icon className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-500">{item.old.value}</span>
                    </div>
                    {/* Arrow */}
                    <div className="flex items-center justify-center">
                      <ArrowRight className="w-3.5 h-3.5 text-gray-700" />
                    </div>
                    {/* New */}
                    <div className="flex items-center gap-2.5">
                      <item.new.icon className={`w-4 h-4 ${item.new.color} flex-shrink-0`} />
                      <span className={`text-xs sm:text-sm font-medium ${item.new.color}`}>{item.new.value}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto">
                <Link href={user ? "/chat" : "/auth"} className="block">
                  <motion.button
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-sm text-white transition-colors duration-200 shadow-lg shadow-blue-600/20"
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {user ? (
                        <><Search className="w-4 h-4" />Ir para Busca</>
                      ) : (
                        <><Rocket className="w-4 h-4" />Criar Conta Agora</>
                      )}
                    </span>
                  </motion.button>
                </Link>
                <p className="text-[11px] text-center text-gray-600 mt-2.5">
                  {user ? (
                    <><Sparkles className="w-3 h-3 inline text-blue-400" /> Comece a economizar agora</>
                  ) : (
                    <><Check className="w-3 h-3 inline text-green-500" /> Plano gratuito · Sem cartão · Acesso imediato</>
                  )}
                </p>
              </div>
            </motion.div>

            {/* Stats + Features — Desktop only */}
            <motion.div
              className="hidden lg:flex flex-col gap-4"
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest mb-5">Plataforma</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: '1M+', label: 'Produtos', icon: Package, color: 'text-blue-400' },
                    { value: '9+', label: 'Marketplaces', icon: Store, color: 'text-blue-400' },
                    { value: '27', label: 'Estados', icon: MapPin, color: 'text-green-400' },
                    { value: '40%', label: 'Economia média', icon: TrendingDown, color: 'text-green-400' },
                  ].map((stat) => (
                    <motion.div
                      key={stat.label}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-default"
                      whileHover={{ y: -2 }}
                    >
                      <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                      <p className={`text-2xl font-bold ${stat.color} leading-none mb-1`}>{stat.value}</p>
                      <p className="text-[11px] text-gray-600">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl p-4 sm:p-6 flex-1">
                <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest mb-5">Recursos</p>
                <div className="space-y-2">
                  {[
                    { icon: Bot, title: 'Busca Guiada por IA' },
                    { icon: ImageIcon, title: 'Busca por Imagem' },
                    { icon: Shield, title: 'Detecção de Fraude' },
                    { icon: Zap, title: 'Busca Instantânea' },
                    { icon: TrendingDown, title: 'Histórico de Preços' },
                    { icon: Bell, title: 'Alertas Inteligentes' },
                  ].map((f, i) => (
                    <motion.div
                      key={f.title}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:bg-white/5 hover:border-white/10 transition-all group cursor-default"
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <f.icon className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                      <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors font-medium">{f.title}</span>
                      <Check className="w-3.5 h-3.5 text-green-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </AnimatedSection>

        {/* ─── MARKETPLACES ─── */}
        <AnimatedSection className="container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-2 sm:mb-3">
                Conectado aos maiores marketplaces
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm md:text-base max-w-xl mx-auto">Buscamos em tempo real para você economizar</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2.5">
              {[
                { name: 'OLX' },
                { name: 'Mercado Livre' },
                { name: 'Shopee' },
                { name: 'Amazon' },
                { name: 'Enjoei' },
                { name: 'Kabum' },
                { name: 'Webmotors' },
                { name: 'iCarros' },
                { name: 'Mobiauto' },
              ].map((m) => (
                <motion.span
                  key={m.name}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-full text-xs sm:text-sm font-medium text-gray-400 hover:text-white hover:border-white/[0.12] transition-colors cursor-default"
                  whileHover={{ y: -2 }}
                >
                  {m.name}
                </motion.span>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* ─── HOW IT WORKS ─── */}
        <AnimatedSection id="como-funciona" className="container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-2 sm:mb-3">
                Como funciona?
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm md:text-base">Em três passos simples</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
              {[
                {
                  step: '01',
                  icon: Search,
                  title: 'Busque',
                  desc: 'Digite o produto, envie uma foto ou converse com nossa IA',
                },
                {
                  step: '02',
                  icon: Bot,
                  title: 'IA Analisa',
                  desc: 'Nossa IA busca, compara preços e detecta fraudes automaticamente',
                },
                {
                  step: '03',
                  icon: DollarSign,
                  title: 'Economize',
                  desc: 'Veja os melhores preços e escolha a oferta perfeita',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  className="relative"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* connector line */}
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-[calc(50%+60px)] right-[-50%] h-px bg-white/[0.06]" />
                  )}

                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl p-5 sm:p-7 hover:border-white/[0.12] transition-colors group h-full">
                    <div className="flex items-start justify-between mb-4 sm:mb-6">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/[0.04] border border-white/[0.08] rounded-lg sm:rounded-xl flex items-center justify-center">
                        <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <span className="text-3xl sm:text-4xl font-black text-white/[0.06] group-hover:text-white/[0.12] transition-colors select-none">{item.step}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-medium text-white mb-1.5 sm:mb-2">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        <LimitedOfferSection />

        <footer className="container mx-auto px-4 py-8 sm:py-10 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <Image
                src="/assets/icons/logo.ico"
                alt="Zavlo Logo"
                width={24}
                height={24}
                className="rounded-lg opacity-90 sm:w-7 sm:h-7"
              />
              <span className="text-sm sm:text-base font-medium text-white">Zavlo</span>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-700">
              © {new Date().getFullYear()} Zavlo • Todos os direitos reservados
            </p>
          </div>
        </footer>

      </main>
    </>
  );
}