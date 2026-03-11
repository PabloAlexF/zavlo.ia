'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
function ConfirmPlanContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);
    const planName = searchParams.get('plan') || 'basic';
    const cycle = searchParams.get('cycle') || 'monthly';
    useEffect(() => {
        setMounted(true);
    }, []);
    const planDetails = {
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
    return (<div className="min-h-screen bg-[#0B0B0F] relative overflow-hidden">
      <Header />
      
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a2e12_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e12_1px,transparent_1px)] bg-[size:32px_32px]"/>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"/>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]"/>

      <main className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-12">
            <motion.div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full px-4 py-2 mb-6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
              <Check className="w-4 h-4 text-green-400"/>
              <span className="text-sm text-green-300 font-medium">Excelente escolha!</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Plano {plan.name}
            </h1>
            <p className="text-lg text-gray-400">
              Você está a um passo de economizar muito dinheiro
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-2xl p-8 mb-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">Cobrança {cycle === 'yearly' ? 'Anual' : 'Mensal'}</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">R$ {monthlyEquivalent.toFixed(2)}</span>
                  <span className="text-gray-400">/mês</span>
                </div>
                {cycle === 'yearly' && (<div className="text-sm text-green-400 font-semibold mt-2">
                    💰 Economize R$ {savings} por ano
                  </div>)}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Total {cycle === 'yearly' ? 'anual' : 'mensal'}</div>
                <div className="text-3xl font-bold text-white">R$ {finalPrice.toFixed(2)}</div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Incluído no plano:
              </h3>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (<li key={i} className="flex items-center gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                    {feature}
                  </li>))}
              </ul>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Benefícios exclusivos
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {plan.benefits.map((benefit, i) => (<div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-sm text-gray-300">{benefit}</span>
                </div>))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Garantia de 7 dias</h3>
            <p className="text-gray-400 text-sm">
              Não gostou? Devolvemos 100% do seu dinheiro, sem perguntas.
            </p>
          </div>

          <motion.button onClick={() => router.push(`/checkout/payment?plan=${planName}&cycle=${cycle}`)} className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-2 group" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Continuar para Pagamento
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
          </motion.button>

          <p className="text-center text-sm text-gray-500 mt-4">
            🔒 Pagamento seguro • ❌ Cancele quando quiser • 💯 Sem taxas ocultas
          </p>
        </motion.div>
      </main>
    </div>);
}
export default function ConfirmPlan() {
    return (<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-white">Carregando...</p></div>}>
      <ConfirmPlanContent />
    </Suspense>);
}
