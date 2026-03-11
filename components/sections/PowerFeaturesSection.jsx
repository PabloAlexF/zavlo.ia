'use client';
import { Search, Image, MapPin, Zap, Bell } from 'lucide-react';
const AnimatedSection = ({ children, className }) => (<section className={className}>{children}</section>);
export default function PowerFeaturesSection() {
    const features = [
        { icon: Search, text: 'Busca em Marketplaces', desc: 'Pesquise em todos os sites de uma vez' },
        { icon: Image, text: 'Busca por Imagem', desc: 'Encontre produtos usando fotos' },
        { icon: MapPin, text: 'Filtro por Cidade', desc: 'Produtos próximos a você' },
        { icon: Zap, text: 'Comparação Automática', desc: 'Compare preços instantaneamente' },
        { icon: Bell, text: 'Alertas Inteligentes', desc: 'Notificações de ofertas' }
    ];
    return (<AnimatedSection className="py-20 bg-gradient-to-b from-transparent to-blue-500/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              FUNCIONALIDADES
            </span>
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              PODEROSAS
            </span>
          </h3>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {features.map((feature, i) => (<div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6"/>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-1">{feature.text}</h4>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              </div>
            </div>))}
        </div>
      </div>
    </AnimatedSection>);
}
