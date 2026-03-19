'use client';

import { motion } from 'framer-motion';

export function SearchingAnimation() {
  const steps = [
    { text: 'Analisando marketplaces', delay: 0 },
    { text: 'Comparando preços', delay: 0.6 },
    { text: 'Organizando resultados', delay: 1.2 },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-6 space-y-5">
      {/* Rings animados */}
      <div className="relative w-20 h-20">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-violet-500/40"
            style={{ inset: `${i * 6}px` }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
          />
        ))}
        <motion.div
          className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <span className="text-base">🔍</span>
        </motion.div>
      </div>

      {/* Texto principal */}
      <motion.p
        className="text-sm font-semibold text-white"
        animate={{ opacity: [1, 0.6, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        Buscando produtos...
      </motion.p>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-2 text-xs text-slate-400"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: step.delay, duration: 0.4 }}
          >
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-violet-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: step.delay }}
            />
            {step.text}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
