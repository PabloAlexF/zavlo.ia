'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { motion } from 'framer-motion';
import { QrCode, Copy, Check, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

function PixPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  const paymentId = searchParams.get('paymentId');
  const qrCode = searchParams.get('qrCode');

  const copyToClipboard = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentId) return;

    setChecking(true);
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) return;

      const userData = JSON.parse(user);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zavlo-ia.onrender.com/api/v1';

      const response = await fetch(`${API_URL}/payments/pix/${paymentId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`,
        },
        body: JSON.stringify({ paymentId }),
      });

      const data = await response.json();

      if (data.status === 'approved') {
        toast.success('Pagamento confirmado!');
        router.push('/dashboard');
      } else {
        toast.info('Aguardando pagamento...');
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentId]);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950" />

      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-12">
        <motion.button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Voltar</span>
        </motion.button>

        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full mb-4">
            <QrCode className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-semibold text-white mb-2">
            Pagamento via PIX
          </h1>
          <p className="text-gray-500">
            Escaneie o QR Code ou copie o código abaixo
          </p>
        </motion.div>

        <motion.div
          className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white rounded-xl p-6 mb-6 flex items-center justify-center">
            <div className="text-center">
              <QrCode className="w-48 h-48 mx-auto text-gray-800" />
              <p className="text-sm text-gray-600 mt-4">
                Escaneie com o app do seu banco
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Código PIX Copia e Cola
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={qrCode || ''}
                  readOnly
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-white text-sm font-mono pr-12"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/[0.04] rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="w-5 h-5" />
              Copiar Código PIX
            </button>
          </div>
        </motion.div>

        <motion.div
          className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start gap-3 mb-4">
            <Clock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-white mb-1">
                Aguardando pagamento
              </h3>
              <p className="text-xs text-gray-500">
                Verificando automaticamente a cada 5 segundos
              </p>
            </div>
          </div>

          <button
            onClick={checkPaymentStatus}
            disabled={checking}
            className="w-full py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {checking ? 'Verificando...' : 'Verificar Pagamento Agora'}
          </button>
        </motion.div>

        <motion.div
          className="mt-6 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">Como pagar:</p>
            <ol className="text-left space-y-2 max-w-md mx-auto">
              <li className="flex gap-2">
                <span className="text-blue-400">1.</span>
                <span>Abra o app do seu banco</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">2.</span>
                <span>Escolha pagar com PIX</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">3.</span>
                <span>Escaneie o QR Code ou cole o código</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">4.</span>
                <span>Confirme o pagamento</span>
              </li>
            </ol>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function PixPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <PixPaymentContent />
    </Suspense>
  );
}
