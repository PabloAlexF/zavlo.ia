'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, TrendingDown, TrendingUp, Target, X } from 'lucide-react';
import { useState } from 'react';

interface SortSelectionModalProps {
  onSelect: (sortBy: string) => void;
  onCancel: () => void;
}

export function SortSelectionModal({ onSelect, onCancel }: SortSelectionModalProps) {
  const [selectedSort, setSelectedSort] = useState<string>('');

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

  const handleSelect = (value: string) => {
    setSelectedSort(value);
    setTimeout(() => onSelect(value), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center bg-gradient-to-t from-black/80 to-transparent pb-2 pt-8 px-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-t-2xl border border-white/10 bg-gradient-to-br from-[#13131f] to-[#1a1a2e] p-5 shadow-2xl overflow-hidden"
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
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
