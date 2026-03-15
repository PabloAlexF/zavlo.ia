'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Loader2, User, Edit2, CreditCard } from 'lucide-react';
import { ProductCard } from '@/components/features/ProductCard';
import Link from 'next/link';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'products' | 'confirmation' | 'category_question' | 'image_confirmation' | 'sort_question';
  content: string;
  products?: any[];
  timestamp: Date;
  searchType?: 'text' | 'image';
  creditCost?: number;
  categoryQuestion?: {
    id: string;
    options: string[];
    category: string;
  };
  imageData?: string;
  detectedProduct?: string;
}

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
  userCredits: number;
  onSendMessage: (text: string) => void;
  onImageSearchReject: () => void;
  onImagePriceSearch: () => void;
  onExecuteImageSearch: (sortBy: string) => void;
  onConfirmSearch: () => void;
  onCancelSearch: () => void;
  isEditingQuery: boolean;
  editedQuery: string;
  onEditQueryChange: (value: string) => void;
  onStartEditQuery: () => void;
  onCancelEditQuery: () => void;
  onConfirmEditQuery: () => void;
  onUpdateDetectedProduct: (messageId: string, newName: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

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

const AIBubble = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl rounded-tl-sm border border-white/[0.07] bg-[#13131f] p-4 text-sm leading-relaxed text-slate-200">
    {children}
  </div>
);

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
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 ${styles[variant]}`}
    >
      {children}
    </motion.button>
  );
};

export function ChatMessages({
  messages,
  loading,
  userCredits,
  onSendMessage,
  onImageSearchReject,
  onImagePriceSearch,
  onExecuteImageSearch,
  onConfirmSearch,
  onCancelSearch,
  isEditingQuery,
  editedQuery,
  onEditQueryChange,
  onStartEditQuery,
  onCancelEditQuery,
  onConfirmEditQuery,
  onUpdateDetectedProduct,
  messagesEndRef,
}: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto px-3 py-5 sm:px-5 sm:py-8 md:px-8 md:py-10" style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.04) 0%, transparent 60%), #0A0A12' }}>
      <div className="mx-auto max-w-3xl space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, delay: index < 3 ? index * 0.05 : 0 }}
            >
              {/* ── Usuário ── */}
              {message.type === 'user' && (
                <div className="flex items-end justify-end gap-2 sm:gap-3">
                  <div className="max-w-[85%] sm:max-w-[78%]">
                    <div className="rounded-2xl rounded-br-sm border border-white/[0.07] bg-[#1a1a2e]/80 px-4 py-3">
                      {message.imageData && (
                        <img
                          src={message.imageData}
                          alt="Imagem enviada"
                          className="mb-3 max-w-[180px] rounded-xl border border-slate-700"
                        />
                      )}
                      <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                  <UserAvatar />
                </div>
              )}

              {/* ── IA texto ── */}
              {message.type === 'ai' && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <AIAvatar />
                  <div className="max-w-[90%] sm:max-w-[78%]">
                    <AIBubble>
                      {message.content === 'searching_animation' ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2.5">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            >
                              <Loader2 className="h-4 w-4 text-teal-300/70" />
                            </motion.div>
                            <span className="text-slate-300">Buscando produtos...</span>
                          </div>
                          <div className="space-y-1.5 pl-6">
                            {['Analisando marketplaces', 'Comparando preços', 'Organizando resultados'].map((text, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.35 }}
                                className="flex items-center gap-2 text-xs text-slate-500"
                              >
                                <motion.div
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.35 }}
                                  className="h-1 w-1 rounded-full bg-teal-400/60"
                                />
                                {text}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ) : message.content === 'location_question' ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-slate-300">
                            <MapPin className="h-4 w-4 text-teal-300/70" />
                            <span>Quer buscar em alguma região específica?</span>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <OptionButton onClick={() => onSendMessage('minha cidade')} variant="primary">
                              Minha cidade
                            </OptionButton>
                            <OptionButton onClick={() => onSendMessage('meu estado')}>
                              Meu estado
                            </OptionButton>
                            <OptionButton onClick={() => onSendMessage('não')}>
                              Todo o Brasil
                            </OptionButton>
                          </div>
                        </div>
                      ) : message.content.includes('Créditos insuficientes') ? (
                        <div className="space-y-4">
                          <p className="whitespace-pre-wrap text-slate-200">{message.content}</p>
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
                        <p className="whitespace-pre-wrap text-slate-200">{message.content}</p>
                      )}
                    </AIBubble>
                  </div>
                </div>
              )}

              {/* ── Pergunta de categoria ── */}
              {message.type === 'category_question' && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <AIAvatar />
                  <div className="max-w-[90%] sm:max-w-[78%]">
                    <AIBubble>
                      <p className="mb-3 text-slate-300">{message.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {message.categoryQuestion?.options?.map((option, i) => (
                          <OptionButton key={i} onClick={() => onSendMessage(option)}>
                            {option}
                          </OptionButton>
                        ))}
                      </div>
                    </AIBubble>
                  </div>
                </div>
              )}

              {/* ── Confirmação de imagem ── */}
              {message.type === 'image_confirmation' && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <AIAvatar />
                  <div className="max-w-[90%] sm:max-w-[78%]">
                    <AIBubble>
                      <p className="mb-3 text-slate-400 text-xs uppercase tracking-wider">Produto identificado</p>
                      <div className="relative mb-4">
                        <input
                          type="text"
                          defaultValue={message.detectedProduct || ''}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              onUpdateDetectedProduct(message.id, (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 pr-9 text-sm text-slate-100 outline-none transition-colors focus:border-violet-500/50"
                        />
                        <Edit2 className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                      </div>
                      <div className="flex gap-2">
                        <OptionButton onClick={onImageSearchReject} variant="danger">Não</OptionButton>
                        <OptionButton onClick={onImagePriceSearch} variant="primary">Sim, buscar preços</OptionButton>
                      </div>
                    </AIBubble>
                  </div>
                </div>
              )}

              {/* ── Pergunta de ordenação ── */}
              {message.type === 'sort_question' && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <AIAvatar />
                  <div className="max-w-[90%] sm:max-w-[78%]">
                    <AIBubble>
                      <p className="mb-3 text-slate-300">{message.content}</p>
                      <div className="space-y-2">
                        {[
                          { label: 'Maior relevância', value: 'BEST_MATCH', desc: 'Produtos mais relacionados' },
                          { label: 'Menor preço', value: 'LOWEST_PRICE', desc: 'Do mais barato ao mais caro' },
                          { label: 'Maior preço', value: 'HIGHEST_PRICE', desc: 'Do mais caro ao mais barato' },
                        ].map((option, i) => (
                          <motion.button
                            key={option.value}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.07 }}
                            whileHover={{ x: 3 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => onExecuteImageSearch(option.value)}
                            className="flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-2.5 text-left transition-all hover:border-violet-500/30 hover:bg-violet-500/10"
                          >
                            <span className="text-sm font-medium text-slate-200">{option.label}</span>
                            <span className="text-xs text-slate-500">{option.desc}</span>
                          </motion.button>
                        ))}
                      </div>
                    </AIBubble>
                  </div>
                </div>
              )}

              {/* ── Confirmação de busca ── */}
              {message.type === 'confirmation' && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <AIAvatar />
                  <div className="max-w-[90%] sm:max-w-[78%]">
                    <AIBubble>
                      <p className="mb-3 text-slate-400 text-xs uppercase tracking-wider">Confirmar busca</p>
                      <div className="relative mb-4">
                        <input
                          type="text"
                          value={isEditingQuery ? editedQuery : message.content}
                          disabled={!isEditingQuery}
                          onChange={(e) => isEditingQuery && onEditQueryChange(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-violet-500/50 disabled:border-transparent disabled:bg-transparent disabled:px-0 disabled:text-slate-300"
                        />
                      </div>
                      {!isEditingQuery ? (
                        <div className="flex flex-wrap gap-2">
                          <OptionButton onClick={onCancelSearch}>Cancelar</OptionButton>
                          <OptionButton onClick={onStartEditQuery}>Editar</OptionButton>
                          <OptionButton onClick={onConfirmSearch} variant="primary">Confirmar busca</OptionButton>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <OptionButton onClick={onCancelEditQuery}>Cancelar</OptionButton>
                          <OptionButton onClick={() => {
                            onConfirmEditQuery();
                            setTimeout(() => onConfirmSearch(), 100);
                          }} variant="primary">Salvar e Buscar</OptionButton>
                        </div>
                      )}
                    </AIBubble>
                  </div>
                </div>
              )}

              {/* ── Produtos ── */}
              {message.type === 'products' && message.products && message.products.length > 0 && (
                <div className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3"
                  >
                    {[...message.products]
                      .sort((a, b) => a.price - b.price)
                      .map((product, idx) => (
                        <motion.div
                          key={product.id || idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                  </motion.div>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <AIAvatar />
                    <AIBubble>
                      Encontrei <span className="font-semibold text-violet-400">{message.products.length} produtos</span>. Quer buscar outro?
                    </AIBubble>
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
            <div className="rounded-2xl rounded-tl-sm border border-slate-700/60 bg-slate-900/70 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.15 }}
                      className="h-1.5 w-1.5 rounded-full bg-violet-500/70"
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-500">Processando...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
