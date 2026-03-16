import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SearchOptions {
  query: string;
  sortBy?: string;
  skipClassification?: boolean;
  classification?: any; // ✅ Passar classificação para evitar duplicação
}

export function useSearch() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const requestLockRef = useRef(false);
  const lastRequestRef = useRef<string>('');

  const classifyQuery = useCallback(async (query: string) => {
    // Prevent duplicate requests
    if (requestLockRef.current) {
      console.log('[SEARCH] Request bloqueada - já existe uma em andamento');
      return null;
    }

    // Prevent same query in short time
    const requestKey = `classify_${query}`;
    if (lastRequestRef.current === requestKey) {
      console.log('[SEARCH] Query duplicada ignorada:', query);
      return null;
    }

    requestLockRef.current = true;
    lastRequestRef.current = requestKey;

    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        router.push('/auth');
        return null;
      }

      const userData = JSON.parse(user);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      
      // ✅ NOVO ENDPOINT: /api/classify (não consome créditos)
      const response = await fetch(`${API_URL}/search/classify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (response.status === 401) {
        localStorage.removeItem('zavlo_user');
        router.push('/auth');
        return null;
      }

      if (response.ok) {
        const data = await response.json();
        return data;
      }

      return null;
    } catch (error) {
      console.error('Classify error:', error);
      return null;
    } finally {
      requestLockRef.current = false;
      // Clear last request after 2s to allow retry
      setTimeout(() => {
        if (lastRequestRef.current === requestKey) {
          lastRequestRef.current = '';
        }
      }, 2000);
    }
  }, [router]);

  const executeSearch = useCallback(async (options: SearchOptions) => {
    // Prevent duplicate requests
    if (requestLockRef.current) {
      console.log('[SEARCH] Request bloqueada - já existe uma em andamento');
      return null;
    }

    const requestKey = `search_${options.query}_${options.sortBy}`;
    if (lastRequestRef.current === requestKey) {
      console.log('[SEARCH] Busca duplicada ignorada:', options.query);
      return null;
    }

    requestLockRef.current = true;
    lastRequestRef.current = requestKey;
    setLoading(true);

    try {
      const user = localStorage.getItem('zavlo_user');
      if (!user) {
        router.push('/auth');
        return null;
      }

      const userData = JSON.parse(user);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      
      const params = new URLSearchParams({
        query: options.query,
        limit: '50',
        sortBy: options.sortBy || 'RELEVANCE'
      });

      // ✅ PROBLEMA 1 CORRIGIDO: Passar classificação para evitar duplicação
      if (options.classification) {
        params.append('classification', JSON.stringify(options.classification));
      }
      
      const response = await fetch(`${API_URL}/search/text?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userData.token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('zavlo_user');
        router.push('/auth');
        return null;
      }

      if (response.ok) {
        const data = await response.json();
        return data;
      }

      return null;
    } catch (error) {
      console.error('Search error:', error);
      return null;
    } finally {
      setLoading(false);
      requestLockRef.current = false;
      // Clear last request after 2s to allow retry
      setTimeout(() => {
        if (lastRequestRef.current === requestKey) {
          lastRequestRef.current = '';
        }
      }, 2000);
    }
  }, [router]);

  return {
    loading,
    setLoading,
    classifyQuery,
    executeSearch,
  };
}
