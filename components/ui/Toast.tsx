'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'from-green-500/20 to-emerald-500/20 border-green-500/50',
    error: 'from-red-500/20 to-rose-500/20 border-red-500/50',
    info: 'from-blue-500/20 to-cyan-500/20 border-blue-500/50',
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 right-4 z-50 max-w-md"
      >
        <div className={`bg-gradient-to-r ${colors[type]} backdrop-blur-xl border rounded-xl p-4 shadow-2xl flex items-center gap-3`}>
          <Icon className="w-5 h-5 text-white flex-shrink-0" />
          <p className="text-white font-medium flex-1">{message}</p>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
