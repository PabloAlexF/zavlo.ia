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
            prices: `${API_URL}/search/prices`,
            classify: `${API_URL}/search/classify`,
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
        favorites: {
            add: `${API_URL}/favorites`,
            list: `${API_URL}/favorites`,
        },
    },
};
export async function fetcher(url, options) {
    const raw = localStorage.getItem('zavlo_user');
    const token = raw ? (() => { try { return JSON.parse(raw).token; } catch { return null; } })() : null;
    const response = await fetch(url, Object.assign(Object.assign({}, options), { headers: Object.assign(Object.assign({ 'Content-Type': 'application/json' }, (token && { Authorization: `Bearer ${token}` })), options === null || options === void 0 ? void 0 : options.headers) }));
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const error = new Error(errorBody?.message || `Erro ${response.status}`);
        error.status = response.status;
        error.data = errorBody;
        throw error;
    }
    return response.json();
}
