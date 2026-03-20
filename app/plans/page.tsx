'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Toast } from '@/components/ui/Toast';

import { DollarSign, Sparkles, Check, Zap, Search, Camera } from 'lucide-react';

interface Plan {
  name: string;
  price: number;
  yearlyPrice: number;
  popular?: boolean;
  features: string[];
  cta: string;
  subtitle?: string;
}

interface CreditPackage {
  credits: number;
  price: number;
}

export default function Plans() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const plans: Plan[] = [
    {
      name: 'Gratuito',
      price: 0,
      yearlyPrice: 0,
      features: ['3 comparações grátis', 'Marketplaces principais', '20 resultados por busca', 'Com anúncios'],
      cta: 'Começar Grátis',
      subtitle: 'Teste sem compromisso',
    },
    {
      name: 'Básico',
      price: 39.90,
      yearlyPrice: 399.00,
      features: ['15 créditos/mês', 'Todos os marketplaces', 'Sem anúncios', 'Histórico 30 dias', 'Alertas de preço'],
      cta: 'Assinar Agora',
      subtitle: 'Economize até R$ 800/mês',
    },
    {
      name: 'Pro',
      price: 89.90,
      yearlyPrice: 899.00,
      popular: true,
      features: ['48 créditos/mês', 'IA avançada de produtos', 'Busca por imagem', 'Prioridade máxima', 'Suporte WhatsApp prioritário', 'Histórico 90 dias'],
      cta: 'Assinar Pro',
      subtitle: 'Economize até R$ 2.400/mês',
    },
    {
      name: 'Business',
      price: 299.00,
      yearlyPrice: 2990.00,
      features: ['200 créditos/mês', 'API REST completa', 'Webhooks personalizados', 'Até 5 usuários', 'Relatórios e analytics', 'Gerente de conta dedicado'],
      cta: 'Falar com Vendas',
      subtitle: 'Para empresas e revendedores',
    },
  ];

  const creditPackages: CreditPackage[] = [
    { credits: 10, price: 15.90 },
    { credits: 25, price: 32.90 },
    { credits: 60, price: 69.90 },
  ];

  const handleSelectPlan = async (planName: string): Promise<void> => {
    const user = localStorage.getItem('zavlo_user');
    if (!user) {
      router.push('/auth');
      return;
    }

    if (planName === 'Gratuito') {
      const userData = JSON.parse(user);
      userData.plan = 'free';
      localStorage.setItem('zavlo_user', JSON.stringify(userData));
      window.dispatchEvent(new Event('userChanged'));
      setToast({ message: 'Plano gratuito ativado!', type: 'success' });
      router.push('/chat');
      return;
    }

    if (planName === 'Business') {
      window.location.href = 'mailto:vendas@zavlo.ia';
      return;
    }

    const planMap: Record<string, string> = {
      'Básico': 'basic',
      'Pro': 'pro',
    };

    router.push(`/checkout/confirm?plan=${planMap[planName]}&cycle=${billingCycle}`);
  };

  const handleBuyCredits = async (credits: number, price: number): Promise<void> => {
    const user = localStorage.getItem('zavlo_user');
    if (!user) {
      router.push('/auth');
      return;
    }

    // Redirect to checkout page for credits
    router.push(`/checkout/credits?credits=${credits}&price=${price}`);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] pt-24 pb-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse mix-blend-screen pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/10 text-sm px-4 py-1 rounded-full border border-white/20 mb-6 text-white">
            <DollarSign className="w-4 h-4" />
            Economize em Cada Compra
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Compare Preços em Segundos
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">Encontre o menor preço antes de comprar. Economize tempo e dinheiro em cada busca.</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                billingCycle === 'monthly' 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                billingCycle === 'yearly' 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Anual <span className="text-green-400 ml-1 font-semibold">-16%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-20">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              onMouseEnter={() => setHoveredPlan(plan.name)}
              onMouseLeave={() => setHoveredPlan(null)}
              className={`relative bg-white/5 backdrop-blur-sm rounded-2xl border p-6 flex flex-col h-full transition-all duration-300 ${
                plan.popular 
                  ? 'border-purple-500/50 shadow-2xl shadow-purple-500/10 scale-105 z-10' 
                  : 'border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-bold text-xl mb-2 text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {plan.price === 0 ? 'Grátis' : `R$ ${billingCycle === 'monthly' ? plan.price.toFixed(2) : (plan.yearlyPrice / 12).toFixed(2)}`}
                  </span>
                  {plan.price > 0 && <span className="text-gray-400 text-sm">/mês</span>}
                </div>
                {billingCycle === 'yearly' && plan.price > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    R$ {plan.yearlyPrice.toFixed(2)}/ano
                  </p>
                )}
                {plan.subtitle && (
                  <p className="text-xs text-gray-500 mt-3 italic">{plan.subtitle}</p>
                )}
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.name)}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* What You Can Do Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 mb-20 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            O que você pode fazer?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Search className="w-10 h-10 text-blue-400" />
              </div>
              <div className="text-white font-semibold text-lg mb-1">Busca Rápida</div>
              <div className="text-gray-400 text-sm">Digite o produto e compare preços</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Camera className="w-10 h-10 text-purple-400" />
              </div>
              <div className="text-white font-semibold text-lg mb-1">Busca por Foto</div>
              <div className="text-gray-400 text-sm">Tire foto e encontre onde comprar</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Zap className="w-10 h-10 text-yellow-400" />
              </div>
              <div className="text-white font-semibold text-lg mb-1">Preços Atualizados</div>
              <div className="text-gray-400 text-sm">Dados em tempo real das lojas</div>
            </div>
          </div>
        </div>

        {/* Credit Packages - Secondary Section */}
        <div className="mt-20 pt-12 border-t border-white/10">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2 text-white flex items-center justify-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Precisa de comparações extras?
            </h3>
            <p className="text-gray-400 text-sm">Comparações avulsas (validade 90 dias)</p>
            <p className="text-yellow-400 text-xs mt-2 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              Assinantes pagam até 50% menos por comparação
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {creditPackages.map((pkg, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 transition-all duration-300 hover:border-white/20"
              >
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-white mb-2">
                    {pkg.credits} comparações
                  </div>
                  <div className="text-xl font-bold text-white mb-2">
                    R$ {pkg.price.toFixed(2)}
                  </div>
                  <div className="text-xs text-yellow-400">
                    Cada comparação busca em múltiplas lojas
                  </div>
                </div>

                <button
                  onClick={() => handleBuyCredits(pkg.credits, pkg.price)}
                  className="w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 bg-white/10 text-white border border-white/20 hover:bg-white/20 text-sm"
                >
                  Comprar
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
