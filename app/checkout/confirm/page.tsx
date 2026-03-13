'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, ArrowRight, Sparkles } from 'lucide-react';

interface PlanDetails {
  name: string;
  price: number;
  yearlyPrice: number;
  features: string[];
  benefits: string[];
}

function ConfirmPlanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  const planName = searchParams.get('plan') || 'basic';
  const cycle = searchParams.get('cycle') || 'monthly';

  useEffect(() => {
    setMounted(true);
  }, []);

  const planDetails: Record<string, PlanDetails> = {
    basic: {
      name: 'Básico',
      price: 27.00,
      yearlyPrice: 270.00,
      features: ['15 comparações/mês', 'Todas as lojas', 'Sem anúncios', 'Histórico 30 dias'],
      benefits: [
        'Economize até R$ 500/mês em compras',
        'Acesso a todas as lojas do mercado',
        'Histórico completo de 30 dias',
        'Alertas de preço por email',
        'Suporte por email em 24h',
        'Sem anúncios na plataforma',
      ],
    },
    pro: {
      name: 'Pro',
      price: 77.00,
      yearlyPrice: 770.00,
      features: ['48 análises/mês', 'IA que entende o produto', 'Todas as lojas', 'Prioridade na fila', 'Suporte WhatsApp'],
      benefits: [
        'Economize até R$ 2.000/mês em compras',
        'Acesso a todas as lojas do mercado',
        'IA avançada para recomendações',
        'Alertas instantâneos via WhatsApp',
        'Histórico de 90 dias',
        'Suporte prioritário via WhatsApp',
        'Prioridade na fila de busca',
        'Comparação avançada de produtos',
      ],
    },
    business: {
      name: 'Business',
      price: 197.00,
      yearlyPrice: 1970.00,
      features: ['200 análises/mês', 'API completa', 'Todas as lojas', 'Até 5 usuários', 'Relatórios avançados'],
      benefits: [
        'Economize até R$ 10.000/mês em compras',
        'Acesso a todas as lojas do mercado',
        'IA avançada + Detecção de fraude',
        'Alertas instantâneos via WhatsApp',
        'Histórico ilimitado',
        'Acesso à API completa',
        'Até 5 usuários na conta',
        'Exportar dados em CSV/Excel',
        'Suporte prioritário 24/7',
        'Scraping em tempo real',
      ],
    },
  };

  const plan = planDetails[planName];
  const finalPrice = cycle === 'yearly' ? plan.yearlyPrice : plan.price;
  const monthlyEquivalent = cycle === 'yearly' ? plan.yearlyPrice / 12 : plan.price;
  const savings = cycle === 'yearly' ? (plan.price * 12 - plan.yearlyPrice).toFixed(2) : '0';

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative">
      <Header />
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent" />

      <main className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="w-full max-w-5xl">
          <div className="grid lg:grid-cols-[1fr_380px] gap-16 items-start">
            {/* Left Column - Main Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Header */}
              <div>
                <motion.div 
                  className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1.5 mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-medium text-blue-400">Excelente escolha</span>
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white tracking-tight">
                  Plano {plan.name}
                </h1>
                <p className="text-lg text-gray-400">
                  Você está a um passo de economizar muito dinheiro
                </p>
              </div>

              {/* Benefits Grid */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">O que está incluído</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {plan.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                      <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300 leading-relaxed">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guarantee */}
              <div className="flex items-start gap-4 p-6 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-500/10 rounded-full flex-shrink-0">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Garantia de 7 dias</h3>
                  <p className="text-sm text-gray-400">
                    Não gostou? Devolvemos 100% do seu dinheiro, sem perguntas.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Sticky Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="lg:sticky lg:top-24"
            >
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 space-y-6">
                {/* Pricing */}
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                    {cycle === 'yearly' ? 'Cobrança Anual' : 'Cobrança Mensal'}
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-5xl font-bold text-white">R$ {monthlyEquivalent.toFixed(2)}</span>
                    <span className="text-lg text-gray-400">/mês</span>
                  </div>
                  {cycle === 'yearly' && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <Sparkles className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-sm text-green-400 font-medium">Economize R$ {savings}/ano</span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-white/[0.05]" />

                {/* Features List */}
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Recursos do plano
                  </div>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Divider */}
                <div className="border-t border-white/[0.05]" />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total {cycle === 'yearly' ? 'anual' : 'mensal'}</span>
                  <span className="text-2xl font-bold text-white">R$ {finalPrice.toFixed(2)}</span>
                </div>

                {/* CTA Button */}
                <motion.button
                  onClick={() => router.push(`/checkout/payment?plan=${planName}&cycle=${cycle}`)}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 group"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continuar para Pagamento
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <p className="text-center text-xs text-gray-500">
                  Pagamento seguro • Cancele quando quiser
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ConfirmPlan() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><div className="w-6 h-6 border-2 border-white/10 border-t-white rounded-full animate-spin" /></div>}>
      <ConfirmPlanContent />
    </Suspense>
  );
}
