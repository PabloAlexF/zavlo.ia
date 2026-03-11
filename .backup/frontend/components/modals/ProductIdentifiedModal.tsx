'use client';

import { CheckCircle, XCircle, AlertTriangle, Coins, Edit3, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface ProductIdentifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: () => void;
  productName: string;
  onEdit: (newName: string) => void;
  userCredits: number;
}

export default function ProductIdentifiedModal({ 
  isOpen, 
  onClose, 
  onSearch, 
  productName, 
  onEdit,
  userCredits 
}: ProductIdentifiedModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(productName);

  if (!isOpen) return null;

  const hasCredits = userCredits >= 2;
  const isLongText = productName.length > 80;

  const handleEdit = (value: string) => {
    setEditedName(value);
    onEdit(value);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <div className="bg-[#1a1a1f] border border-white/20 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-4 sm:mb-6">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 ${
            hasCredits ? 'bg-green-500/20 border-2 border-green-500/50' : 'bg-red-500/20 border-2 border-red-500/50'
          }`}>
            {hasCredits ? (
              <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-400" />
            ) : (
              <XCircle className="w-7 h-7 sm:w-8 sm:h-8 text-red-400" />
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{hasCredits ? 'Produto Identificado' : 'Créditos Insuficientes'}</h2>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-4 sm:p-5 mb-4 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs sm:text-sm text-gray-300 font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Produto Identificado:
            </label>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <Edit3 className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-blue-400 font-medium">Editável</span>
            </div>
          </div>
          
          <div className="relative group">
            <textarea
              value={editedName}
              onChange={(e) => handleEdit(e.target.value)}
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
              disabled={!hasCredits}
              rows={isLongText ? 4 : 2}
              className={`w-full px-4 py-3 bg-black/70 border-2 rounded-xl text-white text-sm sm:text-base outline-none transition-all resize-none disabled:opacity-50 ${
                isEditing 
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/30' 
                  : 'border-white/30 hover:border-white/50'
              }`}
              placeholder="Digite o nome do produto..."
            />
            {!isEditing && hasCredits && (
              <div className="absolute right-3 top-3 pointer-events-none">
                <Edit3 className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-2 text-xs text-gray-400">
            <span>{editedName.length} caracteres</span>
            {isLongText && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="text-yellow-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  <span className="line-clamp-1">Texto longo - edite para melhorar</span>
                </span>
              </>
            )}
          </div>
        </div>

        {hasCredits ? (
          <>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-yellow-400 font-semibold mb-1 text-sm sm:text-base">Créditos:</p>
                  <p className="text-xs sm:text-sm text-gray-300">1 usado (identificação)</p>
                  <p className="text-xs sm:text-sm text-gray-300">Para buscar menor preço: +1 crédito</p>
                  <p className="text-xs sm:text-sm text-white font-semibold mt-1 sm:mt-2">Total: 2 créditos</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-2.5 sm:p-3 mb-4 sm:mb-6 text-xs sm:text-sm">
              <div className="flex justify-between items-center text-gray-300">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                  <span>Saldo atual:</span>
                </div>
                <span className="text-white font-semibold">{userCredits.toLocaleString()} créditos</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className="w-full sm:flex-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all font-medium text-sm sm:text-base"
              >
                Cancelar
              </button>
              <button
                onClick={onSearch}
                className="w-full sm:flex-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform shadow-lg text-sm sm:text-base"
              >
                Buscar Menor Preço
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-400 text-xs sm:text-sm mb-1 sm:mb-2">
                    Você precisa de pelo menos 2 créditos para buscar por imagem.
                  </p>
                  <p className="text-gray-400 text-xs">
                    Saldo atual: {userCredits} créditos
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform shadow-lg text-sm sm:text-base"
            >
              Entendi
            </button>
          </>
        )}
      </div>
    </div>
  );
}
