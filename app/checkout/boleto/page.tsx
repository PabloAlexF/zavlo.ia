'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Copy, Check, Clock, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

function BoletoPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const paymentId = searchParams.get('paymentId');
  const barcode = searchParams.get('barcode');
  const ticketUrl = searchParams.get('ticketUrl');
  const amount = searchParams.get('amount');
  const plan = searchParams.get('plan');

  const copyToClipboard = () => {
    if (barcode) {
      navigator.clipboard.writeText(barcode);
      setCopied(true);
      toast.success('Código de barras copiado!');
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

  const cancelPayment = async () => {
    setCancelling(true);
    try {
      toast.success('Pagamento cancelado');
      router.push('/checkout/confirm');
    } catch (error) {
      toast.error('Erro ao cancelar pagamento');
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [paymentId]);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Header />
      
      <div className="fixed inset-0 bg-[#0A0A0A]" />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-12">
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-medium text-white">
                Pagamento Boleto
              </h1>
              <p className="text-sm text-gray-500">
                Plano {plan} • R$ {amount}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCancelModal(true)}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-white/[0.06] hover:border-white/[0.12] rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-medium text-white mb-4">Código de Barras</h3>
            
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-4 mb-4">
              <p className="text-xs font-mono text-white break-all">
                {barcode || 'Gerando código...'}
              </p>
            </div>

            <button
              onClick={copyToClipboard}
              disabled={!barcode}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-600/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mb-4"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Código Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar Código de Barras
                </>
              )}
            </button>

            {ticketUrl && (
              <a
                href={ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar Boleto PDF
              </a>
            )}
          </motion.div>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-white">
                    Aguardando pagamento
                  </h3>
                  <p className="text-xs text-gray-500">
                    Pode levar até 3 dias úteis
                  </p>
                </div>
              </div>
              <button
                onClick={checkPaymentStatus}
                disabled={checking}
                className="w-full py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {checking ? 'Verificando...' : 'Verificar Agora'}
              </button>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">
                Como pagar
              </h3>
              <ol className="space-y-3">
                {[
                  'Copie o código de barras acima',
                  'Acesse o app ou site do seu banco',
                  'Escolha "Pagar com código de barras"',
                  'Cole o código e confirme o pagamento',
                  'Ou baixe o PDF e pague em qualquer banco/lotérica'
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-400">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-500/10 text-orange-400 rounded-full flex items-center justify-center text-xs font-medium">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-400 font-medium mb-1">
                    Atenção
                  </p>
                  <p className="text-xs text-yellow-400/80">
                    O boleto vence em 3 dias. Após o pagamento, pode levar até 2 dias úteis para compensação.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {showCancelModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelModal(false)}
            >
              <motion.div
                className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-6 max-w-md w-full"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">
                      Cancelar pagamento?
                    </h3>
                    <p className="text-sm text-gray-400">
                      O boleto será invalidado e você precisará gerar um novo para concluir a compra.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white rounded-lg font-medium transition-colors"
                  >
                    Continuar Pagando
                  </button>
                  <button
                    onClick={cancelPayment}
                    disabled={cancelling}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {cancelling ? 'Cancelando...' : 'Sim, Cancelar'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function BoletoPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <BoletoPaymentContent />
    </Suspense>
  );
}
