'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentFailure() {
  const router = useRouter();

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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full mb-6">
            <XCircle className="w-12 h-12 text-red-400" />
          </div>

          <h1 className="text-4xl font-semibold text-white mb-4">
            Pagamento N\u00e3o Aprovado
          </h1>
          
          <p className="text-lg text-gray-400 mb-8">
            Houve um problema ao processar seu pagamento. Tente novamente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/[0.04] border border-white/[0.06] text-white rounded-xl font-medium hover:bg-white/[0.08] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </motion.button>

            <motion.button
              onClick={() => router.push('/plans')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-5 h-5" />
              Tentar Novamente
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
