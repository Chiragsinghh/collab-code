import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'}/api`,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('codesync_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('codesync_token');
            localStorage.removeItem('user'); // if we store user info
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
