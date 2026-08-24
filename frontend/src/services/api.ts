import axios , {AxiosError} from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost;3000/api',
});

// Injecte le token à chaque requête
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Déconnexion automatique sur 401 (token expiré/invalide)
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function getApiError(err: unknown): string {
    const ax = err as AxiosError<{ message?: string }>;
    return ax.response?.data?.message ?? 'Une erreur est survenue';
} 

export default api;