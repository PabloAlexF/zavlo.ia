// Fallback temporário para produção - configure NEXT_PUBLIC_API_URL no Hostinger
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zavlo-ia.onrender.com/api/v1';
export const api = {
    baseURL: API_URL,
    endpoints: {
        auth: {
            register: `${API_URL}/auth/register`,
            login: `${API_URL}/auth/login`,
        },
        products: {
            list: `${API_URL}/products`,
            byId: (id) => `${API_URL}/products/${id}`,
        },
        search: {
            text: `${API_URL}/search/text`,
            image: `${API_URL}/search/image`,
            suggestions: `${API_URL}/search/suggestions`,
        },
        locations: {
            cep: (cep) => `${API_URL}/locations/cep/${cep}`,
            states: `${API_URL}/locations/states`,
        },
        comparisons: {
            compare: `${API_URL}/comparisons/compare`,
            bestDeals: `${API_URL}/comparisons/best-deals`,
        },
    },
};
export async function fetcher(url, options) {
    const token = localStorage.getItem('token');
    const response = await fetch(url, Object.assign(Object.assign({}, options), { headers: Object.assign(Object.assign({ 'Content-Type': 'application/json' }, (token && { Authorization: `Bearer ${token}` })), options === null || options === void 0 ? void 0 : options.headers) }));
    if (!response.ok) {
        throw new Error('Erro na requisição');
    }
    return response.json();
}
