import axios from 'axios';

// --- LOGIQUE DE BASE URL SÉCURISÉE ---
const getBaseURL = () => {
  // On récupère l'URL depuis les variables d'env (CRA ou Vite)
  let url = process.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || "https://calsed-frontend.vercel.app/";
  
  // Nettoyage : On s'assure que l'URL ne finit pas par un slash inutile
  url = url.replace(/\/$/, "");

  // CORRECTION : Si l'URL ne finit pas par /api, on l'ajoute.
  // C'est cette ligne qui va transformer calsed-api.onrender.com en calsed-api.onrender.com/api
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  
  return url;
};

// 1. Création de l'instance Axios
const api = axios.create({
  baseURL: getBaseURL(), 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. INTERCEPTEUR DE REQUÊTE (Avant l'envoi)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('calsed_token') || sessionStorage.getItem('calsed_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. INTERCEPTEUR DE RÉPONSE (À la réception)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si le serveur répond 401 (Non Autorisé / Token expiré)
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/connexion') {
        
        // Nettoyage complet
        localStorage.removeItem('calsed_token');
        localStorage.removeItem('calsed_user');
        sessionStorage.removeItem('calsed_token');
        sessionStorage.removeItem('calsed_user');
        
        // Redirection forcée
        window.location.href = '/connexion'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;
