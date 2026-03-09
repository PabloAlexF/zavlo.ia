'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from '@/components/ui/Toast';
import { Search, Heart, Tag, Coins, ChevronRight, Image as ImageIcon, Type, CheckCircle, XCircle, Star, TrendingUp, Activity, Calendar, Award, Zap, Target, BarChart3, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserStats {
  name: string;
  textSearchesToday: number;
  imageSearchesToday: number;
  textSearchesMonth: number;
  imageSearchesMonth: number;
  totalSearches: number;
  favoritesCount: number;
  listingsCount: number;
  plan: string;
  credits: number;
  planExpiresAt?: string;
  memberSince?: string;
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

const StatCard = ({ Icon, title, value, details, link, linkText = 'Ver todos', color, trend, delay = 0 }: any) => {
  const router = useRouter();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex flex-col justify-between hover:border-white/30 transition-all shadow-xl group relative overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">{title}</h3>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-black text-white">{value}</p>
              {trend && (
                <span className={`text-sm font-bold flex items-center gap-1 ${
                  trend > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${
                    trend < 0 ? 'rotate-180' : ''
                  }`} />
                  {Math.abs(trend)}%
                </span>
              )}
            </div>
            {details && <p className="text-sm text-gray-400 mt-2">{details}</p>}
          </div>
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className={`p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-lg`}
          >
            <Icon className={`w-7 h-7 ${color}`} />
          </motion.div>
        </div>
        {link && (
          <button 
            onClick={() => router.push(link)} 
            className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 group/btn mt-4"
          >
            {linkText} 
            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </motion.div>
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
        
        // Buscar dados de uso
        const usageResponse = await fetch('http://localhost:3001/api/v1/users/usage', {
          headers: { 'Authorization': `Bearer ${userData.token}` },
        });
        
        let usageData = { textToday: 0, imageToday: 0, textMonth: 0, imageMonth: 0 };
        if (usageResponse.ok) {
          usageData = await usageResponse.json();
        }
        
        setStats({
          name: userProfile.name || 'Usuário',
          textSearchesToday: usageData.textToday || 0,
          imageSearchesToday: usageData.imageToday || 0,
          textSearchesMonth: usageData.textMonth || 0,
          imageSearchesMonth: usageData.imageMonth || 0,
          totalSearches: (usageData.textToday || 0) + (usageData.imageToday || 0),
          favoritesCount: 0,
          listingsCount: 0,
          plan: userProfile.plan || 'free',
          credits: userProfile.credits || 0,
          planExpiresAt: userProfile.planExpiresAt,
          memberSince: userProfile.createdAt,
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
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard 
                Icon={Search} 
                title="Buscas Hoje" 
                value={stats?.totalSearches || 0} 
                details={`${stats?.textSearchesToday || 0} texto • ${stats?.imageSearchesToday || 0} imagem`} 
                color="text-blue-400"
                delay={0}
              />
              <StatCard 
                Icon={Activity} 
                title="Buscas no Mês" 
                value={(stats?.textSearchesMonth || 0) + (stats?.imageSearchesMonth || 0)} 
                details={`${stats?.textSearchesMonth || 0} texto • ${stats?.imageSearchesMonth || 0} imagem`} 
                color="text-purple-400"
                delay={0.1}
              />
              <StatCard 
                Icon={Heart} 
                title="Favoritos" 
                value={stats?.favoritesCount || 0} 
                link="/favorites" 
                color="text-red-400"
                delay={0.2}
              />
              <StatCard 
                Icon={Tag} 
                title="Anúncios" 
                value={stats?.listingsCount || 0} 
                link="/sell" 
                linkText="Criar novo" 
                color="text-orange-400"
                delay={0.3}
              />
            </div>

            {/* Credits & Plan Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-yellow-200 uppercase tracking-wide mb-2">Créditos Disponíveis</h3>
                      <p className="text-5xl font-black text-yellow-400">{stats?.credits || 0}</p>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Coins className="w-16 h-16 text-yellow-400 opacity-50" />
                    </motion.div>
                  </div>
                  <button 
                    onClick={() => router.push('/plans')} 
                    className="w-full mt-4 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    Comprar Mais Créditos
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-purple-200 uppercase tracking-wide mb-2">Plano Atual</h3>
                      <p className="text-4xl font-black text-purple-400">{getPlanName(stats?.plan || 'free')}</p>
                      {stats?.planExpiresAt && (
                        <p className="text-sm text-purple-300 mt-2 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Expira em {Math.ceil((new Date(stats.planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias
                        </p>
                      )}
                    </div>
                    <Award className="w-16 h-16 text-purple-400 opacity-50" />
                  </div>
                  <button 
                    onClick={() => router.push('/plans')} 
                    className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <Target className="w-5 h-5" />
                    Fazer Upgrade
                  </button>
                </div>
              </motion.div>
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
