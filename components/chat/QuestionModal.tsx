'use client';

import { motion } from 'framer-motion';
import { X, MapPin, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';

interface QuestionModalProps {
  question: string;
  missingFields: string[];
  onAnswer: (answer: string) => void;
  onSkip: () => void;
  userLocation?: { city?: string; state?: string };
}

export function QuestionModal({ question, missingFields, onAnswer, onSkip, userLocation }: QuestionModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [locationInput, setLocationInput] = useState<string>('');
  const [yearInput, setYearInput] = useState<string>('');
  const [priceInput, setPriceInput] = useState<string>('');

  const isConditionQuestion = missingFields[0] === 'condition';
  const isLocationQuestion = missingFields[0] === 'location';
  const isYearQuestion = missingFields[0] === 'year';
  const isPriceQuestion = missingFields[0] === 'price_range';

  const handleSubmit = () => {
    if (isLocationQuestion && locationInput.trim()) {
      onAnswer(locationInput.trim());
    } else if (isYearQuestion && yearInput.trim()) {
      onAnswer(yearInput.trim());
    } else if (isPriceQuestion && priceInput.trim()) {
      onAnswer(priceInput.trim());
    } else if (selectedAnswer) {
      onAnswer(selectedAnswer);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onSkip}
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
          onClick={onSkip}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600">
          {isConditionQuestion ? (
            <Tag className="h-6 w-6 text-white" />
          ) : isYearQuestion ? (
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ) : (
            <MapPin className="h-6 w-6 text-white" />
          )}
        </div>

        {/* Question */}
        <h3 className="mb-2 text-xl font-semibold text-white">
          {question.split('\n')[0]}
        </h3>
        <p className="mb-6 text-sm text-slate-400">
          Isso ajuda a encontrar os melhores resultados para você
        </p>

        {/* Options */}
        <div className="space-y-3">
          {isConditionQuestion && (
            <>
              <p className="mb-3 text-sm text-slate-300">Qual condição você prefere?</p>
              {['novo', 'usado'].map((option) => (
                <motion.button
                  key={option}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedAnswer(option)}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                    selectedAnswer === option
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white capitalize text-base">{option}</span>
                    {selectedAnswer === option && (
                      <div className="h-5 w-5 rounded-full bg-violet-500 flex items-center justify-center">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </>
          )}

          {isPriceQuestion && (
            <div className="space-y-3">
              <p className="text-sm text-slate-300 mb-3">Digite sua faixa de preço:</p>
              <input
                type="text"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="Ex: até 50mil ou entre 30mil e 60mil"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-2">
                {['até 30mil', 'até 50mil', 'até 80mil', 'até 100mil'].map((price) => (
                  <button
                    key={price}
                    onClick={() => setPriceInput(price)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    {price}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isYearQuestion && (
            <div className="space-y-3">
              <p className="text-sm text-slate-300 mb-3">Digite o ano ou faixa de anos:</p>
              <input
                type="text"
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
                placeholder="Ex: 2020 ou 2018-2022"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
                autoFocus
              />
              <div className="grid grid-cols-3 gap-2">
                {['2024', '2023', '2022', '2021', '2020', '2019'].map((year) => (
                  <button
                    key={year}
                    onClick={() => setYearInput(year)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLocationQuestion && (
            <div className="space-y-3">
              <p className="text-sm text-slate-300 mb-3">Digite a cidade ou estado:</p>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Ex: São Paulo, SP"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                {userLocation?.city && (
                  <button
                    onClick={() => setLocationInput(userLocation.city!)}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    {userLocation.city}
                  </button>
                )}
                {userLocation?.state && (
                  <button
                    onClick={() => setLocationInput(userLocation.state!)}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    {userLocation.state}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onSkip}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-slate-300 transition-colors hover:bg-white/10 text-sm"
          >
            Buscar sem isso
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer && !locationInput.trim() && !yearInput.trim() && !priceInput.trim()}
            className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
