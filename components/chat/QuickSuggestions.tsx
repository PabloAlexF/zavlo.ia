'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface QuickSuggestionsProps {
  onSuggestionClick: (text: string) => void;
  onImageSearchClick?: () => void;
  showMoreSuggestions: boolean;
  onToggleMore: () => void;
  isIntroduction: boolean;
}

export function QuickSuggestions({
  onSuggestionClick,
  onImageSearchClick,
  showMoreSuggestions,
  onToggleMore,
  isIntroduction
}: QuickSuggestionsProps) {
  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto px-3 py-6 sm:px-6 sm:py-10 md:px-8 md:py-12" style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.08) 0%, transparent 55%), #0A0A12' }}>
      <div className="w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
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
            transition={{ delay: 0.2, duration: 0.45, ease: 'easeOut' }}
            className="mb-2 text-[24px] font-semibold tracking-tight text-white sm:mb-3 sm:text-4xl md:text-5xl"
          >
            {isIntroduction ? 'Como posso te chamar?' : 'Bem-vindo! 👋 Encontre o melhor preço'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.45, ease: 'easeOut' }}
            className="mx-auto max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base"
          >
            {isIntroduction
              ? 'Me conte seu nome para começarmos nossa jornada'
              : 'Pesquise produtos, compare marketplaces e receba sugestões em segundos'}
          </motion.p>
        </motion.div>

        {!isIntroduction && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: 'easeOut' }}
            className="mx-auto max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.45, ease: 'easeOut' }}
              className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-[#13131f] p-3.5 text-left shadow-[0_10px_30px_rgba(0,0,0,0.25)] sm:p-5"
            >
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="space-y-3">
                <p className="text-[15px] leading-relaxed text-slate-200 sm:text-base">
                  Olá! Eu sou a <span className="font-semibold text-white">Zavlo</span> e vou te ajudar a encontrar o melhor preço.
                </p>
                <div className="space-y-1.5 text-[15px] leading-relaxed text-slate-300 sm:text-base">
                  <p>1️⃣ Você me diz o produto que quer encontrar.</p>
                  <p>2️⃣ Eu faço perguntas rápidas para refinar sua busca.</p>
                  <p>3️⃣ Busco no marketplace principal e te mostro os melhores resultados.</p>
                  <p>4️⃣ Se quiser, expandimos para outras plataformas.</p>
                </div>
                <p className="text-sm text-slate-500">
                  💡 Dica: inclua detalhes como marca, ano, modelo ou faixa de preço para melhorar a precisão.
                </p>
                <p className="text-sm text-slate-500">
                  🚗 Veículos: se for <span className="font-medium text-slate-300">novo</span>, priorizo Mercado Livre; se for <span className="font-medium text-slate-300">usado</span>, priorizo OLX.
                </p>
                <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap">
                  <motion.button
                    whileHover={{ y: -1, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSuggestionClick('__quick_start__')}
                    className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-95 sm:w-auto sm:py-2 sm:text-xs"
                  >
                    Começar agora
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -1, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onImageSearchClick?.()}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-violet-500/30 hover:bg-violet-500/[0.07] hover:text-white sm:w-auto sm:py-2 sm:text-xs"
                  >
                    Buscar por imagem
                  </motion.button>
                </div>
              </div>
            </motion.div>
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
