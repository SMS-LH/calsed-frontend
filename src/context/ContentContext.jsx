import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import api from "@/api/axios";

const ContentContext = createContext();

export const ContentProvider = ({ children }) => {
  // --- ÉTATS ---
  const [blogPosts, setBlogPosts] = useState([]);
  const [products, setProducts] = useState([]); 
  const [teamMembers, setTeamMembers] = useState([]); // Initialisé vide, chargé depuis DB
  const [isLoading, setIsLoading] = useState(true); 
  
  // --- FONCTIONS DE CHARGEMENT ---

  const fetchTeam = useCallback(async () => {
    try {
      const res = await api.get('/team'); // On récupère les membres depuis MongoDB
      setTeamMembers(res.data);
    } catch (error) {
      console.error("Erreur chargement équipe:", error);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
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
      const res = await api.get('/products');
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
    fetchTeam(); // On charge l'équipe au démarrage
  }, [fetchPosts, fetchProducts, fetchTeam]);

  // --- FONCTIONS API (BLOG) ---

  const addBlogPost = async (newPost) => {
    try {
      const res = await api.post('/posts', newPost);
      setBlogPosts(prev => [res.data, ...prev]);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la création");
      return false;
    }
  };

  const updateBlogPost = async (postId, updatedData) => {
    try {
      const res = await api.put(`/posts/${postId}`, updatedData);
      setBlogPosts(prev => prev.map(p => (p._id === postId || p.id === postId) ? res.data : p));
      return true;
    } catch (error) {
      toast.error("Erreur lors de la modification");
      return false;
    }
  };

  // --- FONCTIONS API (BOUTIQUE) ---

  const addProduct = async (newProductData) => {
    try {
      await api.post('/products', newProductData);
      await fetchProducts(); 
      return true;
    } catch (error) {
      toast.error("Erreur serveur boutique");
      return false;
    }
  };

  const removeProduct = async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      setProducts(prev => prev.filter(p => (p._id !== productId && p.id !== productId)));
      toast.success("Produit retiré");
    } catch (error) {
      toast.error("Erreur suppression produit");
    }
  };

  // --- FONCTIONS API (ÉQUIPE / BUREAU) ---
  // On remplace les fonctions locales par des appels API
  
  const addTeamMember = async (memberData) => {
    try {
      const res = await api.post('/team', memberData);
      setTeamMembers(prev => [...prev, res.data]);
      toast.success("Membre ajouté au bureau national");
      return true;
    } catch (error) {
      toast.error("Erreur lors de l'ajout du membre");
      return false;
    }
  };

  const removeTeamMember = async (memberId) => {
    try {
      // On utilise l'ID MongoDB (_id) pour supprimer
      await api.delete(`/team/${memberId}`);
      setTeamMembers(prev => prev.filter(m => m._id !== memberId));
      toast.success("Membre retiré du bureau");
    } catch (error) {
      toast.error("Erreur lors de la suppression du membre");
    }
  };

  const value = {
    teamMembers,
    blogPosts,
    products, 
    isLoading,
    featuredPosts: blogPosts.filter(p => p.featured === true || p.featured === "true"),
    addTeamMember,
    removeTeamMember,
    addBlogPost,
    updateBlogPost,
    addProduct, 
    removeProduct, 
    refreshContent: () => { fetchPosts(); fetchProducts(); fetchTeam(); }
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};

export const useContent = () => useContext(ContentContext);