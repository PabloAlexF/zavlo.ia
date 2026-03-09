'use client';

import { useUser } from '@/contexts/UserContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { transactionService, Transaction } from '@/lib/transactions';
import { getPlanLimits } from '@/lib/plans';
import { motion } from 'framer-motion';
import { 
  User, Mail, Calendar, Crown, Zap, TrendingUp, ShoppingCart, 
  BarChart3, LogOut, Sparkles, ArrowUpRight, Clock, CreditCard,
  Package, Eye, MousePointerClick
} from 'lucide-react';

export default function Profile() {
  const { user, loading, updateUser } = useUser();
  const router = useRouter();
  const [transactions, setTransactions] = useState<(Transaction & { id: string })[]>([]);

  useEffect(() => {
    if (user?.userId) {
      transactionService.getHistory(user.userId, 10).then(setTransactions);
      
      const loadProfile = async () => {
        try {
          const [profileRes, usageRes] = await Promise.all([
            fetch('http://localhost:3001/api/v1/users/profile', {
              headers: { 'Authorization': `Bearer ${user.token}` },
            }),
            fetch('http://localhost:3001/api/v1/users/usage', {
              headers: { 'Authorization': `Bearer ${user.token}` },
            })
          ]);
          
          if (profileRes.ok) {
            const profile = await profileRes.json();
            const usage = usageRes.ok ? await usageRes.json() : { textToday: 0, imageToday: 0 };
            
            updateUser({ 
              credits: profile.credits,
              plan: profile.plan || 'free',
              billingCycle: profile.billingCycle,
              planStartedAt: profile.planStartedAt,
              planExpiresAt: profile.planExpiresAt,
              createdAt: profile.createdAt,
              searchesUsedToday: usage.textToday,
              imageSearchesUsedToday: usage.imageToday,
            });
          }
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
        }
      };
      
      loadProfile();
      const interval = setInterval(loadProfile, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.userId]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

  const planDetails: Record<string, { name: string; color: string; icon: any }> = {
    free: { name: 'Gratuito', color: 'from-gray-500 to-gray-600', icon: Package },
    basic: { name: 'Básico', color: 'from-blue-500 to-cyan-500', icon: Zap },
    pro: { name: 'Pro', color: 'from-purple-500 to-pink-500', icon: Crown },
    business: { name: 'Empresarial', color: 'from-orange-500 to-red-500', icon: Sparkles },
  };

  const currentPlan = planDetails[user.plan || 'free'] || planDetails.free;
  const planLimits = getPlanLimits(user.plan || 'free');
  const PlanIcon = currentPlan.icon;

  return (
    <div className="min-h-screen bg-[#0B0B0F] relative overflow-hidden">
      <Header />
      
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a2e12_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e12_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />

      <main className="relative z-10 container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Meu Perfil</h1>
            <p className="text-gray-400">Gerencie sua conta e assinatura</p>
          </div>
          <motion.button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="w-5 h-5" />
            Sair
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Card */}
            <motion.div 
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-4xl font-black text-white shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-black text-white mb-2">{user.name}</h2>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Membro desde {user.createdAt && !isNaN(new Date(user.createdAt).getTime())
                          ? new Date(user.createdAt).toLocaleDateString('pt-BR') 
                          : new Date().toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Créditos', value: user.credits || 0, icon: Zap, color: 'from-yellow-500 to-orange-500' },
                { label: 'Buscas Hoje', value: user.searchesUsedToday || 0, icon: Eye, color: 'from-blue-500 to-cyan-500' },
                { label: 'Imagens Hoje', value: user.imageSearchesUsedToday || 0, icon: MousePointerClick, color: 'from-purple-500 to-pink-500' },
                { label: 'Transações', value: transactions.length, icon: CreditCard, color: 'from-green-500 to-emerald-500' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Usage Progress */}
            <motion.div 
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Uso Hoje
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-300">Buscas por Texto</span>
                    <span className="text-sm font-bold text-white">
                      {user.searchesUsedToday || 0} / {planLimits.textSearches === Infinity ? '∞' : planLimits.textSearches}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: planLimits.textSearches === Infinity 
                          ? '50%' 
                          : `${Math.min(((user.searchesUsedToday || 0) / planLimits.textSearches) * 100, 100)}%` 
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-300">Análises por Imagem</span>
                    <span className="text-sm font-bold text-white">
                      {user.imageSearchesUsedToday || 0} / {planLimits.imageSearches === Infinity ? '∞' : planLimits.imageSearches}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: planLimits.imageSearches === Infinity 
                          ? '50%' 
                          : planLimits.imageSearches === 0 
                          ? '0%' 
                          : `${Math.min(((user.imageSearchesUsedToday || 0) / planLimits.imageSearches) * 100, 100)}%` 
                      }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Transaction History */}
            <motion.div 
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Histórico de Créditos
              </h3>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400">Nenhuma transação ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((item, i) => (
                    <motion.div 
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.05 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                          item.type === 'purchase' ? 'bg-green-500/20 text-green-400' :
                          item.type === 'usage' ? 'bg-red-500/20 text-red-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {item.type === 'purchase' ? '↓' : item.type === 'usage' ? '↑' : '★'}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{item.description}</p>
                          <p className="text-sm text-gray-400">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-black ${item.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {item.amount > 0 ? '+' : ''}{item.amount}
                        </p>
                        <p className="text-sm text-gray-400">Saldo: {item.balance}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Plan Card */}
            <motion.div 
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-white">Plano Atual</h3>
                <Link href="/plans">
                  <motion.button 
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white hover:bg-white/10 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Mudar
                  </motion.button>
                </Link>
              </div>
              
              <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r ${currentPlan.color} text-white font-black text-2xl mb-6 shadow-lg`}>
                <PlanIcon className="w-8 h-8" />
                {currentPlan.name}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-sm text-gray-400">Próxima cobrança</span>
                  <span className="text-sm font-semibold text-white">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-400">Status</span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Ativo
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/plans">
                <motion.div 
                  className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl hover:scale-105 transition-all group"
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-white mb-1 flex items-center gap-2">
                        <Crown className="w-5 h-5" />
                        Fazer Upgrade
                      </h4>
                      <p className="text-sm text-gray-300">Desbloqueie recursos premium</p>
                    </div>
                    <ArrowUpRight className="w-6 h-6 text-purple-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </motion.div>
              </Link>

              <Link href="/plans">
                <motion.div 
                  className="p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl hover:scale-105 transition-all group"
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-white mb-1 flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        Comprar Créditos
                      </h4>
                      <p className="text-sm text-gray-300">Adicione mais créditos</p>
                    </div>
                    <ArrowUpRight className="w-6 h-6 text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </motion.div>
              </Link>

              <Link href="/analytics">
                <motion.div 
                  className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-2xl hover:scale-105 transition-all group"
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-white mb-1 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Ver Relatórios
                      </h4>
                      <p className="text-sm text-gray-300">Análise de uso detalhada</p>
                    </div>
                    <ArrowUpRight className="w-6 h-6 text-green-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
