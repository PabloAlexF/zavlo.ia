'use client';

import { Clock, MousePointer, Zap, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ComparisonSection() {
  const comparisons = [
    {
      old: { icon: MousePointer, value: '15+', label: 'abas abertas', color: 'text-red-400' },
      new: { icon: Sparkles, value: '1', label: 'conversa com IA', color: 'text-blue-400' }
    },
    {
      old: { icon: Clock, value: '2h', label: 'procurando', color: 'text-orange-400' },
      new: { icon: Zap, value: '30s', label: 'resultado pronto', color: 'text-purple-400' }
    },
    {
      old: { icon: TrendingUp, value: '???', label: 'preço incerto', color: 'text-yellow-400' },
      new: { icon: TrendingUp, value: '40%', label: 'economia garantida', color: 'text-green-400' }
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm font-medium text-blue-400 mb-4">
            Antes vs Agora
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Pare de perder tempo
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              e dinheiro
            </span>
          </h2>
        </motion.div>

        <div className="max-w-5xl mx-auto space-y-6 mb-12">
          {comparisons.map((item, i) => (
            <motion.div
              key={i}
              className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {/* Old Way */}
              <div className="bg-white/5 border border-red-500/20 rounded-2xl p-6 backdrop-blur-sm hover:border-red-500/40 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <item.old.icon className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <div className={`text-3xl font-black ${item.old.color}`}>{item.old.value}</div>
                    <div className="text-sm text-gray-500">{item.old.label}</div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex justify-center">
                <ArrowRight className="w-8 h-8 text-gray-600" />
              </div>

              {/* New Way */}
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm hover:border-blue-500/50 transition-all relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <item.new.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className={`text-3xl font-black ${item.new.color}`}>{item.new.value}</div>
                    <div className="text-sm text-gray-300 font-medium">{item.new.label}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Link href="/auth">
            <motion.button 
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/25 overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Criar Conta Agora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">Plano gratuito • Sem cartão • Acesso imediato</p>
        </motion.div>
      </div>
    </section>
  );
}
