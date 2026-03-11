'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WelcomeCardProps {
  userName: string;
  delay?: number;
}

export default function WelcomeCard({ userName, delay = 0 }: WelcomeCardProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 overflow-hidden group cursor-pointer h-full"
      whileHover={{ scale: 1.02 }}
    >
      {/* Abstract Background Art */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-400 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full mb-4"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-xs font-semibold text-white">Painel Premium</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.3 }}
            className="text-3xl font-black text-white mb-2"
          >
            Bem-vindo de volta,
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.4 }}
            className="text-4xl font-black text-white mb-4"
          >
            {userName}! 👋
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.5 }}
            className="text-white/80 text-sm leading-relaxed"
          >
            Pronto para encontrar as melhores ofertas hoje? Nossa IA está preparada para ajudar você a economizar.
          </motion.p>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.6 }}
          onClick={() => router.push('/chat')}
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-white/90 transition-all shadow-lg group/btn"
        >
          Começar Busca
          <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
        </motion.button>
      </div>

      {/* Animated Particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full"
          initial={{
            x: Math.random() * 300,
            y: Math.random() * 300,
            opacity: 0,
          }}
          animate={{
            y: [null, -100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </motion.div>
  );
}
