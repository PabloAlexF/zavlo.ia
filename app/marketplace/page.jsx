'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Eye, MousePointerClick, ExternalLink, PackageOpen, SlidersHorizontal, Grid3x3, List, TrendingUp, Clock, Star, MapPin, Tag, Heart, ShoppingCart, Zap, Award, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const categories = [
    { id: 'all', name: 'Todos', icon: Grid3x3 },
    { id: 'electronics', name: 'Eletrônicos', icon: PackageOpen },
    { id: 'fashion', name: 'Moda', icon: Tag },
    { id: 'home', name: 'Casa', icon: Star },
    { id: 'vehicles', name: 'Veículos', icon: TrendingUp },
    { id: 'sports', name: 'Esportes', icon: Clock },
];
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zavlo-ia.onrender.com/api/v1';
export default function MarketplacePage() {
    var _a;
    const router = useRouter();
    const [listings, setListings] = useState([]);
    const [filteredListings, setFilteredListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [conditionFilter, setConditionFilter] = useState('all');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('recent');
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [wishlist, setWishlist] = useState(new Set());
    const [hoveredCard, setHoveredCard] = useState(null);
    useEffect(() => {
        loadListings();
        loadWishlist();
    }, []);
    useEffect(() => {
        filterAndSortListings();
    }, [listings, searchQuery, selectedCategory, conditionFilter, priceRange, sortBy]);
    const filterAndSortListings = () => {
        let filtered = [...listings];
        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(listing => {
                var _a;
                return listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    ((_a = listing.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchQuery.toLowerCase()));
            });
        }
        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(listing => listing.category === selectedCategory);
        }
        // Condition filter
        if (conditionFilter !== 'all') {
            filtered = filtered.filter(listing => listing.condition === conditionFilter);
        }
        // Price range filter
        if (priceRange.min) {
            filtered = filtered.filter(listing => listing.price >= parseFloat(priceRange.min));
        }
        if (priceRange.max) {
            filtered = filtered.filter(listing => listing.price <= parseFloat(priceRange.max));
        }
        // Sort
        switch (sortBy) {
            case 'price_asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'popular':
                filtered.sort((a, b) => (b.views + b.clicks) - (a.views + a.clicks));
                break;
            case 'recent':
            default:
                filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        setFilteredListings(filtered);
    };
    const loadWishlist = () => {
        const saved = localStorage.getItem('zavlo_wishlist');
        if (saved) {
            setWishlist(new Set(JSON.parse(saved)));
        }
    };
    const toggleWishlist = (listingId) => {
        const newWishlist = new Set(wishlist);
        if (newWishlist.has(listingId)) {
            newWishlist.delete(listingId);
        }
        else {
            newWishlist.add(listingId);
        }
        setWishlist(newWishlist);
        localStorage.setItem('zavlo_wishlist', JSON.stringify([...newWishlist]));
    };
    const loadListings = async () => {
        try {
            // First try to fetch from the new public listings endpoint
            let response = await fetch(`${API_URL}/listings/public`);
            if (response.ok) {
                const data = await response.json();
                // Handle direct array from listings endpoint
                let listings = Array.isArray(data) ? data : [];
                setListings(listings);
            }
            else {
                // Fallback to products endpoint if listings endpoint fails
                response = await fetch(`${API_URL}/products`);
                if (response.ok) {
                    const data = await response.json();
                    // Handle both formats: direct array or wrapped object
                    let listings = Array.isArray(data) ? data : (data.listings || data.products || []);
                    // Filter for Zavlo.ia listings only when using products endpoint
                    const zavloListings = listings.filter((product) => (product.source === 'Zavlo.ia' || product.marketplace === 'Zavlo.ia' || product.source === 'zavlo') &&
                        product.active !== false);
                    setListings(zavloListings);
                }
            }
        }
        catch (error) {
            console.error('Error loading listings:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setConditionFilter('all');
        setPriceRange({ min: '', max: '' });
        setSortBy('recent');
    };
    const activeFiltersCount = [
        searchQuery,
        selectedCategory !== 'all',
        conditionFilter !== 'all',
        priceRange.min,
        priceRange.max,
    ].filter(Boolean).length;
    if (loading) {
        return (<div className="min-h-screen bg-[#0B0B0F] pt-24 pb-12">
        <main className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-white/10 rounded-xl w-1/3"/>
            <div className="h-20 bg-white/5 rounded-2xl"/>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (<div key={i} className="bg-white/5 rounded-2xl h-96"/>))}
            </div>
          </div>
        </main>
      </div>);
    }
    return (<div className="min-h-screen bg-[#0B0B0F] pt-20 pb-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a2e12_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e12_1px,transparent_1px)] bg-[size:32px_32px]"/>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"/>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]"/>

      <main className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Marketplace Zavlo
          </h1>
          <p className="text-gray-400 flex items-center gap-2">
            <PackageOpen className="w-5 h-5"/>
            {filteredListings.length} produtos disponíveis
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div className="mb-6 overflow-x-auto pb-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex gap-3 min-w-max">
            {categories.map((cat) => (<motion.button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${selectedCategory === cat.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <cat.icon className="w-5 h-5"/>
                {cat.name}
              </motion.button>))}
          </div>
        </motion.div>

        {/* Search and Filters Bar */}
        <motion.div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6 shadow-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
              <input type="text" placeholder="Buscar produtos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"/>
            </div>

            {/* Sort */}
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 cursor-pointer" style={{ colorScheme: 'dark' }}>
              <option value="recent">Mais Recentes</option>
              <option value="price_asc">Menor Preço</option>
              <option value="price_desc">Maior Preço</option>
              <option value="popular">Mais Populares</option>
            </select>

            {/* View Mode */}
            <div className="flex gap-2">
              <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid'
            ? 'bg-blue-600 text-white'
            : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                <Grid3x3 className="w-5 h-5"/>
              </button>
              <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list'
            ? 'bg-blue-600 text-white'
            : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                <List className="w-5 h-5"/>
              </button>
            </div>

            {/* Filters Toggle */}
            <button onClick={() => setShowFilters(!showFilters)} className="relative px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-all flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5"/>
              Filtros
              {activeFiltersCount > 0 && (<span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {activeFiltersCount}
                </span>)}
            </button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="pt-6 mt-6 border-t border-white/10 grid md:grid-cols-3 gap-4">
                  {/* Condition */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Condição</label>
                    <select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)} className="w-full px-4 py-2.5 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 cursor-pointer" style={{ colorScheme: 'dark' }}>
                      <option value="all">Todas</option>
                      <option value="new">Novo</option>
                      <option value="used">Usado</option>
                    </select>
                  </div>

                  {/* Price Min */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Preço Mínimo</label>
                    <input type="number" placeholder="R$ 0" value={priceRange.min} onChange={(e) => setPriceRange(Object.assign(Object.assign({}, priceRange), { min: e.target.value }))} className="w-full px-4 py-2.5 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"/>
                  </div>

                  {/* Price Max */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Preço Máximo</label>
                    <input type="number" placeholder="R$ 10000" value={priceRange.max} onChange={(e) => setPriceRange(Object.assign(Object.assign({}, priceRange), { max: e.target.value }))} className="w-full px-4 py-2.5 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"/>
                  </div>
                </div>

                {activeFiltersCount > 0 && (<button onClick={clearFilters} className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-semibold hover:bg-red-500/30 transition-all flex items-center gap-2">
                    <X className="w-4 h-4"/>
                    Limpar Filtros
                  </button>)}
              </motion.div>)}
          </AnimatePresence>
        </motion.div>

        {/* Active Filters Tags */}
        {activeFiltersCount > 0 && (<motion.div className="flex flex-wrap gap-2 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {searchQuery && (<span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
                Busca: "{searchQuery.slice(0, 20)}{searchQuery.length > 20 ? '...' : ''}"
                <X className="w-4 h-4 cursor-pointer hover:text-white" onClick={() => setSearchQuery('')}/>
              </span>)}
            {selectedCategory !== 'all' && (<span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                {(_a = categories.find(c => c.id === selectedCategory)) === null || _a === void 0 ? void 0 : _a.name}
                <X className="w-4 h-4 cursor-pointer hover:text-white" onClick={() => setSelectedCategory('all')}/>
              </span>)}
            {conditionFilter !== 'all' && (<span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
                {conditionFilter === 'new' ? 'Novo' : 'Usado'}
                <X className="w-4 h-4 cursor-pointer hover:text-white" onClick={() => setConditionFilter('all')}/>
              </span>)}
          </motion.div>)}

        {/* Listings Grid/List */}
        {filteredListings.length === 0 ? (<motion.div className="text-center py-20" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
              <PackageOpen className="w-10 h-10 text-gray-400"/>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {listings.length === 0 ? 'Nenhum produto disponível' : 'Nenhum resultado encontrado'}
            </h3>
            <p className="text-gray-400 mb-8">
              {listings.length === 0 ? 'Seja o primeiro a anunciar!' : 'Tente ajustar os filtros de busca'}
            </p>
            {activeFiltersCount > 0 && (<button onClick={clearFilters} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                Limpar Filtros
              </button>)}
          </motion.div>) : (<motion.div className={viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {filteredListings.map((listing, index) => {
                var _a;
                return (<motion.div key={listing.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all group ${viewMode === 'list' ? 'flex gap-4' : ''}`} whileHover={{ y: -4, scale: 1.02 }}>
                {/* Image */}
                <div className={`relative bg-white/5 ${viewMode === 'list' ? 'w-48 h-48' : 'aspect-square'} overflow-hidden`} onMouseEnter={() => setHoveredCard(listing.id)} onMouseLeave={() => setHoveredCard(null)}>
                  {listing.images && listing.images.length > 0 ? (<img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1a2e" width="400" height="400"/%3E%3Ctext fill="%23ffffff" font-family="sans-serif" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESem Imagem%3C/text%3E%3C/svg%3E';
                        }}/>) : (<div className="w-full h-full flex items-center justify-center">
                      <PackageOpen className="w-12 h-12 text-gray-500"/>
                    </div>)}
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm bg-green-500/30 text-green-300 border border-green-500/50">
                        {listing.condition === 'new' ? 'Novo' : 'Usado'}
                      </span>
                      {listing.originalPrice && listing.originalPrice > listing.price && (<span className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm bg-red-500/30 text-red-300 border border-red-500/50 flex items-center gap-1">
                          <Percent className="w-3 h-3"/>
                          {Math.round((1 - listing.price / listing.originalPrice) * 100)}% OFF
                        </span>)}
                      {((_a = listing.shipping) === null || _a === void 0 ? void 0 : _a.free) && (<span className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm bg-blue-500/30 text-blue-300 border border-blue-500/50 flex items-center gap-1">
                          <Zap className="w-3 h-3"/>
                          Frete Grátis
                        </span>)}
                    </div>
                    
                    {/* Wishlist Button */}
                    <motion.button onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(listing.id);
                    }} className="p-2 rounded-full backdrop-blur-sm bg-black/50 border border-white/20 hover:bg-black/70 transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Heart className={`w-5 h-5 transition-colors ${wishlist.has(listing.id) ? 'fill-red-500 text-red-500' : 'text-white'}`}/>
                    </motion.button>
                  </div>

                  {/* Quick Actions Overlay */}
                  <AnimatePresence>
                    {hoveredCard === listing.id && viewMode === 'grid' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-2">
                        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-all" onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/listing/${listing.id}`);
                        }}>
                          <Eye className="w-5 h-5 text-white"/>
                        </motion.button>
                        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15 }} className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-all">
                          <ShoppingCart className="w-5 h-5 text-white"/>
                        </motion.button>
                      </motion.div>)}
                  </AnimatePresence>
                </div>

                {/* Content */}
                <div className={`p-4 flex flex-col ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  {/* Rating */}
                  {listing.rating && (<div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (<Star key={i} className={`w-4 h-4 ${i < Math.floor(listing.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-600'}`}/>))}
                      </div>
                      <span className="text-sm text-gray-400">
                        {listing.rating.toFixed(1)} ({listing.reviewCount || 0})
                      </span>
                    </div>)}

                  <h3 className="font-bold text-white text-lg line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
                    {listing.title}
                  </h3>
                  
                  {viewMode === 'list' && listing.description && (<p className="text-gray-400 text-sm line-clamp-2 mb-3">{listing.description}</p>)}

                  {/* Seller Info */}
                  {listing.seller && (<div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <Award className="w-4 h-4"/>
                      <span>{listing.seller.name}</span>
                      {listing.seller.rating && (<span className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-3 h-3 fill-current"/>
                          {listing.seller.rating.toFixed(1)}
                        </span>)}
                    </div>)}

                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    {listing.location && (<span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4"/>
                        {typeof listing.location === 'string'
                            ? listing.location
                            : `${listing.location.city || ''}, ${listing.location.state || ''}`}
                      </span>)}
                  </div>

                  {/* Shipping Info */}
                  {listing.shipping && (<div className="flex items-center gap-2 text-sm mb-3">
                      {listing.shipping.free ? (<span className="text-green-400 font-semibold flex items-center gap-1">
                          <Zap className="w-4 h-4"/>
                          Frete Grátis
                        </span>) : (<span className="text-gray-400">
                          Entrega em {listing.shipping.days} dias
                        </span>)}
                    </div>)}

                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4"/>
                      {listing.views || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointerClick className="w-4 h-4"/>
                      {listing.clicks || 0}
                    </span>
                    {listing.stock !== undefined && (<span className={`flex items-center gap-1 ${listing.stock < 10 ? 'text-red-400' : 'text-green-400'}`}>
                        <PackageOpen className="w-4 h-4"/>
                        {listing.stock} disponíveis
                      </span>)}
                  </div>

                  <div className="mt-auto">
                    {listing.originalPrice && listing.originalPrice > listing.price && (<p className="text-sm text-gray-400 line-through mb-1">
                        R$ {listing.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>)}
                    <p className="text-2xl font-black text-green-400 mb-3">
                      R$ {listing.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>

                    <button onClick={async () => {
                        try {
                            await fetch(`${API_URL}/listings/${listing.id}/click`, {
                                method: 'POST',
                            });
                        }
                        catch (e) { }
                        router.push(`/listing/${listing.id}`);
                    }} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/50 group-hover:scale-105">
                      Ver Detalhes
                      <ExternalLink className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              </motion.div>);
            })}
          </motion.div>)}
      </main>
    </div>);
}
