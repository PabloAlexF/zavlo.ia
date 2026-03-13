'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Atualizar dados do usu\u00e1rio
    const user = localStorage.getItem('zavlo_user');
    if (user) {
      window.dispatchEvent(new Event('userChanged'));
    }
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950" />

      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-32 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>

          <h1 className="text-4xl font-semibold text-white mb-4">
            Pagamento Confirmado!
          </h1>
          
          <p className="text-lg text-gray-400 mb-8">
            Seu plano foi ativado com sucesso. Aproveite todos os recursos!
          </p>

          <motion.button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Ir para Dashboard
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
}
