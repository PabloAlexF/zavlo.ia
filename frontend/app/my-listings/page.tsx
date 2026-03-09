'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Toast } from '@/components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Eye, MousePointerClick, Edit, Trash2, Power, ExternalLink, Plus, PackageOpen, Sparkles } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  condition: 'new' | 'used';
  active: boolean;
  featured: boolean;
  views: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export default function MyListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [conditionFilter, setConditionFilter] = useState<'all' | 'new' | 'used'>('all');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; listingId: string; title: string }>({ show: false, listingId: '', title: '' });

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchQuery, statusFilter, conditionFilter]);

  const filterListings = () => {
    let filtered = [...listings];

    if (searchQuery) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(listing =>
        statusFilter === 'active' ? listing.active : !listing.active
      );
    }

    if (conditionFilter !== 'all') {
      filtered = filtered.filter(listing => listing.condition === conditionFilter);
    }

    setFilteredListings(filtered);
  };

  const loadListings = async () => {
    const user = localStorage.getItem('zavlo_user');
    if (!user) {
      router.push('/auth');
      return;
    }

    try {
      const userData = JSON.parse(user);
      const response = await fetch('http://localhost:3001/api/v1/listings/my', {
        headers: { 'Authorization': `Bearer ${userData.token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setListings(data);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (listingId: string) => {
    const user = localStorage.getItem('zavlo_user');
    if (!user) return;

    try {
      const userData = JSON.parse(user);
      const response = await fetch(`http://localhost:3001/api/v1/listings/${listingId}/toggle`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${userData.token}` },
      });

      if (response.ok) {
        setListings(prev => prev.map(listing => 
          listing.id === listingId ? { ...listing, active: !listing.active } : listing
        ));
        setToast({ message: 'Status atualizado!', type: 'success' });
      }
    } catch (error) {
      setToast({ message: 'Erro ao atualizar status', type: 'error' });
    }
  };

  const deleteListing = async (listingId: string) => {
    const user = localStorage.getItem('zavlo_user');
    if (!user) return;

    try {
      const userData = JSON.parse(user);
      const response = await fetch(`http://localhost:3001/api/v1/listings/${listingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userData.token}` },
      });

      if (response.ok) {
        setListings(prev => prev.filter(listing => listing.id !== listingId));
        setToast({ message: 'Anúncio excluído!', type: 'success' });
        setDeleteModal({ show: false, listingId: '', title: '' });
      }
    } catch (error) {
      setToast({ message: 'Erro ao excluir anúncio', type: 'error' });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setConditionFilter('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] pt-24 pb-12">
        <main className="max-w-6xl mx-auto px-4 animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/3 mb-8"></div>
          <div className="h-20 bg-white/5 rounded-2xl mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-white/5 rounded-2xl h-80"></div>)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] relative overflow-hidden">
      <Header />
      
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a2e12_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e12_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-12">
        <motion.div 
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Meus Anúncios
            </h1>
            <p className="text-gray-400 flex items-center gap-2">
              <PackageOpen className="w-5 h-5" />
              {filteredListings.length} de {listings.length} anúncios
            </p>
          </div>
          <motion.button
            onClick={() => router.push('/sell')}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            Criar Anúncio
          </motion.button>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar anúncios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                <option value="all" className="bg-gray-900">Todos</option>
                <option value="active" className="bg-gray-900">Ativos</option>
                <option value="inactive" className="bg-gray-900">Inativos</option>
              </select>

              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value as any)}
                className="px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                <option value="all" className="bg-gray-900">Todas</option>
                <option value="new" className="bg-gray-900">Novo</option>
                <option value="used" className="bg-gray-900">Usado</option>
              </select>
            </div>
          </div>

          {(searchQuery || statusFilter !== 'all' || conditionFilter !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/10">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                  "{searchQuery.slice(0, 15)}{searchQuery.length > 15 ? '...' : ''}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                  {statusFilter === 'active' ? 'Ativos' : 'Inativos'}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setStatusFilter('all')} />
                </span>
              )}
              {conditionFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                  {conditionFilter === 'new' ? 'Novo' : 'Usado'}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setConditionFilter('all')} />
                </span>
              )}
              <button onClick={clearFilters} className="ml-auto text-xs text-gray-400 active:text-white transition">
                Limpar
              </button>
            </div>
          )}
        </motion.div>

        {filteredListings.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <PackageOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-white mb-2">
              {listings.length === 0 ? 'Nenhum anúncio ainda' : 'Nenhum resultado'}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {listings.length === 0 ? 'Crie seu primeiro anúncio' : 'Ajuste os filtros'}
            </p>
            {listings.length === 0 ? (
              <button
                onClick={() => router.push('/sell')}
                className="bg-blue-600 active:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                Criar Anúncio
              </button>
            ) : (
              <button
                onClick={clearFilters}
                className="bg-white/10 active:bg-white/20 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {filteredListings.map((listing, index) => (
              <motion.div 
                key={listing.id} 
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                {/* Image Section */}
                <div className="relative aspect-square w-full bg-white/5">
                  {listing.images && listing.images.length > 0 ? (
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%231a1a2e" width="400" height="300"/%3E%3Ctext fill="%23ffffff" font-family="sans-serif" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESem Imagem%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-sm ${listing.active ? 'bg-green-500/30 text-green-300' : 'bg-gray-500/30 text-gray-300'}`}>
                    {listing.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Content Section */}
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-white text-sm sm:text-base line-clamp-2 mb-1">{listing.title}</h3>
                  <p className="text-lg sm:text-xl font-bold text-green-400 mb-2">R$ {listing.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  
                  <div className="flex items-center gap-3 text-[10px] sm:text-xs text-gray-400 mb-3">
                    <div className="flex items-center gap-1"><Eye className="w-3 h-3" />{listing.views}</div>
                    <div className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" />{listing.clicks}</div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 mt-auto">
                    <button onClick={() => router.push(`/listing/${listing.id}/edit`)} className="flex items-center justify-center gap-1 bg-white/10 active:bg-white/20 text-white px-2 py-1.5 rounded text-xs font-medium transition-colors">
                      <Edit className="w-3 h-3" /> Editar
                    </button>
                    <button onClick={() => toggleActive(listing.id)} className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${listing.active ? 'bg-gray-600/20 active:bg-gray-600/30 text-gray-300' : 'bg-green-600/20 active:bg-green-600/30 text-green-400'}`}>
                      <Power className="w-3 h-3" /> {listing.active ? 'Pausar' : 'Ativar'}
                    </button>
                    <button onClick={() => router.push(`/listing/${listing.id}`)} className="flex items-center justify-center gap-1 bg-blue-600/20 active:bg-blue-600/30 text-blue-400 px-2 py-1.5 rounded text-xs font-medium transition-colors">
                      <ExternalLink className="w-3 h-3" /> Ver
                    </button>
                    <button onClick={() => setDeleteModal({ show: true, listingId: listing.id, title: listing.title })} className="flex items-center justify-center gap-1 bg-red-600/20 active:bg-red-600/30 text-red-400 px-2 py-1.5 rounded text-xs font-medium transition-colors">
                      <Trash2 className="w-3 h-3" /> Excluir
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-2">Excluir Anúncio</h3>
            <p className="text-gray-400 mb-1">Tem certeza que deseja excluir:</p>
            <p className="text-white font-medium mb-6">"{deleteModal.title}"?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, listingId: '', title: '' })}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteListing(deleteModal.listingId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
