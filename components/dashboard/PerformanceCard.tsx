'use client';

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface PerformanceCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color: string;
  delay?: number;
  onClick?: () => void;
}

export default function PerformanceCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color,
  delay = 0,
  onClick,
}: PerformanceCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -5, scale: 1.05 }}
      onClick={onClick}
      className={`bg-gradient-to-br ${color} backdrop-blur-xl border border-white/20 rounded-2xl p-6 relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-2">
              {title}
            </p>
            <p className="text-4xl font-black text-white mb-1" suppressHydrationWarning>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-white/70">{subtitle}</p>
            )}
          </div>
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        {trend !== undefined && (
          <div className="flex items-center gap-2">
            {isPositive && <TrendingUp className="w-4 h-4 text-green-400" />}
            {isNegative && <TrendingDown className="w-4 h-4 text-red-400" />}
            <span
              className={`text-sm font-bold ${
                isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'
              }`}
            >
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            {trendLabel && (
              <span className="text-xs text-white/60">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
