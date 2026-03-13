'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, QrCode, FileText, Shield, Check, ArrowLeft, Sparkles, Lock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zavlo-ia.onrender.com/api/v1';

type PaymentMethod = 'checkout' | 'pix';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('checkout');
  const [processing, setProcessing] = useState(false);
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_base64: string; payment_id?: string } | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [modal, setModal] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; title: string; message: string } | null>(null);

  const planName = searchParams.get('plan') || 'basic';
  const cycle = searchParams.get('cycle') || 'monthly';

  useEffect(() => {
    setMounted(true);
  }, []);

  const prices: Record<string, { monthly: number; yearly: number }> = {
    basic: { monthly: 27.00, yearly: 270.00 },
    pro: { monthly: 77.00, yearly: 770.00 },
    business: { monthly: 197.00, yearly: 1970.00 },
  };

  const planNames: Record<string, string> = {
    basic: 'Básico',
    pro: 'Pro',
    business: 'Business',
  };

  const finalPrice = cycle === 'yearly' ? prices[planName].yearly : prices[planName].monthly;

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        setModal({ type: 'error', title: 'Autenticação Necessária', message: 'Faça login para continuar com o pagamento.' });
        setTimeout(() => router.push('/auth'), 2000);
        return;
      }

      const userData = JSON.parse(user);

      // PIX Payment
      if (paymentMethod === 'pix') {
        const response = await fetch(`${API_URL}/payments/pix`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
          },
          body: JSON.stringify({
            plan: planName,
            amount: finalPrice,
          }),
        });

        const data = await response.json();

        // Check for error responses
        if (!response.ok || data.error) {
          console.error('PIX Error:', data);
          setModal({ 
            type: 'error', 
            title: 'Erro no Pagamento PIX', 
            message: data.solution || data.message || 'Falha ao gerar QR Code. Tente novamente.' 
          });
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

      // Credit Card / Debit / Boleto - Redirect to Mercado Pago
      const response = await fetch(`${API_URL}/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`,
        },
        body: JSON.stringify({
          plan: planName,
          amount: finalPrice,
        }),
      });

      const data = await response.json();

      // Check for error responses
      if (!response.ok || data.error) {
        console.error('Payment Error:', data);
        setModal({ 
          type: 'error', 
          title: 'Erro no Pagamento', 
          message: data.solution || data.message || 'Falha ao processar pagamento. Tente novamente.' 
        });
        setProcessing(false);
        return;
      }

      // Redirect to Mercado Pago Checkout
      const redirectUrl = data.sandbox_init_point || data.init_point;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error(error);
      setModal({ type: 'error', title: 'Erro', message: 'Erro ao processar pagamento. Verifique sua conexão.' });
      setProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: 'checkout' as PaymentMethod,
      Icon: CreditCard,
      title: 'Cartão ou Boleto',
      subtitle: 'Crédito, Débito ou Boleto',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'pix' as PaymentMethod,
      Icon: QrCode,
      title: 'PIX',
      subtitle: 'Aprovação instantânea',
      color: 'from-green-500 to-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06] bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg sm:rounded-xl flex items-center justify-center text-black font-bold text-sm sm:text-base">Z</div>
            <span className="font-semibold text-white text-sm sm:text-base">Zavlo</span>
          </Link>
          <Link href={`/checkout/confirm?plan=${planName}&cycle=${cycle}`} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Title */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/[0.04] text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/[0.08] mb-4 sm:mb-6 text-gray-400">
              <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Pagamento Seguro</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 text-white tracking-tight">
              Finalizar Pagamento
            </h1>
            <p className="text-sm sm:text-base text-gray-500">Escolha a forma de pagamento</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Payment Methods & Form */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Method Selection */}
              <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h2 className="font-medium text-base sm:text-lg mb-4 sm:mb-6 text-white">Método de Pagamento</h2>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`relative p-4 sm:p-6 rounded-xl border transition-all active:scale-95 sm:hover:scale-[1.02] ${
                        paymentMethod === method.id 
                          ? 'border-white/20 bg-white/[0.06]' 
                          : 'border-white/[0.06] bg-white/[0.02]'
                      }`}
                    >
                      {paymentMethod === method.id && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
                        </div>
                      )}
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-3 sm:mb-4 mx-auto`}>
                        <method.Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-sm sm:text-base text-white mb-0.5 sm:mb-1">{method.title}</div>
                        <div className="text-[10px] sm:text-xs text-gray-500">{method.subtitle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Form */}
              <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-xl sm:rounded-2xl p-4 sm:p-6">
                {paymentMethod === 'checkout' && (
                  <div className="text-center py-8 sm:py-12">
                    <CreditCard className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4 sm:mb-6" />
                    <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">Você será redirecionado para o Mercado Pago</p>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="px-2 sm:px-3 py-1 bg-white/[0.04] rounded-lg text-[10px] sm:text-xs text-gray-400">✓ Cartão de Crédito</div>
                      <div className="px-2 sm:px-3 py-1 bg-white/[0.04] rounded-lg text-[10px] sm:text-xs text-gray-400">✓ Cartão de Débito</div>
                      <div className="px-2 sm:px-3 py-1 bg-white/[0.04] rounded-lg text-[10px] sm:text-xs text-gray-400">✓ Boleto</div>
                      <div className="px-2 sm:px-3 py-1 bg-white/[0.04] rounded-lg text-[10px] sm:text-xs text-gray-400">✓ PIX</div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-600">Escolha seu método preferido na próxima tela</p>
                  </div>
                )}

                {paymentMethod === 'pix' && (
                  <div className="text-center py-8 sm:py-12">
                    {pixData ? (
                      <>
                        <div className="w-48 h-48 sm:w-64 sm:h-64 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl mx-auto mb-4 sm:mb-6">
                          <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code PIX" className="w-full h-full" />
                        </div>
                        <div className="bg-white/[0.04] rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                          <p className="text-[10px] sm:text-xs text-gray-500 mb-2">Código PIX Copia e Cola:</p>
                          <p className="text-[10px] sm:text-xs text-white font-mono break-all">{pixData.qr_code}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(pixData.qr_code);
                              setModal({ type: 'success', title: 'Código Copiado!', message: 'Cole no seu app de pagamentos para finalizar.' });
                            }}
                            className="mt-2 sm:mt-3 px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-black rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-100 active:scale-95 transition-all"
                          >
                            Copiar Código
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Escaneie o QR Code ou copie o código</p>
                        <p className="text-[10px] sm:text-xs text-gray-600 mb-4 sm:mb-6">Válido por 30 minutos</p>
                        
                        <button
                          onClick={async () => {
                            setConfirmingPayment(true);
                            try {
                              const user = localStorage.getItem('zavlo_user');
                              if (!user) {
                                setModal({ type: 'error', title: 'Erro', message: 'Faça login para continuar.' });
                                setTimeout(() => router.push('/auth'), 2000);
                                return;
                              }
                              const userData = JSON.parse(user);
                              
                              const response = await fetch(`${API_URL}/payments/pix/${pixData.payment_id}/confirm`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${userData.token}`,
                                },
                                body: JSON.stringify({ paymentId: pixData.payment_id }),
                              });
                              
                              const data = await response.json();
                              
                              if (response.ok && data.status === 'approved') {
                                setModal({ 
                                  type: 'success', 
                                  title: 'Pagamento Confirmado!', 
                                  message: `Seus créditos foram adicionados à sua conta. Redirecionando...` 
                                });
                                
                                // Update user data in localStorage
                                const user = localStorage.getItem('zavlo_user');
                                if (user) {
                                  const userData = JSON.parse(user);
                                  const updatedUser = {
                                    ...userData,
                                    credits: (userData.credits || 0) + (data.credits || 15),
                                    plan: data.plan || 'basic',
                                  };
                                  localStorage.setItem('zavlo_user', JSON.stringify(updatedUser));
                                  window.dispatchEvent(new Event('userChanged'));
                                }
                                
                                setTimeout(() => router.push('/profile'), 2000);
                              } else if (data.status === 'pending') {
                                setModal({ 
                                  type: 'info', 
                                  title: 'Pagamento Pendente', 
                                  message: 'Ainda não identificamos seu pagamento. Aguarde alguns instantes e tente novamente.' 
                                });
                              } else {
                                setModal({ 
                                  type: 'error', 
                                  title: 'Pagamento Não Confirmado', 
                                  message: 'Não conseguimos confirmar seu pagamento. Verifique se o PIX foi realizado.' 
                                });
                              }
                            } catch (error) {
                              console.error(error);
                              setModal({ type: 'error', title: 'Erro', message: 'Erro ao verificar pagamento. Tente novamente.' });
                            } finally {
                              setConfirmingPayment(false);
                            }
                          }}
                          disabled={confirmingPayment}
                          className="w-full max-w-md mx-auto py-3 sm:py-4 bg-white text-black rounded-lg sm:rounded-xl font-medium text-sm sm:text-base hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {confirmingPayment ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Verificando...
                            </>
                          ) : (
                            <>
                              <Check className="w-5 h-5" />
                              Já Fiz o Pagamento
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-40 h-40 sm:w-48 sm:h-48 bg-white/[0.04] rounded-xl sm:rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center border border-white/[0.06]">
                          <QrCode className="w-16 h-16 sm:w-24 sm:h-24 text-gray-600" />
                        </div>
                        <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">QR Code será gerado após confirmar</p>
                        <p className="text-[10px] sm:text-xs text-gray-600">Válido por 30 minutos</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:sticky lg:top-24">
                <h3 className="font-medium text-base sm:text-lg mb-4 sm:mb-6 text-white">Resumo do Pedido</h3>
                
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Plano {planNames[planName]}</span>
                    <span className="font-medium text-white">R$ {finalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Cobrança</span>
                    <span className="text-white">{cycle === 'yearly' ? 'Anual' : 'Mensal'}</span>
                  </div>
                  {cycle === 'yearly' && (
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-green-400 bg-green-500/10 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                      Economize 16% no plano anual
                    </div>
                  )}
                  <div className="border-t border-white/[0.06] pt-3 sm:pt-4 flex justify-between font-semibold text-lg sm:text-xl">
                    <span className="text-white">Total</span>
                    <span className="text-white">R$ {finalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full py-3 sm:py-4 bg-white text-black rounded-lg sm:rounded-xl font-medium text-sm sm:text-base hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4 sm:mb-6"
                >
                  {processing ? 'Processando...' : 'Confirmar Pagamento'}
                </button>

                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Pagamento seguro
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Garantia de 7 dias
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Cancele quando quiser
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {modal && (
        <Modal
          isOpen={!!modal}
          onClose={() => setModal(null)}
          type={modal.type}
          title={modal.title}
          message={modal.message}
        />
      )}
    </div>
  );
}

export default function Payment() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
