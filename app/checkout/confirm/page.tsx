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
      features: ['15 comparações/mês', '6 lojas monitoradas', 'Sem anúncios', 'Histórico 30 dias'],
      benefits: [
        'Economize até R$ 500/mês em compras',
        'Acesso a 6 lojas principais',
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
      features: ['48 análises/mês', 'IA que entende o produto', '9 lojas monitoradas', 'Prioridade na fila', 'Suporte WhatsApp'],
      benefits: [
        'Economize até R$ 2.000/mês em compras',
        'Acesso a TODAS as 9 lojas',
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
        'Acesso a TODAS as 12 lojas',
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Header />
      
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950" />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8 sm:mb-12">
            <motion.div 
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              <span className="text-xs sm:text-sm text-gray-400 font-medium">Excelente escolha!</span>
            </motion.div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 sm:mb-3 text-white tracking-tight">
              Plano {plan.name}
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              Você está a um passo de economizar muito dinheiro
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
              <div>
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Cobrança {cycle === 'yearly' ? 'Anual' : 'Mensal'}</div>
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white">R$ {monthlyEquivalent.toFixed(2)}</span>
                  <span className="text-sm sm:text-base text-gray-500">/mês</span>
                </div>
                {cycle === 'yearly' && (
                  <div className="text-xs sm:text-sm text-green-400 font-medium mt-1.5 sm:mt-2">
                    Economize R$ {savings} por ano
                  </div>
                )}
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Total {cycle === 'yearly' ? 'anual' : 'mensal'}</div>
                <div className="text-2xl sm:text-3xl font-semibold text-white">R$ {finalPrice.toFixed(2)}</div>
              </div>
            </div>

            <div className="border-t border-white/[0.06] pt-4 sm:pt-6">
              <h3 className="font-medium text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2 text-white">
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                Incluído no plano:
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              Benefícios exclusivos
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {plan.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-2 sm:gap-3 bg-white/[0.02] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/[0.06]">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-400">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white/[0.04] rounded-full mb-3 sm:mb-4">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="font-medium text-base sm:text-lg mb-1 sm:mb-2 text-white">Garantia de 7 dias</h3>
            <p className="text-gray-500 text-xs sm:text-sm">
              Não gostou? Devolvemos 100% do seu dinheiro, sem perguntas.
            </p>
          </div>

          <motion.button
            onClick={() => router.push(`/checkout/payment?plan=${planName}&cycle=${cycle}`)}
            className="w-full py-3 sm:py-4 md:py-5 bg-white text-black rounded-lg sm:rounded-xl font-medium text-sm sm:text-base md:text-lg transition-all flex items-center justify-center gap-2 group hover:bg-gray-100 active:scale-95"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Continuar para Pagamento
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <p className="text-center text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4">
            Pagamento seguro • Cancele quando quiser • Sem taxas ocultas
          </p>
        </motion.div>
      </main>
    </div>
  );
}

export default function ConfirmPlan() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>}>
      <ConfirmPlanContent />
    </Suspense>
  );
}
