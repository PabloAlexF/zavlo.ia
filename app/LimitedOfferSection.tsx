'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown, Rocket, Sparkles, CheckCircle, ShieldCheck, CreditCard } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const LimitedOfferSection = () => {
  const { user } = useUser();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.section
      className="container mx-auto px-4 py-20 sm:py-28"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="max-w-4xl mx-auto bg-[#0C0B10]/50 border border-white/10 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl shadow-black/30">
        {/* Subtle inner glow */}
        <div className="absolute -inset-px rounded-3xl border-2 border-blue-500/20 blur-xl pointer-events-none" />

        <motion.div
          className="relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full mb-6">
            <Crown className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-blue-300 tracking-wider uppercase">Acesso Premium</span>
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Comece Grátis Hoje
          </motion.h2>

          <motion.p variants={itemVariants} className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            Teste todos os recursos premium por 7 dias, sem compromisso.
          </motion.p>

          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-12 max-w-3xl mx-auto">
            {[
              { icon: Sparkles, text: 'Buscas ilimitadas' },
              { icon: ShieldCheck, text: 'IA de busca avançada' },
              { icon: CreditCard, text: 'Não requer cartão de crédito' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <item.icon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-gray-300 font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link href="/auth">
              <button className="px-10 py-4 bg-white text-black rounded-xl font-bold text-base shadow-lg shadow-white/10 hover:bg-gray-200 transition-colors transform hover:scale-105 active:scale-100">
                <span className="flex items-center gap-2.5">
                  <Rocket className="w-5 h-5" />
                  Criar Conta Gratuita
                </span>
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default LimitedOfferSection;