'use client';

import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CircularChartProps {
  title: string;
  percentage: number;
  icon: LucideIcon;
  color: string;
  delay: number;
}

export default function CircularChart({ title, percentage, icon: Icon, color, delay }: CircularChartProps) {
  const [progress, setProgress] = useState(0);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, delay * 1000 + 300);
    return () => clearTimeout(timer);
  }, [percentage, delay]);

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
      <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 h-full min-h-[280px] flex flex-col">
        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide">{title}</h3>
          <div className={`p-2 rounded-lg bg-gradient-to-br ${color} bg-opacity-20`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Circular Progress */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            {/* Background circle */}
            <svg className="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <motion.circle
                cx="50%"
                cy="50%"
                r="45"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut", delay: delay + 0.3 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Percentage text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + 0.5, type: "spring" }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl font-black text-white">{progress}%</p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-400">Baseado em métricas reais</p>
        </div>
      </div>
    </motion.div>
  );
}
