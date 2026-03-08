import { useState } from "react";
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
import { CreditCard, Truck, CheckCircle2, ArrowLeft, Loader2, User as UserIcon, Mail } from "lucide-react";

// IMPORT DU PONT API SÉCURISÉ
import api from "@/api/axios";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // État du formulaire initialisé avec les données user si dispo
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "Dakar",
    postalCode: ""
  });

  const total = getCartTotal() + 2000; // Total + frais de livraison

  const handleOrder = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) return toast.error("Votre panier est vide");

    setIsProcessing(true);

    // Préparation des données pour le Backend
    const orderData = {
      customerName: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      items: cart.map(item => ({
        productId: item._id || item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: total
    };

    try {
      // APPEL RÉEL AU BACKEND AVEC AXIOS
      await api.post('/orders', orderData);

      setIsSuccess(true);
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
      <div className="min-h-screen pt-32 flex items-center justify-center bg-white px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-black text-[#0A2A5C] mb-4">Commande confirmée !</h1>
          <p className="text-slate-500 mb-8">
            Merci {formData.name}. Un e-mail de confirmation a été envoyé à <strong>{formData.email}</strong>. 
            Le service logistique CALSED vous contactera sous peu.
          </p>
          <Button 
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")} 
            className="bg-[#0A2A5C] rounded-xl w-full h-12 font-bold"
          >
            {isAuthenticated ? "Suivre ma commande" : "Retour à l'accueil"}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        <button onClick={() => navigate("/panier")} className="flex items-center text-slate-500 hover:text-[#0A2A5C] mb-6 transition-colors font-medium">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour au panier
        </button>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            
            {/* SECTION IDENTITÉ */}
            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-white border-b p-8">
                <CardTitle className="flex items-center gap-3 text-[#0A2A5C]">
                  <UserIcon className="h-6 w-6 text-blue-600" /> Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Nom complet</Label>
                    <Input 
                      required
                      placeholder="Votre nom"
                      value={formData.name}
                      disabled={isAuthenticated}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={isAuthenticated ? "bg-slate-100 cursor-not-allowed" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Adresse E-mail</Label>
                    <Input 
                      required
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      disabled={isAuthenticated}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={isAuthenticated ? "bg-slate-100 cursor-not-allowed" : ""}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SECTION LIVRAISON */}
            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-white border-b p-8">
                <CardTitle className="flex items-center gap-3 text-[#0A2A5C]">
                  <Truck className="h-6 w-6 text-blue-600" /> Détails de livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form id="checkout-form" onSubmit={handleOrder} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Téléphone (Contact de livraison)</Label>
                    <Input 
                      required 
                      type="tel"
                      pattern="(\+221|00221)?[7][05678][0-9]{7}"
                      title="Veuillez entrer un numéro de téléphone sénégalais valide (ex: 77 123 45 67)"
                      placeholder="Ex: 77 123 45 67" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Adresse exacte (Quartier, Rue, Porte...)</Label>
                    <Input 
                      required 
                      placeholder="Ex: Mermoz, Rue MZ 12, Immeuble X" 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Ville</Label>
                      <Input required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Code Postal (Optionnel)</Label>
                      <Input value={formData.postalCode} onChange={(e) => setFormData({...formData, postalCode: e.target.value})} />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* PAIEMENT */}
            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-white border-b p-8">
                <CardTitle className="flex items-center gap-3 text-[#0A2A5C]">
                  <CreditCard className="h-6 w-6 text-amber-500" /> Méthode de règlement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="p-5 border-2 border-amber-400 bg-amber-50/50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-amber-100">
                      <Truck className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-bold text-[#0A2A5C]">Paiement à la réception</p>
                      <p className="text-xs text-amber-700">Espèces ou transfert (OM/Wave) lors de la livraison</p>
                    </div>
                  </div>
                  <div className="h-6 w-6 rounded-full border-4 border-amber-500 bg-white shadow-inner"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RÉCAPITULATIF */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden sticky top-32 border-t-8 border-[#0A2A5C]">
              <div className="p-8 pb-4">
                <h2 className="text-xl font-bold text-[#0A2A5C]">Votre commande</h2>
              </div>
              <CardContent className="p-8 pt-0 space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {cart.map(item => (
                    <div key={item._id || item.id} className="flex justify-between text-sm">
                      <span className="text-slate-500 truncate mr-4">{item.quantity}x {item.name}</span>
                      <span className="font-bold text-slate-700 shrink-0">{(item.price * item.quantity).toLocaleString()} FCFA</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Articles</span>
                    <span>{getCartTotal().toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Livraison (Dakar)</span>
                    <span>2,000 FCFA</span>
                  </div>
                  <div className="flex justify-between items-end pt-4">
                    <span className="text-sm font-bold text-[#0A2A5C] uppercase tracking-wider">Total TTC</span>
                    <span className="text-3xl font-black text-[#0A2A5C]">{total.toLocaleString()} FCFA</span>
                  </div>
                </div>
                <Button 
                  form="checkout-form"
                  type="submit"
                  disabled={isProcessing}
                  className="w-full h-16 bg-amber-400 hover:bg-amber-500 text-[#0A2A5C] rounded-2xl text-lg font-black mt-6 shadow-lg shadow-amber-200 transition-all hover:-translate-y-1"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>Traitement...</span>
                    </div>
                  ) : (
                    "Valider mon achat"
                  )}
                </Button>
                <p className="text-[10px] text-center text-slate-400 mt-4 font-medium uppercase tracking-widest">
                  Transaction sécurisée par CALSED
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