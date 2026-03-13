'use client';

import { motion } from 'framer-motion';
import { Search, Image as ImageIcon, TrendingUp, Sparkles, Tag } from 'lucide-react';

interface QuickSuggestionsProps {
  onSuggestionClick: (text: string) => void;
  showMoreSuggestions: boolean;
  onToggleMore: () => void;
  isIntroduction: boolean;
}

export function QuickSuggestions({
  onSuggestionClick,
  showMoreSuggestions,
  onToggleMore,
  isIntroduction
}: QuickSuggestionsProps) {
  const suggestions = [
    { icon: <Search className="h-4 w-4" />, title: 'Encontrar o produto mais barato', query: 'iPhone 15 Pro' },
    { icon: <TrendingUp className="h-4 w-4" />, title: 'Comparar preços', query: 'Notebook Gamer' },
    { icon: <ImageIcon className="h-4 w-4" />, title: 'Buscar por imagem', query: 'buscar por imagem' },
    { icon: <Tag className="h-4 w-4" />, title: 'Descobrir ofertas', query: 'Smart TV 50 polegadas' },
  ];

  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 py-6 sm:px-6 sm:py-10 md:px-8 md:py-12" style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.06) 0%, transparent 55%), #0A0A12' }}>
      <div className="w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center sm:mb-12"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-[0_0_32px_rgba(139,92,246,0.35)] sm:mb-6 sm:h-14 sm:w-14"
          >
            <Sparkles className="h-6 w-6 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-2 text-2xl font-semibold tracking-tight text-white sm:mb-3 sm:text-4xl md:text-5xl"
          >
            {isIntroduction ? 'Como posso te chamar?' : 'Vamos começar'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mx-auto max-w-xl text-xs leading-relaxed text-slate-500 sm:text-sm md:text-base"
          >
            {isIntroduction
              ? 'Me conte seu nome para começarmos nossa jornada'
              : 'Pergunte qualquer produto, compare preços ou encontre as melhores ofertas'}
          </motion.p>
        </motion.div>

        {!isIntroduction && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + index * 0.07 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSuggestionClick(suggestion.query)}
                className="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5 text-left transition-all duration-200 hover:border-violet-500/30 hover:bg-violet-500/[0.07]"
              >
                <span className="rounded-lg border border-white/[0.08] bg-white/[0.05] p-2 text-slate-400 transition-colors group-hover:border-violet-500/30 group-hover:bg-violet-500/10 group-hover:text-violet-300">
                  {suggestion.icon}
                </span>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white">{suggestion.title}</span>
              </motion.button>
            ))}
          </motion.div>
        )}

        {isIntroduction && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mx-auto flex max-w-xs flex-col gap-3"
          >
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const name = prompt('👋 Qual é o seu nome?');
                if (name) onSuggestionClick(`Meu nome é ${name}`);
              }}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(139,92,246,0.35)] transition-all hover:shadow-[0_4px_18px_rgba(139,92,246,0.5)]"
            >
              Me apresentar
            </motion.button>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSuggestionClick('Quero buscar um produto')}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] py-3.5 text-sm font-medium text-slate-300 transition-all hover:border-violet-500/30 hover:bg-violet-500/[0.07] hover:text-white"
            >
              Começar a buscar
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
