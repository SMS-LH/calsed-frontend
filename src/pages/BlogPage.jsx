import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Calendar,
  Clock,
  ArrowRight,
  FileText,
  BookOpen,
  Plus
} from "lucide-react";
import { useContent } from "@/context/ContentContext"; 

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const BlogPage = () => {
  const { blogPosts } = useContent(); 

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(9); 
  const POSTS_PER_LOAD = 6; 

  // --- CORRECTION DÉPLOIEMENT : Gestion sécurisée des URLs d'images ---
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Si c'est déjà une URL complète (ex: Cloudinary, http...), on la retourne telle quelle
    if (imagePath.startsWith('http')) return imagePath;
    
    // Sinon, on construit l'URL complète vers le backend
    // On retire '/api' de REACT_APP_API_URL s'il est présent pour pointer à la racine du serveur
    const baseUrl = (process.env.REACT_APP_API_URL || '').replace(/\/api$/, '');
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  // 1. Extraction sécurisée des catégories
  const categories = useMemo(() => {
    const allCats = blogPosts
      .map(post => post.category)
      .filter(cat => cat && typeof cat === 'string');
    return ["all", ...new Set(allCats)];
  }, [blogPosts]);

  // 2. Filtrage robuste
  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const searchContent = (searchQuery || "").toLowerCase().trim();
      const matchesSearch = 
        (post.title || "").toLowerCase().includes(searchContent) ||
        (post.excerpt || "").toLowerCase().includes(searchContent);

      const currentCat = (post.category || "").toLowerCase().trim();
      const selectedCat = selectedCategory.toLowerCase().trim();
      
      const matchesCategory = selectedCategory === "all" || currentCat === selectedCat;

      return matchesSearch && matchesCategory;
    });
  }, [blogPosts, searchQuery, selectedCategory]);

  const displayedPosts = filteredPosts.slice(0, visibleCount);
  const hasMorePosts = filteredPosts.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + POSTS_PER_LOAD);
  };

  const handleFilterChange = (category) => {
    setSelectedCategory(category);
    setSearchQuery(""); 
    setVisibleCount(9); 
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setVisibleCount(9); 
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#0A2A5C] selection:text-white pb-24">
      
      {/* 1. HEADER */}
      <section className="bg-slate-50 pt-32 pb-24 border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0A2A5C]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10 text-center max-w-3xl">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">Journal du CALSED</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-[#0A2A5C] mb-6">
              Inspiration, Actualités & Réflexions
            </h1>
            <p className="text-lg text-slate-500 font-light leading-relaxed">
              Plongez au cœur de la vie du réseau. Découvrez les parcours inspirants de nos alumni.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. FILTRES & RECHERCHE */}
      <section className="sticky top-20 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-100 py-4 shadow-sm">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleFilterChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    selectedCategory === category 
                    ? "bg-[#0A2A5C] text-white shadow-md hover:bg-[#0A2A5C]/90" 
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {category === "all" ? "Toutes les rubriques" : category}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 h-10 bg-slate-50 border-0 focus-visible:ring-1 focus-visible:ring-[#0A2A5C] rounded-full text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. GRILLE ARTICLES */}
      <section className="container mx-auto px-6 lg:px-12 py-16">
        
        {blogPosts.length === 0 ? (
           <div className="text-center py-24 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
             <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-4" />
             <p className="text-slate-500 font-medium">Le journal est vide pour le moment.</p>
           </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-slate-500 text-lg mb-6">Aucun article ne correspond à votre recherche.</p>
            <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setVisibleCount(9); }} className="rounded-full">
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {displayedPosts.map((post, index) => {
                const isHero = index === 0;
                const safeImageUrl = getImageUrl(post.image);
                
                return (
                  <motion.div 
                    key={post._id || post.id} 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={fadeInUp}
                    className={isHero ? "col-span-full mb-12" : ""}
                  >
                    <Link to={`/blog/${post._id || post.id}`} className="group block h-full">
                      <article className={`flex flex-col h-full ${isHero ? "lg:grid lg:grid-cols-12 lg:gap-12 items-center" : ""}`}>
                        
                        {/* Image */}
                        <div className={`relative overflow-hidden rounded-2xl bg-slate-100 ${isHero ? "lg:col-span-7 aspect-[16/9] lg:aspect-auto lg:h-[500px]" : "aspect-[16/10] mb-6"}`}>
                          {safeImageUrl ? (
                            <img
                              src={safeImageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <FileText className="h-16 w-16 opacity-50" />
                            </div>
                          )}
                          <div className="absolute top-4 left-4">
                             <Badge className="bg-white/90 text-slate-900 hover:bg-white backdrop-blur-md shadow-sm border-0 font-bold px-3 py-1 uppercase text-[10px] tracking-wider">
                               {post.category || "Article"}
                             </Badge>
                          </div>
                        </div>

                        {/* Contenu Texte */}
                        <div className={`flex flex-col ${isHero ? "lg:col-span-5 py-6" : ""}`}>
                          <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {post.date ? new Date(post.date).toLocaleDateString('fr-FR') : "Récemment"}
                            </span>
                            {post.readTime && (
                              <span className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-slate-300 mx-2" />
                                <Clock className="h-3.5 w-3.5" /> {post.readTime}
                              </span>
                            )}
                          </div>

                          <h2 className={`font-bold font-display text-slate-900 group-hover:text-[#0A2A5C] transition-colors leading-[1.1] mb-4 ${isHero ? "text-3xl md:text-4xl lg:text-5xl" : "text-xl md:text-2xl line-clamp-2"}`}>
                            {post.title}
                          </h2>

                          <p className={`text-slate-500 leading-relaxed mb-6 font-light ${isHero ? "text-lg line-clamp-4" : "text-sm line-clamp-3 flex-1"}`}>
                            {post.excerpt?.replace(/<[^>]*>?/gm, '') || "Lire la suite..."}
                          </p>
                          
                          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center text-[#0A2A5C] font-bold text-sm uppercase tracking-widest group/btn">
                            Lire l'article <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          </div>
                        </div>

                      </article>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Bouton Voir Plus */}
            {hasMorePosts && (
              <div className="text-center mt-20">
                <Button 
                  onClick={handleLoadMore}
                  variant="outline"
                  className="rounded-full px-8 h-12 border-slate-200 text-slate-600 hover:text-[#0A2A5C] hover:border-[#0A2A5C] hover:bg-white transition-all shadow-sm font-bold"
                >
                  <Plus className="mr-2 h-4 w-4" /> Charger plus d'articles
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default BlogPage;