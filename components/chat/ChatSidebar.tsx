'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Plus, Trash2, Edit2, Check, X, Zap,
  Search, Home, CreditCard, History, Star, Sparkles, Circle,
  Settings, User
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

interface ChatHistory {
  id: string;
  title: string;
  messages: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistory: ChatHistory[];
  currentChatId: string;
  userCredits: number;
  isCreatingNewChat: boolean;
  onNewChat: () => void;
  onLoadChat: (chatId: string) => void;
  onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
}

const NAV_ITEMS = [
  { icon: Home, label: 'Início', href: '/' },
  { icon: CreditCard, label: 'Planos', href: '/plans' },
  { icon: History, label: 'Histórico', href: '/history' },
];

const CHAT_ICONS = [Star, Sparkles, Circle, MessageSquare];
const CHAT_ICON_COLORS = [
  'text-amber-400',
  'text-violet-400',
  'text-sky-400',
  'text-emerald-400',
];

function groupChatsByDate(chats: ChatHistory[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  return {
    pinned: [] as ChatHistory[],
    today: chats.filter(c => new Date(c.updatedAt) >= today),
    yesterday: chats.filter(c => {
      const d = new Date(c.updatedAt);
      return d >= yesterday && d < today;
    }),
    lastWeek: chats.filter(c => {
      const d = new Date(c.updatedAt);
      return d >= lastWeek && d < yesterday;
    }),
  };
}

function getChatIcon(id: string) {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const Icon = CHAT_ICONS[hash % CHAT_ICONS.length];
  const color = CHAT_ICON_COLORS[hash % CHAT_ICON_COLORS.length];
  return { Icon, color };
}

export function ChatSidebar({
  isOpen,
  onClose,
  chatHistory,
  currentChatId,
  userCredits,
  isCreatingNewChat,
  onNewChat,
  onLoadChat,
  onDeleteChat,
}: ChatSidebarProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [search, setSearch] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userName, setUserName] = useState('Usuário');
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('zavlo_user');
      if (raw) {
        const data = JSON.parse(raw);
        const name = data.name || data.username || data.email?.split('@')[0] || 'Usuário';
        setUserName(name);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node))
        setSettingsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [settingsOpen]);

  const handleLogout = () => {
    localStorage.removeItem('zavlo_user');
    window.dispatchEvent(new Event('userChanged'));
    router.push('/auth');
  };
  const filtered = (chats: ChatHistory[]) =>
    search.trim()
      ? chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
      : chats;

  // When searching, show all matching chats flat; otherwise group by date
  const allFiltered = search.trim()
    ? chatHistory.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    : null;

  const grouped = groupChatsByDate(chatHistory);

  const SectionLabel = ({ label }: { label: string }) => (
    <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-[0.14em] text-white/20">
      {label}
    </p>
  );

  const ChatItem = ({ chat }: { chat: ChatHistory }) => {
    const { Icon, color } = getChatIcon(chat.id);
    const isActive = currentChatId === chat.id;

    return (
      <motion.div
        key={chat.id}
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        className={`group relative cursor-pointer rounded-lg px-2.5 py-2 transition-all duration-150 ${
          isActive
            ? 'bg-white/[0.07] text-white'
            : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
        }`}
        style={isActive ? { backdropFilter: 'blur(8px)' } : {}}
      >
        {editingId === chat.id ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') setEditingId(null);
              }}
              className="h-7 flex-1 rounded-md border border-white/10 bg-white/[0.06] px-2 text-xs text-white outline-none focus:border-violet-500/50"
              autoFocus
            />
            <button onClick={() => setEditingId(null)} className="rounded p-1 text-white/40 hover:text-white">
              <Check className="h-3 w-3" />
            </button>
            <button onClick={() => setEditingId(null)} className="rounded p-1 text-white/40 hover:text-white">
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5" onClick={() => onLoadChat(chat.id)}>
            <Icon className={`h-3.5 w-3.5 shrink-0 ${color} opacity-70`} />
            <span className="min-w-0 flex-1 truncate text-[13px] font-light">{chat.title}</span>
            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={(e) => { e.stopPropagation(); setEditingId(chat.id); setEditTitle(chat.title); }}
                className="rounded p-1 text-white/30 hover:text-white/80"
              >
                <Edit2 className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => onDeleteChat(chat.id, e)}
                className="rounded p-1 text-white/30 hover:text-rose-400"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const ChatGroup = ({ label, chats }: { label: string; chats: ChatHistory[] }) => {
    const items = filtered(chats);
    if (items.length === 0) return null;
    return (
      <div className="mb-5">
        <SectionLabel label={label} />
        <div className="space-y-0.5">
          {items.map(chat => <ChatItem key={chat.id} chat={chat} />)}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />

          <motion.aside
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="fixed bottom-0 left-0 top-0 z-50 flex w-72 flex-col border-r border-white/[0.05] bg-[#121212] md:relative"
          >
            {/* ── Top: Logo + Search ── */}
            <div className="px-4 pb-3 pt-5">
              <div className="mb-4 flex items-center gap-2.5 px-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-600">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-white">Zavlo AI</span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/20" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar conversas..."
                  className="h-8 w-full rounded-lg border border-white/[0.07] bg-white/[0.04] pl-8 pr-8 text-xs text-white/70 outline-none placeholder:text-white/20 focus:border-white/[0.12] focus:bg-white/[0.06]"
                />
                <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-white/10 px-1 text-[9px] text-white/20">/</kbd>
              </div>
            </div>

            {/* ── Nav ── */}
            <nav className="px-3 pb-4">
              {NAV_ITEMS.map(({ icon: Icon, label, href }) => (
                <button
                  key={label}
                  onClick={() => router.push(href)}
                  className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-light text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/80"
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  {label}
                </button>
              ))}
            </nav>

            <div className="mx-4 border-t border-white/[0.05]" />

            {/* ── New Chat ── */}
            <div className="px-4 py-3">
              <motion.button
                onClick={onNewChat}
                disabled={isCreatingNewChat}
                whileTap={{ scale: 0.98 }}
                className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 text-xs font-semibold text-white shadow-[0_2px_12px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_2px_16px_rgba(139,92,246,0.45)] disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                {isCreatingNewChat ? 'Criando...' : 'Nova conversa'}
              </motion.button>
            </div>

            {/* ── Chat History ── */}
            <style>{`
              .sidebar-scroll::-webkit-scrollbar { width: 3px; }
              .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
              .sidebar-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
            `}</style>
            <div className="sidebar-scroll flex-1 overflow-y-auto px-3 py-2">
              {chatHistory.length === 0 ? (
                <div className="py-12 text-center">
                  <MessageSquare className="mx-auto mb-3 h-8 w-8 text-white/10" />
                  <p className="text-xs text-white/20">Nenhuma conversa ainda</p>
                </div>
              ) : allFiltered !== null ? (
                // Flat search results
                allFiltered.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-xs text-white/20">Sem resultados para &ldquo;{search}&rdquo;</p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {allFiltered.map(chat => <ChatItem key={chat.id} chat={chat} />)}
                  </div>
                )
              ) : (
                // Grouped by date
                <>
                  <ChatGroup label="Pinned" chats={grouped.pinned} />
                  <ChatGroup label="Today" chats={grouped.today} />
                  <ChatGroup label="Yesterday" chats={grouped.yesterday} />
                  <ChatGroup label="Last 7 Days" chats={grouped.lastWeek} />
                </>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="border-t border-white/[0.05] px-4 py-4">
              {/* Credits */}
              <div className="mb-3 flex items-center gap-1.5 px-1">
                <Zap className="h-3 w-3 text-violet-400/70" />
                <span className="text-xs font-light text-white/30">
                  <span className="font-medium text-white/60">{userCredits}</span> créditos restantes
                </span>
              </div>

              {/* Profile row */}
              <div ref={settingsRef} className="relative">
                <div className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.04]">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600/60 to-blue-600/60">
                    <User className="h-3.5 w-3.5 text-white/80" />
                  </div>
                  <span className="flex-1 truncate text-xs font-medium text-white/60">{userName}</span>
                  <button
                    onClick={() => setSettingsOpen(v => !v)}
                    className="rounded p-0.5 text-white/20 transition-colors hover:text-white/60"
                  >
                    <Settings className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>

                <AnimatePresence>
                  {settingsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className="absolute bottom-full left-0 right-0 mb-1 overflow-hidden rounded-lg border border-white/[0.07] bg-[#1a1a1a] shadow-xl"
                    >
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-xs text-rose-400 transition-colors hover:bg-rose-500/10"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sair da conta
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
