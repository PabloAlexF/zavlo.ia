'use client';

import { useState } from 'react';
import { api, fetcher } from '@/lib/api';
import { Product, SearchFilters } from '@/types';

export function useSearch() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchByText = async (query: string, filters?: SearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        query,
        ...filters,
      } as any);

      const data = await fetcher(`${api.endpoints.search.text}?${params}`);
      setProducts(data);
    } catch (err) {
      setError('Erro ao buscar produtos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchByImage = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(api.endpoints.search.image, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError('Erro ao buscar por imagem');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    searchByText,
    searchByImage,
  };
}
