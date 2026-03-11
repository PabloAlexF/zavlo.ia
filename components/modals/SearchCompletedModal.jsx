'use client';
export default function SearchCompletedModal({ isOpen, onClose, creditsUsed, resultsCount }) {
    if (!isOpen)
        return null;
    return (<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Busca Concluída</h2>
          <p className="text-gray-400">Encontramos {resultsCount} produtos com o melhor preço!</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400">Total de créditos usados:</span>
            <span className="text-3xl font-bold text-white">{creditsUsed}</span>
          </div>
          <div className="text-sm text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>• Identificação:</span>
              <span className="text-white">1 crédito</span>
            </div>
            <div className="flex justify-between">
              <span>• Busca menor preço:</span>
              <span className="text-white">1 crédito</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-white font-semibold">Produtos ordenados por menor preço</p>
              <p className="text-sm text-gray-300">Economize comprando o mais barato!</p>
            </div>
          </div>
        </div>

        <button onClick={onClose} className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform">
          Ver Resultados
        </button>
      </div>
    </div>);
}
