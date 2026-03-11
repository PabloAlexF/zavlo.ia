'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Info } from 'lucide-react';
export function Modal({ isOpen, onClose, type = 'info', title, message, confirmText = 'Fechar', onConfirm, cancelText = 'Cancelar', }) {
    const icons = {
        success: <Check className="w-6 h-6 text-green-400"/>,
        error: <X className="w-6 h-6 text-red-400"/>,
        warning: <AlertCircle className="w-6 h-6 text-yellow-400"/>,
        info: <Info className="w-6 h-6 text-blue-400"/>,
    };
    const colors = {
        success: 'bg-green-500/20',
        error: 'bg-red-500/20',
        warning: 'bg-yellow-500/20',
        info: 'bg-blue-500/20',
    };
    return (<AnimatePresence>
      {isOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[type]}`}>
                {icons[type]}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{message}</p>
              </div>
            </div>

            <div className="flex gap-3">
              {onConfirm ? (<>
                  <button onClick={onClose} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition">
                    {cancelText}
                  </button>
                  <button onClick={() => {
                    onConfirm();
                    onClose();
                }} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition shadow-lg shadow-blue-500/20">
                    {confirmText}
                  </button>
                </>) : (<button onClick={onClose} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition">
                  {confirmText}
                </button>)}
            </div>
          </motion.div>
        </motion.div>)}
    </AnimatePresence>);
}
