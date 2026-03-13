'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, QrCode, Shield, Check, ArrowLeft, Lock, Zap } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zavlo-ia.onrender.com/api/v1';

type PaymentMethod = 'checkout' | 'pix';

function CreditsCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [processing, setProcessing] = useState(false);
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_base64: string; payment_id?: string } | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [modal, setModal] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; title: string; message: string } | null>(null);

  const credits = parseInt(searchParams.get('credits') || '10');
  const price = parseFloat(searchParams.get('price') || '15.90');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        setModal({ type: 'error', title: 'Autenticação Necessária', message: 'Faça login para continuar.' });
        setTimeout(() => router.push('/auth'), 2000);
        return;
      }

      const userData = JSON.parse(user);

      if (paymentMethod === 'pix') {
        const response = await fetch(`${API_URL}/payments/pix`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
          },
          body: JSON.stringify({
            plan: `credits-${credits}`,
            amount: price,
          }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          setModal({ type: 'error', title: 'Erro no Pagamento PIX', message: data.solution || data.message || 'Falha ao gerar QR Code.' });
          setProcessing(false);
          return;
        }

        setPixData({
          qr_code: data.qr_code,
          qr_code_base64: data.qr_code_base64,
          payment_id: data.payment_id,
        });
        setProcessing(false);
        return;
      }

      const response = await fetch(`${API_URL}/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`,
        },
        body: JSON.stringify({
          plan: `credits-${credits}`,
          amount: price,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setModal({ type: 'error', title: 'Erro no Pagamento', message: data.solution || data.message || 'Falha ao processar pagamento.' });
        setProcessing(false);
        return;
      }

      const redirectUrl = data.sandbox_init_point || data.init_point;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (error) {
      setModal({ type: 'error', title: 'Erro', message: 'Erro ao processar pagamento.' });
      setProcessing(false);
    }
  };

  const paymentMethods = [
    { id: 'pix' as PaymentMethod, Icon: QrCode, title: 'PIX', subtitle: 'Aprovação instantânea', color: 'from-green-500 to-green-600' },
    { id: 'checkout' as PaymentMethod, Icon: CreditCard, title: 'Cartão ou Boleto', subtitle: 'Crédito, Débito ou Boleto', color: 'from-blue-500 to-blue-600' }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950" />
      
      <header className="relative z-10 border-b border-white/[0.06] bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg sm:rounded-xl flex items-center justify-center text-black font-bold text-sm sm:text-base">Z</div>
            <span className="font-semibold text-white text-sm sm:text-base">Zavlo</span>
          </Link>
          <Link href="/plans" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/[0.04] text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/[0.08] mb-4 sm:mb-6 text-gray-400">
            <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Pagamento Seguro</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 text-white tracking-tight">Comprar Créditos</h1>
          <p className="text-sm sm:text-base text-gray-500">Escolha como deseja pagar</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h2 className="font-medium text-base sm:text-lg mb-4 sm:mb-6 text-white">Método de Pagamento</h2>
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                {paymentMethods.map((method) => (
                  <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                    className={`relative p-4 sm:p-6 rounded-xl border transition-all active:scale-95 sm:hover:scale-[1.02] ${paymentMethod === method.id ? 'border-white/20 bg-white/[0.06]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                    {paymentMethod === method.id && <div className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center"><Check className="w-3 h-3 sm:w-4 sm:h-4 text-black" /></div>}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-3 sm:mb-4 mx-auto`}><method.Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" /></div>
                    <div className="text-center"><div className="font-medium text-sm sm:text-base text-white mb-0.5 sm:mb-1">{method.title}</div><div className="text-[10px] sm:text-xs text-gray-500">{method.subtitle}</div></div>
                  </button>
                ))}
              </div>
            </div>

            {pixData && (
              <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                <div className="w-48 h-48 sm:w-64 sm:h-64 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl mx-auto mb-4 sm:mb-6">
                  <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code" className="w-full h-full" />
                </div>
                <button onClick={() => { navigator.clipboard.writeText(pixData.qr_code); setModal({ type: 'success', title: 'Copiado!', message: 'Cole no app de pagamentos.' }); }}
                  className="px-4 py-2.5 bg-white text-black rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-100 active:scale-95 transition-all mb-4 sm:mb-6">Copiar Código PIX</button>
                <button onClick={async () => {
                  setConfirmingPayment(true);
                  try {
                    const user = JSON.parse(localStorage.getItem('zavlo_user') || '{}');
                    const response = await fetch(`${API_URL}/payments/pix/${pixData.payment_id}/confirm`, {
                      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                      body: JSON.stringify({ paymentId: pixData.payment_id }),
                    });
                    const data = await response.json();
                    if (response.ok && data.status === 'approved') {
                      setModal({ type: 'success', title: 'Confirmado!', message: `${credits} créditos adicionados!` });
                      setTimeout(() => router.push('/profile'), 2000);
                    } else {
                      setModal({ type: 'info', title: 'Pendente', message: 'Aguarde e tente novamente.' });
                    }
                  } finally { setConfirmingPayment(false); }
                }} disabled={confirmingPayment}
                  className="w-full py-3 sm:py-4 bg-white text-black rounded-lg sm:rounded-xl font-medium text-sm sm:text-base hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50">
                  {confirmingPayment ? 'Verificando...' : 'Já Fiz o Pagamento'}
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:sticky lg:top-24">
              <h3 className="font-medium text-base sm:text-lg mb-4 sm:mb-6 text-white">Resumo</h3>
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-white/[0.04] rounded-lg sm:rounded-xl mb-4">
                <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-400" />
                <div><p className="text-xl sm:text-2xl font-bold text-white">{credits}</p><p className="text-[10px] sm:text-xs text-gray-500">Créditos</p></div>
              </div>
              <div className="border-t border-white/[0.06] pt-4 flex justify-between font-semibold text-lg sm:text-xl mb-4 sm:mb-6">
                <span className="text-white">Total</span><span className="text-white">R$ {price.toFixed(2)}</span>
              </div>
              <button onClick={handlePayment} disabled={processing || !!pixData}
                className="w-full py-3 sm:py-4 bg-white text-black rounded-lg sm:rounded-xl font-medium text-sm sm:text-base hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4 sm:mb-6">
                {processing ? 'Processando...' : pixData ? 'QR Code Gerado' : 'Confirmar Pagamento'}
              </button>
              <div className="space-y-2 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Pagamento seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Créditos instantâneos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {modal && <Modal isOpen={!!modal} onClose={() => setModal(null)} type={modal.type} title={modal.title} message={modal.message} />}
    </div>
  );
}

export default function CreditsCheckout() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>}>
      <CreditsCheckoutContent />
    </Suspense>
  );
}
