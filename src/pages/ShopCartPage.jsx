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
      <div className="min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <ShoppingBag className="h-10 w-10 text-slate-300" />
          </div>
          <h1 className="text-3xl font-black text-[#0A2A5C] mb-4">Votre panier est vide</h1>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto font-light">
            Explorez notre boutique et trouvez les articles exclusifs du collectif CALSED.
          </p>
          <Link to="/boutique">
            <Button className="bg-[#0A2A5C] hover:bg-slate-800 rounded-full px-8 h-12">
              Découvrir la boutique
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-4 mb-10">
          <Link to="/boutique">
            <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-4xl font-black text-[#0A2A5C] tracking-tighter">Mon Panier</h1>
          <Badge className="bg-[#FFD700] text-[#0A2A5C] hover:bg-[#FFD700] font-bold">
            {cart.length} article{cart.length > 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 items-start">
          {/* LISTE DES ARTICLES */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white">
                    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
                      {/* Image */}
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-100 shrink-0">
                        <img 
                          src={getImageUrl(Array.isArray(item.image) ? item.image[0] : item.image)} 
                          alt={item.name} 
                          className="max-w-full max-h-full object-contain p-2"
                        />
                      </div>

                      {/* Détails */}
                      <div className="flex-1 text-center sm:text-left space-y-1">
                        <Badge variant="outline" className="text-[9px] uppercase tracking-widest text-slate-400 mb-1">
                          {item.category}
                        </Badge>
                        <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                        <p className="text-amber-600 font-bold">{item.price?.toLocaleString()} FCFA</p>
                      </div>

                      {/* Contrôles Quantité */}
                      <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-xl hover:bg-white text-[#0A2A5C]"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-xl hover:bg-white text-[#0A2A5C]"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Supprimer */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                        onClick={() => removeFromCart(item._id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* RÉCAPITULATIF COMMANDE */}
          <div className="space-y-6">
            <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
              <div className="p-8 bg-[#0A2A5C] text-white">
                <h2 className="text-xl font-bold mb-1">Résumé</h2>
                <p className="text-blue-200/60 text-xs uppercase tracking-widest font-medium">Finalisation de commande</p>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-slate-600">
                    <span className="font-light">Sous-total</span>
                    <span className="font-bold">{subtotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="font-light">Livraison</span>
                    <span className="font-bold">{shipping.toLocaleString()} FCFA</span>
                  </div>
                  <Separator className="bg-slate-100" />
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-black">Total à payer</p>
                      <p className="text-3xl font-black text-[#0A2A5C]">{total.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleCheckout}
                  className="w-full h-16 bg-amber-400 hover:bg-amber-500 text-[#0A2A5C] rounded-2xl text-lg font-black shadow-xl shadow-amber-400/20 transition-all active:scale-95"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Passer au paiement
                </Button>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    Paiement 100% sécurisé
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                    <Truck className="h-4 w-4 text-blue-500" />
                    Livraison sous 48h (Dakar)
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-[10px] text-slate-400 px-8 leading-relaxed">
              En procédant au paiement, vous soutenez directement les initiatives sociales et académiques du réseau CALSED.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCartPage;