'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, Target, Bell } from 'lucide-react';

interface SavingsCardProps {
  totalSavings: number;
  activeAlerts: number;
  alertsReached: number;
  biggestDrop: number;
  delay?: number;
}

export default function SavingsCard({
  totalSavings,
  activeAlerts,
  alertsReached,
  biggestDrop,
  delay = 0,
}: SavingsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-green-200 uppercase tracking-wide mb-2">
              Economia Total
            </h3>
            <p className="text-5xl font-black text-green-400" suppressHydrationWarning>
              R$ {totalSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-green-300 mt-2">
              Com alertas de preço
            </p>
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <DollarSign className="w-16 h-16 text-green-400 opacity-50" />
          </motion.div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center mb-2">
              <Bell className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white" suppressHydrationWarning>
              {activeAlerts}
            </p>
            <p className="text-xs text-gray-400">Alertas Ativos</p>
          </div>

          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white" suppressHydrationWarning>
              {alertsReached}
            </p>
            <p className="text-xs text-gray-400">Metas Atingidas</p>
          </div>

          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingDown className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white" suppressHydrationWarning>
              {biggestDrop}%
            </p>
            <p className="text-xs text-gray-400">Maior Queda</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
