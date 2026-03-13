'use client';

import { motion } from 'framer-motion';
import { Menu, X, Sparkles, Trash2, Settings } from 'lucide-react';

interface ChatHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  userCredits: number;
  onClearChat: () => void;
}

export function ChatHeader({ sidebarOpen, onToggleSidebar, userCredits, onClearChat }: ChatHeaderProps) {
  return (
    <header className="h-14 flex-shrink-0 border-b border-white/[0.06] bg-[#0D0D14]/90 px-3 backdrop-blur-md sm:h-16 sm:px-5 md:px-8">
      <div className="flex h-full w-full items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4">
          <motion.button
            onClick={onToggleSidebar}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-2 text-slate-400 transition-all hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </motion.button>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-[0_0_16px_rgba(139,92,246,0.35)] sm:h-9 sm:w-9">
              <Sparkles className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-white">Zavlo</h1>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Assistente de Compras</p>
            </div>
            <h1 className="text-sm font-semibold text-white sm:hidden">Zavlo</h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-1 text-xs font-medium text-violet-300 sm:px-3">
            <span className="hidden sm:inline">{userCredits} créditos</span>
            <span className="sm:hidden">{userCredits}</span>
          </div>

          <motion.button
            onClick={onClearChat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-2 text-slate-400 transition-all hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
            title="Limpar conversa"
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden rounded-lg border border-white/[0.08] bg-white/[0.04] p-2 text-slate-400 transition-all hover:border-white/20 hover:text-slate-200 sm:flex"
            title="Configurações"
          >
            <Settings className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
