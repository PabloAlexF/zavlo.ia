'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';

export default function LimitedOfferSection() {
  const { user } = useUser();

  return (
    <motion.section 
      className="container mx-auto px-4 py-20 sm:py-28 lg:py-32"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Clean minimalist card */}
        <motion.div 
          className="bg-white/[0.02] border border-white/[0.08] rounded-3xl p-12 sm:p-16 lg:p-20 text-center backdrop-blur-xl relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-purple-500/[0.03] pointer-events-none" />
          
          <div className="relative z-10">
            {/* Small badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-xs font-medium text-blue-400 tracking-wide">Oferta de Lançamento</span>
            </motion.div>
            
            {/* Clean title */}
            <motion.h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white mb-6 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              {user ? 'Comece a buscar' : 'Comece gratuitamente'}
            </motion.h2>
            
            {/* Subtitle */}
            <motion.p 
              className="text-lg lg:text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-light"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              {user ? 'Encontre os melhores preços em segundos.' : 'Acesso completo por 7 dias. Sem cartão de crédito.'}
            </motion.p>

            {/* Clean feature list */}
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-6 mb-12"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              {[
                'Buscas ilimitadas',
                'IA avançada',
                'Todos os recursos'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-300">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <Link href={user ? '/chat' : '/auth'}>
              <motion.button 
                className="group relative px-8 py-4 bg-white text-black rounded-full font-medium text-base inline-flex items-center gap-2 overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <span className="relative z-10">{user ? 'Ir para busca' : 'Começar agora'}</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                
                {/* Hover effect */}
                <motion.div
                  className="absolute inset-0 bg-gray-100"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>

            {/* Small text */}
            {!user && (
              <motion.p 
                className="text-xs text-gray-600 mt-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
              >
                Cancele quando quiser. Sem compromisso.
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
