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
    <div className="min-h-screen bg-[#0B0B0F] relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">Z</div>
            <span className="font-semibold text-white">Zavlo.ia</span>
          </Link>
          <Link href="/plans" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />Voltar
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 text-sm px-4 py-1 rounded-full border border-white/20 mb-6 text-white">
            <Lock className="w-4 h-4" />Pagamento Seguro
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Comprar Créditos</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="font-bold text-xl mb-6 text-white">Método de Pagamento</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                    className={`relative p-6 rounded-xl border-2 transition-all hover:scale-105 ${paymentMethod === method.id ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}>
                    {paymentMethod === method.id && <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-4 mx-auto`}><method.Icon className="w-6 h-6 text-white" /></div>
                    <div className="text-center"><div className="font-semibold text-white mb-1">{method.title}</div><div className="text-xs text-gray-400">{method.subtitle}</div></div>
                  </button>
                ))}
              </div>
            </div>

            {pixData && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                <div className="w-64 h-64 bg-white p-4 rounded-2xl mx-auto mb-6">
                  <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code" className="w-full h-full" />
                </div>
                <button onClick={() => { navigator.clipboard.writeText(pixData.qr_code); setModal({ type: 'success', title: 'Copiado!', message: 'Cole no app de pagamentos.' }); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 mb-6">Copiar Código PIX</button>
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
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold">
                  {confirmingPayment ? 'Verificando...' : 'Já Fiz o Pagamento'}
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-6 text-white">Resumo</h3>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl mb-4">
                <Zap className="w-8 h-8 text-yellow-400" />
                <div><p className="text-2xl font-black text-white">{credits}</p><p className="text-xs text-gray-300">Créditos</p></div>
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between font-bold text-xl mb-6">
                <span className="text-white">Total</span><span className="text-white">R$ {price.toFixed(2)}</span>
              </div>
              <button onClick={handlePayment} disabled={processing || !!pixData}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50 mb-6">
                {processing ? 'Processando...' : pixData ? 'QR Code Gerado' : 'Confirmar Pagamento'}
              </button>
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
    <Suspense fallback={<div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center"><div className="text-white">Carregando...</div></div>}>
      <CreditsCheckoutContent />
    </Suspense>
  );
}
