'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, Edit2, CreditCard, ExternalLink } from 'lucide-react';
import { ProductCard } from '@/components/features/ProductCard';
import { SearchingAnimation } from '@/components/chat/SearchingAnimation';
import Link from 'next/link';
import { useState } from 'react';

interface PriceSuggestion { label: string; min?: number; max?: number; value?: string }

interface Message {
  id: string;
  type: 'user' | 'ai' | 'products' | 'image_confirmation' | 'sort_question' | 'query_confirm' | 'question' | 'expansion';
  content: string;
  products?: any[];
  timestamp: Date;
  searchType?: 'text' | 'image';
  creditCost?: number;
  imageData?: string;
  detectedProduct?: string;
  priceRangeApplied?: { min?: number; max?: number; target?: number };
  questionType?: string;
  questionSuggestions?: PriceSuggestion[];
  userLocation?: { city?: string; state?: string };
  expansionSources?: string[];
  primarySource?: string;
  isVehicle?: boolean;
  queryConfirmSortBy?: string;
  queryConfirmCreditEstimate?: number;
  queryConfirmNotes?: string[];
  isImageSort?: boolean;
  questionAnswered?: boolean;
  questionAnswerLabel?: string;
}

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
  userCredits: number;
  onSendMessage: (text: string) => void;
  onImageSearchReject: () => void;
  onImagePriceSearch: () => void;
  onExecuteImageSearch: (sortBy: string) => void;
  onUpdateDetectedProduct: (messageId: string, newName: string) => void;
  onQuestionAnswer: (answer: string) => void;
  onQuestionSkip: () => void;
  onExpandSearch: (source: string) => void;
  onExecuteTextSort: (sortBy: string) => void;
  onQueryConfirm: (finalQuery: string, sortBy: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

// ── Avatars ──────────────────────────────────────────────────────────────────
const AIAvatar = () => (
  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-[0_0_12px_rgba(139,92,246,0.3)]">
    <Sparkles className="h-3.5 w-3.5 text-white" />
  </div>
);

const UserAvatar = () => (
  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.06]">
    <User className="h-3.5 w-3.5 text-slate-400" />
  </div>
);

// ── Controlled product name editor ─────────────────────────────────────────
function EditableProductName({ messageId, initialValue, onUpdate }: {
  messageId: string;
  initialValue: string;
  onUpdate: (id: string, name: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="relative mb-4">
      <input
        type="text"
        value={value}
        maxLength={100}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onUpdate(messageId, value);
            (e.target as HTMLInputElement).blur();
          }
        }}
        onBlur={() => onUpdate(messageId, value)}
        className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 pr-9 text-sm text-slate-100 outline-none transition-colors focus:border-violet-500/50"
      />
      <Edit2 className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
    </div>
  );
}

// ── Bubble base ───────────────────────────────────────────────────────────────
const AIBubble = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl rounded-tl-sm border border-white/[0.07] bg-[#13131f] p-3.5 text-[14px] leading-relaxed text-slate-200 sm:p-5 sm:text-[15px] ${className}`}>
    {children}
  </div>
);

