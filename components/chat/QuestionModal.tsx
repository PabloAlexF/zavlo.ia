'use client';

import { motion } from 'framer-motion';
import { X, MapPin, Tag, DollarSign } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface PriceSuggestion { label: string; min?: number; max?: number }

interface QuestionModalProps {
  question: string | { question: string; suggestions?: PriceSuggestion[] };
  missingFields: string[];
  questionType?: string;
  onAnswer: (answer: string) => void;
  onSkip: () => void;
  userLocation?: { city?: string; state?: string };
}

export function QuestionModal({ question, missingFields, questionType, onAnswer, onSkip, userLocation }: QuestionModalProps) {
  const [locationInput, setLocationInput] = useState('');
  const [yearInput, setYearInput] = useState('');
  const [priceInput, setPriceInput] = useState('');

  const activeType = questionType ?? missingFields[0] ?? null;

  const isConditionQuestion = activeType === 'condition';
  const isLocationQuestion  = activeType === 'location';
  const isYearQuestion      = activeType === 'year';
  const isPriceQuestion     = activeType === 'price_range';

  const questionText = typeof question === 'object' ? question.question : question;
  const priceSuggestions: PriceSuggestion[] = typeof question === 'object' && question.suggestions
    ? question.suggestions
    : [
        { label: 'até 30mil',      max: 30000 },
        { label: 'até 50mil',      max: 50000 },
        { label: 'até 80mil',      max: 80000 },
        { label: 'acima de 80mil', min: 80000 },
      ];

  // Guard contra double-submit
  const hasSubmittedRef = useRef(false);

  // Resetar inputs e guard a cada nova pergunta
  useEffect(() => {
    hasSubmittedRef.current = false;
    setLocationInput('');
    setYearInput('');
    setPriceInput('');
  }, [activeType]);

  if (!activeType) return null;

  const safeSubmit = (value: string) => {
    if (hasSubmittedRef.current || !value.trim()) return;
    hasSubmittedRef.current = true;
    onAnswer(value.trim());
  };

  const handleSubmit = () => {
    if (isLocationQuestion) safeSubmit(locationInput);
    else if (isYearQuestion) safeSubmit(yearInput);
    else if (isPriceQuestion) safeSubmit(priceInput);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const isDisabled =
    (isLocationQuestion && !locationInput.trim()) ||
    (isYearQuestion     && !yearInput.trim()) ||
    (isPriceQuestion    && !priceInput.trim());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center bg-gradient-to-t from-black/80 to-transparent pb-2 pt-8 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onSkip(); }}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-t-2xl border border-white/10 bg-gradient-to-br from-[#13131f] to-[#1a1a2e] p-5 shadow-2xl"
      >
        <button
          onClick={onSkip}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600">
          {isConditionQuestion ? (
            <Tag className="h-6 w-6 text-white" />
          ) : isYearQuestion ? (
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ) : isPriceQuestion ? (
            <DollarSign className="h-6 w-6 text-white" />
          ) : (
            <MapPin className="h-6 w-6 text-white" />
          )}
        </div>

        <h3 className="mb-2 text-xl font-semibold text-white">{questionText}</h3>
        <p className="mb-6 text-sm text-slate-400">Isso ajuda a encontrar os melhores resultados para você</p>

        <div className="space-y-3">
          {/* ── Condição ── */}
          {isConditionQuestion && (
            <>
              <p className="mb-3 text-sm text-slate-300">Qual condição você prefere?</p>
              {[
                { value: 'novo', label: 'Novo', desc: '0km, lacrado ou nunca usado' },
                { value: 'usado', label: 'Usado', desc: 'Seminovo ou segunda mão' },
                { value: 'ambos', label: 'Tanto faz', desc: 'Ver todas as opções' },
              ].map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => safeSubmit(option.value)}
                  className="w-full rounded-xl border-2 border-white/10 bg-white/5 p-4 text-left transition-all hover:border-violet-500 hover:bg-violet-500/10"
                >
                  <span className="font-semibold text-white text-base">{option.label}</span>
                  <p className="mt-0.5 text-xs text-slate-500">{option.desc}</p>
                </motion.button>
              ))}
            </>
          )}

          {/* ── Preço ── */}
          {isPriceQuestion && (
            <div className="space-y-3">
              <p className="text-sm text-slate-300 mb-1">Digite ou escolha uma faixa:</p>
              <input
                type="text"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Ex: até 50mil ou entre 30mil e 60mil"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
                autoFocus
              />
              <div className="grid grid-cols-1 gap-2">
                {priceSuggestions.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => safeSubmit(JSON.stringify({ type: 'price_range', value: s }))}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-left text-slate-300 hover:border-violet-500 hover:bg-violet-500/10 hover:text-white transition-all"
                  >
                    💰 {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Ano ── */}
          {isYearQuestion && (
            <div className="space-y-3">
              <p className="text-sm text-slate-300 mb-1">Digite o ano ou faixa de anos:</p>
              <input
                type="text"
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Ex: 2020 ou 2018-2022"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
                autoFocus
              />
              <div className="grid grid-cols-3 gap-2">
                {['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2015'].map((year) => (
                  <button
                    key={year}
                    onClick={() => safeSubmit(year)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:border-violet-500 hover:bg-violet-500/10 hover:text-white transition-colors"
                  >
                    {year}
                  </button>
                ))}
                <button
                  onClick={() => safeSubmit('qualquer ano')}
                  className="col-span-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400 hover:border-violet-500 hover:bg-violet-500/10 hover:text-white transition-colors"
                >
                  Qualquer ano
                </button>
              </div>
            </div>
          )}

          {/* ── Localização ── */}
          {isLocationQuestion && (
            <div className="space-y-3">
              <p className="text-sm text-slate-300 mb-1">Digite a cidade ou estado:</p>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Ex: São Paulo, SP"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
                autoFocus
              />
              {(userLocation?.city || userLocation?.state) && (
                <div className="flex gap-2 flex-wrap">
                  {userLocation.city && (
                    <button
                      onClick={() => safeSubmit(userLocation.city!)}
                      className="flex-1 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm text-violet-300 hover:border-violet-500 hover:bg-violet-500/20 transition-colors"
                    >
                      📍 {userLocation.city}
                    </button>
                  )}
                  {userLocation.state && (
                    <button
                      onClick={() => safeSubmit(userLocation.state!)}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:border-violet-500 hover:bg-violet-500/10 hover:text-white transition-colors"
                    >
                      {userLocation.state}
                    </button>
                  )}
                  <button
                    onClick={() => safeSubmit('todo o brasil')}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400 hover:border-violet-500 hover:bg-violet-500/10 hover:text-white transition-colors"
                  >
                    🇧🇷 Todo o Brasil
                  </button>
                </div>
              )}
              {!userLocation?.city && !userLocation?.state && (
                <button
                  onClick={() => safeSubmit('todo o brasil')}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400 hover:border-violet-500 hover:bg-violet-500/10 hover:text-white transition-colors"
                >
                  🇧🇷 Todo o Brasil
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onSkip}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-slate-300 transition-colors hover:bg-white/10 text-sm"
          >
            Continuar sem filtro
          </button>
          {!isConditionQuestion && (
            <button
              onClick={handleSubmit}
              disabled={isDisabled}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
