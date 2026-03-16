'use client';

import { motion } from 'framer-motion';
import { Search, Edit2, Check, X } from 'lucide-react';
import { useState } from 'react';

interface SearchConfirmationModalProps {
  finalQuery: string;
  onConfirm: (editedQuery: string) => void;
  onCancel: () => void;
}

export function SearchConfirmationModal({ finalQuery, onConfirm, onCancel }: SearchConfirmationModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuery, setEditedQuery] = useState(finalQuery);

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleConfirm = () => {
    onConfirm(editedQuery);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-gradient-to-br from-[#13131f] to-[#1a1a2e] p-6 shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600">
          <Search className="h-6 w-6 text-white" />
        </div>

        {/* Title */}
        <h3 className="mb-2 text-xl font-semibold text-white">
          Confirmar Busca
        </h3>
        <p className="mb-6 text-sm text-slate-400">
          Vou buscar o seguinte produto para você:
        </p>

        {/* Query Display/Edit */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            {isEditing ? (
              <textarea
                value={editedQuery}
                onChange={(e) => setEditedQuery(e.target.value)}
                className="w-full rounded-xl border border-violet-500/50 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none resize-none"
                rows={3}
                autoFocus
              />
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-lg font-medium text-white">{editedQuery}</p>
              </div>
            )}
          </div>

          {/* Edit/Save Button */}
          {isEditing ? (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-300 hover:bg-green-500/20"
            >
              <Check className="h-4 w-4" />
              Salvar
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
            >
              <Edit2 className="h-4 w-4" />
              Editar busca
            </button>
          )}
        </div>

        {/* Info */}
        <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
          <p className="text-sm text-blue-200">
            💡 <strong>Dica:</strong> Quanto mais específico, melhores os resultados!
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-slate-300 transition-colors hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!editedQuery.trim()}
            className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" />
            Confirmar Busca
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
