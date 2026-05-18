import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Accept': 'application/json',
    }
});

// Intercepteur pour ajouter le token (admin ou client) à chaque requête
api.interceptors.request.use(
    config => {
        const isAdminRoute = config.url && (config.url.startsWith('v1/admin') || config.url.includes('/admin/'));
        const token = isAdminRoute 
            ? localStorage.getItem('admin_token') 
            : (localStorage.getItem('customer_token') || localStorage.getItem('admin_token'));
            
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            console.warn('Session expirée ou non autorisée');
            // Optionnel : redirection vers login
            // localStorage.removeItem('admin_token');
        }
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
