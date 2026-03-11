'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface CircularChartProps {
  title: string;
  percentage: number;
  icon: LucideIcon;
  color: string;
  delay?: number;
}

export default function CircularChart({ 
  title, 
  percentage, 
  icon: Icon, 
  color,
  delay = 0 
}: CircularChartProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 relative overflow-hidden group"
    >
      {/* Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            {title}
          </h3>
          <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Circular Progress */}
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            {/* Background Circle */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-white/10"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="64"
                cy="64"
                r="45"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, delay: delay + 0.3, ease: "easeOut" }}
                style={{
                  strokeDasharray: circumference,
                }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.5, duration: 0.5 }}
                className="text-3xl font-black text-white"
              >
                {percentage}%
              </motion.span>
              <span className="text-xs font-semibold text-white">Completo</span>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Meta</span>
            <span className="text-white font-semibold">100%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
