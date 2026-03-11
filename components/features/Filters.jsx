'use client';
import { useState } from 'react';
export function Filters({ onFilterChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        state: '',
        category: '',
        minPrice: '',
        maxPrice: '',
    });
    const states = ['MG', 'SP', 'RJ', 'BA', 'RS', 'PR', 'SC'];
    const categories = ['Eletrônicos', 'Veículos', 'Imóveis', 'Móveis', 'Moda'];
    const handleApply = () => {
        onFilterChange(filters);
        setIsOpen(false);
    };
    return (<div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:bg-gray-50">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
        </svg>
        Filtros
      </button>

      {isOpen && (<div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg p-6 w-80 z-50">
          <h3 className="font-semibold mb-4">Filtrar Resultados</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <select value={filters.state} onChange={(e) => setFilters(Object.assign(Object.assign({}, filters), { state: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Todos</option>
                {states.map((state) => (<option key={state} value={state}>{state}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <select value={filters.category} onChange={(e) => setFilters(Object.assign(Object.assign({}, filters), { category: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Todas</option>
                {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Preço</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Mín" value={filters.minPrice} onChange={(e) => setFilters(Object.assign(Object.assign({}, filters), { minPrice: e.target.value }))} className="w-1/2 px-3 py-2 border rounded-lg"/>
                <input type="number" placeholder="Máx" value={filters.maxPrice} onChange={(e) => setFilters(Object.assign(Object.assign({}, filters), { maxPrice: e.target.value }))} className="w-1/2 px-3 py-2 border rounded-lg"/>
              </div>
            </div>

            <button onClick={handleApply} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Aplicar Filtros
            </button>
          </div>
        </div>)}
    </div>);
}
