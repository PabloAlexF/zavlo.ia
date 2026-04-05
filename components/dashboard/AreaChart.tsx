'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface AreaChartProps {
  title: string;
  data: number[];
  labels: string[];
  delay: number;
}

export default function AreaChart({ title, data, labels, delay }: AreaChartProps) {
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

    // Calculate points
    const max = Math.max(...data, 1);
    const points = data.map((value, index) => ({
      x: padding + (chartWidth / (data.length - 1)) * index,
      y: padding + chartHeight - (value / max) * chartHeight,
    }));

    if (points.length === 0) return;

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(148, 163, 184, 0.28)');
    gradient.addColorStop(1, 'rgba(148, 163, 184, 0.02)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding);
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.lineTo(point.x, point.y);
      } else {
        const prevPoint = points[index - 1];
        const cpX = (prevPoint.x + point.x) / 2;
        ctx.bezierCurveTo(cpX, prevPoint.y, cpX, point.y, point.x, point.y);
      }
    });
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
    lineGradient.addColorStop(0, '#E5E7EB');
    lineGradient.addColorStop(1, '#94A3B8');

    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        const prevPoint = points[index - 1];
        const cpX = (prevPoint.x + point.x) / 2;
        ctx.bezierCurveTo(cpX, prevPoint.y, cpX, point.y, point.x, point.y);
      }
    });
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw points
    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#F8FAFC';
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, index) => {
      if (index % Math.ceil(labels.length / 6) === 0) {
        ctx.fillText(label, points[index].x, height - padding + 20);
      }
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
      {/* Glow effect */}
      <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-400">Último período</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg">
            <TrendingUp className="w-4 h-4 text-gray-300" />
            <span className="text-sm font-medium text-gray-300">atividade</span>
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
