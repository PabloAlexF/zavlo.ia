'use client';
import { useState } from 'react';
import Image from 'next/image';
export default function SearchResults({ results, loading, onFavorite }) {
    const [favorites, setFavorites] = useState(new Set());
    const handleFavorite = (product) => {
        const newFavorites = new Set(favorites);
        if (favorites.has(product.id)) {
            newFavorites.delete(product.id);
        }
        else {
            newFavorites.add(product.id);
        }
        setFavorites(newFavorites);
        onFavorite === null || onFavorite === void 0 ? void 0 : onFavorite(product);
    };
    if (loading) {
        return (<div className="space-y-4">
        {[...Array(6)].map((_, i) => (<div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-white/10 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
                <div className="h-4 bg-white/10 rounded w-1/4"></div>
              </div>
            </div>
          </div>))}
      </div>);
    }
    if (results.length === 0) {
        return (<div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Nenhum produto encontrado</h3>
        <p className="text-gray-400">Tente usar termos diferentes ou menos específicos</p>
      </div>);
    }
    return (<div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          {results.length} produtos encontrados
        </h2>
        <select className="bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-white text-sm appearance-none cursor-pointer [&>option]:bg-black [&>option]:text-white" style={{ colorScheme: 'dark' }}>
          <option value="relevance">Relevância</option>
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
          <option value="newest">Mais recentes</option>
        </select>
      </div>

      <div className="grid gap-4">
        {results.map((product) => (<div key={product.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 group">
            <div className="flex gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                {product.image ? (<Image src={product.image} alt={product.title} fill className="object-cover rounded-lg" onError={(e) => {
                    const target = e.target;
                    target.src = '/placeholder-product.png';
                }}/>) : (<div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>)}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white mb-1 line-clamp-2 group-hover:text-blue-400 transition-colors">
                  {product.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-green-400">
                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="bg-white/10 px-2 py-1 rounded text-xs">
                      {product.source}
                    </span>
                    {product.location && (<span>{product.location.city}, {product.location.state}</span>)}
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => handleFavorite(product)} className={`p-2 rounded-lg transition-colors ${favorites.has(product.id)
                ? 'bg-red-500/20 text-red-400'
                : 'bg-white/10 text-gray-400 hover:text-red-400'}`}>
                      <svg className="w-4 h-4" fill={favorites.has(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                    </button>
                    
                    <a href={product.url} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Ver Produto
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>))}
      </div>
    </div>);
}
