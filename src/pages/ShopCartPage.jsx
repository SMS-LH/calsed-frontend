import { motion, AnimatePresence } from "framer-motion";
// Badge est maintenant correctement importé
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowLeft, 
  CreditCard,
  Truck,
  ShieldCheck
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const ShopCartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();

  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? 2000 : 0; // Frais de port fixes
  const total = subtotal + shipping;

  // --- CORRECTION DÉPLOIEMENT : Gestion sécurisée des URLs d'images ---
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    const baseUrl = (process.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const handleCheckout = () => {
    // Modification : On ne vérifie plus isAuthenticated ici
    // On redirige tout le monde vers le tunnel d'achat
    navigate("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[100dvh] pt-24 md:pt-32 pb-20 bg-slate-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center w-full max-w-md bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-slate-100"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner border border-slate-100">
            <ShoppingBag className="h-8 w-8 md:h-10 md:w-10 text-slate-300" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0A2A5C] mb-3 md:mb-4 leading-tight">Votre panier est vide</h1>
          <p className="text-sm md:text-base text-slate-500 mb-6 md:mb-8 font-light leading-relaxed">
            Explorez notre boutique et trouvez les articles exclusifs du collectif CALSED.
          </p>
          <Link to="/boutique" className="block w-full">
            <Button className="w-full bg-[#0A2A5C] hover:bg-[#08224a] rounded-xl h-12 md:h-14 font-bold text-sm md:text-base shadow-lg shadow-blue-900/10">
              Découvrir la boutique
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-28 pb-16 md:pb-20 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        
        {/* EN-TÊTE */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6 md:mb-10">
          <Link to="/boutique">
            <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-slate-200 h-10 w-10 md:h-12 md:w-12 text-slate-500 hover:text-[#0A2A5C]">
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0A2A5C] tracking-tight">Mon Panier</h1>
          <Badge className="bg-[#FFD700] text-[#0A2A5C] hover:bg-[#FFD700] font-bold px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs">
            {cart.length} article{cart.length > 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 md:gap-8 lg:gap-10 items-start">
          
          {/* COLONNE GAUCHE : LISTE DES ARTICLES */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="border-0 shadow-sm rounded-2xl md:rounded-[2rem] overflow-hidden bg-white">
                    <CardContent className="p-3 md:p-5 lg:p-6 flex flex-row items-stretch sm:items-center gap-4 md:gap-6">
                      
                      {/* Image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-slate-50 rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center border border-slate-100 shrink-0">
                        <img 
                          src={getImageUrl(Array.isArray(item.image) ? item.image[0] : item.image)} 
                          alt={item.name} 
                          className="max-w-full max-h-full object-contain p-2 md:p-3"
                        />
                      </div>

                      {/* Contenu (Détails + Actions) */}
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="min-w-0">
                            <Badge variant="outline" className="text-[8px] md:text-[9px] uppercase tracking-widest text-slate-400 mb-1 px-1.5 py-0 border-slate-200">
                              {item.category || "Article"}
                            </Badge>
                            <h3 className="text-sm md:text-lg font-bold text-slate-900 leading-tight md:leading-snug truncate pr-2" title={item.name}>
                              {item.name}
                            </h3>
                            <p className="text-amber-600 font-bold text-xs md:text-base mt-0.5">{item.price?.toLocaleString()} FCFA</p>
                          </div>
                          
                          {/* Supprimer (Desktop : haut droite. Mobile : intégré en bas, mais gardons-le en haut pour consistance si besoin, ou on le met en bas) */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="hidden sm:flex text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl h-8 w-8 md:h-10 md:w-10 shrink-0 -mt-1 -mr-1 md:mt-0 md:mr-0 transition-colors"
                            onClick={() => removeFromCart(item._id)}
                            title="Supprimer l'article"
                          >
                            <Trash2 className="h-4 w-4 md:h-5 w-5" />
                          </Button>
                        </div>

                        {/* Contrôles Quantité & Supprimer Mobile */}
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50 sm:border-0 sm:pt-0">
                          
                          <div className="flex items-center gap-1 md:gap-2 bg-slate-50 p-1 md:p-1.5 rounded-lg md:rounded-xl border border-slate-100 shadow-sm">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 md:h-9 md:w-9 rounded-md md:rounded-lg hover:bg-white text-[#0A2A5C] bg-white sm:bg-transparent shadow-sm sm:shadow-none"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                            <span className="w-6 md:w-8 text-center font-bold text-xs md:text-sm text-slate-700">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 md:h-9 md:w-9 rounded-md md:rounded-lg hover:bg-white text-[#0A2A5C] bg-white sm:bg-transparent shadow-sm sm:shadow-none"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          </div>

                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="sm:hidden text-slate-400 hover:text-red-600 bg-red-50/50 hover:bg-red-100 rounded-lg h-8 w-8"
                            onClick={() => removeFromCart(item._id)}
                            title="Supprimer l'article"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* COLONNE DROITE : RÉCAPITULATIF COMMANDE */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4 md:space-y-6 lg:sticky lg:top-28">
            <Card className="border-0 shadow-lg md:shadow-2xl rounded-2xl md:rounded-[2.5rem] bg-white overflow-hidden border-t-[6px] md:border-t-8 border-[#0A2A5C]">
              
              <div className="p-5 md:p-8 bg-[#0A2A5C] text-white">
                <h2 className="text-lg md:text-xl font-bold mb-0.5 md:mb-1">Résumé</h2>
                <p className="text-blue-200/60 text-[10px] md:text-xs uppercase tracking-widest font-medium">Finalisation de commande</p>
              </div>
              
              <CardContent className="p-5 md:p-8 space-y-4 md:space-y-6">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex justify-between text-xs md:text-sm text-slate-600 font-medium">
                    <span>Sous-total articles</span>
                    <span className="font-bold text-slate-900">{subtotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm text-slate-600 font-medium">
                    <span>Livraison estimée</span>
                    <span className="font-bold text-slate-900">{shipping.toLocaleString()} FCFA</span>
                  </div>
                  <Separator className="bg-slate-100 my-2" />
                  <div className="flex justify-between items-end pt-2">
                    <div>
                      <p className="text-[10px] md:text-xs text-slate-400 uppercase font-black tracking-wider">Total à payer</p>
                      <p className="text-2xl md:text-3xl font-black text-[#0A2A5C] leading-none mt-1">{total.toLocaleString()} <span className="text-lg md:text-xl text-[#0A2A5C]/70">FCFA</span></p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleCheckout}
                  className="w-full h-14 md:h-16 bg-amber-400 hover:bg-amber-500 text-[#0A2A5C] rounded-xl md:rounded-2xl text-base md:text-lg font-black shadow-lg shadow-amber-400/20 transition-all active:scale-[0.98] mt-2 md:mt-4"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Passer au paiement
                </Button>

                <div className="space-y-2 md:space-y-3 pt-3 md:pt-4 border-t border-slate-50 mt-2">
                  <div className="flex items-center gap-2.5 md:gap-3 text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tighter bg-slate-50 p-2 md:p-2.5 rounded-lg border border-slate-100">
                    <ShieldCheck className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500 shrink-0" />
                    <span>Paiement 100% sécurisé (à la livraison)</span>
                  </div>
                  <div className="flex items-center gap-2.5 md:gap-3 text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tighter bg-slate-50 p-2 md:p-2.5 rounded-lg border border-slate-100">
                    <Truck className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-500 shrink-0" />
                    <span>Livraison sous 48h (Dakar)</span>
                  </div>
                </div>
              </CardContent>

            </Card>

            <p className="text-center text-[9px] md:text-[10px] text-slate-400 px-4 md:px-8 leading-relaxed font-medium">
              En procédant au paiement, vous soutenez directement les initiatives sociales et académiques du réseau CALSED.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCartPage;