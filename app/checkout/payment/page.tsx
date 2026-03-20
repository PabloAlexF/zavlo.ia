'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { OrderSummary, calculateTotalWithFee } from '@/components/checkout/OrderSummary';
import { CreditCardPreview } from '@/components/checkout/CreditCardPreview';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Script from 'next/script';
import { PLAN_PRICES } from '@/lib/plans';

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

  const price = cycle === 'yearly'
    ? PLAN_PRICES[planName]?.yearly ?? 0
    : PLAN_PRICES[planName]?.monthly ?? 0;

  // Inicializar Mercado Pago SDK
  useEffect(() => {
    if (mpLoaded && !mp) {
      const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
      if (publicKey && window.MercadoPago) {
        const mercadopago = new window.MercadoPago(publicKey);
        setMp(mercadopago);
      }
    }
  }, [mpLoaded, mp]);

  const handleConfirmPayment = async () => {
    const totalWithFee = calculateTotalWithFee(price, paymentMethod);

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error('Preencha todos os campos de contato');
      return;
    }

    if (!formData.cpf) {
      toast.error('Preencha o CPF');
      return;
    }
    
    const cpfClean = formData.cpf.replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      toast.error('CPF inválido');
      return;
    }

    if (paymentMethod === 'card') {
      if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
        toast.error('Preencha todos os dados do cartão');
        return;
      }
    }

    if (paymentMethod === 'boleto') {
      if (!formData.address || !formData.number || !formData.neighborhood || !formData.city || !formData.state || !formData.zipCode) {
        toast.error('Preencha o endereço completo para boleto');
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

        // Enviar pagamento para backend com valor atualizado
        const paymentPayload = {
          plan: planName,
          amount: totalWithFee,  // Valor com taxa incluída
          cardToken: token.id,
          installments: 1,
          payer: {
            email: formData.email,
            identification: {
              type: 'CPF',
              number: cpfClean,
            },
          },
        };

        const response = await fetch(`${API_URL}/payments/card`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
          },
          body: JSON.stringify(paymentPayload),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.message || 'Erro ao processar pagamento');
        }

        if (data.status === 'approved') {
          toast.success('Pagamento aprovado!');
          // Buscar perfil atualizado do backend para refletir créditos e plano corretos
          try {
            const profileRes = await fetch(`${API_URL}/users/profile`, {
              headers: { 'Authorization': `Bearer ${userData.token}` },
            });
            if (profileRes.ok) {
              const profile = await profileRes.json();
              const updatedUser = { ...userData, plan: profile.plan, credits: profile.credits, planExpiresAt: profile.planExpiresAt };
              localStorage.setItem('zavlo_user', JSON.stringify(updatedUser));
              window.dispatchEvent(new Event('userChanged'));
            }
          } catch {}
          setTimeout(() => router.push('/checkout/success'), 1500);
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailToUse = formData.email || userData.email;
        
        if (!emailRegex.test(emailToUse)) {
          toast.error('Email inválido. Verifique o email informado.');
          setLoading(false);
          return;
        }
        
        const pixPayload = {
          plan: planName,
          amount: totalWithFee,  // Valor com taxa incluída
          userId: userData.userId,
          userEmail: emailToUse,
          payer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: emailToUse,
            phone: formData.phone,
            cpf: formData.cpf,
          },
        };

        const response = await fetch(`${API_URL}/payments/pix`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
          },
          body: JSON.stringify(pixPayload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.merchant_message || 'Erro ao processar pagamento');
        }

        if (data.qr_code) {
          toast.success('QR Code PIX gerado!');
          sessionStorage.setItem(`pix_qr_${data.id}`, data.qr_code);
          router.push(`/checkout/pix?paymentId=${data.id}&amount=${totalWithFee.toFixed(2)}&plan=${planName}`);
          return;
        } else {
          throw new Error('QR Code não foi gerado. Tente novamente.');
        }
      }

      // PAGAMENTO COM BOLETO
      if (paymentMethod === 'boleto') {
        const boletoPayload = {
          plan: planName,
          amount: totalWithFee,  // Valor com taxa incluída
          userId: userData.userId,
          userEmail: formData.email || userData.email,
          payer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            cpf: formData.cpf,
            address: {
              zipCode: formData.zipCode,
              street: formData.address,
              number: formData.number,
              complement: formData.complement || '',
              neighborhood: formData.neighborhood,
              city: formData.city,
              state: formData.state,
            },
          },
        };

        const response = await fetch(`${API_URL}/payments/boleto`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
          },
          body: JSON.stringify(boletoPayload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.merchant_message || 'Erro ao processar pagamento');
        }

        if (data.barcode || data.ticket_url) {
          toast.success('Boleto gerado!');
          router.push(`/checkout/boleto?paymentId=${data.id}&barcode=${encodeURIComponent(data.barcode || '')}&ticketUrl=${encodeURIComponent(data.ticket_url || '')}&amount=${totalWithFee.toFixed(2)}&plan=${planName}`);
          return;
        } else {
          throw new Error('Boleto não foi gerado. Tente novamente.');
        }
      }

      toast.error('Erro ao processar pagamento. Tente novamente.');
    } catch (error: any) {
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
        onLoad={() => setMpLoaded(true)}
        onError={() => toast.error('Erro ao carregar sistema de pagamento')}
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
              paymentMethod={paymentMethod}
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
