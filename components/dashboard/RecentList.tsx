'use client';

import { motion } from 'framer-motion';
import { LucideIcon, ExternalLink, Eye, MousePointerClick } from 'lucide-react';
import Image from 'next/image';

interface RecentItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  price?: number;
  views?: number;
  clicks?: number;
  date?: string;
  url?: string;
  active?: boolean;
}

interface RecentListProps {
  title: string;
  items: RecentItem[];
  icon: LucideIcon;
  emptyMessage?: string;
  delay?: number;
  onItemClick?: (item: RecentItem) => void;
}

export default function RecentList({
  title,
  items,
  icon: Icon,
  emptyMessage = 'Nenhum item encontrado',
  delay = 0,
  onItemClick,
}: RecentListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
            <Icon className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <span className="text-sm text-gray-400">{items.length} itens</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + index * 0.05 }}
              onClick={() => onItemClick?.(item)}
              className={`flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group ${
                onItemClick ? 'cursor-pointer' : ''
              }`}
            >
              {item.image && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                    {item.title}
                  </h4>
                  {item.active !== undefined && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                        item.active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {item.active ? 'Ativo' : 'Inativo'}
                    </span>
                  )}
                </div>

                {item.subtitle && (
                  <p className="text-xs text-gray-400 mb-2 truncate">{item.subtitle}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-400">
                  {item.price !== undefined && (
                    <span className="font-bold text-green-400" suppressHydrationWarning>
                      R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  {item.views !== undefined && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {item.views}
                    </span>
                  )}
                  {item.clicks !== undefined && (
                    <span className="flex items-center gap-1">
                      <MousePointerClick className="w-3 h-3" />
                      {item.clicks}
                    </span>
                  )}
                  {item.date && (
                    <span className="ml-auto">{item.date}</span>
                  )}
                </div>
              </div>

              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
