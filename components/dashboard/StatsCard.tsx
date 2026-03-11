'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

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
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative group"
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity rounded-2xl`} />
      
      {/* Card */}
      <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 overflow-hidden">
        {/* Background decoration */}
        <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full blur-2xl`} />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${color} bg-opacity-20`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            {trend !== 0 && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span className="text-xs font-bold">{Math.abs(trend)}%</span>
              </div>
            )}
          </div>

          {/* Value */}
          <div className="mb-2">
            <h3 className="text-3xl font-black text-white">{value.toLocaleString()}</h3>
          </div>

          {/* Label */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-400">{title}</p>
            <p className="text-xs text-gray-500">{trendLabel}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
