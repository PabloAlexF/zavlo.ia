'use client';
import { useEffect, useState } from 'react';
import { BrainCircuit, Gem, Zap, CheckCircle, Mail, Users, Target } from 'lucide-react';
export default function About() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handleMouseMove = (event) => {
            if (window.innerWidth < 768)
                return;
            const { clientX, clientY } = event;
            const { innerWidth, innerHeight } = window;
            const x = (clientX / innerWidth - 0.5) * 2;
            const y = (clientY / innerHeight - 0.5) * 2;
            setMousePos({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);
    const features = [
        {
            Icon: Zap,
            title: 'Busca Instantânea',
            description: 'Nosso sistema otimizado busca em múltiplos marketplaces simultaneamente, retornando resultados em segundos.',
            color: 'text-yellow-400'
        },
        {
            Icon: BrainCircuit,
            title: 'IA Avançada',
            description: 'Algoritmos de IA que entendem suas buscas, analisam imagens e trazem os resultados mais relevantes.',
            color: 'text-purple-400'
        },
        {
            Icon: Gem,
            title: 'Melhor Preço',
            description: 'Comparamos preços e histórico para garantir que você sempre encontre as melhores ofertas do mercado.',
            color: 'text-green-400'
        },
    ];
    const technologies = ['Visão Computacional', 'NLP Avançado', 'Machine Learning', 'Web Scraping'];
    const stats = [
        { value: '1M+', label: 'Produtos Ativos', color: 'from-blue-400 to-cyan-400' },
        { value: '9+', label: 'Marketplaces', color: 'from-purple-400 to-pink-400' },
        { value: '27', label: 'Estados Cobertos', color: 'from-green-400 to-emerald-400' },
        { value: '100%', label: 'Gratuito para Usar', color: 'from-yellow-400 to-orange-400' },
    ];
    return (<div className="relative min-h-screen overflow-hidden bg-[#0B0B0F] text-white">
      {/* Background Elements from Homepage */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#3B82F615,transparent)]"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-[100px] animate-pulse mix-blend-screen transition-transform duration-500 ease-out" style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }}/>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-[100px] animate-pulse mix-blend-screen transition-transform duration-500 ease-out" style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }}/>

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-24 sm:py-32 space-y-24">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-anim_4s_ease_infinite]">
            Sobre o Zavlo.ia
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Revolucionando a forma como você encontra as melhores ofertas online.
          </p>
        </div>

        {/* Mission & Vision Section */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-xl border border-white/20"><Target className="w-6 h-6 text-blue-400"/></div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Nossa Missão</h2>
            </div>
            <p className="text-gray-400 leading-relaxed text-lg">
              Simplificar a vida de quem busca os melhores preços online. Sabemos que comparar preços manualmente é trabalhoso. Por isso, criamos uma plataforma inteligente que faz todo esse trabalho por você.
            </p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-xl border border-white/20"><Users className="w-6 h-6 text-purple-400"/></div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Para Quem</h2>
            </div>
            <p className="text-gray-400 leading-relaxed text-lg">
              Para o consumidor inteligente, o caçador de ofertas e qualquer pessoa que queira economizar tempo e dinheiro, garantindo sempre o melhor negócio sem esforço.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="space-y-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Nossos Pilares
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (<div key={feature.title} className="relative bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 group">
                <div className="flex flex-col items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-xl border border-white/20 group-hover:scale-110 transition-transform duration-300">
                    <feature.Icon className={`w-8 h-8 ${feature.color}`}/>
                  </div>
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>))}
          </div>
        </div>

        {/* Technology Section */}
        <div className="relative p-8 sm:p-12 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Tecnologia de Ponta</h2>
            <p className="text-gray-400 leading-relaxed text-lg mb-8 max-w-3xl">
              Utilizamos as mais modernas tecnologias de IA e machine learning para proporcionar a melhor experiência de busca e comparação de preços:
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              {technologies.map((tech) => (<div key={tech} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0"/>
                  <span className="text-gray-300 font-medium">{tech}</span>
                </div>))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => (<div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
              <p className={`text-4xl sm:text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-wider">{stat.label}</p>
            </div>))}
        </div>

        {/* Contact Section */}
        <div className="text-center p-10 sm:p-12 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10">
          <Mail className="w-12 h-12 mx-auto mb-6 text-gray-300"/>
          <h2 className="text-3xl font-bold mb-4">Fale Conosco</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            Tem alguma dúvida, sugestão ou proposta de parceria? Adoraríamos ouvir você!
          </p>
          <a href="mailto:contato@zavlo.ia" className="inline-block px-8 py-3 rounded-full bg-white/10 backdrop-blur-sm text-white font-semibold border-2 border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-300">
            contato@zavlo.ia
          </a>
        </div>
      </main>
    </div>);
}
