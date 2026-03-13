'use client';

import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import Image from 'next/image';

interface CreditCardPreviewProps {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
}

// Detectar bandeira do cartão baseado nos primeiros dígitos
const detectCardBrand = (number: string): { name: string; logo?: string; gradient: string } => {
  const cleaned = number.replace(/\s/g, '');
  
  // Visa: começa com 4
  if (/^4/.test(cleaned)) {
    return {
      name: 'VISA',
      gradient: 'linear-gradient(135deg, #1A1F71 0%, #0D47A1 100%)',
    };
  }
  
  // Mastercard: 51-55 ou 2221-2720
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
    return {
      name: 'MASTERCARD',
      gradient: 'linear-gradient(135deg, #EB001B 0%, #F79E1B 100%)',
    };
  }
  
  // Elo: 4011, 4312, 4389, 4514, 4576, 5041, 5066, 5090, 6277, 6362, 6363, 6504, 6505, 6516
  if (/^(4011|4312|4389|4514|4576|5041|5066|5090|6277|636[2-3]|650[4-5]|6516)/.test(cleaned)) {
    return {
      name: 'ELO',
      gradient: 'linear-gradient(135deg, #FFCB05 0%, #000000 100%)',
    };
  }
  
  // American Express: 34 ou 37
  if (/^3[47]/.test(cleaned)) {
    return {
      name: 'AMEX',
      gradient: 'linear-gradient(135deg, #006FCF 0%, #00A3E0 100%)',
    };
  }
  
  // Hipercard: 606282
  if (/^606282/.test(cleaned)) {
    return {
      name: 'HIPERCARD',
      gradient: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)',
    };
  }
  
  // Padrão
  return {
    name: 'CARD',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  };
};

export function CreditCardPreview({ cardNumber, cardName, expiryDate }: CreditCardPreviewProps) {
  const formatCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    const masked = cleaned.replace(/\d(?=\d{4})/g, '•');
    return masked.match(/.{1,4}/g)?.join(' ') || '•••• •••• •••• ••••';
  };

  const brand = detectCardBrand(cardNumber);

  return (
    <motion.div
      className="relative w-full aspect-[1.586] rounded-2xl p-6 overflow-hidden"
      style={{
        background: brand.gradient,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      key={brand.name} // Re-anima quando muda a bandeira
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      
      {/* Padrão de chip */}
      <div className="absolute top-16 left-6 w-12 h-10 rounded bg-gradient-to-br from-yellow-200 to-yellow-400 opacity-80" />
      
      <div className="relative h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <CreditCard className="w-10 h-10 text-white/80" />
          <motion.div 
            className="text-white/90 text-sm font-bold tracking-wider"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {brand.name}
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.div 
            className="text-white text-xl font-mono tracking-wider"
            key={cardNumber}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {formatCardNumber(cardNumber)}
          </motion.div>
          
          <div className="flex justify-between items-end">
            <div>
              <div className="text-white/60 text-[10px] uppercase mb-1">Nome</div>
              <motion.div 
                className="text-white text-sm font-medium uppercase"
                key={cardName}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {cardName || 'SEU NOME'}
              </motion.div>
            </div>
            <div>
              <div className="text-white/60 text-[10px] uppercase mb-1">Validade</div>
              <motion.div 
                className="text-white text-sm font-medium"
                key={expiryDate}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {expiryDate || 'MM/AA'}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
