import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, Target, Users, GraduationCap, Shield, Smartphone
} from "lucide-react";
import { toast } from "sonner";

// IMPORT DU PONT API SÉCURISÉ
import api from "@/api/axios";

const DonatePage = () => {
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("wave");
  const [donorInfo, setDonorInfo] = useState({ name: "", email: "", message: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [donationComplete, setDonationComplete] = useState(false);
  const [transactionRef, setTransactionRef] = useState(""); // Pour stocker la ref du backend

  const presetAmounts = ["5000", "10000", "25000", "50000", "100000"];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    
    // 1. Validation Montant
    const finalAmount = amount || customAmount;
    if (!finalAmount || parseInt(finalAmount) < 500) {
      toast.error("Le montant minimum est de 500 FCFA");
      return;
    }

    // 2. Validation Infos
    if (!donorInfo.name || !donorInfo.email) {
      toast.error("Merci de renseigner votre nom et email pour le reçu.");
      return;
    }

    setIsProcessing(true);

    try {
      // 3. Appel au Backend via Axios
      const response = await api.post("/donate", {
        amount: formatPrice(finalAmount), // On envoie le montant formaté ou brut selon préférence
        paymentMethod,
        donorInfo
      });

      // Axios place la réponse JSON dans response.data
      setTransactionRef(response.data.transactionId); 
      setDonationComplete(true);
      toast.success("Don validé avec succès !");

    } catch (error) {
      console.error("Erreur don:", error);
      const errorMsg = error.response?.data?.message || "Impossible de contacter le serveur de paiement.";
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const impactItems = [
    {
      icon: GraduationCap,
      title: "Soutien Pédagogique",
      description: "Dons de matériel didactique et organisation des journées d'excellence."
    },
    {
      icon: Users,
      title: "Solidarité",
      description: "Aide d'urgence pour les anciens élèves en situation difficile."
    },
    {
      icon: Target,
      title: "Vie du Réseau",
      description: "Financement des activités et événements de la communauté."
    }
  ];

  // VUE : DON EFFECTUÉ
  if (donationComplete) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-slate-50 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white p-10 rounded-3xl shadow-xl border border-slate-100"
          >
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-green-50/50">
              <Heart className="h-12 w-12 text-green-600 fill-green-600" />
            </div>
            <h1 className="text-3xl font-bold font-display text-[#0A2A5C] mb-4">
              Merci du fond du cœur !
            </h1>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Votre don de <strong className="text-[#0A2A5C]">{formatPrice(amount || customAmount)} FCFA</strong> a bien été reçu.
              Un reçu fiscal vous a été envoyé par email à <strong>{donorInfo.email}</strong>.
            </p>
            
            {/* Affichage de la référence transaction */}
            <div className="bg-slate-50 p-3 rounded-lg mb-8 text-xs text-slate-500 font-mono">
              Réf Transaction : {transactionRef}
            </div>
            
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Faire un autre don
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // VUE : FORMULAIRE DE DON
  return (
    <div className="min-h-screen pt-20 bg-slate-50 font-sans text-slate-900">
      <section className="bg-[#0A2A5C] py-20 relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700] opacity-10 rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl">
          <Badge className="mb-6 bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/20 py-1 px-4 backdrop-blur-md">
            <Heart className="w-4 h-4 mr-2 fill-current" />
            Fonds de Dotation
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-6">
            Soutenez le CALSED
          </h1>
          <p className="text-blue-100/80 text-lg leading-relaxed max-w-xl mx-auto">
            Votre générosité est notre seule ressource. Chaque don nous permet de maintenir notre indépendance et d'agir concrètement pour le lycée et les anciens.
          </p>
        </div>
      </section>

      <section className="py-16 -mt-10 relative z-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-xl bg-white overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-[#0A2A5C] to-[#FFD700]" />
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold font-display text-[#0A2A5C] mb-6">
                    Effectuer un don
                  </h2>
                  
                  <form onSubmit={handleDonate} className="space-y-8">
                    {/* Montant */}
                    <div>
                      <Label className="text-sm font-semibold text-slate-600 mb-3 block uppercase tracking-wider">Je donne</Label>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {presetAmounts.map((preset) => (
                          <Button
                            key={preset}
                            type="button"
                            variant={amount === preset ? "default" : "outline"}
                            className={`h-12 text-lg font-medium ${
                              amount === preset 
                                ? "bg-[#0A2A5C] text-white hover:bg-[#0A2A5C]/90" 
                                : "border-slate-200 text-slate-600 hover:border-[#0A2A5C] hover:text-[#0A2A5C]"
                            }`}
                            onClick={() => { setAmount(preset); setCustomAmount(""); }}
                          >
                            {formatPrice(parseInt(preset))}
                          </Button>
                        ))}
                        <Button
                          type="button"
                          variant={amount === "" && customAmount ? "default" : "outline"}
                          className={`h-12 text-sm font-medium ${
                            amount === "" && customAmount 
                              ? "bg-[#0A2A5C] text-white" 
                              : "border-slate-200 text-slate-600"
                          }`}
                          onClick={() => setAmount("")}
                        >
                          Autre
                        </Button>
                      </div>
                      
                      {amount === "" && (
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="Montant libre (FCFA)"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            min="500"
                            className="h-12 pl-4 text-lg border-slate-300 focus:border-[#0A2A5C] focus:ring-[#0A2A5C]"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">FCFA</span>
                        </div>
                      )}
                    </div>

                    {/* Paiement */}
                    <div>
                      <Label className="text-sm font-semibold text-slate-600 mb-3 block uppercase tracking-wider">Via</Label>
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-4">
                        <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === "wave" ? "border-blue-500 bg-blue-50" : "border-slate-100 hover:border-slate-300"
                        }`}>
                          <RadioGroupItem value="wave" id="wave" className="text-blue-600" />
                          <Label htmlFor="wave" className="flex items-center gap-3 cursor-pointer w-full">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                              <Smartphone className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-slate-700">Wave</span>
                          </Label>
                        </div>

                        <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === "orange" ? "border-orange-500 bg-orange-50" : "border-slate-100 hover:border-slate-300"
                        }`}>
                          <RadioGroupItem value="orange" id="orange" className="text-orange-600" />
                          <Label htmlFor="orange" className="flex items-center gap-3 cursor-pointer w-full">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                              <Smartphone className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-slate-700">Orange Money</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Infos Donateur */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase mb-1">Nom</Label>
                          <Input 
                            id="name" 
                            placeholder="Votre nom" 
                            className="bg-slate-50 border-slate-200" 
                            value={donorInfo.name}
                            onChange={(e) => setDonorInfo({...donorInfo, name: e.target.value})} 
                            required 
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase mb-1">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="Pour le reçu" 
                            className="bg-slate-50 border-slate-200" 
                            value={donorInfo.email}
                            onChange={(e) => setDonorInfo({...donorInfo, email: e.target.value})} 
                            required 
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="message" className="text-xs font-bold text-slate-500 uppercase mb-1">Message de soutien</Label>
                        <Textarea 
                          id="message" 
                          placeholder="Un petit mot pour le collectif..." 
                          className="bg-slate-50 border-slate-200 resize-none" 
                          rows={2} 
                          value={donorInfo.message}
                          onChange={(e) => setDonorInfo({...donorInfo, message: e.target.value})} 
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full h-14 text-lg font-bold bg-[#FFD700] text-[#0A2A5C] hover:bg-[#FFD700]/90 shadow-lg shadow-amber-500/20"
                      disabled={isProcessing || (!amount && !customAmount)}
                    >
                      {isProcessing ? (
                        "Traitement sécurisé..."
                      ) : (
                        `Confirmer le don de ${formatPrice(parseInt(amount || customAmount || 0))} FCFA`
                      )}
                    </Button>
                    
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                      <Shield className="h-3 w-3" />
                      <span>Paiement 100% sécurisé via PayTech</span>
                    </div>

                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* DROITE : POURQUOI DONNER ? */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-[#0A2A5C] text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <h3 className="text-2xl font-bold font-display mb-4">Votre impact est immédiat</h3>
                <p className="text-blue-100 mb-6 leading-relaxed">
                  Le CALSED ne reçoit aucune subvention. Ce sont les dons des anciens élèves et des sympathisants qui permettent de financer nos actions.
                </p>
                <div className="space-y-4">
                  {impactItems.map((item, index) => (
                    <div key={index} className="flex gap-4 items-start bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                      <div className="bg-white text-[#0A2A5C] p-2 rounded-lg shrink-0">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{item.title}</h4>
                        <p className="text-xs text-blue-200 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default DonatePage;