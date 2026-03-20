'use client';

import { motion } from 'framer-motion';

const steps = [
  'Analisando marketplaces',
  'Comparando preços',
  'Organizando resultados',
];

export function SearchingAnimation() {
  return (
    <div className="flex items-center gap-4 py-1">
      {/* Spinner compacto */}
      <div className="relative h-9 w-9 flex-shrink-0">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-violet-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-t-2 border-violet-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-sm">🔍</div>
      </div>

      {/* Steps */}
      <div className="space-y-1.5">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.5, duration: 0.3 }}
          >
            <motion.div
              className="h-1 w-1 rounded-full bg-violet-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.4 }}
            />
            <span className="text-xs text-slate-400">{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
