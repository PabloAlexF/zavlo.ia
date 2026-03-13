'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, ArrowUp, X, Search } from 'lucide-react';

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageSearch: () => void;
  uploadedImage: string | null;
  onRemoveImage: () => void;
  loading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function ChatInput({
  input,
  onInputChange,
  onSend,
  onImageUpload,
  onImageSearch,
  uploadedImage,
  onRemoveImage,
  loading,
  inputRef,
  fileInputRef,
}: ChatInputProps) {
  const hasContent = input.trim() || uploadedImage;

  return (
    <div className="border-t border-white/[0.06] bg-[#0D0D14]/95 px-3 pb-4 pt-3 backdrop-blur-md sm:px-5 sm:pb-6 sm:pt-4 md:px-8">
      <div className="mx-auto max-w-3xl">
        <AnimatePresence>
          {uploadedImage && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-3"
            >
              <div className="relative inline-block">
                <img src={uploadedImage} alt="Preview" className="h-16 w-16 rounded-xl border border-white/10 object-cover" />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onRemoveImage}
                  className="absolute -right-1.5 -top-1.5 rounded-full border border-white/10 bg-[#1a1a2e] p-0.5 text-slate-300 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="rounded-2xl border border-white/[0.08] bg-[#13131f] shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 focus-within:border-violet-500/40 focus-within:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(139,92,246,0.15)]">
          <div className="flex items-center gap-2 px-3 py-3 md:px-4">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageUpload} className="hidden" />

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-all hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300 disabled:opacity-40"
              title="Buscar por imagem"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Imagem</span>
            </motion.button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  uploadedImage ? onImageSearch() : onSend();
                }
              }}
              placeholder="Pergunte qualquer coisa..."
              className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-100 outline-none placeholder:text-slate-600"
              disabled={loading}
            />

            <AnimatePresence mode="wait">
              {hasContent ? (
                <motion.button
                  key="send"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={uploadedImage ? onImageSearch : onSend}
                  disabled={loading || (!input.trim() && !uploadedImage)}
                  className={`rounded-xl p-2.5 transition-all duration-200 ${
                    loading
                      ? 'cursor-not-allowed bg-white/[0.04] text-slate-600'
                      : 'bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-[0_4px_14px_rgba(139,92,246,0.4)] hover:shadow-[0_4px_18px_rgba(139,92,246,0.55)]'
                  }`}
                >
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <ArrowUp className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </motion.button>
              ) : (
                <motion.button
                  key="idle"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5 text-slate-600"
                  disabled
                >
                  <Search className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="mt-2 text-center text-[10px] text-slate-700 sm:mt-2.5">
          Zavlo AI pode cometer erros. Verifique informações importantes.
        </p>
      </div>
    </div>
  );
}
