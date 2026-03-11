'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Coins, Zap, X } from 'lucide-react';
export default function CreditUsedModal({ isOpen, onClose, creditsUsed, remainingCredits, searchType = 'text' }) {
    return (<AnimatePresence>
      {isOpen && (<>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"/>
          
          {/* Modal */}
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-[#101014] border border-white/10 rounded-2xl shadow-2xl z-50 p-6">
            {/* Close Button */}
            <button onClick={onClose} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5"/>
            </button>

            {/* Success Icon */}
            <div className="text-center mb-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                <CheckCircle className="w-8 h-8 text-white"/>
              </motion.div>
              
              <h2 className="text-xl font-bold text-white mb-2">
                Busca Concluída! 🎉
              </h2>
              <p className="text-gray-400 text-sm">
                {searchType === 'image'
                ? 'Produto identificado e busca realizada com sucesso!'
                : 'Sua busca foi realizada com sucesso!'}
              </p>
            </div>

            {/* Credits Info */}
            <div className="space-y-3 mb-6">
              {/* Credits Spent */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-red-400"/>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Créditos Gastos</p>
                      <p className="text-white font-semibold text-lg">-{creditsUsed}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Remaining Credits */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Coins className="w-5 h-5 text-yellow-400"/>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Créditos Restantes</p>
                      <p className="text-white font-semibold text-lg">
                        {remainingCredits >= 0 ? remainingCredits.toLocaleString() : 0}
                      </p>
                    </div>
                  </div>
                  {remainingCredits <= 5 && remainingCredits > 0 && (<span className="text-orange-400 text-xs font-medium animate-pulse">
                      Acabando!
                    </span>)}
                </div>
              </motion.div>

              {/* Low Credits Warning */}
              {remainingCredits <= 0 && (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-center">
                  <p className="text-red-400 font-semibold text-sm mb-2">
                    ⚠️ Créditos Esgotados!
                  </p>
                  <p className="text-gray-400 text-xs">
                    Adquira mais créditos para continuar usando a plataforma.
                  </p>
                </motion.div>)}
            </div>

            {/* Close Button */}
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} onClick={onClose} className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
              Entendi
            </motion.button>
          </motion.div>
        </>)}
    </AnimatePresence>);
}
