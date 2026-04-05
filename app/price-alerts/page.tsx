'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Toast } from '@/components/ui/Toast';
import { Bell, Trash2, Target, Activity } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zavlo-ia.onrender.com/api/v1';

interface PriceAlert {
  id: string;
  productTitle: string;
  productUrl: string;
  currentPrice: number;
  targetPrice?: number;
  lastCheckedPrice: number;
  lastCheckedAt?: string;
  isActive: boolean;
  createdAt: string;
}

interface AlertStats {
  total: number;
  active: number;
  withTarget: number;
}

export default function PriceAlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const activeAlerts = useMemo(() => alerts.filter((alert) => alert.isActive), [alerts]);

  useEffect(() => {
    void loadAlerts();
  }, []);

  const getToken = (): string | null => {
    const user = localStorage.getItem('zavlo_user');
    if (!user) return null;

    try {
      const parsed = JSON.parse(user);
      return parsed?.token || null;
    } catch {
      return null;
    }
  };

  const loadAlerts = async () => {
    const token = getToken();
    if (!token) {
      router.push('/auth');
      return;
    }

    setLoading(true);

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [alertsResponse, statsResponse] = await Promise.all([
        fetch(`${API_URL}/price-alerts`, { headers }),
        fetch(`${API_URL}/price-alerts/stats`, { headers }),
      ]);

      if (!alertsResponse.ok) {
        throw new Error(`Erro ao carregar alertas (${alertsResponse.status})`);
      }

      const alertsData: PriceAlert[] = await alertsResponse.json();
      setAlerts(Array.isArray(alertsData) ? alertsData : []);

      if (statsResponse.ok) {
        const statsData: AlertStats = await statsResponse.json();
        setStats(statsData);
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      setToast({ message: 'Não foi possível carregar os alertas.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const removeAlert = async (alertId: string) => {
    const token = getToken();
    if (!token) {
      router.push('/auth');
      return;
    }

    setDeletingId(alertId);

    try {
      const response = await fetch(`${API_URL}/price-alerts/${alertId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Erro ao remover alerta (${response.status})`);
      }

      setAlerts((prev) => prev.filter((item) => item.id !== alertId));
      setStats((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          total: Math.max(0, prev.total - 1),
          active: Math.max(0, prev.active - 1),
          withTarget: Math.max(
            0,
            prev.withTarget - (alerts.find((item) => item.id === alertId)?.targetPrice ? 1 : 0),
          ),
        };
      });

      setToast({ message: 'Alerta removido com sucesso.', type: 'success' });
    } catch (error) {
      console.error('Erro ao remover alerta:', error);
      setToast({ message: 'Não foi possível remover o alerta.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0C10]">
        <Header />
        <main className="max-w-5xl mx-auto px-4 pt-24 pb-12">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-64 rounded bg-white/10" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-24 rounded-2xl bg-white/5" />
              ))}
            </div>
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-28 rounded-2xl bg-white/5" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C10]">
      <Header />

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-12 space-y-6">
        <section>
          <h1 className="text-3xl font-semibold text-white mb-2">Alertas de Preço</h1>
          <p className="text-gray-400">Acompanhe seus produtos e remova alertas quando não precisar mais.</p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Total</p>
            <p className="text-3xl font-semibold text-white" suppressHydrationWarning>{stats?.total ?? activeAlerts.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Ativos</p>
            <p className="text-3xl font-semibold text-white" suppressHydrationWarning>{stats?.active ?? activeAlerts.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Com meta</p>
            <p className="text-3xl font-semibold text-white" suppressHydrationWarning>{stats?.withTarget ?? activeAlerts.filter((a) => a.targetPrice).length}</p>
          </div>
        </section>

        <section className="space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-6 h-6 text-gray-300" />
              </div>
              <h2 className="text-lg font-medium text-white mb-1">Nenhum alerta ativo</h2>
              <p className="text-gray-400 mb-6">Crie alertas a partir das buscas para monitorar queda de preço.</p>
              <button
                onClick={() => router.push('/search')}
                className="px-5 py-2.5 rounded-xl bg-white text-black hover:bg-gray-200 transition-colors font-medium"
              >
                Ir para busca
              </button>
            </div>
          ) : (
            activeAlerts.map((alert) => {
              const isDropping = alert.lastCheckedPrice < alert.currentPrice;

              return (
                <article
                  key={alert.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-medium text-white truncate">{alert.productTitle}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs sm:text-sm text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5" />
                          Último preço: R$ {Number(alert.lastCheckedPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        {alert.targetPrice ? (
                          <span className="inline-flex items-center gap-1">
                            <Target className="w-3.5 h-3.5" />
                            Meta: R$ {Number(alert.targetPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        ) : null}
                        {isDropping ? <span className="text-green-400">Preço em queda</span> : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={alert.productUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-gray-200 hover:bg-white/[0.08] transition-colors text-sm"
                      >
                        Abrir produto
                      </a>
                      <button
                        onClick={() => removeAlert(alert.id)}
                        disabled={deletingId === alert.id}
                        className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-gray-300 hover:bg-white/[0.08] disabled:opacity-50 transition-colors text-sm inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deletingId === alert.id ? 'Removendo...' : 'Remover'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
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
