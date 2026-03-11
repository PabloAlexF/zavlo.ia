'use client';
import { AlertTriangle, XCircle, Coins, CreditCard } from 'lucide-react';
export default function TextSearchModal({ isOpen, onClose, onConfirm, userCredits }) {
    if (!isOpen)
        return null;
    const hasCredits = userCredits > 0;
    return (<div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1f] border border-white/20 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-4 sm:mb-6">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 ${hasCredits ? 'bg-yellow-500/20 border-2 border-yellow-500/50' : 'bg-red-500/20 border-2 border-red-500/50'}`}>
            {hasCredits ? (<AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-400"/>) : (<XCircle className="w-7 h-7 sm:w-8 sm:h-8 text-red-400"/>)}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{hasCredits ? 'Aviso de Créditos' : 'Sem Créditos'}</h2>
          <p className="text-sm sm:text-base text-gray-300">
            {hasCredits ? 'Esta busca consumirá 1 crédito.' : 'Você não tem créditos suficientes para realizar esta busca.'}
          </p>
        </div>

        {hasCredits ? (<>
            <div className="bg-white/10 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-300">
                  <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400"/>
                  <span className="text-xs sm:text-sm">Saldo atual:</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-white">{userCredits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/20">
                <span className="text-xs sm:text-sm text-gray-300">Após busca:</span>
                <span className="text-lg sm:text-xl font-semibold text-blue-400">{(userCredits - 1).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button onClick={onClose} className="w-full sm:flex-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all font-medium text-sm sm:text-base">
                Cancelar
              </button>
              <button onClick={onConfirm} className="w-full sm:flex-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform shadow-lg text-sm sm:text-base">
                Confirmar Busca
              </button>
            </div>
          </>) : (<>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-red-400"/>
                <p className="text-red-400 text-xs sm:text-sm">
                  Adquira mais créditos para continuar usando a plataforma
                </p>
              </div>
            </div>

            <button onClick={onClose} className="w-full px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform shadow-lg text-sm sm:text-base">
              Entendi
            </button>
          </>)}
      </div>
    </div>);
}
