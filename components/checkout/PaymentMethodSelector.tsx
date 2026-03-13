'use client';

import { motion } from 'framer-motion';
import { CreditCard, QrCode, FileText } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selected: 'card' | 'pix' | 'boleto';
  onSelect: (method: 'card' | 'pix' | 'boleto') => void;
}

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  const methods = [
    { id: 'card' as const, label: 'Cartão de Crédito', icon: CreditCard },
    { id: 'pix' as const, label: 'PIX', icon: QrCode },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {methods.map((method) => {
        const isSelected = selected === method.id;
        const Icon = method.icon;

        return (
          <motion.button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              isSelected
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSelected && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-blue-500/20"
                layoutId="payment-method-highlight"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            <div className="relative flex flex-col items-center gap-3">
              <Icon className={`w-7 h-7 ${isSelected ? 'text-blue-400' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                {method.label}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
