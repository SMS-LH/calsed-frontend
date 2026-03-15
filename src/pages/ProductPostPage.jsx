import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ShoppingCart, 
  ShieldCheck, 
  Truck,
  CreditCard,
  PackageSearch,
  CheckCircle2
} from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { useCart } from "@/context/CartContext"; 
import { toast } from "sonner";

const ProductPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, isLoading } = useContent();
  const { addToCart, clearCart } = useCart(); 
  const [selectedImage, setSelectedImage] = useState(0);

  // --- CORRECTION DÉPLOIEMENT : Gestion sécurisée des URLs d'images ---
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    const baseUrl = (process.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const product = products.find(p => (p.id || p._id)?.toString() === id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-slate-100 border-t-[#0A2A5C] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm w-full max-w-md">
          <PackageSearch className="h-12 w-12 md:h-16 md:w-16 mx-auto text-slate-200 mb-4" />
          <h1 className="text-xl md:text-2xl font-bold text-[#0A2A5C] mb-2">Produit introuvable</h1>
          <p className="text-sm md:text-base text-slate-500 mb-6">Cet article ne semble plus être disponible.</p>
          <Link to="/boutique" className="block w-full">
            <Button className="bg-[#0A2A5C] hover:bg-[#08224a] rounded-full w-full">Retourner à la boutique</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.image) ? product.image : [product.image];

  // Fonction Achat Immédiat
  const handleBuyNow = () => {
    if (product.stock > 0) {
      // Optionnel : Vider le panier avant si on veut un achat unique strict
      // clearCart(); 
      addToCart(product, 1);
      navigate("/checkout"); // Redirection directe
    } else {
      toast.error("Cet article n'est plus disponible.");
    }
  };

  return (
    <div className="min-h-[100dvh] pt-20 md:pt-28 pb-16 md:pb-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
        
        {/* Fil d'ariane simplifié */}
        <div className="mb-4 md:mb-8">
          <Button 
            variant="ghost" 
            className="text-slate-500 hover:text-[#0A2A5C] hover:bg-slate-50 px-2 md:px-3 -ml-2 font-medium h-9 md:h-10 text-xs md:text-sm"
            onClick={() => navigate("/boutique")}
          >
            <ArrowLeft className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" /> Retour à la boutique
          </Button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 lg:items-start">
          
          {/* COLONNE GAUCHE : IMAGES */}
          <div className="lg:col-span-7 space-y-4 md:space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="aspect-square rounded-2xl md:rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-4 md:p-8 relative group"
            >
              <img
                src={getImageUrl(images[selectedImage])}
                alt={product.name}
                className="max-w-full max-h-full object-contain transition-transform duration-500 md:group-hover:scale-105"
              />
              {product.stock <= 0 && (
                 <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                    <Badge variant="destructive" className="text-base md:text-lg px-4 md:px-6 py-1.5 md:py-2">Rupture</Badge>
                 </div>
              )}
            </motion.div>

            {images.length > 1 && (
              <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl md:rounded-2xl border-2 shrink-0 overflow-hidden transition-all bg-slate-50 ${
                      selectedImage === idx ? "border-[#0A2A5C] ring-2 ring-[#0A2A5C]/20" : "border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <img src={getImageUrl(img)} alt={`Miniature ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLONNE DROITE : INFO & ACTION */}
          <div className="lg:col-span-5 flex flex-col lg:sticky lg:top-24">
            <div className="mb-4 md:mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
                  <Badge variant="outline" className="text-slate-500 border-slate-200 uppercase tracking-widest text-[9px] md:text-[10px] font-bold px-2 md:px-3 py-0.5 md:py-1">
                    {product.category || "Collection Officielle"}
                  </Badge>
                  {product.stock > 0 && (
                    <div className="flex items-center text-[10px] md:text-xs font-bold text-green-700 bg-green-50 border border-green-100 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> En stock
                    </div>
                  )}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-3 md:mb-4 leading-tight">{product.name}</h1>
              
              <div className="flex items-center gap-4">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0A2A5C]">{product.price?.toLocaleString()} FCFA</span>
              </div>
            </div>

            <Separator className="mb-4 md:mb-6 bg-slate-100" />

            <div className="prose prose-sm md:prose-base prose-slate text-slate-600 leading-relaxed md:leading-loose mb-6 md:mb-8">
              <p className="whitespace-pre-line">{product.description || "Aucune description détaillée pour cet article. Produit officiel CALSED."}</p>
            </div>

            {/* ACTION AREA */}
            <div className="mt-auto bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100">
              <div className="flex flex-col gap-2.5 md:gap-3">
                {/* BOUTON ACHAT IMMÉDIAT (Mis en avant) */}
                <Button 
                  size="lg" 
                  className={`w-full h-12 md:h-14 font-bold rounded-xl text-sm md:text-base shadow-lg shadow-blue-900/10 transition-transform active:scale-[0.98] ${
                    product.stock > 0 
                    ? "bg-[#0A2A5C] hover:bg-[#08224a] text-white" 
                    : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none hover:bg-slate-300"
                  }`}
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                >
                  <CreditCard className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  {product.stock > 0 ? "Acheter maintenant" : "Indisponible"}
                </Button>

                {/* BOUTON AJOUT PANIER (Secondaire) */}
                {product.stock > 0 && (
                  <Button 
                    variant="outline"
                    size="lg" 
                    className="w-full h-12 md:h-14 font-bold rounded-xl border-slate-200 text-slate-700 hover:bg-white hover:border-[#0A2A5C] hover:text-[#0A2A5C] transition-all text-sm md:text-base"
                    onClick={() => addToCart(product, 1)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Ajouter au panier
                  </Button>
                )}
              </div>

              {/* RASSURANCE */}
              <div className="grid grid-cols-2 gap-2 mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-200/60">
                <div className="flex flex-col items-center text-center gap-1 bg-white py-2 rounded-lg border border-slate-50 shadow-sm">
                  <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wide">Paiement Sécurisé</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1 bg-white py-2 rounded-lg border border-slate-50 shadow-sm">
                  <Truck className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wide">Livraison Express</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPostPage;