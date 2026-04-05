'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
  trend: number;
  trendLabel: string;
  color: string;
  delay: number;
}

export default function StatsCard({ icon: Icon, title, value, trend, trendLabel, color, delay }: StatsCardProps) {
  const isPositive = trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="relative"
    >
      <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-5">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} opacity-90`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            {trend !== 0 && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                isPositive ? 'bg-white/5 text-gray-200' : 'bg-white/5 text-gray-300'
              }`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span className="text-xs font-medium">{Math.abs(trend)}%</span>
              </div>
            )}
          </div>

          <div className="mb-2.5">
            <h3 className="text-3xl font-semibold text-white" suppressHydrationWarning>{value.toLocaleString()}</h3>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-300">{title}</p>
            <p className="text-xs text-gray-500">{trendLabel}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
