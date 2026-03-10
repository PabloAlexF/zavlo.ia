const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {
  baseURL: API_URL,
  
  endpoints: {
    auth: {
      register: `${API_URL}/auth/register`,
      login: `${API_URL}/auth/login`,
    },
    products: {
      list: `${API_URL}/products`,
      byId: (id: string) => `${API_URL}/products/${id}`,
    },
    search: {
      text: `${API_URL}/search/text`,
      image: `${API_URL}/search/image`,
      suggestions: `${API_URL}/search/suggestions`,
    },
    locations: {
      cep: (cep: string) => `${API_URL}/locations/cep/${cep}`,
      states: `${API_URL}/locations/states`,
    },
    comparisons: {
      compare: `${API_URL}/comparisons/compare`,
      bestDeals: `${API_URL}/comparisons/best-deals`,
    },
  },
};

export async function fetcher(url: string, options?: RequestInit) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error('Erro na requisição');
  }

  return response.json();
}
