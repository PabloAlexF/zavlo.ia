'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, TrendingDown, TrendingUp, Target, X, Sparkles, Zap, ShoppingBag, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface SortSelectionModalProps {
  onSelect: (sortBy: string) => void;
  onCancel: () => void;
}

export function SortSelectionModal({ onSelect, onCancel }: SortSelectionModalProps) {
  const [selectedSort, setSelectedSort] = useState<string>('');
  const [step, setStep] = useState<'info' | 'sort'>('info');

  const sortOptions = [
    {
      value: 'RELEVANCE',
      label: 'Melhor resultado',
      desc: 'Produtos mais relevantes para sua busca',
      icon: Target,
      color: 'violet',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      value: 'LOWEST_PRICE',
      label: 'Menor preço',
      desc: 'Do mais barato ao mais caro',
      icon: TrendingDown,
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      value: 'HIGHEST_PRICE',
      label: 'Maior preço',
      desc: 'Do mais caro ao mais barato',
      icon: TrendingUp,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    }
  ];

  const handleContinue = () => {
    setStep('sort');
  };

  const handleSelect = (value: string) => {
    setSelectedSort(value);
    setTimeout(() => onSelect(value), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-[#13131f] to-[#1a1a2e] p-6 shadow-2xl overflow-hidden"
      >
        {/* Animated Background Gradient */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-white z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <AnimatePresence mode="wait">
          {step === 'info' ? (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              {/* Animated Icon */}
              <motion.div
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 mx-auto"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <ShoppingBag className="h-8 w-8 text-white" />
              </motion.div>

              {/* Title with Animation */}
              <motion.h3
                className="mb-3 text-2xl font-bold text-center bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Pronto para buscar!
              </motion.h3>

              <motion.p
                className="mb-6 text-center text-slate-400 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Vamos encontrar as melhores ofertas para você
              </motion.p>

              {/* Info Cards */}
              <div className="space-y-3 mb-6">
                <motion.div
                  className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 flex-shrink-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Target className="h-6 w-6 text-blue-400" />
                  </motion.div>
                  <div className="flex-1">
                    <div className="font-semibold text-white text-base mb-0.5">20 Resultados</div>
                    <div className="text-xs text-slate-400">Dos melhores marketplaces</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20 flex-shrink-0"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Zap className="h-6 w-6 text-violet-400" />
                  </motion.div>
                  <div className="flex-1">
                    <div className="font-semibold text-white text-base mb-0.5">1 Crédito</div>
                    <div className="text-xs text-slate-400">Será descontado da sua conta</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 flex-shrink-0"
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-6 w-6 text-green-400" />
                    </motion.div>
                  </motion.div>
                  <div className="flex-1">
                    <div className="font-semibold text-white text-base mb-0.5">Busca Inteligente</div>
                    <div className="text-xs text-slate-400">IA compara preços em tempo real</div>
                  </div>
                </motion.div>
              </div>

              {/* Continue Button */}
              <motion.button
                onClick={handleContinue}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl font-semibold text-base shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 flex items-center justify-center gap-2 group relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative z-10">Prosseguir</span>
                <ArrowRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="sort"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              {/* Icon */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600">
                <ArrowUpDown className="h-6 w-6 text-white" />
              </div>

              {/* Title */}
              <h3 className="mb-2 text-xl font-semibold text-white">
                Como ordenar os resultados?
              </h3>
              <p className="mb-6 text-sm text-slate-400">
                Escolha a melhor forma de visualizar os produtos
              </p>

              {/* Options */}
              <div className="space-y-3">
                {sortOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(option.value)}
                      className={`w-full rounded-xl border-2 p-4 text-left transition-all relative overflow-hidden ${
                        selectedSort === option.value
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      {selectedSort === option.value && (
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-r ${option.gradient} opacity-10`}
                          layoutId="selectedBg"
                          transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        />
                      )}
                      <div className="flex items-center gap-3 relative z-10">
                        <motion.div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${option.color}-500/20 flex-shrink-0`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon className={`h-5 w-5 text-${option.color}-400`} />
                        </motion.div>
                        <div className="flex-1">
                          <div className="font-semibold text-white text-base mb-0.5">{option.label}</div>
                          <div className="text-xs text-slate-400">{option.desc}</div>
                        </div>
                        {selectedSort === option.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-5 w-5 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0"
                          >
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
