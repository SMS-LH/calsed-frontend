import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  CheckCircle, Calendar, CreditCard, 
  History, Phone, Minus, Plus, Lock, 
  Users, Sparkles, LayoutDashboard, HeartHandshake,
  ArrowRight, ShieldCheck, FileText, Check, Bell
} from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import api from "@/api/axios";

const MemberPage = () => {
  const { user, isMember: globalIsMember, isAuthenticated, updateUserData } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [arrears, setArrears] = useState(0); 
  const [amountDue, setAmountDue] = useState(0);
  const [monthsToPay, setMonthsToPay] = useState(1);
  const [isUpToDate, setIsUpToDate] = useState(globalIsMember);
  const [history, setHistory] = useState([]); 
  const [hasDeclared, setHasDeclared] = useState(false); // Pour bloquer le bouton après déclaration

  const MONTHLY_FEE = 2000;
  const TREASURER_PHONE = "77 812 34 56"; // À remplacer par le vrai numéro

  // --- 1. CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    const refreshData = async () => {
      if (user && (user.id || user._id)) {
        const userId = user.id || user._id;
        try {
          const resUser = await api.get(`/users/${userId}`);
          const freshUserData = resUser.data;
          
          const freshPaidUntil = freshUserData.paidUntil ? new Date(freshUserData.paidUntil) : null;
          const now = new Date();
          setIsUpToDate(freshPaidUntil && freshPaidUntil > now);
          
          if (freshUserData.paidUntil !== user.paidUntil) {
              updateUserData(freshUserData);
          }

          const resHistory = await api.get(`/payment/history/${userId}`);
          setHistory(resHistory.data);
          
        } catch (error) {
          console.error("Erreur synchro:", error);
        }
      }
    };
    
    if (isAuthenticated) {
        refreshData();
    }
  }, [user?.id, user?._id, isAuthenticated]); 

  // --- 2. LOGIQUE DE DETTE ---
  useEffect(() => {
    if (user && isAuthenticated) {
      if (isUpToDate) {
        setArrears(0); setAmountDue(0); setMonthsToPay(1); 
        return; 
      }
      const today = new Date(); today.setHours(0, 0, 0, 0);
      let expiryDate = user.paidUntil ? new Date(user.paidUntil) : new Date(user.createdAt || Date.now());
      expiryDate.setHours(0, 0, 0, 0);

      if (expiryDate >= today) {
          setIsUpToDate(true);
          return;
      }

      const diffTime = today.getTime() - expiryDate.getTime();
      const oneMonthInMs = 1000 * 60 * 60 * 24 * 30.44; 
      let debt = Math.ceil(diffTime / oneMonthInMs);
      setArrears(debt > 0 ? debt : 1);
      setAmountDue((debt > 0 ? debt : 1) * MONTHLY_FEE);
      setMonthsToPay(debt > 0 ? debt : 1);
    }
  }, [user, isUpToDate, isAuthenticated]);

  const formatDate = (dateString) => {
    if (!dateString) return "Aucune cotisation";
    return new Date(dateString).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const incrementMonths = (val) => setMonthsToPay(prev => Math.max(1, prev + val));

  // --- 3. DÉCLARATION DE PAIEMENT SANS CODE ---
  const handlePaymentDeclaration = async () => {
    setLoading(true);
    const toastId = toast.loading("Notification de l'administration...");
    const userId = user.id || user._id;

    try {
      // On enregistre la demande en base de données avec le statut 'pending' (en attente)
      // Le backend se chargera d'envoyer le mail à l'admin
      await api.post('/payment/declare', {
          userId: userId,
          amount: monthsToPay * MONTHLY_FEE,
          months: monthsToPay,
          type: 'Wave/OM (Déclaré)',
          status: 'pending'
      });

      setHasDeclared(true);
      toast.success(`Déclaration envoyée ! Votre compte sera mis à jour sous peu.`, { id: toastId, duration: 5000 });
      
    } catch (error) {
      toast.error("Erreur lors de l'envoi de la déclaration.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // VUE VISITEUR : PRÉSENTATION INSTITUTIONNELLE
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-24 font-sans border-t border-slate-200">
        <div className="container mx-auto px-6 max-w-6xl">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 text-[#0A2A5C] text-xs font-bold tracking-[0.2em] uppercase mb-8">
              <span className="w-1.5 h-1.5 bg-amber-500"></span>
              Espace Réseau
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0A2A5C] mb-8 tracking-tight leading-tight">
              Rejoignez le cercle d'excellence du <span className="text-amber-500">LSED.</span>
            </h1>
            <p className="text-lg text-slate-500 mb-10 font-light leading-relaxed max-w-2xl mx-auto">
              Le CALSED structure la force de son réseau pour catalyser les opportunités professionnelles et soutenir le développement de notre alma mater.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/connexion">
                <Button size="lg" className="w-full sm:w-auto bg-[#0A2A5C] hover:bg-[#08224a] text-white px-8 h-14 rounded-none font-bold shadow-lg transition-transform hover:-translate-y-1">
                  Accéder au portail <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/inscription">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-100 px-8 h-14 rounded-none font-bold">
                  Soumettre une demande
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Users, title: "Annuaire Global", text: "Accédez à un marché caché de l'emploi et développez des synergies avec les anciens du LSED partout dans le monde." },
              { icon: Sparkles, title: "Carrière & Mentorat", text: "Bénéficiez de l'expérience des aînés à travers nos programmes de mentorat et nos offres de stages exclusives." },
              { icon: HeartHandshake, title: "Fonds de Solidarité", text: "Participez aux initiatives concrètes pour soutenir le Lycée Scientifique et accompagner les jeunes promotions." }
            ].map((feature, i) => (
              <Card key={i} className="border border-slate-200 shadow-sm rounded-none bg-white hover:border-[#0A2A5C] transition-colors group">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 text-[#0A2A5C] group-hover:bg-[#0A2A5C] group-hover:text-white transition-colors">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-xl font-bold mb-3">{feature.title}</CardTitle>
                  <p className="text-slate-500 text-sm font-light leading-relaxed">
                    {feature.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // VUE MEMBRE : TABLEAU DE BORD DÉCLARATIF
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen pt-28 pb-16 bg-slate-50 font-sans border-t border-slate-200">
      <div className="container mx-auto px-6 max-w-5xl">
        
        {/* Header Dashboard */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-black text-[#0A2A5C] mb-2 tracking-tight">Espace Membre</h1>
            <p className="text-slate-500 font-light">
              Bienvenue, <span className="font-bold text-slate-800">{user?.prenom}</span>. Voici le statut de votre adhésion.
            </p>
          </div>
          {isUpToDate && (
             <div className="bg-[#0A2A5C] text-white px-4 py-2 text-xs uppercase tracking-widest font-bold flex items-center gap-2 shadow-sm rounded-none">
                <CheckCircle className="w-4 h-4 text-amber-500" /> Membre Actif
             </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* CARTE STATUT */}
            <Card className={`rounded-none border-t-4 shadow-sm ${isUpToDate ? "border-t-green-600 border-slate-200" : "border-t-red-600 border-slate-200"}`}>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-1">Validité de l'adhésion</h2>
                    <p className="text-slate-500 font-light text-sm mb-6">L'accès à l'annuaire et aux offres dépend de ce statut.</p>
                    
                    <div className="flex items-center gap-3 bg-slate-50 p-4 border border-slate-200 w-fit rounded-none">
                      <Calendar className="h-5 w-5 text-[#0A2A5C]" />
                      <span className="text-sm font-medium text-slate-700">Expire le : <strong className={isUpToDate ? "text-green-600" : "text-red-600"}>{formatDate(user.paidUntil)}</strong></span>
                    </div>
                  </div>
                  
                  <div className="text-center min-w-[120px] bg-slate-50 p-4 border border-slate-200">
                    {isUpToDate ? (
                        <div className="flex flex-col items-center justify-center">
                           <div className="w-12 h-12 bg-green-100 flex items-center justify-center mb-2">
                             <CheckCircle className="h-6 w-6 text-green-600" />
                           </div>
                           <span className="text-green-700 font-bold text-xs uppercase tracking-wider">À jour</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-black text-red-600">{arrears}</span>
                            <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider">Mois de retard</span>
                            <div className="mt-2 text-red-700 font-bold border-t border-red-200 pt-2 w-full">{amountDue.toLocaleString()} F</div>
                        </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CARTE PAIEMENT DÉCLARATIF SANS CODE */}
            {!isUpToDate && (
              <Card className="border border-slate-200 shadow-sm rounded-none bg-white">
                  <CardHeader className="bg-slate-50 border-b border-slate-200 pb-4">
                      <CardTitle className="text-lg font-bold text-[#0A2A5C] flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-amber-500" /> Régulariser (Wave / Orange Money)
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                      <div className="grid md:grid-cols-2 gap-8">
                          
                          {/* Étape 1 & 2 : Calcul et Numéro */}
                          <div className="space-y-6">
                              <div>
                                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">1. Calculer le montant</Label>
                                  <div className="flex items-center gap-4 bg-slate-50 p-2 border border-slate-200 rounded-none w-fit">
                                      <Button variant="ghost" size="icon" onClick={() => incrementMonths(-1)} disabled={hasDeclared} className="h-10 w-10 hover:bg-white rounded-none"><Minus className="h-4 w-4" /></Button>
                                      <Input type="number" value={monthsToPay} readOnly className="h-10 w-16 text-center text-lg font-bold border-0 bg-transparent focus-visible:ring-0" />
                                      <Button variant="ghost" size="icon" onClick={() => incrementMonths(1)} disabled={hasDeclared} className="h-10 w-10 hover:bg-white rounded-none"><Plus className="h-4 w-4" /></Button>
                                  </div>
                                  <p className="mt-3 text-2xl font-black text-[#0A2A5C]">{(monthsToPay * MONTHLY_FEE).toLocaleString()} FCFA</p>
                              </div>

                              <div className="bg-amber-50 border border-amber-200 p-4 rounded-none">
                                  <p className="text-sm text-amber-800 font-medium mb-1">2. Effectuez le transfert</p>
                                  <p className="text-xs text-amber-700/80 mb-2">Envoyez l'argent au Trésorier via Wave ou Orange Money :</p>
                                  <div className="text-xl font-mono font-black text-amber-900 bg-white px-3 py-1 inline-block border border-amber-200">
                                      {TREASURER_PHONE}
                                  </div>
                              </div>
                          </div>

                          {/* Étape 3 : Confirmation Simple */}
                          <div className="space-y-4 bg-slate-50 p-6 border border-slate-200 flex flex-col justify-center">
                              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">3. Confirmer l'envoi</Label>
                              <p className="text-xs text-slate-500 font-light mb-4 leading-relaxed">
                                Une fois le transfert effectué de votre côté, cliquez ci-dessous. Le bureau sera notifié et validera votre adhésion rapidement.
                              </p>
                              
                              <Button 
                                onClick={handlePaymentDeclaration} 
                                disabled={loading || hasDeclared} 
                                className={`w-full h-12 rounded-none font-bold transition-all ${
                                  hasDeclared 
                                  ? "bg-green-600 text-white hover:bg-green-700" 
                                  : "bg-[#0A2A5C] text-white hover:bg-[#08224a]"
                                }`}
                              >
                                  {loading ? "Notification en cours..." : hasDeclared ? "Déclaration envoyée ✓" : "J'ai transféré l'argent"}
                              </Button>
                              
                              <div className="text-center mt-2 text-[10px] text-slate-400 flex items-center justify-center gap-1 uppercase tracking-widest font-bold">
                                  <Bell className="w-3 h-3" /> Alerte administrateur
                              </div>
                          </div>

                      </div>
                  </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-8">
            {/* CARTE SUPPORT */}
            <Card className="bg-[#0A2A5C] text-white border-0 shadow-sm rounded-none p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <h3 className="font-bold flex items-center gap-2 mb-3 relative z-10"><Phone className="h-4 w-4 text-amber-400" /> Assistance Trésorerie</h3>
                <p className="text-blue-100/70 text-xs mb-4 font-light leading-relaxed relative z-10">
                    Un problème avec votre déclaration ? Une erreur sur le montant ? Contactez directement la commission des finances.
                </p>
                <div className="text-lg font-mono font-bold mb-2 relative z-10">
                    {TREASURER_PHONE}
                </div>
            </Card>

            {/* HISTORIQUE */}
            <Card className="border border-slate-200 shadow-sm rounded-none bg-white">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <History className="h-4 w-4" /> Historique récent
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto max-h-[300px]">
                    {history.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {history.map((pay, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-black text-[#0A2A5C] text-sm">{pay.amount.toLocaleString()} F</span>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">{pay.type || "Cotisation"}</span>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <div className="text-xs font-medium text-slate-600 mb-1">{new Date(pay.date).toLocaleDateString()}</div>
                                        {pay.status === 'pending' ? (
                                            <Badge variant="outline" className="text-[9px] py-0 h-4 bg-amber-50 text-amber-700 border-amber-200 rounded-none uppercase tracking-widest">En attente</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[9px] py-0 h-4 bg-green-50 text-green-700 border-green-200 rounded-none uppercase tracking-widest">Validé</Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                            <FileText className="w-8 h-8 mb-3 opacity-20" />
                            <p className="text-xs font-light">Aucune transaction.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MemberPage;