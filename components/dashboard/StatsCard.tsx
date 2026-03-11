'use client';

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  color: string;
  delay?: number;
}

export default function StatsCard({ 
  icon: Icon, 
  title, 
  value, 
  trend, 
  trendLabel = 'vs last month',
  color, 
  delay = 0 
}: StatsCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 overflow-hidden group cursor-pointer"
    >
      {/* Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {title}
            </p>
            <h3 className="text-3xl font-black text-white">
              {value}
            </h3>
          </div>
          
          {/* Icon */}
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
        </div>

        {/* Trend */}
        {trend !== undefined && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
              isPositive ? 'bg-green-500/20 text-green-400' : 
              isNegative ? 'bg-red-500/20 text-red-400' : 
              'bg-gray-500/20 text-gray-400'
            }`}>
              {isPositive && <TrendingUp className="w-3 h-3" />}
              {isNegative && <TrendingDown className="w-3 h-3" />}
              <span className="text-xs font-bold">
                {Math.abs(trend)}%
              </span>
            </div>
            <span className="text-xs text-gray-500">{trendLabel}</span>
          </div>
        )}
      </div>

      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  );
}
