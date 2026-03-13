'use client';

import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

interface OrderSummaryProps {
  planName: string;
  price: number;
  cycle: 'monthly' | 'yearly';
  loading?: boolean;
  onConfirm: () => void;
}

export function OrderSummary({ planName, price, cycle, loading, onConfirm }: OrderSummaryProps) {
  const monthlyPrice = cycle === 'yearly' ? price / 12 : price;
  const savings = cycle === 'yearly' ? (monthlyPrice * 12 - price).toFixed(2) : '0';

  return (
    <motion.div
      className="sticky top-24 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-sm"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-lg font-semibold text-white mb-6">Resumo do Pedido</h3>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm text-gray-400">Plano {planName}</div>
            <div className="text-xs text-gray-600 mt-1">
              Cobrança {cycle === 'yearly' ? 'anual' : 'mensal'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-white">
              R$ {monthlyPrice.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">/mês</div>
          </div>
        </div>

        {cycle === 'yearly' && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className="text-xs text-green-400 font-medium">
              Economize R$ {savings} por ano
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-white/[0.06] pt-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Subtotal</span>
          <span className="text-sm text-white">R$ {price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-base font-medium text-white">Total</span>
          <span className="text-2xl font-bold text-white">R$ {price.toFixed(2)}</span>
        </div>
      </div>

      <motion.button
        onClick={onConfirm}
        disabled={loading}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2"
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processando...
          </>
        ) : (
          'Confirmar Pagamento'
        )}
      </motion.button>

      <p className="text-xs text-center text-gray-600 mt-4">
        Pagamento 100% seguro e criptografado
      </p>
    </motion.div>
  );
}
