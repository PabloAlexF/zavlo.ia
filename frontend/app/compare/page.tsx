'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';

export default function ComparePage() {
  const [productName, setProductName] = useState('');
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/v1/comparisons/compare?title=${productName}`
      );
      const data = await response.json();
      setComparison(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Header />
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative container mx-auto px-4 py-12 pt-24 sm:pt-28">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-white">Comparar Preços</h1>
        <p className="text-gray-400 mb-8 sm:mb-12">Compare preços em todos os marketplaces</p>

        <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-30 group-hover:opacity-50 blur transition-opacity"></div>
            <div className="relative flex flex-col sm:flex-row gap-3 sm:gap-4 bg-[#0B0B0F] border border-white/20 rounded-2xl p-4 sm:p-6">
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ex: iPhone 13 Pro Max"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={handleCompare}
                disabled={loading || !productName}
                className="px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? 'Comparando...' : 'Comparar'}
              </button>
            </div>
          </div>
        </div>

        {comparison && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-white">{comparison.productTitle}</h2>
              
              <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
                <div className="text-center p-3 sm:p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl sm:rounded-2xl">
                  <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Menor Preço</div>
                  <div className="text-xl sm:text-3xl font-bold text-green-400">
                    R$ {comparison.minPrice?.toFixed(2)}
                  </div>
                </div>
                
                <div className="text-center p-3 sm:p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl sm:rounded-2xl">
                  <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Preço Médio</div>
                  <div className="text-xl sm:text-3xl font-bold text-blue-400">
                    R$ {comparison.averagePrice?.toFixed(2)}
                  </div>
                </div>
                
                <div className="text-center p-3 sm:p-6 bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-xl sm:rounded-2xl">
                  <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Maior Preço</div>
                  <div className="text-xl sm:text-3xl font-bold text-red-400">
                    R$ {comparison.maxPrice?.toFixed(2)}
                  </div>
                </div>
              </div>

              <h3 className="font-semibold mb-3 sm:mb-4 text-lg text-white">Fontes Encontradas</h3>
              <div className="space-y-3">
                {comparison.sources?.map((source: any, index: number) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-white">{source.source}</div>
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">
                        Ver anúncio →
                      </a>
                    </div>
                    <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
                      R$ {source.price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
