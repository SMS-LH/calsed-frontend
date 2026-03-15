import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingBag, 
  Trash2, 
  Minus, 
  Plus,
  ArrowLeft,
  Truck,
  ArrowRight,
  Check,
  Banknote,
  Info
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, subtotal, checkout } = useCart();
  
  // Méthode de paiement fixe : livraison
  const [paymentMethod] = useState("livraison");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  
  // Informations de livraison
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Dakar"
  });

  // Gestion sécurisée des URLs d'images
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = (process.env.REACT_APP_API_URL || '').replace(/\/api$/, '');
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const shippingCost = subtotal >= 25000 ? 0 : 2500;
  const total = subtotal + shippingCost;

  const handleCheckout = async () => {
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      toast.error("Veuillez remplir toutes les informations de livraison");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Envoi de la commande avec la méthode "livraison"
      const result = await checkout(paymentMethod, shippingInfo);
      
      if (result.success) {
        setOrderNumber(result.orderNumber);
        setOrderComplete(true);
        window.scrollTo(0,0);
        toast.success("Commande validée avec succès !");
      } else {
        toast.error(result.message || "La validation a échoué.");
      }
    } catch (error) {
      toast.error("Erreur lors de la connexion au serveur.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- VUE : COMMANDE TERMINÉE ---
  if (orderComplete) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 pb-16 bg-slate-50/50">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white p-6 md:p-12 rounded-[2rem] shadow-sm border border-slate-100 mt-8"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 md:h-10 md:w-10 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-900 mb-4">
              Commande Confirmée !
            </h1>
            <p className="text-slate-500 mb-6 md:mb-8 text-base md:text-lg">
              Votre commande a bien été reçue. Notre équipe vous contactera rapidement pour la livraison.
            </p>
            
            <div className="bg-blue-50 text-blue-800 p-4 md:p-6 rounded-2xl mb-6 md:mb-8 border border-blue-100 text-left">
              <p className="font-medium flex items-start md:items-center gap-3">
                <Banknote className="h-6 w-6 mt-0.5 md:mt-0 shrink-0 text-blue-600" /> 
                <span className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                  <span>À préparer pour le livreur :</span> 
                  <span className="font-black text-xl md:text-2xl text-blue-700">{formatPrice(total)}</span>
                </span>
              </p>
              <p className="text-xs md:text-sm mt-3 opacity-80 pl-9 md:pl-9">(Espèces, Wave ou Orange Money acceptés à la livraison)</p>
            </div>

            <div className="mb-8 md:mb-10">
              <Badge variant="outline" className="text-sm md:text-base px-4 py-2 border-slate-200 text-slate-600 bg-slate-50">
                Commande N° <span className="font-mono font-bold text-slate-900 ml-2">{orderNumber}</span>
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link to="/boutique" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full h-12 md:h-12 border-slate-200 text-slate-600 rounded-xl">
                  Continuer mes achats
                </Button>
              </Link>
              <Link to="/" className="w-full sm:w-auto">
                <Button className="w-full h-12 md:h-12 bg-[#0A2A5C] hover:bg-[#08224a] rounded-xl text-white">
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // --- VUE : PANIER VIDE ---
  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-slate-50/50 flex flex-col items-center justify-center">
        <div className="container mx-auto px-4 lg:px-8 max-w-xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-slate-100"
          >
            <ShoppingBag className="h-16 w-16 md:h-20 md:w-20 mx-auto text-slate-300 mb-6" />
            <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-900 mb-4">
              Votre panier est vide
            </h1>
            <p className="text-slate-500 mb-8 text-sm md:text-base">
              Découvrez notre collection de merch officiel CALSED et soutenez le réseau !
            </p>
            <Link to="/boutique">
              <Button size="lg" className="bg-[#0A2A5C] text-white hover:bg-[#08224a] rounded-xl px-8 h-12 w-full sm:w-auto">
                Voir la boutique
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // --- VUE : PANIER NORMAL ---
  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 bg-slate-50/50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Link to="/boutique">
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-[#0A2A5C] -ml-2 mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continuer mes achats
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-[#0A2A5C] flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 md:h-8 md:w-8 text-amber-500" />
            Mon Panier <span className="text-slate-400 font-medium text-xl md:text-2xl ml-1">({items.length})</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 md:gap-8 lg:items-start flex-col lg:flex-row">
          
          {/* COLONNE GAUCHE : Liste des articles */}
          <div className="lg:col-span-7 space-y-4 md:space-y-6">
            {items.map((item) => (
              <motion.div
                key={`${item.id}-${item.size}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                  <CardContent className="p-3 md:p-5">
                    <div className="flex gap-3 md:gap-5">
                      {/* Image du produit */}
                      <div className="w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                        {item.images && item.images[0] ? (
                          <img
                            src={getImageUrl(item.images[0])}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ShoppingBag className="h-8 w-8 opacity-50" />
                          </div>
                        )}
                      </div>
                      
                      {/* Détails du produit */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-sm md:text-base leading-tight md:leading-snug truncate pr-2" title={item.name}>
                              {item.name}
                            </h3>
                            {item.size && (
                              <Badge variant="secondary" className="mt-1.5 md:mt-2 bg-slate-100 text-slate-600 text-[10px] md:text-xs">
                                Taille: {item.size}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 md:h-9 md:w-9 rounded-lg -mt-1 -mr-1 md:mt-0 md:mr-0"
                            onClick={() => removeItem(item.id, item.size)}
                          >
                            <Trash2 className="h-4 w-4 md:h-4 md:w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-end justify-between mt-3 md:mt-4 pt-3 border-t border-slate-50">
                          {/* Contrôle Quantité (Plus grand sur mobile) */}
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 md:h-9 md:w-9 rounded-none hover:bg-slate-100 text-slate-600"
                              onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3 md:h-3.5 md:w-3.5" />
                            </Button>
                            <span className="w-8 md:w-10 text-center text-xs md:text-sm font-bold text-slate-700 bg-slate-50/50 py-1.5">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 md:h-9 md:w-9 rounded-none hover:bg-slate-100 text-slate-600"
                              onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3 md:h-3.5 md:w-3.5" />
                            </Button>
                          </div>
                          
                          <p className="font-black text-amber-600 text-sm md:text-lg">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* COLONNE DROITE : Formulaire et Récapitulatif */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Infos de Livraison */}
            <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
              <CardHeader className="p-4 md:p-5 border-b bg-slate-50/50 rounded-t-2xl">
                <CardTitle className="text-base md:text-lg flex items-center gap-2 text-[#0A2A5C]">
                  <Truck className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
                  Informations de Livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-5 space-y-4">
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="name" className="text-xs md:text-sm font-bold text-slate-700">Nom complet <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    value={shippingInfo.name}
                    onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                    placeholder="Votre nom"
                    className="h-10 md:h-11 bg-slate-50 focus-visible:ring-[#0A2A5C]"
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="phone" className="text-xs md:text-sm font-bold text-slate-700">Téléphone <span className="text-red-500">*</span></Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                    placeholder="+221 77 XXX XX XX"
                    className="h-10 md:h-11 bg-slate-50 focus-visible:ring-[#0A2A5C]"
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="address" className="text-xs md:text-sm font-bold text-slate-700">Adresse exacte <span className="text-red-500">*</span></Label>
                  <Input
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                    placeholder="Quartier, rue, numéro de maison..."
                    className="h-10 md:h-11 bg-slate-50 focus-visible:ring-[#0A2A5C]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Mode de Paiement (Informations) */}
            <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="p-4 md:p-5 border-b bg-slate-50/50">
                <CardTitle className="text-base md:text-lg flex items-center gap-2 text-[#0A2A5C]">
                  <Banknote className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
                  Paiement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start gap-3 p-3 md:p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="mt-0.5 shrink-0 bg-white p-1 rounded-full shadow-sm">
                    <Info className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm md:text-base">Paiement à la livraison</p>
                    <p className="text-xs md:text-sm text-slate-600 mt-1 leading-relaxed">
                      Aucun paiement n'est requis maintenant. Vous paierez votre commande en espèces ou via Wave/Orange Money directement au livreur.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Récapitulatif Total */}
            <Card className="border-[#0A2A5C]/20 shadow-md rounded-2xl bg-white relative overflow-hidden">
              {/* Bandeau déco */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0A2A5C] to-amber-500"></div>
              
              <CardHeader className="p-5 md:p-6 pb-2">
                <CardTitle className="text-lg md:text-xl text-[#0A2A5C]">Récapitulatif</CardTitle>
              </CardHeader>
              
              <CardContent className="p-5 md:p-6 pt-2 space-y-4">
                <div className="flex justify-between text-sm md:text-base text-slate-600 font-medium">
                  <span>Sous-total articles</span>
                  <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm md:text-base text-slate-600 font-medium">
                  <span>Frais de livraison</span>
                  <span className={shippingCost === 0 ? "text-emerald-600 font-bold" : "font-bold text-slate-900"}>
                    {shippingCost === 0 ? "Gratuit" : formatPrice(shippingCost)}
                  </span>
                </div>
                
                {subtotal < 25000 && (
                  <p className="text-[10px] md:text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg font-medium border border-amber-100 flex items-center gap-1.5">
                    <Info className="h-3 w-3" /> Livraison gratuite dès 25 000 F d'achats !
                  </p>
                )}
                
                <Separator className="bg-slate-200 my-4" />
                
                <div className="flex justify-between items-center font-black text-xl md:text-2xl">
                  <span className="text-[#0A2A5C]">Total</span>
                  <span className="text-amber-500">{formatPrice(total)}</span>
                </div>
                
                <Button 
                  className="w-full bg-[#0A2A5C] hover:bg-[#08224a] text-white mt-6 rounded-xl h-14 text-base md:text-lg font-bold shadow-lg transition-transform active:scale-[0.98]"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      Confirmer la commande
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                <p className="text-center text-[10px] md:text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                  <Lock className="h-3 w-3" /> Vos informations sont sécurisées.
                </p>
              </CardContent>
            </Card>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;