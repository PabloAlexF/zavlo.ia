'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface AreaChartProps {
  title: string;
  data: number[];
  labels: string[];
  delay?: number;
}

export default function AreaChart({ 
  title, 
  data, 
  labels,
  delay = 0 
}: AreaChartProps) {
  const maxValue = Math.max(...data);
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (value / maxValue) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 relative overflow-hidden group"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-400">Desempenho Mensal</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-lg">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-bold text-green-400">+12.5%</span>
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-48">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            {/* Grid Lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="currentColor"
                strokeWidth="0.2"
                className="text-white/10"
              />
            ))}

            {/* Area Gradient */}
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Area Fill */}
            <motion.polygon
              points={`0,100 ${points} 100,100`}
              fill="url(#areaGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.3, duration: 0.8 }}
            />

            {/* Line */}
            <motion.polyline
              points={points}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: delay + 0.5, duration: 1.5, ease: "easeOut" }}
            />

            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>

            {/* Data Points */}
            {data.map((value, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - (value / maxValue) * 80;
              return (
                <motion.circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: delay + 0.7 + index * 0.05 }}
                  className="drop-shadow-lg"
                />
              );
            })}
          </svg>
        </div>

        {/* Labels */}
        <div className="flex justify-between mt-4 text-xs text-gray-400">
          {labels.map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
