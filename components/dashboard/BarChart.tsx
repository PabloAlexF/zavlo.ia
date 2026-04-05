'use client';

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface BarChartProps {
  title: string;
  data: number[];
  labels: string[];
  delay: number;
}

export default function BarChart({ title, data, labels, delay }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Validar dados
    if (!data || data.length === 0) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    const width = rect.width;
    const height = rect.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Calculate bars
    const max = Math.max(...data, 1);
    const barWidth = chartWidth / data.length - 10;

    if (barWidth <= 0) return;

    // Draw bars with animation
    data.forEach((value, index) => {
      const barHeight = (value / max) * chartHeight;
      const x = padding + (chartWidth / data.length) * index + 5;
      const y = padding + chartHeight - barHeight;

      // Gradient for each bar
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, '#E5E7EB');
      gradient.addColorStop(1, '#94A3B8');

      // Draw bar
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [8, 8, 0, 0]);
      ctx.fill();

      // Draw label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[index], x + barWidth / 2, height - padding + 20);

      // Draw value on top of bar
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
    });
  }, [data, labels]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -5 }}
      className="relative group"
    >
      <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-400">Últimos dias</p>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10">
            <BarChart3 className="w-4 h-4 text-gray-300" />
          </div>
        </div>

        {/* Chart */}
        <canvas
          ref={canvasRef}
          className="w-full h-64"
        />
      </div>
    </motion.div>
  );
}
