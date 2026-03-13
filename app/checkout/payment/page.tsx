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
    console.log('🔵 Iniciando processo de pagamento...');
    console.log('📋 Dados do formulário:', formData);
    console.log('💳 Método de pagamento:', paymentMethod);
    console.log('📦 Plano:', planName, '| Ciclo:', cycle, '| Preço:', price);

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      console.log('❌ Campos de contato incompletos');
      toast.error('Preencha todos os campos de contato');
      return;
    }

    // Validar CPF para qualquer método de pagamento
    if (!formData.cpf) {
      console.log('❌ CPF não preenchido');
      toast.error('Preencha o CPF');
      return;
    }
    
    const cpfClean = formData.cpf.replace(/\D/g, '');
    console.log('🆔 CPF limpo:', cpfClean);
    if (cpfClean.length !== 11) {
      console.log('❌ CPF inválido - tamanho:', cpfClean.length);
      toast.error('CPF inválido');
      return;
    }

    if (paymentMethod === 'card') {
      console.log('💳 Validando dados do cartão...');
      if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
        console.log('❌ Dados do cartão incompletos');
        toast.error('Preencha todos os dados do cartão');
        return;
      }
    }

    setLoading(true);
    console.log('⏳ Loading ativado');

    try {
      const user = localStorage.getItem('zavlo_user');
      console.log('👤 Usuário do localStorage:', user ? 'Encontrado' : 'Não encontrado');
      
      if (!user) {
        console.log('❌ Usuário não logado');
        toast.error('Você precisa estar logado');
        router.push('/auth');
        return;
      }

      const userData = JSON.parse(user);
      console.log('👤 Dados do usuário:', { userId: userData.userId, email: userData.email });
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zavlo-ia.onrender.com/api/v1';
      console.log('🌐 API URL:', API_URL);

      // PAGAMENTO COM CARTÃO - DIRETO (SEM SAIR DA PÁGINA)
      if (paymentMethod === 'card') {
        console.log('💳 Processando pagamento com cartão...');
        
        if (!mp) {
          console.log('❌ Mercado Pago SDK não carregado');
          toast.error('Mercado Pago não carregado. Recarregue a página.');
          setLoading(false);
          return;
        }

        console.log('✅ Mercado Pago SDK disponível');
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

        console.log('🔐 Dados do cartão para tokenização:', {
          cardNumber: cardData.cardNumber.slice(0, 6) + '...',
          cardholderName: cardData.cardholderName,
          expirationMonth: cardData.cardExpirationMonth,
          expirationYear: cardData.cardExpirationYear,
          cpf: cpfClean.slice(0, 3) + '...',
        });

        console.log('🔄 Criando token do cartão...');
        const token = await mp.createCardToken(cardData);
        
        console.log('📝 Resposta do token:', token);
        
        if (!token || !token.id) {
          console.log('❌ Token inválido ou não criado');
          toast.error('Erro ao processar cartão. Verifique os dados.');
          setLoading(false);
          return;
        }

        console.log('✅ Token do cartão criado:', token.id);

        // Enviar pagamento para backend
        const paymentPayload = {
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
        };

        console.log('📤 Enviando pagamento para backend:', paymentPayload);

        const response = await fetch(`${API_URL}/payments/card`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
          },
          body: JSON.stringify(paymentPayload),
        });

        console.log('📥 Resposta do backend - Status:', response.status);

        const data = await response.json();
        console.log('📥 Resposta do backend - Data:', data);

        if (!response.ok || data.error) {
          console.log('❌ Erro na resposta do backend:', data);
          throw new Error(data.message || 'Erro ao processar pagamento');
        }

        // Verificar status
        console.log('🔍 Status do pagamento:', data.status);
        
        if (data.status === 'approved') {
          console.log('✅ Pagamento aprovado!');
          toast.success('Pagamento aprovado!');
          
          // Atualizar dados do usuário
          const updatedUser = { ...userData, plan: planName };
          localStorage.setItem('zavlo_user', JSON.stringify(updatedUser));
          window.dispatchEvent(new Event('userChanged'));
          console.log('✅ Dados do usuário atualizados no localStorage');

          setTimeout(() => {
            console.log('🔄 Redirecionando para página de sucesso...');
            router.push('/checkout/success');
          }, 1500);
          return;
        } else if (data.status === 'pending') {
          console.log('⏳ Pagamento pendente');
          toast.info('Pagamento pendente de aprovação');
          router.push('/dashboard');
          return;
        } else {
          console.log('❌ Pagamento recusado - Status:', data.status);
          toast.error('Pagamento recusado. Tente outro cartão.');
          setLoading(false);
          return;
        }
      }

      // PAGAMENTO COM PIX
      if (paymentMethod === 'pix') {
        console.log('💰 Processando pagamento com PIX...');
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailToUse = formData.email || userData.email;
        
        console.log('📧 Email para PIX:', emailToUse);
        
        if (!emailRegex.test(emailToUse)) {
          console.log('❌ Email inválido:', emailToUse);
          toast.error('Email inválido. Verifique o email informado.');
          setLoading(false);
          return;
        }
        
        const pixPayload = {
          plan: planName,
          amount: price,
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

        console.log('📤 Enviando requisição PIX:', pixPayload);

        const response = await fetch(`${API_URL}/payments/pix`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
          },
          body: JSON.stringify(pixPayload),
        });

        console.log('📥 Resposta PIX - Status:', response.status);

        const data = await response.json();
        console.log('📥 Resposta PIX - Data:', data);
        console.log('📋 Detalhes completos do erro:', JSON.stringify(data.details, null, 2));

        if (!response.ok) {
          console.log('❌ Erro na resposta PIX:', data);
          throw new Error(data.message || data.merchant_message || 'Erro ao processar pagamento');
        }

        if (data.qr_code) {
          console.log('✅ QR Code PIX gerado!');
          toast.success('QR Code PIX gerado!');
          router.push(`/checkout/pix?paymentId=${data.id}&qrCode=${encodeURIComponent(data.qr_code)}`);
          return;
        } else {
          console.log('❌ QR Code não retornado:', data);
          throw new Error('QR Code não foi gerado. Tente novamente.');
        }
      }

      console.log('❌ Fluxo de pagamento não completado');
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } catch (error: any) {
      console.error('❌ ERRO NO PAGAMENTO:', error);
      console.error('Stack trace:', error.stack);
      toast.error(error.message || 'Erro ao processar pagamento');
    } finally {
      console.log('🏁 Finalizando processo de pagamento');
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
