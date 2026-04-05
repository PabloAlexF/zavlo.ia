'use client';

import Link from 'next/link';
import { Package, Store, MapPin, Zap, Bot, Search, DollarSign, Sparkles, Check, Shield, Clock, Bell, TrendingDown, Image as ImageIcon, MousePointer, ArrowRight, Rocket, BrainCircuit, Tag, ShoppingBag, ChevronRight } from 'lucide-react';
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
        className="fixed top-[-24%] left-1/2 -translate-x-1/2 w-[78vw] h-[58vw] max-w-[980px] max-h-[680px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(59, 130, 246, 0.07) 0%, rgba(96, 165, 250, 0.04) 35%, transparent 72%)',
          x: orb1X,
          y: orb1Y,
        }}
      />

      <main className="relative z-10" onMouseMove={handleMouseMove}>

        {/* ─── HERO ─── */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-4 pt-24 pb-20 sm:pt-34 sm:pb-24">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-6xl mx-auto">

              {/* Left — Text */}
              <motion.div
                className="text-center lg:text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href="/chat" className="inline-block">
                  <motion.div
                  className="inline-flex items-center gap-2 border border-blue-400/20 bg-gradient-to-r from-blue-500/10 via-blue-400/5 to-white/[0.04] hover:from-blue-400/15 hover:to-white/[0.08] px-4 sm:px-5 py-2 rounded-full mb-7 sm:mb-9 transition-colors"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-300" />
                    <span className="text-xs sm:text-sm font-medium text-blue-100/90 tracking-wide">Marketplace interno + busca inteligente multi-sites</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-200/80" />
                  </motion.div>
                </Link>

                <motion.h1
                  className="text-[clamp(2.3rem,6.8vw,4.6rem)] font-semibold mb-5 sm:mb-7 leading-[1.05] tracking-tight"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="text-white">Compre melhor em <span className="text-blue-300">um só lugar</span>.</span>
                </motion.h1>

                <motion.p
                  className="text-base sm:text-lg md:text-xl text-blue-50/75 mb-9 sm:mb-11 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  Compare preços em vários sites, receba resultados personalizados e, se quiser,
                  finalize no marketplace da Zavlo.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-3.5 mb-11 justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Link href={user ? "/chat" : "/auth"} className="w-full sm:w-auto">
                    <motion.button
                      className="w-full sm:w-auto group px-7 sm:px-9 py-3.5 sm:py-4 bg-gradient-to-r from-white to-blue-50 text-black hover:from-blue-50 hover:to-white rounded-xl font-semibold text-base transition-all"
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {user ? (
                          <><Search className="w-4.5 h-4.5" />Começar Busca</>
                        ) : (
                          <><Rocket className="w-4.5 h-4.5" />Criar Conta Grátis</>
                        )}
                      </span>
                    </motion.button>
                  </Link>

                  <Link href="#como-funciona" className="w-full sm:w-auto">
                    <motion.button
                      className="w-full sm:w-auto px-7 sm:px-9 py-3.5 sm:py-4 border border-blue-300/20 bg-gradient-to-r from-white/[0.04] to-blue-500/[0.06] hover:from-white/[0.08] hover:to-blue-500/[0.12] rounded-xl font-medium text-base text-blue-100/90 transition-all"
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        Ver como funciona
                        <ArrowRight className="w-4.5 h-4.5" />
                      </span>
                    </motion.button>
                  </Link>
                </motion.div>

                <motion.div
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 sm:gap-x-6 gap-y-2.5 text-xs sm:text-sm text-blue-100/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-200" />Busca personalizada</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-300" />Comparação rápida</span>
                  <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />Marketplace próprio</span>
                </motion.div>
              </motion.div>

              {/* Right — Quick Value Cards */}
              <div className="hidden lg:grid gap-4">
                {[
                  {
                    icon: Search,
                    title: 'Busca personalizada',
                    desc: 'Você descreve o produto e a IA refina os filtros automaticamente.',
                  },
                  {
                    icon: TrendingDown,
                    title: 'Melhores preços e resultados',
                    desc: 'A Zavlo consulta múltiplos sites para te mostrar as melhores oportunidades.',
                  },
                  {
                    icon: ShoppingBag,
                    title: 'Marketplace interno',
                    desc: 'Também dá para explorar anúncios diretos dentro da própria plataforma.',
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    className="bg-gradient-to-br from-white/[0.06] via-blue-500/[0.06] to-white/[0.02] border border-blue-300/15 rounded-2xl p-6"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.08 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-blue-500/25 to-white/[0.06] border border-blue-200/20 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-blue-200" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-blue-50 mb-1.5">{item.title}</h3>
                        <p className="text-sm text-blue-100/65 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>
          </div>
        </section>

        <AnimatedSection id="como-funciona" className="container mx-auto px-4 py-14 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-blue-50 mb-3.5">
                O que a Zavlo entrega para você
              </h2>
              <p className="text-blue-100/70 text-base sm:text-lg max-w-2xl mx-auto">
                Uma plataforma única para pesquisar, comparar e decidir com confiança.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5 sm:gap-6 mb-10 sm:mb-12">
              {[
                {
                  icon: Search,
                  title: 'Busca personalizada',
                  desc: 'Descreva o que quer e a IA ajusta filtros relevantes para sua necessidade.',
                },
                {
                  icon: TrendingDown,
                  title: 'Comparação multi-sites',
                  desc: 'Encontramos os melhores preços e resultados em diferentes marketplaces.',
                },
                {
                  icon: ShoppingBag,
                  title: 'Marketplace interno',
                  desc: 'Também dá para explorar e negociar direto com anúncios na própria Zavlo.',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  className="bg-gradient-to-b from-white/[0.05] via-blue-500/[0.05] to-white/[0.02] border border-blue-300/15 rounded-2xl p-6 sm:p-7"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-blue-500/25 to-white/[0.06] border border-blue-200/20 flex items-center justify-center mb-4.5">
                    <item.icon className="w-5 h-5 text-blue-200" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-50 mb-2.5">{item.title}</h3>
                  <p className="text-base text-blue-100/65 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-white/[0.06] via-blue-500/[0.07] to-white/[0.03] border border-blue-300/15 rounded-2xl p-6 sm:p-8">
              <div className="grid md:grid-cols-3 gap-5 sm:gap-6 text-base">
                <div className="flex items-center gap-3 text-blue-50/90">
                  <span className="w-8 h-8 rounded-full bg-blue-500/25 border border-blue-200/25 flex items-center justify-center text-sm font-semibold text-blue-100">1</span>
                  Você busca por texto ou imagem
                </div>
                <div className="flex items-center gap-3 text-blue-50/90">
                  <span className="w-8 h-8 rounded-full bg-blue-500/25 border border-blue-200/25 flex items-center justify-center text-sm font-semibold text-blue-100">2</span>
                  A IA compara e organiza resultados
                </div>
                <div className="flex items-center gap-3 text-blue-50/90">
                  <span className="w-8 h-8 rounded-full bg-blue-500/25 border border-blue-200/25 flex items-center justify-center text-sm font-semibold text-blue-100">3</span>
                  Você escolhe a melhor oferta
                </div>
              </div>

              <div className="mt-7 flex flex-col sm:flex-row gap-3.5 sm:justify-center">
                <Link href={user ? "/chat" : "/auth"} className="w-full sm:w-auto">
                  <motion.button
                    className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-white to-blue-50 text-black hover:from-blue-50 hover:to-white rounded-xl font-semibold text-base transition-all"
                    whileTap={{ scale: 0.98 }}
                  >
                    {user ? 'Começar busca agora' : 'Criar conta e começar'}
                  </motion.button>
                </Link>
                <Link href="/marketplace" className="w-full sm:w-auto">
                  <motion.button
                    className="w-full sm:w-auto px-7 py-3.5 border border-blue-200/20 bg-gradient-to-r from-white/[0.05] to-blue-500/[0.08] hover:from-white/[0.09] hover:to-blue-500/[0.15] rounded-xl font-medium text-base text-blue-50/90 transition-all"
                    whileTap={{ scale: 0.98 }}
                  >
                    Ir para o marketplace
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>

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