// ── Markdown-lite: **bold** → <strong> ───────────────────────────────────────
function RichText({ text, className = '' }: { text: string; className?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

// ── Formata texto com quebras de linha e bold ─────────────────────────────────
function FormattedMessage({ content, className = '' }: { content: string; className?: string }) {
  const lines = content.split('\n');
  return (
    <div className={`space-y-1 ${className}`}>
      {lines.map((line, i) => (
        <p key={i} className={line === '' ? 'h-2' : ''}>
          <RichText text={line} />
        </p>
      ))}
    </div>
  );
}

// ── Faixa de preço formatada ──────────────────────────────────────────────────
function formatPriceRange(range: { min?: number; max?: number; target?: number }): string {
  const fmt = (v: number) => v.toLocaleString('pt-BR');
  if (range.min != null && range.max != null) return `R$ ${fmt(range.min)} – R$ ${fmt(range.max)}`;
  if (range.max != null) return `até R$ ${fmt(range.max)}`;
  if (range.min != null) return `acima de R$ ${fmt(range.min)}`;
  if (range.target != null) return `aprox. R$ ${fmt(range.target)}`;
  return '';
}

// ── Marketplace brand configs ─────────────────────────────────────────────────
const MARKETPLACE_CONFIG: Record<string, {
  label: string;
  icon: string;
  bg: string;
  border: string;
  text: string;
  glow: string;
}> = {
  olx: {
    label: 'OLX',
    icon: '🟣',
    bg: 'bg-[#6514DD]/15 hover:bg-[#6514DD]/25',
    border: 'border-[#6514DD]/40 hover:border-[#6514DD]/70',
    text: 'text-[#a97ff5]',
    glow: 'hover:shadow-[0_0_16px_rgba(101,20,221,0.25)]',
  },
  mercadolivre: {
    label: 'Mercado Livre',
    icon: '🟡',
    bg: 'bg-[#FFE600]/10 hover:bg-[#FFE600]/20',
    border: 'border-[#FFE600]/30 hover:border-[#FFE600]/60',
    text: 'text-[#FFE600]',
    glow: 'hover:shadow-[0_0_16px_rgba(255,230,0,0.2)]',
  },
  webmotors: {
    label: 'Webmotors',
    icon: '🔴',
    bg: 'bg-[#E8001C]/10 hover:bg-[#E8001C]/20',
    border: 'border-[#E8001C]/30 hover:border-[#E8001C]/60',
    text: 'text-[#ff4d5e]',
    glow: 'hover:shadow-[0_0_16px_rgba(232,0,28,0.2)]',
  },
  google_shopping: {
    label: 'Google Shopping',
    icon: '🛍️',
    bg: 'bg-white/[0.05] hover:bg-white/[0.09]',
    border: 'border-white/[0.12] hover:border-white/25',
    text: 'text-slate-200',
    glow: '',
  },
};

function getMarketplaceConfig(source: string) {
  return MARKETPLACE_CONFIG[source] ?? {
    label: source,
    icon: '🔍',
    bg: 'bg-white/[0.05] hover:bg-white/[0.09]',
    border: 'border-white/[0.12] hover:border-white/25',
    text: 'text-slate-200',
    glow: '',
  };
}

function getPriceTrendBadge(product: any): { text: string; className: string } | null {
  const trend = product?.priceTrend;
  if (!trend || typeof trend !== 'object') return null;

  const dropPercent = Number(trend.dropPercent ?? 0);
  const windowDays = Number(trend.windowDays ?? 30);
  const status = String(trend.status ?? '').toLowerCase();

  if (status === 'down' && Number.isFinite(dropPercent) && dropPercent > 0) {
    return {
      text: `📉 Caiu ${dropPercent}% (${windowDays}d)`,
      className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    };
  }

  if (status === 'stable') {
    return {
      text: `➖ Estável (${windowDays}d)`,
      className: 'border-slate-500/30 bg-slate-500/10 text-slate-200',
    };
  }

  if (status === 'up') {
    return {
      text: `📈 Em alta (${windowDays}d)`,
      className: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    };
  }

  return null;
}

// ── Option button genérico ────────────────────────────────────────────────────
const OptionButton = ({ onClick, children, variant = 'default' }: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'danger';
}) => {
  const styles = {
    default: 'border-white/[0.08] bg-white/[0.04] text-slate-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white',
    primary: 'border-violet-500/40 bg-violet-500/15 text-violet-200 hover:bg-violet-500/25 hover:border-violet-400/50',
    danger:  'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
  };
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`min-h-11 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${styles[variant]}`}
    >
      {children}
    </motion.button>
  );
};

// ── Skip link ─────────────────────────────────────────────────────────────────
const SkipLink = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button
    onClick={onClick}
    className="mt-1 w-full py-1.5 text-xs text-slate-600 transition-colors hover:text-slate-400"
  >
    {label}
  </button>
);

