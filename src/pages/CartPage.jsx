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
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold font-display text-foreground mb-4">
              Commande Confirmée !
            </h1>
            <p className="text-muted-foreground mb-4 text-lg">
              Votre commande a bien été reçue. Notre équipe vous contactera rapidement pour la livraison.
            </p>
            
            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 border border-blue-100 inline-block text-left">
              <p className="font-medium flex items-center gap-2">
                <Banknote className="h-5 w-5" /> 
                À préparer pour le livreur : <span className="font-bold text-xl">{formatPrice(total)}</span>
              </p>
              <p className="text-sm mt-1 opacity-80">(Espèces, Wave ou Orange Money acceptés à la livraison)</p>
            </div>

            <div className="mb-8">
              <Badge variant="outline" className="text-lg px-4 py-2">
                Commande N° {orderNumber}
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/boutique">
                <Button variant="outline">
                  Continuer mes achats
                </Button>
              </Link>
              <Link to="/">
                <Button>
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
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-3xl font-bold font-display text-foreground mb-4">
              Votre panier est vide
            </h1>
            <p className="text-muted-foreground mb-8">
              Découvrez notre collection de merch officiel CALSED !
            </p>
            <Link to="/boutique">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary-dark">
                Voir la boutique
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // --- VUE : PANIER NORMAL ---
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/boutique">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continuer mes achats
            </Button>
          </Link>
          <h1 className="text-3xl font-bold font-display text-foreground mt-4">
            Mon Panier ({items.length})
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Liste des articles */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={`${item.id}-${item.size}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-0 shadow-soft">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img
                          src={getImageUrl(item.images[0])}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="font-semibold text-foreground truncate">
                              {item.name}
                            </h3>
                            {item.size && (
                              <p className="text-sm text-muted-foreground">
                                Taille: {item.size}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.id, item.size)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-r-none"
                              onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-l-none"
                              onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-bold text-primary">
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

          {/* Formulaire et Récapitulatif */}
          <div className="space-y-4">
            
            {/* Infos de Livraison */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={shippingInfo.name}
                    onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                    placeholder="+221 77 XXX XX XX"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Adresse exacte</Label>
                  <Input
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                    placeholder="Quartier, rue, numéro de maison..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Mode de Paiement (Informations uniquement) */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Paiement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="mt-0.5">
                    <Info className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Paiement à la livraison</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      Aucun paiement n'est requis maintenant. Vous paierez votre commande en espèces ou via Wave/Orange Money directement au livreur.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Récapitulatif Total */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span>{shippingCost === 0 ? "Gratuit" : formatPrice(shippingCost)}</span>
                </div>
                {subtotal < 25000 && (
                  <p className="text-xs text-muted-foreground">
                    Livraison gratuite dès 25 000 FCFA
                  </p>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total à payer</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
                
                <Button 
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary-dark mt-4"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Traitement...
                    </>
                  ) : (
                    <>
                      Confirmer la commande
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;