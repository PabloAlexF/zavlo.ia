'use client';

import { motion } from 'framer-motion';
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
      color: 'violet'
    },
    {
      value: 'LOWEST_PRICE',
      label: 'Menor preço',
      desc: 'Do mais barato ao mais caro',
      icon: TrendingDown,
      color: 'green'
    },
    {
      value: 'HIGHEST_PRICE',
      label: 'Maior preço',
      desc: 'Do mais caro ao mais barato',
      icon: TrendingUp,
      color: 'blue'
    }
  ];

  const handleSelect = (value: string) => {
    setSelectedSort(value);
    setTimeout(() => onSelect(value), 150);
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
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-[#13131f] to-[#1a1a2e] p-6 shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600">
          <ArrowUpDown className="h-6 w-6 text-white" />
        </div>

        {/* Title */}
        <h3 className="mb-2 text-xl font-semibold text-white">
          Como ordenar os resultados?
        </h3>
        <p className="mb-2 text-sm text-slate-400">
          Escolha a melhor forma de visualizar os produtos
        </p>
        <div className="mb-6 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
          <p className="text-xs text-blue-300 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Buscaremos até 20 resultados dos melhores marketplaces
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(option.value)}
                className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                  selectedSort === option.value
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${option.color}-500/20 flex-shrink-0`}>
                    <Icon className={`h-5 w-5 text-${option.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white text-base mb-0.5">{option.label}</div>
                    <div className="text-xs text-slate-400">{option.desc}</div>
                  </div>
                  {selectedSort === option.value && (
                    <div className="h-5 w-5 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
