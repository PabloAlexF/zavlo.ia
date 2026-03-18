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
  if (!activeType) return null;

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

  const isDisabled =
    (isLocationQuestion && !locationInput.trim()) ||
    (isYearQuestion     && !yearInput.trim()) ||
    (isPriceQuestion    && !priceInput.trim());

  // Anti double-submit: debounce + Enter não disparam duas vezes
  const hasSubmittedRef = useRef(false);
  const safeSubmit = (value: string) => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    onAnswer(value);
  };

  // Debounce isolado por tipo de campo
  const debounceRefs = useRef<{
    price: ReturnType<typeof setTimeout> | null;
    year:  ReturnType<typeof setTimeout> | null;
    location: ReturnType<typeof setTimeout> | null;
  }>({ price: null, year: null, location: null });

  const debounceSubmit = (type: 'price' | 'year' | 'location', value: string) => {
    if (debounceRefs.current[type]) clearTimeout(debounceRefs.current[type]!);
    if (!value.trim()) return;
    debounceRefs.current[type] = setTimeout(() => safeSubmit(value.trim()), 800);
  };

  // Reset do guard a cada nova pergunta
  useEffect(() => {
    hasSubmittedRef.current = false;
  }, [question]);

  useEffect(() => () => {
    Object.values(debounceRefs.current).forEach((t) => { if (t) clearTimeout(t); });
  }, []);

  const handleSubmit = () => {
    if (isLocationQuestion && locationInput.trim()) safeSubmit(locationInput.trim());
    else if (isYearQuestion && yearInput.trim())    safeSubmit(yearInput.trim());
    else if (isPriceQuestion && priceInput.trim())  safeSubmit(priceInput.trim());
  };

  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onSkip(); }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-[#13131f] to-[#1a1a2e] p-6 shadow-2xl"
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
          {isConditionQuestion && (
            <>
              <p className="mb-3 text-sm text-slate-300">Qual condição você prefere?</p>
              {['novo', 'usado'].map((option) => (
                <motion.button
                  key={option}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => safeSubmit(option)}
                  className="w-full rounded-xl border-2 border-white/10 bg-white/5 p-4 text-left transition-all hover:border-violet-500 hover:bg-violet-500/10"
                >
                  <span className="font-semibold text-white capitalize text-base">{option}</span>
                </motion.button>
              ))}
            </>
          )}

          {isPriceQuestion && (
            <div className="space-y-3">
              <p className="text-sm text-slate-300 mb-1">Digite ou escolha uma faixa:</p>
              <input
                type="text"
                value={priceInput}
                onChange={(e) => { setPriceInput(e.target.value); debounceSubmit('price', e.target.value); }}
                onKeyDown={onKey}
                placeholder="Ex: até 50mil ou entre 30mil e 60mil"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
                autoFocus
              />
    {priceInput && (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="animate-pulse">●</span> Buscando automaticamente...
              </p>
            )}
              <div className="grid grid-cols-1 gap-2">
                {priceSuggestions.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => {
                      if (hasSubmittedRef.current) return;
                      safeSubmit(JSON.stringify({ type: 'price_range', value: s }));
                    }}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-left text-slate-300 hover:border-violet-500 hover:bg-violet-500/10 hover:text-white transition-all"
                  >
                    💰 {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isYearQuestion && (
            <div className="space-y-3">
              <p className="text-sm text-slate-300 mb-1">Digite o ano ou faixa de anos:</p>
              <input
                type="text"
                value={yearInput}
                onChange={(e) => { setYearInput(e.target.value); debounceSubmit('year', e.target.value); }}
                onKeyDown={onKey}
                placeholder="Ex: 2020 ou 2018-2022"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
                autoFocus
              />
            {yearInput && (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="animate-pulse">●</span> Buscando automaticamente...
              </p>
            )}
              <div className="grid grid-cols-3 gap-2">
                {['2024', '2023', '2022', '2021', '2020', '2019'].map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      if (hasSubmittedRef.current) return;
                      safeSubmit(year);
                    }}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:border-violet-500 hover:bg-violet-500/10 hover:text-white transition-colors"
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLocationQuestion && (
            <div className="space-y-3">
              <p className="text-sm text-slate-300 mb-1">Digite a cidade ou estado:</p>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => { setLocationInput(e.target.value); debounceSubmit('location', e.target.value); }}
                onKeyDown={onKey}
                placeholder="Ex: São Paulo, SP"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
                autoFocus
              />
            {locationInput && (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="animate-pulse">●</span> Buscando automaticamente...
              </p>
            )}
              {(userLocation?.city || userLocation?.state) && (
                <div className="flex gap-2">
                  {userLocation.city && (
                    <button
                      onClick={() => {
                        if (hasSubmittedRef.current) return;
                        safeSubmit(userLocation.city!);
                      }}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:border-violet-500 hover:bg-violet-500/10 hover:text-white transition-colors"
                    >
                      {userLocation.city}
                    </button>
                  )}
                  {userLocation.state && (
                    <button
                      onClick={() => {
                        if (hasSubmittedRef.current) return;
                        safeSubmit(userLocation.state!);
                      }}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:border-violet-500 hover:bg-violet-500/10 hover:text-white transition-colors"
                    >
                      {userLocation.state}
                    </button>
                  )}
                </div>
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
