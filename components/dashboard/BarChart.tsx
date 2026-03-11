'use client';

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface BarChartProps {
  title: string;
  data: number[];
  labels: string[];
  delay?: number;
}

export default function BarChart({ 
  title, 
  data, 
  labels,
  delay = 0 
}: BarChartProps) {
  const maxValue = Math.max(...data);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 relative overflow-hidden group"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-400">Últimos 7 dias</p>
          </div>
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Users className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-48">
          <div className="flex items-end justify-between h-full gap-2">
            {data.map((value, index) => {
              const height = (value / maxValue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  {/* Bar */}
                  <motion.div
                    className="w-full bg-gradient-to-t from-purple-600 via-purple-500 to-pink-500 rounded-t-lg relative group/bar cursor-pointer"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ 
                      delay: delay + 0.5 + index * 0.1, 
                      duration: 0.6,
                      ease: "easeOut"
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-bold opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                      {value}
                    </div>
                  </motion.div>
                  
                  {/* Label */}
                  <span className="text-xs text-gray-400 font-medium">
                    {labels[index]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Média</p>
            <p className="text-lg font-bold text-white">
              {Math.round(data.reduce((a, b) => a + b, 0) / data.length)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Pico</p>
            <p className="text-lg font-bold text-white">{Math.max(...data)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Total</p>
            <p className="text-lg font-bold text-white">
              {data.reduce((a, b) => a + b, 0)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
