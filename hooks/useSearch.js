'use client';
import { useState } from 'react';
import { api, fetcher } from '@/lib/api';
export function useSearch() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const searchByText = async (query, filters) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams(Object.assign({ query }, filters));
            const data = await fetcher(`${api.endpoints.search.text}?${params}`);
            setProducts(data);
        }
        catch (err) {
            setError('Erro ao buscar produtos');
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    const searchByImage = async (file) => {
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
        }
        catch (err) {
            setError('Erro ao buscar por imagem');
            console.error(err);
        }
        finally {
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
