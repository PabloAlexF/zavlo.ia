'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface WelcomeCardProps {
  userName: string;
  delay: number;
}

export default function WelcomeCard({ userName, delay }: WelcomeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -5 }}
      className="relative h-full min-h-[280px] overflow-hidden rounded-2xl group"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90" />
      
      {/* Animated orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-12 -right-12 w-48 h-48 bg-blue-400 rounded-full blur-3xl"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-400 rounded-full blur-3xl"
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-8">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full mb-4"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-xs font-bold text-white">Premium Dashboard</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.3 }}
            className="text-3xl sm:text-4xl font-black text-white mb-2"
          >
            Bem-vindo de volta,
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.4 }}
            className="text-2xl sm:text-3xl font-bold text-white/90"
          >
            {userName}! 👋
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.5 }}
          className="flex items-center gap-2 text-sm text-white/80"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Todos os sistemas operacionais</span>
        </motion.div>
      </div>

      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>
    </motion.div>
  );
}