// ── Inline question chip row ──────────────────────────────────────────────────
const QuestionChip = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <motion.button
    whileHover={{ y: -2, scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="min-h-11 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200 transition-all hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"
  >
    {children}
  </motion.button>
);

// ── Query confirm bubble (editable final query before search) ───────────────
function QueryConfirmBubble({ message, onConfirm }: {
  message: Message;
  onConfirm: (finalQuery: string, sortBy: string) => void;
}) {
  const [value, setValue] = useState(message.content);
  const sortBy = (message as any).queryConfirmSortBy || 'BEST_MATCH';
  const creditEstimate = (message as any).queryConfirmCreditEstimate as number | undefined;
  const notes = ((message as any).queryConfirmNotes as string[] | undefined) || [];
  const sortLabels: Record<string, string> = {
    BEST_MATCH: 'mais relevante', LOWEST_PRICE: 'menor preço',
    HIGHEST_PRICE: 'maior preço', TOP_RATED: 'mais avaliados',
  };
  return (
    <AIBubble>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Busca final • {sortLabels[sortBy] || sortBy}</p>
      <p className="mb-3 text-xs text-slate-400">Confirme ou edite o texto antes de buscar</p>
      {(creditEstimate || notes.length > 0) && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-100">
          {creditEstimate && (
            <p className="font-medium">⚠️ Estimativa desta busca: ~{creditEstimate} crédito{creditEstimate > 1 ? 's' : ''}</p>
          )}
          {notes.filter((note) => !note.includes('Esta busca deve consumir cerca de')).map((note, index) => (
            <p key={index} className="mt-1 text-amber-100/85">• {note}</p>
          ))}
        </div>
      )}
      <div className="relative mb-4">
        <input
          type="text"
          value={value}
          maxLength={150}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && value.trim()) onConfirm(value.trim(), sortBy); }}
          className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 pr-9 text-sm text-slate-100 outline-none transition-colors focus:border-violet-500/50"
        />
        <Edit2 className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        disabled={!value.trim()}
        onClick={() => value.trim() && onConfirm(value.trim(), sortBy)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/35 disabled:opacity-40"
      >
        🔍 Buscar agora
      </motion.button>
    </AIBubble>
  );
}


