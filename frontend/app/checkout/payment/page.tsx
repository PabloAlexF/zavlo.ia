'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, QrCode, FileText, Shield, Check, ArrowLeft, Sparkles, Lock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

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
        const response = await fetch('process.env.NEXT_PUBLIC_API_URL/payments/pix', {
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
      const response = await fetch('process.env.NEXT_PUBLIC_API_URL/payments/create', {
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
    <div className="min-h-screen bg-[#0B0B0F] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse mix-blend-screen" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse mix-blend-screen" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
              Z
            </div>
            <span className="font-semibold text-white">Zavlo.ia</span>
          </Link>
          <Link href={`/checkout/confirm?plan=${planName}&cycle=${cycle}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 text-sm px-4 py-1 rounded-full border border-white/20 mb-6 text-white">
              <Lock className="w-4 h-4" />
              Pagamento Seguro
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Finalizar Pagamento
            </h1>
            <p className="text-lg text-gray-400">Escolha a forma de pagamento</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Methods & Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Method Selection */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="font-bold text-xl mb-6 text-white">Método de Pagamento</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`relative p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                        paymentMethod === method.id 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      {paymentMethod === method.id && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-4 mx-auto`}>
                        <method.Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-white mb-1">{method.title}</div>
                        <div className="text-xs text-gray-400">{method.subtitle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Form */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                {paymentMethod === 'checkout' && (
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                    <p className="text-sm text-gray-300 mb-4">Você será redirecionado para o Mercado Pago</p>
                    <div className="flex flex-wrap justify-center gap-3 mb-4">
                      <div className="px-3 py-1 bg-white/10 rounded-lg text-xs text-gray-300">✓ Cartão de Crédito</div>
                      <div className="px-3 py-1 bg-white/10 rounded-lg text-xs text-gray-300">✓ Cartão de Débito</div>
                      <div className="px-3 py-1 bg-white/10 rounded-lg text-xs text-gray-300">✓ Boleto</div>
                      <div className="px-3 py-1 bg-white/10 rounded-lg text-xs text-gray-300">✓ PIX</div>
                    </div>
                    <p className="text-xs text-gray-500">Escolha seu método preferido na próxima tela</p>
                  </div>
                )}

                {paymentMethod === 'pix' && (
                  <div className="text-center py-12">
                    {pixData ? (
                      <>
                        <div className="w-64 h-64 bg-white p-4 rounded-2xl mx-auto mb-6">
                          <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code PIX" className="w-full h-full" />
                        </div>
                        <div className="bg-white/10 rounded-xl p-4 mb-4">
                          <p className="text-xs text-gray-400 mb-2">Código PIX Copia e Cola:</p>
                          <p className="text-xs text-white font-mono break-all">{pixData.qr_code}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(pixData.qr_code);
                              setModal({ type: 'success', title: 'Código Copiado!', message: 'Cole no seu app de pagamentos para finalizar.' });
                            }}
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                          >
                            Copiar Código
                          </button>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">Escaneie o QR Code ou copie o código</p>
                        <p className="text-xs text-gray-500 mb-6">Válido por 30 minutos</p>
                        
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
                              
                              const response = await fetch(`process.env.NEXT_PUBLIC_API_URL/payments/pix/${pixData.payment_id}/confirm`, {
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
                          className="w-full max-w-md mx-auto py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
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
                        <div className="w-48 h-48 bg-white/10 rounded-2xl mx-auto mb-6 flex items-center justify-center border border-white/20">
                          <QrCode className="w-24 h-24 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-300 mb-2">QR Code será gerado após confirmar</p>
                        <p className="text-xs text-gray-500">Válido por 30 minutos</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sticky top-24">
                <h3 className="font-bold text-lg mb-6 text-white">Resumo do Pedido</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Plano {planNames[planName]}</span>
                    <span className="font-semibold text-white">R$ {finalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cobrança</span>
                    <span className="text-white">{cycle === 'yearly' ? 'Anual' : 'Mensal'}</span>
                  </div>
                  {cycle === 'yearly' && (
                    <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded-lg">
                      <Sparkles className="w-4 h-4" />
                      Economize 16% no plano anual
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-4 flex justify-between font-bold text-xl">
                    <span className="text-white">Total</span>
                    <span className="text-white">R$ {finalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6 shadow-lg shadow-blue-500/20"
                >
                  {processing ? 'Processando...' : 'Confirmar Pagamento'}
                </button>

                <div className="space-y-3 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    Pagamento 100% seguro
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Garantia de 7 dias
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
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
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
