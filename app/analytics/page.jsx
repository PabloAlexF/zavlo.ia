'use client';
export default function Analytics() {
    const stats = [
        { label: 'Total Produtos', value: '1.247', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>, gradient: 'from-blue-400 to-blue-600' },
        { label: 'Buscas', value: '8.542', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>, gradient: 'from-purple-400 to-purple-600' },
        { label: 'Preço Médio', value: 'R$ 2.899', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, gradient: 'from-green-400 to-green-600' },
        { label: 'Usuários Ativos', value: '342', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>, gradient: 'from-pink-400 to-pink-600' },
    ];
    const topCategories = [
        { name: 'Eletrônicos', count: 342 },
        { name: 'Celulares', count: 287 },
        { name: 'Notebooks', count: 156 },
        { name: 'Games', count: 134 },
        { name: 'Casa e Decoração', count: 98 },
        { name: 'Moda', count: 76 },
        { name: 'Esportes', count: 54 },
        { name: 'Livros', count: 32 },
    ];
    const topMarketplaces = [
        { name: 'OLX', percentage: 35, color: 'from-blue-500 to-blue-600' },
        { name: 'Mercado Livre', percentage: 28, color: 'from-yellow-500 to-yellow-600' },
        { name: 'Amazon', percentage: 18, color: 'from-orange-500 to-orange-600' },
        { name: 'Shopee', percentage: 12, color: 'from-orange-400 to-red-500' },
        { name: 'Outros', percentage: 7, color: 'from-purple-500 to-purple-600' },
    ];
    const recentActivity = [
        { time: '2 minutos atrás', action: 'Nova busca por', item: 'iPhone 14 Pro' },
        { time: '5 minutos atrás', action: 'Produto comparado', item: 'Samsung Galaxy S23' },
        { time: '12 minutos atrás', action: 'Nova busca por', item: 'Notebook Dell' },
        { time: '18 minutos atrás', action: 'Produto visualizado', item: 'AirPods Pro' },
        { time: '25 minutos atrás', action: 'Nova busca por', item: 'PlayStation 5' },
    ];
    return (<div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"/>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"/>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12 relative pt-24">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Title */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Analytics
            </h1>
            <p className="text-xl text-gray-500">
              Estatísticas e insights da plataforma
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (<div key={stat.label} className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl hover:bg-white/[0.04] transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</span>
                  <span className="text-gray-700">{stat.icon}</span>
                </div>
                <div className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
              </div>))}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Categories */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl">
              <h2 className="text-2xl font-bold mb-6">Top Categorias</h2>
              <div className="space-y-4">
                {topCategories.map((category, index) => (<div key={category.name} className="flex items-center justify-between group hover:translate-x-2 transition-transform">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-sm font-bold text-gray-400 group-hover:from-blue-500 group-hover:to-purple-500 group-hover:text-white transition-all">
                        {index + 1}
                      </div>
                      <span className="text-gray-300 group-hover:text-white transition-colors">{category.name}</span>
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {category.count}
                    </span>
                  </div>))}
              </div>
            </div>

            {/* Top Marketplaces */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl">
              <h2 className="text-2xl font-bold mb-6">Marketplaces Mais Usados</h2>
              <div className="space-y-6">
                {topMarketplaces.map((marketplace) => (<div key={marketplace.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 font-medium">{marketplace.name}</span>
                      <span className="font-bold text-gray-400">{marketplace.percentage}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/[0.03] overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${marketplace.color} transition-all duration-1000`} style={{ width: `${marketplace.percentage}%` }}/>
                    </div>
                  </div>))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <h2 className="text-2xl font-bold">Atividade Recente</h2>
            </div>
            <div className="space-y-1">
              {recentActivity.map((activity, index) => (<div key={index} className="flex items-center justify-between py-4 border-b border-white/[0.03] last:border-0 group hover:bg-white/[0.02] px-4 -mx-4 rounded-lg transition-colors">
                  <div>
                    <span className="text-gray-500 text-sm">{activity.action}</span>{' '}
                    <span className="text-white font-medium group-hover:text-blue-400 transition-colors">{activity.item}</span>
                  </div>
                  <span className="text-sm text-gray-600">{activity.time}</span>
                </div>))}
            </div>
          </div>

          {/* Growth Chart Placeholder */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl">
            <h2 className="text-2xl font-bold mb-6">Crescimento de Buscas</h2>
            <div className="h-80 flex items-center justify-center bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 animate-pulse"/>
              <p className="text-gray-600 relative z-10">Gráfico de crescimento em breve...</p>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
