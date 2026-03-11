'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface PieChartProps {
  title: string;
  data: { label: string; value: number; color: string }[];
  icon: LucideIcon;
  delay?: number;
}

export default function PieChart({ title, data, icon: Icon, delay = 0 }: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2;

    data.forEach((item) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // Draw center circle for donut effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(15, 15, 20, 0.95)';
    ctx.fill();
  }, [data]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <Icon className="w-6 h-6 text-purple-400" />
        </div>

        <div className="flex items-center gap-6">
          <div className="relative w-40 h-40">
            <canvas ref={canvasRef} className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-black text-white" suppressHydrationWarning>
                  {total}
                </p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-300">{item.label}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white" suppressHydrationWarning>
                    {item.value}
                  </p>
                  <p className="text-xs text-gray-400">
                    {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
