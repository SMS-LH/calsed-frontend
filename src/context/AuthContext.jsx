import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

// IMPORT DU PONT API SÉCURISÉ
import api from "@/api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);

  // --- CHARGEMENT INITIAL (REFRESH) ---
  useEffect(() => {
    const initAuth = async () => {
      // 1. On cherche le token et l'user PARTOUT (Local ou Session)
      const storedUser = localStorage.getItem("calsed_user") || sessionStorage.getItem("calsed_user");
      const token = localStorage.getItem("calsed_token") || sessionStorage.getItem("calsed_token");
      
      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser); // Affichage rapide cache

        try {
            // Vérification serveur au démarrage avec Axios
            const userId = parsedUser._id || parsedUser.id;
            const response = await api.get(`/users/${userId}`);
            
            const freshUser = response.data;
            setUser(freshUser);
            
            // On met à jour le bon stockage (là où on a trouvé le token)
            if (localStorage.getItem("calsed_token")) {
                localStorage.setItem("calsed_user", JSON.stringify(freshUser));
            } else {
                sessionStorage.setItem("calsed_user", JSON.stringify(freshUser));
            }
            
            console.log("Données utilisateur rafraîchies (Start).");
        } catch (error) {
            console.warn("Serveur injoignable (Start) ou Token invalide.");
            // Optionnel : Déconnecter l'utilisateur si le token est expiré (ex: 401)
            if(error.response?.status === 401) {
                logout();
            }
        } finally {
            // On libère l'app seulement après la vérification
            setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const updateUserData = (newData) => {
    setUser((prev) => {
        const updated = { ...prev, ...newData };
        // Mise à jour intelligente du stockage actif
        if (localStorage.getItem("calsed_token")) {
            localStorage.setItem("calsed_user", JSON.stringify(updated));
        } else {
            sessionStorage.setItem("calsed_user", JSON.stringify(updated));
        }
        return updated;
    });
  };

  // --- 1. LOGIN AVEC "SE SOUVENIR DE MOI" ---
  const login = async (email, password, rememberMe = false) => {
    try {
      // Étape A : Connexion standard avec Axios
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

      // Étape B : Choix du stockage (Local vs Session)
      const storage = rememberMe ? localStorage : sessionStorage;
      const otherStorage = rememberMe ? sessionStorage : localStorage;

      // On nettoie l'autre stockage pour éviter les conflits
      otherStorage.removeItem("calsed_token");
      otherStorage.removeItem("calsed_user");

      // On sauvegarde le token
      storage.setItem("calsed_token", data.token);

      // Étape C : Récupération du profil FRAIS (Double check)
      let finalUser = data.user;

      try {
          const userId = data.user._id || data.user.id;
          const freshResponse = await api.get(`/users/${userId}`);
          
          finalUser = freshResponse.data; 
          console.log("Données utilisateur rafraîchies (Login).");
      } catch (fetchError) {
          console.warn("Impossible de récupérer les détails frais.");
      }

      // Étape D : Sauvegarde finale user
      storage.setItem("calsed_user", JSON.stringify(finalUser));
      setUser(finalUser);
      
      return { success: true, user: finalUser };

    } catch (error) {
      console.error("Erreur Login:", error);
      const errorMsg = error.response?.data?.message || "Identifiants incorrects ou serveur inaccessible.";
      return { success: false, error: errorMsg };
    }
  };

  // --- 2. REGISTER (MODIFIÉ POUR BLOQUER L'ACCÈS DIRECT) ---
  const register = async (userData) => {
    try {
      // Appel Axios
      const response = await api.post('/auth/register', userData);
      
      // --- MODIFICATION ICI : ON NE CONNECTE PLUS L'UTILISATEUR ---
      // On retire les setItem et le setUser pour forcer l'attente de validation admin.
      return { success: true, message: response.data.message };

    } catch (error) {
      const errorMsg = error.response?.data?.message || "Serveur inaccessible ou erreur inscription.";
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    // On nettoie tout, partout
    localStorage.removeItem("calsed_token");
    localStorage.removeItem("calsed_user");
    sessionStorage.removeItem("calsed_token");
    sessionStorage.removeItem("calsed_user");
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const dataToSend = { ...profileData, _id: user._id || user.id };

      // L'en-tête Authorization (Bearer token) est géré automatiquement par api.js !
      const response = await api.put('/users/profile', dataToSend);

      const updatedUser = { ...user, ...response.data };
      updateUserData(updatedUser); 
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Erreur mise à jour";
      return { success: false, error: errorMsg };
    }
  };

  const subscribe = async (months = 1) => {
    try {
      const response = await api.put('/users/subscribe', { 
        userId: user._id || user.id, 
        monthsPaid: months 
      });

      if (response.data.success) {
        updateUserData(response.data.user);
        return { success: true, user: response.data.user };
      }
      return { success: false, error: "Erreur lors de l'abonnement" };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Erreur serveur";
      return { success: false, error: errorMsg };
    }
  };

  const adminValidatePayment = async (userId, months = 1) => {
    try {
      const response = await api.put('/users/subscribe', { 
        userId, 
        monthsPaid: months 
      });

      toast.success(`Dossier mis à jour`);
      
      // Si l'admin se met à jour lui-même par hasard
      if (user && (user._id === userId || user.id === userId)) {
        updateUserData(response.data.user);
      }
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Serveur inaccessible";
      toast.error(errorMsg);
      return { success: false };
    }
  };

  // Vérification dynamique
  const checkIsMember = (currentUser) => {
    if (!currentUser || !currentUser.paidUntil) return false;
    return new Date(currentUser.paidUntil) > new Date();
  };

  const value = {
    user,
    allUsers,
    loading,
    login,
    register,
    logout,
    subscribe,
    updateProfile,
    updateUserData, 
    adminValidatePayment,
    isAuthenticated: !!user,
    isMember: checkIsMember(user),
    isAdmin: user?.role === "admin"
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};