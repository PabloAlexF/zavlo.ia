import { Search, DollarSign, Bot, MapPin, Bell, TrendingUp } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      Icon: Search,
      title: 'Busca Inteligente',
      description: 'Encontre produtos por texto ou foto usando IA',
      color: 'text-blue-500'
    },
    {
      Icon: DollarSign,
      title: 'Compare Preços',
      description: 'Veja o melhor preço em todos os marketplaces',
      color: 'text-green-500'
    },
    {
      Icon: Bot,
      title: 'IA Integrada',
      description: 'Classificação automática e detecção de fraudes',
      color: 'text-purple-500'
    },
    {
      Icon: MapPin,
      title: 'Busca Local',
      description: 'Filtre por estado, cidade ou CEP',
      color: 'text-red-500'
    },
    {
      Icon: Bell,
      title: 'Alertas',
      description: 'Receba notificações de novos produtos',
      color: 'text-yellow-500'
    },
    {
      Icon: TrendingUp,
      title: 'Histórico',
      description: 'Acompanhe a variação de preços',
      color: 'text-orange-500'
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Por que usar o Zavlo.ia?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <feature.Icon className={`w-10 h-10 mb-4 ${feature.color}`} />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
