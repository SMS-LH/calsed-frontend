import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "@/context/ContentContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Search } from "lucide-react";

const ShopPage = () => {
  const { products, isLoading } = useContent();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // --- CORRECTION DÉPLOIEMENT : Gestion sécurisée des URLs d'images ---
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    const baseUrl = (process.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  // Récupérer les catégories uniques
  const categories = ["all", ...new Set(products.map(p => p.category))];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-slate-100 border-t-[#0A2A5C] rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium text-xs md:text-sm animate-pulse">Chargement de la boutique...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 md:pb-20">
      
      {/* 1. HERO HEADER */}
      <section className="bg-[#0A2A5C] pt-24 md:pt-32 pb-16 md:pb-24 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-amber-400/5 rounded-full blur-[80px] md:blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10 text-center">
          <Badge className="mb-4 md:mb-6 bg-white/10 text-amber-300 hover:bg-white/20 border-0 px-3 md:px-4 py-1 md:py-1.5 backdrop-blur-md text-[10px] md:text-xs">
            Merchandising Officiel
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight mb-4 md:mb-6">
            La Boutique CALSED
          </h1>
          <p className="text-sm md:text-lg text-blue-100/80 font-light max-w-2xl mx-auto leading-relaxed px-2">
            Portez nos couleurs avec fierté. Chaque achat soutient directement les initiatives sociales et éducatives du collectif.
          </p>
        </div>
      </section>

      {/* 2. FILTRES & RECHERCHE */}
      <div className="container mx-auto px-4 md:px-6 lg:px-12 -mt-6 md:-mt-8 relative z-20">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 p-3 md:p-4 lg:p-6 border border-slate-100 flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between">
          
          {/* Barre de recherche */}
          <div className="relative w-full md:w-72 lg:w-80 group shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#0A2A5C] transition-colors" />
            <Input 
              placeholder="Rechercher un produit..." 
              className="pl-10 h-10 md:h-11 bg-slate-50 border border-slate-100 focus-visible:ring-1 focus-visible:ring-[#0A2A5C] transition-all rounded-xl text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtres Catégories */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 w-full scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                  selectedCategory === cat 
                  ? "bg-[#0A2A5C] text-white shadow-md" 
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"
                }`}
              >
                {cat === "all" ? "Tout voir" : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. GRILLE PRODUITS */}
      <div className="container mx-auto px-4 md:px-6 lg:px-12 mt-10 md:mt-16">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 md:h-5 md:w-5 text-amber-500" /> Collection
          </h2>
          <span className="text-xs md:text-sm text-slate-400 font-medium bg-slate-100 px-2 py-0.5 md:py-1 rounded-md">{filteredProducts.length} articles</span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            <AnimatePresence>
              {filteredProducts.map((p) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={p.id}
                  className="h-full"
                >
                  <Link to={`/boutique/${p.id}`} className="group block h-full">
                    <Card className="h-full border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl md:rounded-[1.5rem] overflow-hidden flex flex-col">
                      
                      {/* Image Container */}
                      <div className="aspect-square sm:aspect-[4/5] relative overflow-hidden bg-slate-50 flex items-center justify-center p-4">
                        <img
                          src={getImageUrl(Array.isArray(p.image) ? p.image[0] : p.image)}
                          alt={p.name}
                          className="w-full h-full object-contain transition-transform duration-700 md:group-hover:scale-105"
                        />
                        
                        {/* Overlay au survol (Desktop uniquement) */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center">
                           <Button className="bg-white text-[#0A2A5C] hover:bg-amber-400 hover:text-[#0A2A5C] font-bold rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
                             Voir les détails
                           </Button>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1.5 md:gap-2">
                          {p.stock <= 0 && (
                            <Badge variant="destructive" className="bg-red-500/90 backdrop-blur-md border-0 shadow-sm text-[9px] md:text-xs px-2 py-0.5">Épuisé</Badge>
                          )}
                          {p.isNew && (
                            <Badge className="bg-amber-400 text-[#0A2A5C] hover:bg-amber-400 border-0 shadow-sm text-[9px] md:text-xs px-2 py-0.5">Nouveau</Badge>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <CardContent className="p-4 md:p-5 flex-1 flex flex-col">
                        <div className="mb-1">
                          <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {p.category || "Article"}
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-slate-900 text-base md:text-lg mb-1 md:mb-2 leading-tight group-hover:text-[#0A2A5C] transition-colors line-clamp-2">
                          {p.name}
                        </h3>
                        
                        <div className="mt-auto pt-3 md:pt-4 border-t border-slate-50 flex items-center justify-between">
                          <span className="text-base md:text-lg font-black text-[#0A2A5C]">
                            {p.price?.toLocaleString()} FCFA
                          </span>
                          {/* Petit point indicateur de stock */}
                          <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${p.stock > 0 ? "bg-green-500" : "bg-red-300"}`} title={p.stock > 0 ? "En stock" : "Épuisé"} />
                        </div>
                      </CardContent>

                    </Card>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 md:py-32 bg-white rounded-2xl md:rounded-[2.5rem] border border-dashed border-slate-200 px-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <Search className="h-6 w-6 md:h-8 md:w-8 text-slate-300" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Aucun résultat trouvé</h3>
            <p className="text-sm md:text-base text-slate-500 max-w-sm mx-auto mb-6 md:mb-8">
              Nous n'avons trouvé aucun article correspondant à <span className="font-semibold">"{searchTerm}"</span>. Essayez une autre catégorie.
            </p>
            <Button variant="outline" onClick={() => {setSearchTerm(""); setSelectedCategory("all")}} className="rounded-full h-10 md:h-10 text-sm md:text-base">
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;