export const ChatMessages = ({
  messages,
  loading,
  userCredits,
  onSendMessage,
  onImageSearchReject,
  onImagePriceSearch,
  onExecuteImageSearch,
  onUpdateDetectedProduct,
  onQuestionAnswer,
  onQuestionSkip,
  onExpandSearch,
  onExecuteTextSort,
  onQueryConfirm,
  messagesEndRef,
}: ChatMessagesProps) => {
  const formatTime = (timestamp: Date) => {
    try {
      return new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className="chat-scroll flex-1 overflow-y-auto px-2.5 py-5 sm:px-5 sm:py-8 md:px-8 md:py-10"
      style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.04) 0%, transparent 60%), #0A0A12' }}
    >
      <style>{`
        .chat-scroll::-webkit-scrollbar { width: 6px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 999px; }
        .chat-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
      `}</style>
      <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 18, scale: 0.985, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.97, y: -6 }}
              transition={{ duration: 0.3, delay: index < 4 ? index * 0.028 : 0, ease: [0.22, 1, 0.36, 1] }}
            >

              {/* ── Usuário ── */}
              {message.type === 'user' && (
                <div className="flex items-end justify-end gap-2 sm:gap-3">
                  <div className="max-w-[92%] sm:max-w-[84%]">
                    <div className="rounded-2xl rounded-br-sm border border-white/[0.07] bg-[#1a1a2e]/80 px-3.5 py-3 sm:px-5 sm:py-3.5">
                      {message.imageData && (
                        <img src={message.imageData} alt="Imagem enviada" className="mb-3 max-w-[180px] rounded-xl border border-slate-700" />
                      )}
                      <p className="text-[14px] leading-relaxed text-slate-200 whitespace-pre-wrap sm:text-[15px]">{message.content}</p>
                    </div>
                    <p className="mt-1 px-1 text-right text-[11px] text-slate-600">{formatTime(message.timestamp)}</p>
                  </div>
                  <UserAvatar />
                </div>
              )}

              {/* ── IA texto ── */}
              {message.type === 'ai' && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <AIAvatar />
                  <div className="max-w-[95%] sm:max-w-[86%]">
                    <AIBubble>
                      {message.content === 'searching_animation' ? (
                        <SearchingAnimation />
                      ) : message.content.includes('Créditos insuficientes') ? (
                        <div className="space-y-4">
                          <FormattedMessage content={message.content} />
                          <Link href="/plans">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-shadow hover:shadow-violet-500/40"
                            >
                              <CreditCard className="h-4 w-4" />
                              Ver Planos e Preços
                            </motion.button>
                          </Link>
                        </div>
                      ) : (
                        <FormattedMessage content={message.content} className="text-slate-200" />
                      )}
                    </AIBubble>
                    <p className="mt-1 px-1 text-[11px] text-slate-600">{formatTime(message.timestamp)}</p>
                  </div>
                </div>
              )}

              {/* ── Confirmação de imagem ── */}
              {message.type === 'image_confirmation' && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <AIAvatar />
                  <div className="max-w-[88%] sm:max-w-[80%]">
                    <AIBubble>
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Produto identificado</p>
                      <EditableProductName
                        messageId={message.id}
                        initialValue={message.detectedProduct || ''}
                        onUpdate={onUpdateDetectedProduct}
                      />
                      <div className="flex gap-2">
                        <OptionButton onClick={onImageSearchReject} variant="danger">Não é isso</OptionButton>
                        <OptionButton onClick={onImagePriceSearch} variant="primary">Buscar preços →</OptionButton>
                      </div>
                    </AIBubble>
                  </div>
                </div>
              )}

              {/* ── Pergunta inline (hybrid mode) ── */}
              {message.type === 'question' && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <AIAvatar />
                  <div className="max-w-[88%] sm:max-w-[82%]">
                    <AIBubble>
                      <p className="mb-1 font-medium text-white">{message.content}</p>
                      <p className="mb-4 text-xs text-slate-500">Isso ajuda a encontrar os melhores resultados</p>

                      {message.questionAnswered && (
                        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                          ✅ Resposta: {message.questionAnswerLabel || 'Respondido'}
                        </div>
                      )}

                      {!message.questionAnswered && (
                        <>

                      {/* Condição */}
                      {message.questionType === 'condition' && (
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: 'novo',  label: '✨ Novo',      desc: '0 km' },
                            { value: 'usado', label: '🔄 Usado',     desc: 'Seminovo' },
                            { value: 'ambos', label: '🔀 Tanto faz', desc: 'Todos' },
                          ].map((opt) => (
                            <motion.button
                              key={opt.value}
                              whileHover={{ y: -2, scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => onQuestionAnswer(opt.value)}
                              className="flex flex-col items-start rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-left transition-all hover:border-violet-500/40 hover:bg-violet-500/10"
                            >
                              <span className="text-sm font-medium text-white">{opt.label}</span>
                              <span className="text-[11px] text-slate-500">{opt.desc}</span>
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {/* Preço */}
                      {message.questionType === 'price_range' && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {(message.questionSuggestions ?? [
                              { label: 'até 30mil',      max: 30000 },
                              { label: 'até 50mil',      max: 50000 },
                              { label: 'até 80mil',      max: 80000 },
                              { label: 'acima de 80mil', min: 80000 },
                            ]).map((s) => (
                              <QuestionChip
                                key={s.label}
                                onClick={() => onQuestionAnswer(JSON.stringify({ type: 'price_range', value: s }))}
                              >
                                💰 {s.label}
                              </QuestionChip>
                            ))}
                          </div>
                          <SkipLink onClick={onQuestionSkip} label="Continuar sem filtro de preço" />
                        </div>
                      )}

                      {/* Ano */}
                      {message.questionType === 'year' && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'].map((year) => (
                              <QuestionChip key={year} onClick={() => onQuestionAnswer(year)}>
                                {year}
                              </QuestionChip>
                            ))}
                          </div>
                          <SkipLink onClick={() => onQuestionAnswer('qualquer ano')} label="Qualquer ano" />
                        </div>
                      )}

                      {/* Localização */}
                      {message.questionType === 'location' && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {message.userLocation?.city && (
                              <QuestionChip onClick={() => onQuestionAnswer(message.userLocation!.city!)}>
                                📍 {message.userLocation.city}
                              </QuestionChip>
                            )}
                            {!message.userLocation?.city && [
                              { label: 'São Paulo, SP', value: 'São Paulo, SP' },
                              { label: 'Rio de Janeiro, RJ', value: 'Rio de Janeiro, RJ' },
                              { label: 'Belo Horizonte, MG', value: 'Belo Horizonte, MG' },
                              { label: 'Curitiba, PR', value: 'Curitiba, PR' },
                              { label: 'Porto Alegre, RS', value: 'Porto Alegre, RS' },
                              { label: 'Brasília, DF', value: 'Brasília, DF' },
                            ].map((cityOption) => (
                              <QuestionChip key={cityOption.value} onClick={() => onQuestionAnswer(cityOption.value)}>
                                📍 {cityOption.label}
                              </QuestionChip>
                            ))}
                            <QuestionChip onClick={() => onQuestionAnswer('todo o brasil')}>
                              🇧🇷 Todo o Brasil
                            </QuestionChip>
                          </div>
                          <SkipLink onClick={onQuestionSkip} label="Continuar sem filtro de localização" />
                        </div>
                      )}

                      {/* Sugestões genéricas (gender, size, storage, etc.) */}
                      {message.questionSuggestions && !['condition','price_range','year','location'].includes(message.questionType || '') && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {message.questionSuggestions.map((s: any) => (
                              <QuestionChip
                                key={s.label}
                                onClick={() => onQuestionAnswer(
                                  s.value !== undefined
                                    ? s.value
                                    : JSON.stringify({ type: message.questionType, value: s })
                                )}
                              >
                                {s.label}
                              </QuestionChip>
                            ))}
                          </div>
                          <SkipLink onClick={onQuestionSkip} label="Continuar sem esse filtro" />
                        </div>
                      )}
                        </>
                      )}
                    </AIBubble>
                  </div>
                </div>
              )}

              {/* ── Expansão de marketplace ── */}
              {message.type === 'expansion' && message.expansionSources && message.expansionSources.length > 0 && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <AIAvatar />
                  <div className="max-w-[88%] sm:max-w-[82%]">
                    <AIBubble>
                      <div className="mb-3">
                        <FormattedMessage content={message.content} className="text-slate-200" />
                        <p className="mt-1 text-xs text-slate-500">
                          {message.isVehicle
                            ? 'Quer que eu busque também em outras plataformas?'
                            : 'Quer ampliar a busca em outros marketplaces?'}
                          {' '}
                          <span className="text-slate-600">+1 crédito por plataforma</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {message.expansionSources.map((source, i) => {
                          const cfg = getMarketplaceConfig(source);
                          return (
                            <motion.button
                              key={source}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.08 }}
                              whileHover={{ y: -3, scale: 1.04 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={() => onExpandSearch(source)}
                              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${cfg.bg} ${cfg.border} ${cfg.text} ${cfg.glow}`}
                            >
                              <span>{cfg.icon}</span>
                              <span>Buscar no {cfg.label}</span>
                              <span className="ml-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-normal opacity-70">
                                1 crédito
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </AIBubble>
                  </div>
                </div>
              )}

              {/* ── Query confirm (editable final query) ── */}
              {message.type === 'query_confirm' && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <AIAvatar />
                  <div className="max-w-[88%] sm:max-w-[80%]">
                    <QueryConfirmBubble message={message as any} onConfirm={onQueryConfirm} />
                  </div>
                </div>
              )}

              {message.type === 'sort_question' && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <AIAvatar />
                  <div className="max-w-[88%] sm:max-w-[80%]">
                    <AIBubble>
                      <p className="mb-3 font-medium text-white">{message.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: '🎯 Mais relevante',  value: 'BEST_MATCH' },
                          { label: '💸 Menor preço',     value: 'LOWEST_PRICE' },
                          { label: '💎 Maior preço',     value: 'HIGHEST_PRICE' },
                          { label: '⭐ Mais avaliados',  value: 'TOP_RATED' },
                        ].map((option, i) => (
                          <motion.button
                            key={option.value}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            whileHover={{ y: -2, scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() =>
                              (message as any).isImageSort
                                ? onExecuteImageSearch(option.value)
                                : onExecuteTextSort(option.value)
                            }
                            className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200 transition-all hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"
                          >
                            {option.label}
                          </motion.button>
                        ))}
                      </div>
                    </AIBubble>
                  </div>
                </div>
              )}

              {/* ── Produtos ── */}
              {message.type === 'products' && message.products && message.products.length > 0 && (
                <div className="space-y-4">
                  {message.priceRangeApplied && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 sm:gap-3"
                    >
                      <AIAvatar />
                      <div className="rounded-2xl rounded-tl-sm border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                        <p className="text-sm font-medium text-emerald-200">
                          🎯 Filtrando por {formatPriceRange(message.priceRangeApplied)}
                        </p>
                        <p className="mt-0.5 text-xs text-emerald-300/50">melhores opções dentro do seu orçamento</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3">
                    {message.products.map((product, idx) => {
                      const trendBadge = getPriceTrendBadge(product);
                      return (
                        <motion.div
                          key={product.id || idx}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.3 }}
                          className="space-y-2"
                        >
                          {trendBadge && (
                            <div
                              className={`inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-medium ${trendBadge.className}`}
                            >
                              {trendBadge.text}
                            </div>
                          )}
                          <ProductCard product={product} />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

            </motion.div>
          ))}
        </AnimatePresence>

        {/* ── Loading ── */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 sm:gap-3"
          >
            <AIAvatar />
            <div className="rounded-2xl rounded-tl-sm border border-white/[0.06] bg-[#13131f] px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    className="h-1.5 w-1.5 rounded-full bg-violet-500"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
