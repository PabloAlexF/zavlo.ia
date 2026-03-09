'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from '@/components/ui/Toast';
import { Search, Heart, Tag, Coins, ChevronRight, Image as ImageIcon, Type, CheckCircle, XCircle, Star } from 'lucide-react';

interface UserStats {
  name: string;
  textSearches: number;
  imageSearches: number;
  totalSearches: number;
  favoritesCount: number;
  listingsCount: number;
  plan: string;
  credits: number;
}

interface UserListing {
  id: string;
  title: string;
  price: number;
  active: boolean;
  views: number;
  clicks: number;
  createdAt: string;
}

interface SearchHistory {
  query: string;
  type: 'text' | 'image';
  timestamp: string;
  success: boolean;
  resultsCount: number;
}

const StatCard = ({ Icon, title, value, details, link, linkText = 'Ver todos', color }: any) => {
  const router = useRouter();
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/10 transition-all hover:scale-105 hover:border-white/20 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-400 mb-3">{title}</h3>
          <p className="text-4xl font-bold text-white mb-2">{value}</p>
          {details && <p className="text-xs text-gray-500">{details}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      {link && (
        <button 
          onClick={() => router.push(link)} 
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 group/btn"
        >
          {linkText} 
          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [listings, setListings] = useState<UserListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Usuário');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    loadDashboardData();
    
    // Escutar mudanças nos créditos
    const handleUpdate = () => loadDashboardData();
    window.addEventListener('userChanged', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    
    // Recarregar dados a cada 5 segundos
    const interval = setInterval(loadDashboardData, 5000);
    
    return () => {
      window.removeEventListener('userChanged', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const loadDashboardData = async () => {
    const user = localStorage.getItem('zavlo_user');
    if (!user) {
      router.push('/auth');
      return;
    }

    try {
      const userData = JSON.parse(user);
      
      const statsResponse = await fetch('http://localhost:3001/api/v1/users/profile', {
        headers: { 'Authorization': `Bearer ${userData.token}` },
      });

      if (statsResponse.ok) {
        const userProfile = await statsResponse.json();
        setStats({
          name: userProfile.name || 'Usuário',
          textSearches: userProfile.usage?.text?.daily || 0,
          imageSearches: userProfile.usage?.image?.daily || 0,
          totalSearches: (userProfile.usage?.text?.daily || 0) + (userProfile.usage?.image?.daily || 0),
          favoritesCount: 0,
          listingsCount: 0,
          plan: userProfile.plan || 'free',
          credits: userProfile.credits || 0,
        });
        setUserName(userProfile.name || 'Usuário');
      }

      const historyResponse = await fetch('http://localhost:3001/api/v1/analytics/history?limit=10', {
        headers: { 'Authorization': `Bearer ${userData.token}` },
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData);
      }

      const favoritesResponse = await fetch('http://localhost:3001/api/v1/favorites', {
        headers: { 'Authorization': `Bearer ${userData.token}` },
      });

      if (favoritesResponse.ok) {
        const favorites = await favoritesResponse.json();
        setStats(prev => prev ? { ...prev, favoritesCount: favorites.length } : null);
      }

      const listingsResponse = await fetch('http://localhost:3001/api/v1/listings/my', {
        headers: { 'Authorization': `Bearer ${userData.token}` },
      });

      if (listingsResponse.ok) {
        const userListings = await listingsResponse.json();
        setListings(userListings.slice(0, 5));
        setStats(prev => prev ? { ...prev, listingsCount: userListings.length } : null);
      }

    } catch (error) {
      setToast({ message: 'Erro ao carregar dados', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] pt-24 pb-12">
        <main className="max-w-7xl mx-auto px-4 animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/2 mb-10"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <div key={i} className="bg-white/5 rounded-xl h-36"></div>)}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const getPlanName = (plan: string) => {
    const plans: Record<string, string> = {
      free: 'Gratuito',
      basic: 'Básico',
      pro: 'Pro',
      business: 'Business'
    };
    return plans[plan?.toLowerCase()] || 'Gratuito';
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] pt-24 pb-12">
      <main className="max-w-7xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">
            Bem-vindo(a) de volta, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{userName}</span>!
          </h1>
          <p className="text-gray-400 mt-1">Aqui está um resumo da sua atividade na plataforma.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard Icon={Search} title="Buscas Hoje" value={stats?.totalSearches || 0} details={`${stats?.textSearches || 0} texto • ${stats?.imageSearches || 0} imagem`} color="text-blue-400" />
              <StatCard Icon={Heart} title="Favoritos" value={stats?.favoritesCount || 0} link="/favorites" color="text-red-400" />
              <StatCard Icon={Tag} title="Anúncios" value={stats?.listingsCount || 0} link="/sell" linkText="Criar novo" color="text-orange-400" />
              <StatCard Icon={Coins} title="Créditos" value={stats?.credits || 0} link="/plans" linkText="Comprar mais" color="text-yellow-400" />
            </div>

            {listings.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Meus Anúncios Recentes</h3>
                  <button onClick={() => router.push('/my-listings')} className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    Ver todos <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {listings.map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-white mb-1">{listing.title}</h4>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                          <span>R$ {listing.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-yellow-500" /> {listing.views} visualizações</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${listing.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {listing.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => router.push(`/listing/${listing.id}`)} className="ml-4 text-blue-400 hover:text-blue-300 text-sm">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Plano Atual</h3>
              <p className="text-3xl font-bold text-purple-400 mb-4">{getPlanName(stats?.plan || 'free')}</p>
              <button onClick={() => router.push('/plans')} className="w-full text-center py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-semibold text-white">
                Ver Planos
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Atividade Recente</h3>
              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-400">Nenhuma atividade recente</div>
              ) : (
                <div className="space-y-4">
                  {history.map((item, index) => (
                    <div key={index} className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1.5 p-1.5 rounded-full bg-white/5 border border-white/10">
                          {item.type === 'image' ? <ImageIcon className="w-4 h-4 text-purple-400" /> : <Type className="w-4 h-4 text-blue-400" />}
                        </div>
                        <div>
                          <p className="text-white font-medium truncate max-w-[150px]">
                            {item.type === 'image' ? 'Busca por imagem' : `"${item.query}"`}
                          </p>
                          <p className="text-sm text-gray-400">{new Date(item.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      {item.success ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
