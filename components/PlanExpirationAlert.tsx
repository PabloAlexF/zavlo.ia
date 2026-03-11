'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';

interface PlanStatus {
  isExpired: boolean;
  daysLeft: number | null;
  message: string;
}

export function PlanExpirationAlert() {
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkPlanStatus();
  }, []);

  const checkPlanStatus = async () => {
    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) return;

      const userData = JSON.parse(user);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/plan-status`, {
        headers: {
          'Authorization': `Bearer ${userData.token}`,
        },
      });

      if (response.ok) {
        const status = await response.json();
        
        // Só mostra se expirou ou está perto de expirar (7 dias ou menos)
        if (status.isExpired || (status.daysLeft !== null && status.daysLeft <= 7)) {
          setPlanStatus(status);
        }
      }
    } catch (error) {
      console.error('Error checking plan status:', error);
    }
  };

  if (!planStatus || dismissed) return null;

  const getAlertColor = () => {
    if (planStatus.isExpired) return 'bg-red-500/10 border-red-500/50 text-red-400';
    if (planStatus.daysLeft && planStatus.daysLeft <= 3) return 'bg-orange-500/10 border-orange-500/50 text-orange-400';
    return 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400';
  };

  const getIconColor = () => {
    if (planStatus.isExpired) return 'text-red-400';
    if (planStatus.daysLeft && planStatus.daysLeft <= 3) return 'text-orange-400';
    return 'text-yellow-400';
  };

  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-full mx-4 animate-slide-down`}>
      <div className={`${getAlertColor()} backdrop-blur-sm rounded-xl border p-4 shadow-2xl flex items-start gap-3`}>
        <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${getIconColor()}`} />
        
        <div className="flex-1">
          <p className="font-medium mb-2">{planStatus.message}</p>
          
          {planStatus.isExpired ? (
            <Link 
              href="/plans"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Renovar Agora
            </Link>
          ) : (
            <Link 
              href="/plans"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/20"
            >
              Ver Planos
            </Link>
          )}
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
