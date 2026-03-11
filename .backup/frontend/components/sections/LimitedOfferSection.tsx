'use client';

import { useEffect, useState } from 'react';
import { Check, Sparkles, Rocket, Search } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';

const AnimatedSection = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <section className={className}>{children}</section>
);

export default function LimitedOfferSection() {
  const { user } = useUser();
  const [timeLeft, setTimeLeft] = useState(720);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 720);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const benefits = ['Recursos Premium', 'Suporte Prioritário', 'Atualizações Exclusivas'];

  return (
    <AnimatedSection className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-12 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-30 blur-xl"></div>
          
          <div className="relative">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ACESSO GRÁTIS
                </span>
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold text-white">
                POR TEMPO LIMITADO
              </h3>
            </div>

            <div className="flex justify-center gap-4 mb-8">
              <div className="bg-white/10 rounded-xl p-4 min-w-[80px]">
                <div className="text-4xl font-bold text-center">{String(minutes).padStart(2, '0')}</div>
                <div className="text-xs text-gray-400 text-center mt-1">MIN</div>
              </div>
              <div className="flex items-center text-3xl font-bold">:</div>
              <div className="bg-white/10 rounded-xl p-4 min-w-[80px]">
                <div className="text-4xl font-bold text-center">{String(seconds).padStart(2, '0')}</div>
                <div className="text-xs text-gray-400 text-center mt-1">SEG</div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 justify-center">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link href={user ? "/plans" : "/auth"}>
                <button className="px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-purple-500/50 flex items-center gap-2 mx-auto">
                  {user ? (
                    <>
                      <Sparkles className="w-5 h-5" />
                      VER PLANOS PREMIUM
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5" />
                      GARANTIR MEU ACESSO GRATUITO
                    </>
                  )}
                </button>
              </Link>
              <p className="text-sm text-gray-400 mt-4">
                {user ? 'Upgrade para recursos avançados' : 'Sem cartão de crédito • Cancele quando quiser'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
