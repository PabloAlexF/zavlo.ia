'use client';

import { motion } from 'framer-motion';

export function SearchingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6">
      {/* Animated circles */}
      <div className="relative w-24 h-24">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-purple-500/30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-4 border-purple-400/50"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
        />
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              🔍
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Animated text */}
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.h3
          className="text-lg font-semibold text-white"
          animate={{
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Buscando produtos...
        </motion.h3>
        
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
          <AnimatedStep delay={0} text="Analisando marketplaces" />
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
          <AnimatedStep delay={0.5} text="Comparando preços" />
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
          <AnimatedStep delay={1} text="Organizando resultados" />
        </div>
      </motion.div>
    </div>
  );
}

function AnimatedStep({ delay, text }: { delay: number; text: string }) {
  return (
    <motion.div
      className="flex items-center space-x-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <motion.div
        className="w-2 h-2 rounded-full bg-purple-500"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay + 0.5,
        }}
      />
      <span>{text}</span>
    </motion.div>
  );
}
