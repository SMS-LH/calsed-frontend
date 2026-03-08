import { createContext, useContext, useState, useEffect, useCallback } from "react";
// On garde les données mock UNIQUEMENT pour l'équipe (pas de backend pour ça encore)
import { teamMembers as initialTeam } from "@/data/mockData";
import { toast } from "sonner";

// IMPORT DU PONT API SÉCURISÉ
import api from "@/api/axios";

const ContentContext = createContext();

export const ContentProvider = ({ children }) => {
  // --- ÉTATS ---
  const [blogPosts, setBlogPosts] = useState([]);
  const [products, setProducts] = useState([]); // État pour la boutique
  const [isLoading, setIsLoading] = useState(true); 
  
  // L'équipe reste en local/localStorage
  const [teamMembers, setTeamMembers] = useState(() => {
    try {
      const saved = localStorage.getItem("calsed_team");
      return saved ? JSON.parse(saved) : initialTeam;
    } catch (e) {
      return initialTeam;
    }
  });

  // --- FONCTIONS DE CHARGEMENT ---

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      // APPEL AXIOS
      const res = await api.get('/posts');
      setBlogPosts(res.data);
    } catch (error) {
      console.error("Erreur chargement articles:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      // APPEL AXIOS
      const res = await api.get('/products');
      
      // Normalisation de l'ID pour la compatibilité React
      const normalizedData = res.data.map(p => ({
        ...p,
        id: p._id ? p._id.toString() : p.id
      }));
      setProducts(normalizedData);
    } catch (error) {
      console.error("Erreur chargement boutique:", error);
    }
  }, []);

  // --- INITIALISATION ---
  useEffect(() => {
    fetchPosts();
    fetchProducts(); 
  }, [fetchPosts, fetchProducts]);

  useEffect(() => {
    localStorage.setItem("calsed_team", JSON.stringify(teamMembers));
  }, [teamMembers]);

  // --- FONCTIONS API (BLOG) ---

  const addBlogPost = async (newPost) => {
    try {
      // APPEL AXIOS (headers et JSON.stringify gérés automatiquement)
      const res = await api.post('/posts', newPost);
      
      const savedPost = res.data;
      setBlogPosts(prev => [savedPost, ...prev]);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la création de l'article");
      return false;
    }
  };

  const updateBlogPost = async (postId, updatedData) => {
    try {
      // APPEL AXIOS
      const res = await api.put(`/posts/${postId}`, updatedData);
      
      const updatedPost = res.data;
      setBlogPosts(prev => prev.map(p => (p._id === postId || p.id === postId) ? updatedPost : p));
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la modification");
      return false;
    }
  };

  // --- FONCTIONS API (BOUTIQUE) ---

  const addProduct = async (newProductData) => {
    try {
      // APPEL AXIOS
      await api.post('/products', newProductData);
      
      await fetchProducts(); // Rafraîchissement automatique
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Le serveur ne répond pas";
      toast.error(`Erreur: ${errorMsg}`);
      return false;
    }
  };

  const removeProduct = async (productId) => {
    try {
      // APPEL AXIOS
      await api.delete(`/products/${productId}`);
      
      setProducts(prev => prev.filter(p => (p._id !== productId && p.id !== productId)));
      toast.success("Produit retiré de la vente");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  // --- FONCTIONS LOCALES (ÉQUIPE) ---
  const addTeamMember = (member) => {
    setTeamMembers(prev => [...prev, member]);
  };

  const removeTeamMember = (indexToRemove) => {
    setTeamMembers(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const value = {
    teamMembers,
    blogPosts,
    products, 
    isLoading,
    // Cette propriété filtre dynamiquement les articles marqués comme favoris pour la HomePage
    featuredPosts: blogPosts.filter(p => p.featured === true || p.featured === "true"),
    addTeamMember,
    removeTeamMember,
    addBlogPost,
    updateBlogPost,
    addProduct, 
    removeProduct, 
    refreshContent: () => { fetchPosts(); fetchProducts(); }
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};

export const useContent = () => useContext(ContentContext);