'use client';
import { motion } from 'framer-motion';
import { Zap, Crown, Check } from 'lucide-react';
import Link from 'next/link';
export default function LimitedOfferSection() {
    return (<motion.section className="container mx-auto px-4 py-20" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-3xl p-8 sm:p-12 text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full mb-6">
          <Zap className="w-5 h-5 text-yellow-400"/>
          <span className="text-sm font-bold text-yellow-400">Oferta Limitada</span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
          Comece Grátis Hoje
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Teste todos os recursos premium por 7 dias
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {['Busca ilimitada', 'IA avançada', 'Sem cartão'].map((feature) => (<div key={feature} className="flex items-center justify-center gap-2 text-gray-300">
              <Check className="w-5 h-5 text-green-400"/>
              <span>{feature}</span>
            </div>))}
        </div>

        <Link href="/auth">
          <motion.button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-purple-500/50 transition-all inline-flex items-center gap-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Crown className="w-5 h-5"/>
            Começar Agora
          </motion.button>
        </Link>
      </div>
    </motion.section>);
}
