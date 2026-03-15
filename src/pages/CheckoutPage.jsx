import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  ArrowLeft, 
  Loader2, 
  User as UserIcon, 
  Mail, 
  Lock // Ajout de l'import manquant qui causait l'écran blanc
} from "lucide-react";

// IMPORT DU PONT API SÉCURISÉ
import api from "@/api/axios";

const CheckoutPage = () => {
  const navigate = useNavigate();
  // Vérification si ton context utilise 'cart' ou 'items'
  const { cart, items, getCartTotal, clearCart } = useCart();
  const currentCart = cart || items || []; // Sécurité pour éviter le crash
  
  const { user, isAuthenticated } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "Dakar",
    postalCode: ""
  });

  // Mise à jour si l'utilisateur se connecte après coup
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const total = getCartTotal() + 2000; 

  const handleOrder = async (e) => {
    e.preventDefault();
    
    if (currentCart.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    setIsProcessing(true);

    const orderData = {
      customerName: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      items: currentCart.map(item => ({
        productId: item._id || item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: total
    };

    try {
      await api.post('/orders', orderData);
      setIsSuccess(true);
      window.scrollTo(0,0);
      clearCart();
      toast.success("Commande enregistrée avec succès !");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Erreur lors de la commande";
      toast.error(errorMsg);
      console.error("Checkout Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-24 md:pt-32 pb-16 flex items-center justify-center bg-slate-50 px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border border-slate-100"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
            <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0A2A5C] mb-3 md:mb-4 leading-tight">Commande confirmée !</h1>
          <p className="text-sm md:text-base text-slate-500 mb-6 md:mb-8 leading-relaxed">
            Merci {formData.name}. Un e-mail de confirmation sera envoyé à <strong>{formData.email}</strong>. 
            Le service logistique CALSED vous contactera sous peu.
          </p>
          <Button 
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")} 
            className="bg-[#0A2A5C] hover:bg-[#08224a] rounded-xl w-full h-12 md:h-14 font-bold text-sm md:text-base transition-colors"
          >
            {isAuthenticated ? "Suivre ma commande" : "Retour à l'accueil"}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-28 pb-16 md:pb-20 bg-slate-50/50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
        <button 
          onClick={() => navigate("/panier")} 
          className="flex items-center text-sm md:text-base text-slate-500 hover:text-[#0A2A5C] mb-4 md:mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour au panier
        </button>

        <div className="grid lg:grid-cols-12 gap-6 md:gap-8 lg:gap-10">
          
          {/* COLONNE GAUCHE : FORMULAIRE */}
          <div className="lg:col-span-8 space-y-6 md:space-y-8 order-1 lg:order-1">
            
            <Card className="border-0 shadow-sm rounded-2xl md:rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-slate-50/50 border-b p-5 md:p-8">
                <CardTitle className="flex items-center gap-3 text-lg md:text-xl text-[#0A2A5C]">
                  <UserIcon className="h-5 w-5 md:h-6 md:w-6 text-blue-600" /> Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 md:p-8">
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-xs md:text-sm font-bold text-slate-700">Nom complet <span className="text-red-500">*</span></Label>
                    <Input 
                      required
                      placeholder="Votre nom"
                      value={formData.name}
                      disabled={isAuthenticated}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`h-11 md:h-12 ${isAuthenticated ? "bg-slate-100 cursor-not-allowed" : "bg-white"}`}
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-xs md:text-sm font-bold text-slate-700">Adresse E-mail <span className="text-red-500">*</span></Label>
                    <Input 
                      required
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      disabled={isAuthenticated}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`h-11 md:h-12 ${isAuthenticated ? "bg-slate-100 cursor-not-allowed" : "bg-white"}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl md:rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-slate-50/50 border-b p-5 md:p-8">
                <CardTitle className="flex items-center gap-3 text-lg md:text-xl text-[#0A2A5C]">
                  <Truck className="h-5 w-5 md:h-6 md:w-6 text-blue-600" /> Détails de livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 md:p-8">
                <form id="checkout-form" onSubmit={handleOrder} className="space-y-4 md:space-y-6">
                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-xs md:text-sm font-bold text-slate-700">Téléphone (Contact livreur) <span className="text-red-500">*</span></Label>
                    <Input 
                      required 
                      type="tel"
                      placeholder="77 123 45 67" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="h-11 md:h-12 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-xs md:text-sm font-bold text-slate-700">Adresse exacte <span className="text-red-500">*</span></Label>
                    <Input 
                      required 
                      placeholder="Quartier, Rue, Immeuble..." 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="h-11 md:h-12 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="text-xs md:text-sm font-bold text-slate-700">Ville <span className="text-red-500">*</span></Label>
                      <Input required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="h-11 md:h-12 bg-white" />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="text-xs md:text-sm font-bold text-slate-700">Code Postal</Label>
                      <Input value={formData.postalCode} onChange={(e) => setFormData({...formData, postalCode: e.target.value})} className="h-11 md:h-12 bg-white" />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl md:rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-slate-50/50 border-b p-5 md:p-8">
                <CardTitle className="flex items-center gap-3 text-lg md:text-xl text-[#0A2A5C]">
                  <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-amber-500" /> Mode de règlement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 md:p-8">
                <div className="p-4 md:p-5 border-2 border-amber-400 bg-amber-50/50 rounded-xl md:rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-amber-100 shrink-0">
                      <Truck className="h-5 w-5 md:h-6 md:w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm md:text-base text-[#0A2A5C]">Paiement à la réception</p>
                      <p className="text-[10px] md:text-xs text-amber-700 mt-0.5 leading-snug">Espèces ou transfert lors de la livraison</p>
                    </div>
                  </div>
                  <div className="h-5 w-5 md:h-6 md:w-6 rounded-full border-[3px] md:border-4 border-amber-500 bg-white shadow-inner shrink-0 ml-2"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* COLONNE DROITE : RÉCAPITULATIF */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-2">
            <Card className="border-0 shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white overflow-hidden lg:sticky lg:top-24 border-t-[6px] md:border-t-8 border-[#0A2A5C]">
              <div className="p-5 md:p-8 pb-3 md:pb-4 border-b border-slate-50">
                <h2 className="text-lg md:text-xl font-bold text-[#0A2A5C]">Résumé</h2>
              </div>
              <CardContent className="p-5 md:p-8 pt-4 md:pt-6 space-y-4">
                <div className="max-h-48 md:max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {currentCart.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs md:text-sm">
                      <span className="text-slate-500 truncate mr-3">{item.quantity}x {item.name}</span>
                      <span className="font-bold text-slate-700 shrink-0">{(item.price * item.quantity).toLocaleString()} F</span>
                    </div>
                  ))}
                </div>
                
                <Separator className="bg-slate-100 my-4" />
                
                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between text-xs md:text-sm text-slate-500">
                    <span>Articles</span>
                    <span>{getCartTotal().toLocaleString()} F</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm text-slate-500">
                    <span>Livraison</span>
                    <span>2,000 F</span>
                  </div>
                  <div className="flex justify-between items-end pt-3 md:pt-4 border-t border-slate-50 mt-2">
                    <span className="text-xs md:text-sm font-bold text-[#0A2A5C] uppercase">Total TTC</span>
                    <span className="text-2xl md:text-3xl font-black text-[#0A2A5C]">{total.toLocaleString()} F</span>
                  </div>
                </div>
                
                <Button 
                  form="checkout-form"
                  type="submit"
                  disabled={isProcessing || currentCart.length === 0}
                  className="w-full h-14 md:h-16 bg-amber-400 hover:bg-amber-500 text-[#0A2A5C] rounded-xl md:rounded-2xl text-base md:text-lg font-black mt-6 shadow-lg shadow-amber-200/50 transition-all hover:-translate-y-1 active:scale-[0.98]"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>Traitement...</span>
                    </div>
                  ) : (
                    "Valider la commande"
                  )}
                </Button>
                <p className="text-[9px] md:text-[10px] text-center text-slate-400 mt-4 md:mt-5 font-medium uppercase flex justify-center items-center gap-1.5">
                   <Lock className="h-3 w-3" /> Transaction sécurisée
                </p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;