'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { CreditCardPreview } from '@/components/checkout/CreditCardPreview';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Script from 'next/script';

// Declarar tipo do Mercado Pago SDK
declare global {
  interface Window {
    MercadoPago: any;
  }
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const planName = searchParams.get('plan') || 'basic';
  const cycle = searchParams.get('cycle') || 'monthly';

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | 'boleto'>('card');
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [mpLoaded, setMpLoaded] = useState(false);
  const [mp, setMp] = useState<any>(null);

  const planPrices: Record<string, { monthly: number; yearly: number }> = {
    basic: { monthly: 27, yearly: 270 },
    pro: { monthly: 77, yearly: 770 },
    business: { monthly: 197, yearly: 1970 },
  };

  const price = cycle === 'yearly' 
    ? planPrices[planName].yearly 
    : planPrices[planName].monthly;

  // Inicializar Mercado Pago SDK
  useEffect(() => {
    if (mpLoaded && !mp) {
      const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
      if (publicKey && window.MercadoPago) {
        const mercadopago = new window.MercadoPago(publicKey);
        setMp(mercadopago);
        console.log('✅ Mercado Pago SDK inicializado');
      }
    }
  }, [mpLoaded, mp]);

  const handleConfirmPayment = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error('Preencha todos os campos de contato');
      return;
    }

    if (paymentMethod === 'card') {
      if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
        toast.error('Preencha todos os dados do cartão');
        return;
      }
      if (!formData.cpf) {
        toast.error('Preencha o CPF do titular do cartão');
        return;
      }
      // Validar CPF básico (11 dígitos)
      const cpfClean = formData.cpf.replace(/\D/g, '');
      if (cpfClean.length !== 11) {
        toast.error('CPF inválido');
        return;
      }
    }

    setLoading(true);

    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        toast.error('Você precisa estar logado');
        router.push('/auth');
        return;
      }

      const userData = JSON.parse(user);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zavlo-ia.onrender.com/api/v1';

      // PAGAMENTO COM CARTÃO - DIRETO (SEM SAIR DA PÁGINA)
      if (paymentMethod === 'card') {
        if (!mp) {
          toast.error('Mercado Pago não carregado. Recarregue a página.');
          setLoading(false);
          return;
        }

        toast.info('Processando cartão...');

        // Criar token do cartão
        const [month, year] = formData.expiryDate.split('/');
        const cpfClean = formData.cpf.replace(/\D/g, '');
        
        const cardData = {
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          cardholderName: formData.cardName,
          cardExpirationMonth: month,
          cardExpirationYear: `20${year}`,
          securityCode: formData.cvv,
          identificationType: 'CPF',
          identificationNumber: cpfClean,
        };

        const token = await mp.createCardToken(cardData);
        
        if (!token || !token.id) {
          toast.error('Erro ao processar cartão. Verifique os dados.');
          setLoading(false);
          return;
        }

        console.log('✅ Token do cartão criado:', token.id);

        // Enviar pagamento para backend
        const response = await fetch(`${API_URL}/payments/card`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
          },
          body: JSON.stringify({
            plan: planName,
            amount: price,
            cardToken: token.id,
            installments: 1,
            payer: {
              email: formData.email,
              identification: {
                type: 'CPF',
                number: cpfClean,
              },
            },
          }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.message || 'Erro ao processar pagamento');
        }

        // Verificar status
        if (data.status === 'approved') {
          toast.success('Pagamento aprovado!');
          
          // Atualizar dados do usuário
          const updatedUser = { ...userData, plan: planName };
          localStorage.setItem('zavlo_user', JSON.stringify(updatedUser));
          window.dispatchEvent(new Event('userChanged'));

          setTimeout(() => {
            router.push('/checkout/success');
          }, 1500);
          return;
        } else if (data.status === 'pending') {
          toast.info('Pagamento pendente de aprovação');
          router.push('/dashboard');
          return;
        } else {
          toast.error('Pagamento recusado. Tente outro cartão.');
          setLoading(false);
          return;
        }
      }

      // PAGAMENTO COM PIX
      if (paymentMethod === 'pix') {
        const response = await fetch(`${API_URL}/payments/pix`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
          },
          body: JSON.stringify({
            plan: planName,
            amount: price,
            userId: userData.userId,
            userEmail: formData.email || userData.email,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Erro ao processar pagamento');
        }

        if (data.qr_code) {
          toast.success('QR Code PIX gerado!');
          router.push(`/checkout/pix?paymentId=${data.id}&qrCode=${encodeURIComponent(data.qr_code)}`);
          return;
        }
      }

      toast.error('Método de pagamento não implementado');
    } catch (error: any) {
      console.error('Erro no pagamento:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Mercado Pago SDK */}
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        onLoad={() => {
          console.log('✅ Mercado Pago SDK carregado');
          setMpLoaded(true);
        }}
        onError={() => {
          console.error('❌ Erro ao carregar Mercado Pago SDK');
          toast.error('Erro ao carregar sistema de pagamento');
        }}
      />
      
      <Header />
      
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-12">
        {/* Back Button */}
        <motion.button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Voltar</span>
        </motion.button>

        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-2">
            Finalizar Pagamento
          </h1>
          <p className="text-gray-500">
            Complete seus dados para ativar o plano {planName.charAt(0).toUpperCase() + planName.slice(1)}
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
          {/* Left Column - Form */}
          <div className="space-y-8">
            {/* Payment Method Selection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Método de Pagamento</h3>
              <PaymentMethodSelector
                selected={paymentMethod}
                onSelect={setPaymentMethod}
              />
            </div>

            {/* Checkout Form */}
            <CheckoutForm
              paymentMethod={paymentMethod}
              onFormChange={setFormData}
            />
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Credit Card Preview - Only for Card Payment */}
            {paymentMethod === 'card' && (
              <CreditCardPreview
                cardNumber={formData.cardNumber || ''}
                cardName={formData.cardName || ''}
                expiryDate={formData.expiryDate || ''}
              />
            )}

            {/* Order Summary */}
            <OrderSummary
              planName={planName.charAt(0).toUpperCase() + planName.slice(1)}
              price={price}
              cycle={cycle as 'monthly' | 'yearly'}
              loading={loading}
              onConfirm={handleConfirmPayment}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
