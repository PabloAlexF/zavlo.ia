'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Activity, DollarSign, Users, TrendingUp, Package, ShoppingBag, Eye, MousePointerClick, Heart, Bell, Target, Clock, Calendar, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import AreaChart from '@/components/dashboard/AreaChart';
import BarChart from '@/components/dashboard/BarChart';
import PieChart from '@/components/dashboard/PieChart';
import { Toast } from '@/components/ui/Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zavlo-ia.onrender.com/api/v1';

interface AnalyticsData {
  // Métricas gerais
  totalSearches: number;
  textSearches: number;
  imageSearches: number;
  avgResponseTime: number;
  successRate: number;
  topSources: Record<string, number>;
  dailyStats: any[];
  
  // Dados do usuário
  totalFavorites: number;
  totalListings: number;
  totalAlerts: number;
  totalNotifications: number;
  
  // Performance de anúncios
  totalViews: number;
  totalClicks: number;
  ctr: number;
  totalListingsValue: number;
  
  // Economia
  totalSavings: number;
  activeAlerts: number;
}

export default function Analytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const user = localStorage.getItem('zavlo_user');
    if (!user) {
      router.push('/auth');
      return;
    }

    try {
      const userData = JSON.parse(user);
      const headers = { 'Authorization': `Bearer ${userData.token}` };

      const fetchWithRetry = async (url: string, options: any, retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            const response = await fetch(url, { ...options, signal: AbortSignal.timeout(30000) });
            return response;
          } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
          }
        }
      };

      // Carregar métricas de analytics
      const metricsResponse = await fetchWithRetry(`${API_URL}/analytics/metrics?days=30`, { headers });
      let metrics = {
        totalSearches: 0,
        textSearches: 0,
        imageSearches: 0,
        avgResponseTime: 0,
        successRate: 100,
        topSources: {},
        dailyStats: [],
      };
      if (metricsResponse?.ok) {
        metrics = await metricsResponse.json();
      }

      // Carregar dados do usuário
      const profileResponse = await fetchWithRetry(`${API_URL}/users/profile`, { headers });
      const usageResponse = await fetchWithRetry(`${API_URL}/users/usage`, { headers });
      const favoritesResponse = await fetchWithRetry(`${API_URL}/favorites`, { headers });
      const listingsResponse = await fetchWithRetry(`${API_URL}/listings/my`, { headers });
      const alertsResponse = await fetchWithRetry(`${API_URL}/price-alerts`, { headers });

      let totalFavorites = 0;
      let totalListings = 0;
      let totalAlerts = 0;
      let totalViews = 0;
      let totalClicks = 0;
      let totalListingsValue = 0;
      let totalSavings = 0;

      if (favoritesResponse?.ok) {
        const favorites = await favoritesResponse.json();
        totalFavorites = favorites.length;
      }

      if (listingsResponse?.ok) {
        const listings = await listingsResponse.json();
        totalListings = listings.length;
        totalViews = listings.reduce((sum: number, l: any) => sum + (l.views || 0), 0);
        totalClicks = listings.reduce((sum: number, l: any) => sum + (l.clicks || 0), 0);
        totalListingsValue = listings.reduce((sum: number, l: any) => sum + (l.price || 0), 0);
      }

      if (alertsResponse?.ok) {
        const alerts = await alertsResponse.json();
        totalAlerts = alerts.filter((a: any) => a.isActive).length;
        totalSavings = alerts.reduce((sum: number, alert: any) => {
          const savings = alert.currentPrice - alert.lastCheckedPrice;
          return sum + (savings > 0 ? savings : 0);
        }, 0);
      }

      const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

      setData({
        ...metrics,
        totalFavorites,
        totalListings,
        totalAlerts,
        totalNotifications: 0,
        totalViews,
        totalClicks,
        ctr,
        totalListingsValue,
        totalSavings,
        activeAlerts: totalAlerts,
      });

    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      setToast({ message: 'Erro ao carregar dados de analytics', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Preparar dados para gráficos
  const searchTypeData = data ? [
    { label: 'Texto', value: data.textSearches, color: '#3B82F6' },
    { label: 'Imagem', value: data.imageSearches, color: '#A855F7' },
  ] : [];

  const sourcesData = data?.topSources ? 
    Object.entries(data.topSources).map(([source, count], index) => ({
      label: source,
      value: count as number,
      color: ['#3B82F6', '#A855F7', '#EC4899', '#F59E0B', '#10B981'][index % 5],
    })) : [];

  const monthlyData = data?.dailyStats && data.dailyStats.length > 0
    ? data.dailyStats.slice(-12).map(d => d.searches || 0)
    : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, data?.totalSearches || 0];
  
  const monthlyLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const weeklyData = data?.dailyStats && data.dailyStats.length > 0
    ? data.dailyStats.slice(-7).map(d => d.searches || 0)
    : [0, 0, 0, 0, 0, 0, 0];
  
  const weeklyLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0B0F] via-[#0F0F14] to-[#0B0B0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0F] via-[#0F0F14] to-[#0B0B0F]">
      <div className="container mx-auto px-4 lg:px-8 py-12 pt-24">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Analytics
            </h1>
            <p className="text-xl text-gray-400">
              Estatísticas e insights da sua conta
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <Search className="w-8 h-8 text-blue-400" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-sm text-blue-200 uppercase tracking-wide mb-2">Total de Buscas</p>
              <p className="text-4xl font-black text-white" suppressHydrationWarning>
                {data?.totalSearches || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <Heart className="w-8 h-8 text-purple-400" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-sm text-purple-200 uppercase tracking-wide mb-2">Favoritos</p>
              <p className="text-4xl font-black text-white" suppressHydrationWarning>
                {data?.totalFavorites || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <ShoppingBag className="w-8 h-8 text-green-400" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-sm text-green-200 uppercase tracking-wide mb-2">Anúncios</p>
              <p className="text-4xl font-black text-white" suppressHydrationWarning>
                {data?.totalListings || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <Bell className="w-8 h-8 text-yellow-400" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-sm text-yellow-200 uppercase tracking-wide mb-2">Alertas Ativos</p>
              <p className="text-4xl font-black text-white" suppressHydrationWarning>
                {data?.activeAlerts || 0}
              </p>
            </motion.div>
          </div>
          {/* Gráficos de Atividade */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AreaChart
              title="Atividade Mensal"
              data={monthlyData}
              labels={monthlyLabels}
              delay={0.3}
            />

            <BarChart
              title="Atividade Semanal"
              data={weeklyData}
              labels={weeklyLabels}
              delay={0.35}
            />
          </div>

          {/* Gráficos de Distribuição */}
          {(data?.textSearches || 0) + (data?.imageSearches || 0) > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PieChart
                title="Buscas por Tipo"
                data={searchTypeData}
                icon={Activity}
                delay={0.4}
              />

              {sourcesData.length > 0 && (
                <PieChart
                  title="Fontes Utilizadas"
                  data={sourcesData}
                  icon={BarChart3}
                  delay={0.45}
                />
              )}
            </div>
          )}

          {/* Performance de Anúncios */}
          {data && data.totalListings > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-purple-400" />
                Performance dos Anúncios
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Eye className="w-5 h-5 text-blue-400" />
                    <p className="text-sm text-gray-400 uppercase tracking-wide">Visualizações</p>
                  </div>
                  <p className="text-3xl font-bold text-white" suppressHydrationWarning>
                    {data.totalViews.toLocaleString('pt-BR')}
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <MousePointerClick className="w-5 h-5 text-purple-400" />
                    <p className="text-sm text-gray-400 uppercase tracking-wide">Cliques</p>
                  </div>
                  <p className="text-3xl font-bold text-white" suppressHydrationWarning>
                    {data.totalClicks.toLocaleString('pt-BR')}
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-5 h-5 text-green-400" />
                    <p className="text-sm text-gray-400 uppercase tracking-wide">CTR</p>
                  </div>
                  <p className="text-3xl font-bold text-white" suppressHydrationWarning>
                    {data.ctr.toFixed(1)}%
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-yellow-400" />
                    <p className="text-sm text-gray-400 uppercase tracking-wide">Valor Total</p>
                  </div>
                  <p className="text-3xl font-bold text-white" suppressHydrationWarning>
                    R$ {data.totalListingsValue.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Economia com Alertas */}
          {data && data.totalSavings > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-green-400" />
                Economia com Alertas
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-green-200 uppercase tracking-wide mb-2">Economia Total</p>
                  <p className="text-4xl font-black text-green-400" suppressHydrationWarning>
                    R$ {data.totalSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-green-200 uppercase tracking-wide mb-2">Alertas Ativos</p>
                  <p className="text-4xl font-black text-white" suppressHydrationWarning>
                    {data.activeAlerts}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-green-200 uppercase tracking-wide mb-2">Taxa de Sucesso</p>
                  <p className="text-4xl font-black text-white" suppressHydrationWarning>
                    {data.successRate}%
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Estatísticas Adicionais */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              Estatísticas Gerais
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <p className="text-sm text-gray-400 uppercase tracking-wide">Tempo Médio</p>
                </div>
                <p className="text-3xl font-bold text-white" suppressHydrationWarning>
                  {data?.avgResponseTime ? (data.avgResponseTime / 1000).toFixed(1) : '0'}s
                </p>
                <p className="text-xs text-gray-500 mt-2">Por busca</p>
              </div>

              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <p className="text-sm text-gray-400 uppercase tracking-wide">Buscas de Texto</p>
                </div>
                <p className="text-3xl font-bold text-white" suppressHydrationWarning>
                  {data?.textSearches || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {data?.totalSearches ? Math.round((data.textSearches / data.totalSearches) * 100) : 0}% do total
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <Package className="w-5 h-5 text-pink-400" />
                  <p className="text-sm text-gray-400 uppercase tracking-wide">Buscas de Imagem</p>
                </div>
                <p className="text-3xl font-bold text-white" suppressHydrationWarning>
                  {data?.imageSearches || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {data?.totalSearches ? Math.round((data.imageSearches / data.totalSearches) * 100) : 0}% do total
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

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
