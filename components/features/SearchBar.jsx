'use client';
import { useState } from 'react';
export function SearchBar({ onSearch, onImageSearch, initialValue = '', showCategories = false }) {
    const [query, setQuery] = useState(initialValue);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim())
            onSearch(query);
    };
    const handleImageUpload = (e) => {
        var _a;
        const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file && onImageSearch)
            onImageSearch(file);
    };
    return (<div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center bg-gray-100 rounded-full overflow-hidden">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar produtos..." className="flex-1 px-6 py-4 bg-transparent text-black placeholder-gray-500 outline-none"/>
          
          {onImageSearch && (<label className="px-4 cursor-pointer hover:bg-gray-200 transition-colors">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </label>)}

          <button type="submit" className="px-6 py-4 bg-black text-white hover:bg-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </button>
        </div>
      </form>

      {showCategories && (<div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
          {['Eletrônicos', 'Veículos', 'Imóveis', 'Móveis', 'Moda'].map((cat) => (<button key={cat} onClick={() => onSearch(cat)} className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors whitespace-nowrap">
              {cat}
            </button>))}
        </div>)}
    </div>);
}
